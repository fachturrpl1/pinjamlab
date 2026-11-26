"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin as db } from "@/lib/supabase-server";
import {
  buatSesi,
  hapusSesi,
  adalahAdmin,
  wajibAdmin,
  sandiBenar,
} from "@/lib/session";

/* ------------------------------------------------------------------ */
/* Tipe hasil                                                          */
/* ------------------------------------------------------------------ */

// Dipakai form dengan useActionState. `values` mengembalikan isian
// supaya tidak hilang saat galat; `errors` berisi galat per kolom.
export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  nomor?: number;
};

export type AksiHasil = { ok: boolean; message: string };

export type CekState = {
  ok: boolean;
  message?: string;
  values?: Record<string, string>;
  hasil?: {
    nomor: number;
    status: "menunggu" | "disetujui" | "ditolak";
    ruang: string;
    tanggal: string;
    mulai: string;
    selesai: string;
    alasan_tolak: string | null;
  };
};

const JENIS = ["lab", "kelas", "aula"];
const PESAN_UMUM = "Terjadi kesalahan pada server. Silakan coba lagi.";

/* ------------------------------------------------------------------ */
/* Fungsi bantu                                                        */
/* ------------------------------------------------------------------ */

const ambil = (fd: FormData, kunci: string) =>
  String(fd.get(kunci) ?? "").trim();

const salinIsian = (fd: FormData): Record<string, string> => {
  const hasil: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v === "string") hasil[k] = v;
  }
  return hasil;
};

/** "HH:MM" atau "HH:MM:SS" -> menit sejak 00:00, atau null bila tidak valid. */
function keMenit(t: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(t);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

const keJamDb = (t: string) => (t.length === 5 ? `${t}:00` : t);

/** Tanggal hari ini di WIB, format YYYY-MM-DD. */
const hariIniWIB = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

/** Parse "YYYY-MM-DD"; tolak tanggal mustahil seperti 2026-02-30. */
function parseTanggal(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) {
    return null;
  }
  return d;
}

/** Ada peminjaman DISETUJUI yang beririsan? Jam menempel (11:00-11:00) tidak dihitung. */
async function adaBentrok(
  ruangId: number,
  tanggal: string,
  mulai: string,
  selesai: string,
  kecualiId = -1
): Promise<boolean> {
  const { count, error } = await db
    .from("peminjaman")
    .select("id", { count: "exact", head: true })
    .eq("ruang_id", ruangId)
    .eq("tanggal", tanggal)
    .eq("status", "disetujui")
    .neq("id", kecualiId)
    .lt("mulai", selesai) // mulai lama < selesai baru
    .gt("selesai", mulai); // selesai lama > mulai baru
  if (error) throw error;
  return (count ?? 0) > 0;
}

function segarkan() {
  for (const p of ["/", "/ruang", "/peminjaman", "/admin", "/admin/ruang"]) {
    revalidatePath(p);
  }
}

/* ------------------------------------------------------------------ */
/* PUBLIK: ajukan peminjaman                                           */
/* ------------------------------------------------------------------ */

export async function ajukanPeminjaman(
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const values = salinIsian(fd);
  const errors: Record<string, string> = {};

  const ruangId = Number(ambil(fd, "ruang_id"));
  const tanggal = ambil(fd, "tanggal");
  const mulai = ambil(fd, "mulai");
  const selesai = ambil(fd, "selesai");
  const jumlahTeks = ambil(fd, "jumlah_orang");
  const peminjam = ambil(fd, "peminjam");
  const keperluan = ambil(fd, "keperluan");

  // --- validasi bentuk isian ---
  if (peminjam.length < 3 || peminjam.length > 40) {
    errors.peminjam = "Nama peminjam harus 3 sampai 40 huruf.";
  }
  if (keperluan.length < 5 || keperluan.length > 120) {
    errors.keperluan = "Keperluan harus 5 sampai 120 huruf.";
  }
  if (!Number.isInteger(ruangId) || ruangId <= 0) {
    errors.ruang_id = "Pilih ruang terlebih dahulu.";
  }

  // --- tanggal ---
  const tgl = parseTanggal(tanggal);
  if (!tgl) {
    errors.tanggal = "Tanggal tidak valid.";
  } else {
    const hariIni = parseTanggal(hariIniWIB())!;
    const selisihHari = Math.round((tgl.getTime() - hariIni.getTime()) / 86_400_000);
    const hari = tgl.getUTCDay(); // 0 = Minggu, 6 = Sabtu
    if (selisihHari < 0) errors.tanggal = "Tanggal tidak boleh di masa lalu.";
    else if (selisihHari > 60) errors.tanggal = "Peminjaman paling jauh 60 hari ke depan.";
    else if (hari === 0 || hari === 6) errors.tanggal = "Peminjaman tidak tersedia pada hari Sabtu dan Minggu.";
  }

  // --- jam ---
  const m = keMenit(mulai);
  const s = keMenit(selesai);
  if (m === null) errors.mulai = "Jam mulai tidak valid.";
  if (s === null) errors.selesai = "Jam selesai tidak valid.";
  if (m !== null && m < 7 * 60) errors.mulai = "Jam mulai paling awal 07:00.";
  if (s !== null && s > 17 * 60) errors.selesai = "Jam selesai paling lambat 17:00.";
  if (m !== null && s !== null && !errors.mulai && !errors.selesai) {
    if (s <= m) errors.selesai = "Jam selesai harus setelah jam mulai.";
    else if (s - m > 180) errors.selesai = "Durasi peminjaman paling lama 3 jam.";
  }

  // --- jumlah orang (kapasitas dicek setelah data ruang diambil) ---
  const jumlah = /^\d+$/.test(jumlahTeks) ? Number(jumlahTeks) : NaN;
  if (!Number.isInteger(jumlah) || jumlah <= 0) {
    errors.jumlah_orang = "Jumlah orang harus berupa bilangan lebih dari 0.";
  }

  try {
    // --- aturan yang butuh data dari database ---
    if (!errors.ruang_id) {
      const { data: ruang, error } = await db
        .from("ruang")
        .select("id, nama, kapasitas, aktif")
        .eq("id", ruangId)
        .maybeSingle();
      if (error) throw error;

      if (!ruang) {
        errors.ruang_id = "Ruang tidak ditemukan.";
      } else if (!ruang.aktif) {
        errors.ruang_id = "Ruang ini sedang tidak aktif dan belum bisa dipinjam.";
      } else if (!errors.jumlah_orang && jumlah > ruang.kapasitas) {
        errors.jumlah_orang = `Jumlah orang melebihi kapasitas ruang (${ruang.kapasitas} orang).`;
      }
    }

    // --- bentrok dengan jadwal yang sudah disetujui ---
    if (Object.keys(errors).length === 0) {
      if (await adaBentrok(ruangId, tanggal, keJamDb(mulai), keJamDb(selesai))) {
        errors.mulai =
          "Jam ini bentrok dengan peminjaman yang sudah disetujui. Silakan pilih jam lain.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return { ok: false, message: "Periksa kembali isian Anda.", errors, values };
    }

    // --- simpan; status awal 'menunggu' ---
    const { data, error } = await db
      .from("peminjaman")
      .insert({
        ruang_id: ruangId,
        peminjam,
        keperluan,
        tanggal,
        mulai: keJamDb(mulai),
        selesai: keJamDb(selesai),
        jumlah_orang: jumlah,
      })
      .select("id")
      .single();

    if (error) {
      // 23P01 = exclusion violation (lapisan database menolak bentrok)
      if (error.code === "23P01") {
        return {
          ok: false,
          message: "Jam ini baru saja terisi peminjaman lain. Silakan pilih jam lain.",
          errors: { mulai: "Jam bentrok dengan peminjaman yang sudah disetujui." },
          values,
        };
      }
      throw error;
    }

    revalidatePath("/admin");
    return {
      ok: true,
      message: "Permohonan terkirim. Simpan nomor permohonan Anda untuk cek status.",
      nomor: data.id,
    };
  } catch (e) {
    console.error("ajukanPeminjaman:", e);
    return { ok: false, message: PESAN_UMUM, values };
  }
}

/* ------------------------------------------------------------------ */
/* PUBLIK: cek status (nomor + nama harus cocok)                       */
/* ------------------------------------------------------------------ */

export async function cekStatus(
  _prev: CekState,
  fd: FormData
): Promise<CekState> {
  const values = salinIsian(fd);
  const nomorTeks = ambil(fd, "nomor");
  const nama = ambil(fd, "peminjam");

  if (!nomorTeks || !nama) {
    return { ok: false, message: "Nomor permohonan dan nama peminjam wajib diisi.", values };
  }

  // Terima "PJM-00123", "pjm-123", atau "123"
  const m = /^(?:PJM-)?0*(\d{1,9})$/i.exec(nomorTeks);
  const pesanTidakCocok =
    "Data tidak ditemukan. Pastikan nomor dan nama peminjam sudah benar.";
  if (!m) return { ok: false, message: pesanTidakCocok, values };

  const id = Number(m[1]);

  try {
    const { data: p, error } = await db
      .from("peminjaman")
      .select("id, ruang_id, peminjam, status, tanggal, mulai, selesai, alasan_tolak")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;

    // Pesan sama untuk "nomor tidak ada" dan "nama salah": tidak membocorkan salah satunya.
    if (!p || p.peminjam.trim().toLowerCase() !== nama.toLowerCase()) {
      return { ok: false, message: pesanTidakCocok, values };
    }

    const { data: ruang } = await db
      .from("ruang")
      .select("nama")
      .eq("id", p.ruang_id)
      .maybeSingle();

    return {
      ok: true,
      values,
      hasil: {
        nomor: p.id,
        status: p.status,
        ruang: ruang?.nama ?? "-",
        tanggal: p.tanggal,
        mulai: p.mulai,
        selesai: p.selesai,
        alasan_tolak: p.status === "ditolak" ? p.alasan_tolak : null,
      },
    };
  } catch (e) {
    console.error("cekStatus:", e);
    return { ok: false, message: PESAN_UMUM, values };
  }
}

/* ------------------------------------------------------------------ */
/* AUTENTIKASI                                                         */
/* ------------------------------------------------------------------ */

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const sandi = String(fd.get("sandi") ?? "");

  if (!sandi) {
    return { ok: false, errors: { sandi: "Kata sandi wajib diisi." } };
  }
  if (!sandiBenar(sandi)) {
    return { ok: false, errors: { sandi: "Kata sandi salah." } };
  }

  await buatSesi();
  redirect("/admin"); // redirect melempar exception khusus, jadi jangan taruh di dalam try
}

export async function logout(): Promise<void> {
  await hapusSesi();
  redirect("/login");
}

/** Untuk /login: kalau sudah masuk, langsung ke /admin. */
export async function sudahLogin(): Promise<boolean> {
  return adalahAdmin();
}

/* ------------------------------------------------------------------ */
/* ADMIN: setujui / tolak permohonan                                   */
/* ------------------------------------------------------------------ */

export async function setujuiPeminjaman(id: number): Promise<AksiHasil> {
  await wajibAdmin(); // pemeriksaan ulang di setiap Server Action, bukan hanya di halaman

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "Permohonan tidak valid." };
  }

  try {
    const { data: p, error } = await db
      .from("peminjaman")
      .select("id, ruang_id, tanggal, mulai, selesai, status")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;

    if (!p) return { ok: false, message: "Permohonan tidak ditemukan." };
    if (p.status !== "menunggu") {
      return { ok: false, message: "Permohonan ini sudah diproses sebelumnya." };
    }

    if (await adaBentrok(p.ruang_id, p.tanggal, p.mulai, p.selesai, id)) {
      return {
        ok: false,
        message: "Tidak dapat disetujui: jadwalnya bentrok dengan peminjaman lain yang sudah disetujui.",
      };
    }

    // .eq("status", "menunggu") mencegah dua admin menyetujui permohonan yang sama
    const { error: errUbah } = await db
      .from("peminjaman")
      .update({ status: "disetujui", alasan_tolak: null })
      .eq("id", id)
      .eq("status", "menunggu");

    if (errUbah) {
      if (errUbah.code === "23P01") {
        return { ok: false, message: "Tidak dapat disetujui: jadwalnya bentrok dengan peminjaman lain." };
      }
      throw errUbah;
    }

    // Permohonan menunggu lain yang bentrok otomatis ditolak
    const { data: otomatis, error: errTolak } = await db
      .from("peminjaman")
      .update({
        status: "ditolak",
        alasan_tolak: "Bentrok dengan peminjaman lain yang telah disetujui.",
      })
      .eq("ruang_id", p.ruang_id)
      .eq("tanggal", p.tanggal)
      .eq("status", "menunggu")
      .neq("id", id)
      .lt("mulai", p.selesai)
      .gt("selesai", p.mulai)
      .select("id");
    if (errTolak) throw errTolak;

    segarkan();
    const n = otomatis?.length ?? 0;
    return {
      ok: true,
      message:
        n > 0
          ? `Permohonan disetujui. ${n} permohonan lain yang bentrok ditolak otomatis.`
          : "Permohonan disetujui.",
    };
  } catch (e) {
    console.error("setujuiPeminjaman:", e);
    return { ok: false, message: PESAN_UMUM };
  }
}

export async function tolakPeminjaman(
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  await wajibAdmin();

  const id = Number(ambil(fd, "id"));
  const alasan = ambil(fd, "alasan");
  const values = salinIsian(fd);

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "Permohonan tidak valid.", values };
  }
  if (alasan.length < 5) {
    return {
      ok: false,
      errors: { alasan: "Alasan penolakan wajib diisi, minimal 5 huruf." },
      values,
    };
  }
  if (alasan.length > 200) {
    return { ok: false, errors: { alasan: "Alasan terlalu panjang (maksimal 200 huruf)." }, values };
  }

  try {
    const { data, error } = await db
      .from("peminjaman")
      .update({ status: "ditolak", alasan_tolak: alasan })
      .eq("id", id)
      .eq("status", "menunggu")
      .select("id");
    if (error) throw error;

    if (!data || data.length === 0) {
      return { ok: false, message: "Permohonan tidak ditemukan atau sudah diproses.", values };
    }

    segarkan();
    return { ok: true, message: "Permohonan ditolak." };
  } catch (e) {
    console.error("tolakPeminjaman:", e);
    return { ok: false, message: PESAN_UMUM, values };
  }
}

/* ------------------------------------------------------------------ */
/* ADMIN: kelola ruang                                                 */
/* ------------------------------------------------------------------ */

export async function tambahRuang(
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  await wajibAdmin();

  const values = salinIsian(fd);
  const errors: Record<string, string> = {};

  const nama = ambil(fd, "nama");
  const jenis = ambil(fd, "jenis");
  const lokasi = ambil(fd, "lokasi");
  const kapasitasTeks = ambil(fd, "kapasitas");
  const kapasitas = /^\d+$/.test(kapasitasTeks) ? Number(kapasitasTeks) : NaN;

  if (nama.length < 3 || nama.length > 40) errors.nama = "Nama ruang harus 3 sampai 40 huruf.";
  if (!JENIS.includes(jenis)) errors.jenis = "Pilih jenis: lab, kelas, atau aula.";
  if (!Number.isInteger(kapasitas) || kapasitas <= 0) errors.kapasitas = "Kapasitas harus bilangan lebih dari 0.";
  if (lokasi.length < 1 || lokasi.length > 100) errors.lokasi = "Lokasi wajib diisi (maksimal 100 huruf).";

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Periksa kembali isian Anda.", errors, values };
  }

  try {
    const { error } = await db.from("ruang").insert({ nama, jenis, kapasitas, lokasi });
    if (error) {
      if (error.code === "23505") {
        return { ok: false, errors: { nama: "Nama ruang sudah dipakai." }, values };
      }
      throw error;
    }
    segarkan();
    return { ok: true, message: "Ruang berhasil ditambahkan." };
  } catch (e) {
    console.error("tambahRuang:", e);
    return { ok: false, message: PESAN_UMUM, values };
  }
}

export async function ubahStatusRuang(id: number, aktif: boolean): Promise<AksiHasil> {
  await wajibAdmin();

  if (!Number.isInteger(id) || id <= 0 || typeof aktif !== "boolean") {
    return { ok: false, message: "Permintaan tidak valid." };
  }

  try {
    const { data, error } = await db
      .from("ruang")
      .update({ aktif })
      .eq("id", id)
      .select("id");
    if (error) throw error;
    if (!data || data.length === 0) return { ok: false, message: "Ruang tidak ditemukan." };

    segarkan();
    return { ok: true, message: aktif ? "Ruang diaktifkan." : "Ruang dinonaktifkan." };
  } catch (e) {
    console.error("ubahStatusRuang:", e);
    return { ok: false, message: PESAN_UMUM };
  }
}

export async function hapusRuang(id: number): Promise<AksiHasil> {
  await wajibAdmin();

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "Permintaan tidak valid." };
  }

  const pesanDipakai =
    "Ruang ini pernah dipinjam sehingga tidak bisa dihapus. Anda bisa menonaktifkannya saja.";

  try {
    // Pemeriksaan di server untuk pesan ramah...
    const { count, error: errHitung } = await db
      .from("peminjaman")
      .select("id", { count: "exact", head: true })
      .eq("ruang_id", id);
    if (errHitung) throw errHitung;
    if ((count ?? 0) > 0) return { ok: false, message: pesanDipakai };

    // ...dan database tetap menjaga lewat ON DELETE RESTRICT
    const { error } = await db.from("ruang").delete().eq("id", id);
    if (error) {
      if (error.code === "23503" || error.code === "23001") {
        return { ok: false, message: pesanDipakai };
      }
      throw error;
    }

    segarkan();
    return { ok: true, message: "Ruang berhasil dihapus." };
  } catch (e) {
    console.error("hapusRuang:", e);
    return { ok: false, message: PESAN_UMUM };
  }
}