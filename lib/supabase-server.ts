import "server-only"; // build gagal bila file ini ikut terimpor ke kode browser
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let klien: SupabaseClient | null = null;

function ambilKlien(): SupabaseClient {
  if (!klien) {
    // Dibuat saat pertama kali dipakai (bukan saat impor modul), agar `next build`
    // dapat memeriksa konfigurasi rute meskipun variabel env belum tersedia saat build.
    klien = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return klien;
}

// Kunci rahasia melewati RLS, jadi HANYA dipakai di server.
// Jangan beri awalan NEXT_PUBLIC_ pada SUPABASE_SECRET_KEY.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const target = ambilKlien();
    const nilai = Reflect.get(target, prop, target);
    return typeof nilai === "function" ? nilai.bind(target) : nilai;
  },
});
