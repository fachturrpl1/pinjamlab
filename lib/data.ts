import "server-only";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { JadwalPublik, Jenis, Ruang } from "@/data/types";

const KOLOM_RUANG = "id, nama, jenis, kapasitas, lokasi, aktif";

// Pilih kolom aman secara eksplisit: JANGAN pakai select("*") dan JANGAN sertakan
// peminjam, keperluan, alasan_tolak, atau dibuat untuk query halaman publik.
const KOLOM_JADWAL_PUBLIK = "id, ruang_id, tanggal, mulai, selesai";

/** Ambil daftar ruang yang aktif, diurutkan berdasarkan nama. */
export async function ambilRuangAktif(jenis?: Jenis): Promise<Ruang[]> {
  let query = supabaseAdmin
    .from("ruang")
    .select(KOLOM_RUANG)
    .eq("aktif", true)
    .order("nama", { ascending: true });

  if (jenis) {
    query = query.eq("jenis", jenis);
  }

  const { data, error } = await query;
  if (error) {
    console.error("ambilRuangAktif:", error);
    throw new Error("Gagal memuat data ruang.");
  }

  return (data ?? []) as Ruang[];
}

/** Ambil seluruh ruang (aktif maupun nonaktif) untuk pemetaan nama ruang pada jadwal. */
export async function ambilSemuaRuang(): Promise<Ruang[]> {
  const { data, error } = await supabaseAdmin
    .from("ruang")
    .select(KOLOM_RUANG)
    .order("nama", { ascending: true });

  if (error) {
    console.error("ambilSemuaRuang:", error);
    throw new Error("Gagal memuat daftar ruang.");
  }

  return (data ?? []) as Ruang[];
}

/** Ambil detail satu ruang berdasarkan ID (boleh yang berstatus nonaktif). */
export async function ambilRuangById(id: number): Promise<Ruang | null> {
  const { data, error } = await supabaseAdmin
    .from("ruang")
    .select(KOLOM_RUANG)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("ambilRuangById:", error);
    throw new Error("Gagal memuat detail ruang.");
  }

  return (data as Ruang | null) ?? null;
}

/** Ambil jadwal peminjaman yang sudah disetujui tanpa data pribadi peminjam. */
export async function ambilJadwalDisetujui(
  ruangId?: number
): Promise<JadwalPublik[]> {
  let query = supabaseAdmin
    .from("peminjaman")
    .select(KOLOM_JADWAL_PUBLIK)
    .eq("status", "disetujui")
    .order("tanggal", { ascending: true })
    .order("mulai", { ascending: true });

  if (ruangId !== undefined) {
    query = query.eq("ruang_id", ruangId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("ambilJadwalDisetujui:", error);
    throw new Error("Gagal memuat jadwal peminjaman.");
  }

  return (data ?? []) as JadwalPublik[];
}
