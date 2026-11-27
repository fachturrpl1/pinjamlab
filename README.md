# LokaRuang

1. **Nama Aplikasi dan Alamat Vercel**
   - Nama aplikasi: **LokaRuang** (Aplikasi Peminjaman Ruang dan Laboratorium Sekolah)
   - Alamat Vercel: `https://lokaruang.vercel.app/`

2. **Cara Menjalankan di Laptop**
   - Pasang dependensi:
     ```bash
     npm install
     ```
   - Buat proyek Supabase baru, lalu jalankan seluruh isi berkas `database.sql` di SQL Editor Supabase untuk membuat tabel, aturan keamanan, dan data contoh.
   - Buat berkas `.env.local` di akar proyek dan isi seluruh variabel lingkungan berikut (tanpa mengunggahnya ke Git):
     ```env
     NEXT_PUBLIC_SUPABASE_URL=
     SUPABASE_SECRET_KEY=
     ADMIN_PASSWORD=
     SESSION_SECRET=
     ```
     (`SESSION_SECRET` diisi string acak panjang, misalnya dari hasil `openssl rand -hex 32`.)
   - Jalankan server pengembangan:
     ```bash
     npm run dev
     ```

3. **Daftar Halaman dan Fungsinya**

| Rute | Pengguna | Fungsi |
|---|---|---|
| `/` | Publik | Beranda berisi ringkasan PinjamLab dan daftar ruang aktif |
| `/ruang` | Publik | Daftar ruang aktif dengan filter parameter URL (`?jenis=lab\|kelas\|aula`) |
| `/ruang/[id]` | Publik | Detail ruang, tombol pengajuan (bila aktif), dan jadwal disetujui tanpa nama peminjam |
| `/pinjam` | Publik | Formulir pengajuan peminjaman ruang dengan validasi server dan galat per kolom |
| `/peminjaman` | Publik | Daftar seluruh jadwal peminjaman yang sudah disetujui tanpa nama peminjam |
| `/cek` | Publik | Cek status permohonan menggunakan nomor permohonan dan nama peminjam |
| `/login` | Publik | Halaman masuk admin menggunakan kata sandi |
| `/admin` | Admin | Ringkasan statistik, filter status, dan persetujuan atau penolakan permohonan |
| `/admin/ruang` | Admin | Tambah ruang baru, aktifkan/nonaktifkan ruang, dan hapus ruang |

4. **Aturan Bisnis dan Lapisan Penerapan**

| Aturan Bisnis | Server | Basis Data |
|---|---|---|
| Ruang yang dipinjam harus aktif | Ya | - |
| Tanggal valid, tidak lampau, maksimal 60 hari ke depan (`Asia/Jakarta`) | Ya | - |
| Hari peminjaman hanya Senin–Jumat | Ya | Ya (`CHECK EXTRACT(ISODOW FROM tanggal) < 6`) |
| Jam peminjaman `07:00`–`17:00`, jam selesai setelah jam mulai | Ya | Ya (`CHECK`) |
| Durasi peminjaman maksimal 3 jam | Ya | Ya (`CHECK`) |
| Jumlah orang tidak melebihi kapasitas ruang | Ya | - |
| Pengajuan ditolak jika bentrok dengan jadwal `disetujui` (jam menempel boleh) | Ya | Ya (`EXCLUDE USING gist` dengan `tsrange(..., '[)')`) |
| Dua permohonan `menunggu` yang bertumpuk boleh diajukan bersamaan | Ya | - |
| Menyetujui satu permohonan otomatis menolak permohonan `menunggu` lain yang bentrok | Ya | - |
| Penolakan wajib disertai alasan minimal 5 huruf | Ya | Opsional |
| Ruang yang pernah dipinjam tidak dapat dihapus | Ya | Ya (`ON DELETE RESTRICT`) |

5. **Keamanan**
   - **Kunci publik vs rahasia:** `NEXT_PUBLIC_SUPABASE_URL` boleh diketahui publik, sedangkan `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`, dan `SESSION_SECRET` hanya dipakai di server (tidak diawali `NEXT_PUBLIC_` dan tidak disimpan di repositori). `lib/supabase-server.ts` memakai `server-only` agar tidak terbawa ke kode browser.
   - **RLS dan GRANT:** Row Level Security diaktifkan pada tabel `ruang` dan `peminjaman`. Hak akses `anon` dan `authenticated` dicabut seluruhnya pada `peminjaman` (`REVOKE ALL` tanpa policy), sedangkan pada `ruang` hanya diberi `GRANT SELECT` dan policy `"publik boleh baca ruang"`. Data pribadi peminjam tidak dapat dibaca melalui kunci publik.
   - **Query halaman publik:** `lib/data.ts` hanya memilih kolom aman secara eksplisit (`id, ruang_id, tanggal, mulai, selesai`), tanpa `peminjam`, `keperluan`, `alasan_tolak`, atau `dibuat`.
   - **Sesi dan otorisasi admin:** Login admin membuat cookie `httpOnly` bertanda tangan HMAC-SHA256 (`pinjamlab_session` di `lib/session.ts`) yang diverifikasi dengan `timingSafeEqual`. `wajibAdmin()` dipanggil di awal `/admin`, `/admin/ruang`, dan di awal setiap Server Action admin pada `app/actions.ts`.

6. **Masalah yang Ditemui Saat Pengujian**
   - **Gejala:** Tidak bisa login menjadi admin meskipun kata sandi sudah benar.
   - **Penyebab:** Ada salah ketik (*typo*) pada penulisan nama variabel `SESSION_SECRET` di berkas lingkungan, sehingga `process.env.SESSION_SECRET` bernilai kosong saat penandatanganan cookie sesi di `lib/session.ts`.
   - **Perbaikan:** Memperbaiki penulisan nama variabel menjadi `SESSION_SECRET` dengan benar, lalu memulai ulang server pengembangan.

7. **Bagian yang Belum Selesai**
   - Belum ada pembatasan jumlah percobaan (*rate limiting*) pada form `/login` dan `/cek` di `app/actions.ts`.
   - `setujuiPeminjaman` di `app/actions.ts` masih menjalankan pembaruan status disetujui dan penolakan otomatis permohonan bentrok dalam dua langkah query terpisah tanpa transaksi SQL/RPC.
   - Penayangan ke Vercel beserta pengujian langsung pada alamat publik (`https://lokaruang.vercel.app/`) dan pengisian alamat situs pada butir 1.
