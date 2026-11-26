export type Ruang = {
    id: number;
    nama: string;
    jenis: string;
    kapasitas: number;
    lokasi: string
    aktif: boolean;
}

export type Peminjam = {
    id: number;
    ruang_id: number;
    peminjam: string;
    keperluan: string;
    tanggal: string;
    mulai: string;
    selesai: string;
    jumlah_orang: number;
    status: string;
    alasan_tolak: string | null;
    dibuat: string;
}