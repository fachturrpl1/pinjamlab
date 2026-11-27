import { Building2Icon, GraduationCapIcon, MonitorIcon } from "lucide-react";
import type { Jenis } from "@/data/types";

/** Format "2026-11-30" menjadi "Sen, 30 Nov 2026" tanpa pergeseran zona waktu. */
export function formatTanggal(tanggal: string): string {
  // Parse sebagai UTC agar tanggal tidak bergeser mundur/maju mengikuti zona waktu server/browser
  const d = new Date(`${tanggal}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return tanggal;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** Format "09:00:00" menjadi "09:00". */
export function formatJam(jam: string): string {
  return jam.slice(0, 5);
}

/** Format nomor permohonan menjadi "PJM-00001". */
export function nomorPermohonan(id: number): string {
  return `PJM-${String(id).padStart(5, "0")}`;
}

export const labelJenis: Record<Jenis, string> = {
  lab: "Laboratorium",
  kelas: "Ruang Kelas",
  aula: "Aula",
};

export const ikonJenis = {
  lab: MonitorIcon,
  kelas: GraduationCapIcon,
  aula: Building2Icon,
} as const;
