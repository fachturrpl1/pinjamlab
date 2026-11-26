import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, timingSafeEqual } from "crypto";

const NAMA_COOKIE = "pinjamlab_session";
const DURASI_MS = 8 * 60 * 60 * 1000; // 8 jam

function tandatangani(nilai: string): string {
  const rahasia = process.env.SESSION_SECRET;
  if (!rahasia) throw new Error("SESSION_SECRET belum diatur");
  return createHmac("sha256", rahasia).update(nilai).digest("hex");
}

/** Bandingkan sandi tanpa bocor lewat waktu eksekusi. */
export function sandiBenar(input: string): boolean {
  const sandi = process.env.ADMIN_PASSWORD;
  if (!sandi) return false;
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(input), hash(sandi));
}

export async function buatSesi(): Promise<void> {
  const kedaluwarsa = Date.now() + DURASI_MS;
  const isi = `admin.${kedaluwarsa}`;
  (await cookies()).set(NAMA_COOKIE, `${isi}.${tandatangani(isi)}`, {
    httpOnly: true, // tidak terbaca oleh JavaScript di browser
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURASI_MS / 1000,
  });
}

export async function hapusSesi(): Promise<void> {
  (await cookies()).delete(NAMA_COOKIE);
}

export async function adalahAdmin(): Promise<boolean> {
  const token = (await cookies()).get(NAMA_COOKIE)?.value;
  if (!token) return false;

  const [peran, kedaluwarsa, tanda] = token.split(".");
  if (peran !== "admin" || !kedaluwarsa || !tanda) return false;

  const a = Buffer.from(tanda);
  const b = Buffer.from(tandatangani(`${peran}.${kedaluwarsa}`));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  return Number(kedaluwarsa) > Date.now();
}

/** Panggil di awal setiap halaman dan Server Action milik admin. */
export async function wajibAdmin(): Promise<void> {
  if (!(await adalahAdmin())) redirect("/login");
}