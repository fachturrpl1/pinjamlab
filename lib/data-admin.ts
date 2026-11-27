import "server-only";
import type { Peminjaman, Status } from "@/data/types";
import { ambilSemuaRuang } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-server";

export type StatistikAdmin = {
  menunggu: number;
  disetujui: number;
  ditolak: number;
  ruangAktif: number;
};

export type PermohonanDenganRuang = Peminjaman & {
  nama_ruang: string;
};

const KOLOM_PERMOHONAN =
  "id, ruang_id, peminjam, keperluan, tanggal, mulai, selesai, jumlah_orang, status, alasan_tolak, dibuat";

/** Hitung jumlah permohonan per status dan jumlah ruang aktif secara paralel. */
export async function ambilStatistik(): Promise<StatistikAdmin> {
  const [resMenunggu, resDisetujui, resDitolak, resRuang] = await Promise.all([
    supabaseAdmin
      .from("peminjaman")
      .select("id", { count: "exact", head: true })
      .eq("status", "menunggu"),
    supabaseAdmin
      .from("peminjaman")
      .select("id", { count: "exact", head: true })
      .eq("status", "disetujui"),
    supabaseAdmin
      .from("peminjaman")
      .select("id", { count: "exact", head: true })
      .eq("status", "ditolak"),
    supabaseAdmin
      .from("ruang")
      .select("id", { count: "exact", head: true })
      .eq("aktif", true),
  ]);

  const error =
    resMenunggu.error ??
    resDisetujui.error ??
    resDitolak.error ??
    resRuang.error;
  if (error) {
    console.error("ambilStatistik:", error);
    throw new Error("Gagal memuat statistik admin.");
  }

  return {
    menunggu: resMenunggu.count ?? 0,
    disetujui: resDisetujui.count ?? 0,
    ditolak: resDitolak.count ?? 0,
    ruangAktif: resRuang.count ?? 0,
  };
}

/** Ambil daftar permohonan lengkap untuk halaman admin, urut terbaru. */
export async function ambilPermohonan(
  status?: Status
): Promise<PermohonanDenganRuang[]> {
  let query = supabaseAdmin
    .from("peminjaman")
    .select(KOLOM_PERMOHONAN)
    .order("dibuat", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const [{ data, error }, daftarRuang] = await Promise.all([
    query,
    ambilSemuaRuang(),
  ]);

  if (error) {
    console.error("ambilPermohonan:", error);
    throw new Error("Gagal memuat daftar permohonan.");
  }

  const petaRuang = new Map(daftarRuang.map((r) => [r.id, r.nama]));

  return ((data ?? []) as Peminjaman[]).map((item) => ({
    ...item,
    nama_ruang: petaRuang.get(item.ruang_id) ?? "-",
  }));
}
