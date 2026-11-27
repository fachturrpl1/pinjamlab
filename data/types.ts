export type Jenis = "lab" | "kelas" | "aula";
export type Status = "menunggu" | "disetujui" | "ditolak";

export type Ruang = {
  id: number;
  nama: string;
  jenis: Jenis;
  kapasitas: number;
  lokasi: string;
  aktif: boolean;
};

export type Peminjaman = {
  id: number;
  ruang_id: number;
  peminjam: string;
  keperluan: string;
  tanggal: string; // "YYYY-MM-DD"
  mulai: string; // "HH:MM:SS"
  selesai: string; // "HH:MM:SS"
  jumlah_orang: number;
  status: Status;
  alasan_tolak: string | null;
  dibuat: string; // ISO timestamp
};

// Aman untuk halaman publik: tanpa peminjam, keperluan, alasan_tolak, dan dibuat
export type JadwalPublik = Pick<
  Peminjaman,
  "id" | "ruang_id" | "tanggal" | "mulai" | "selesai"
>;
