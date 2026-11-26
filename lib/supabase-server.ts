import "server-only"; // build gagal bila file ini ikut terimpor ke kode browser
import { createClient } from "@supabase/supabase-js";

// Kunci rahasia melewati RLS, jadi HANYA dipakai di server.
// Jangan beri awalan NEXT_PUBLIC_ pada SUPABASE_SECRET_KEY.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);