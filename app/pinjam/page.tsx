import { InfoIcon } from "lucide-react";
import { FormPinjam } from "@/components/form-pinjam";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ambilRuangAktif } from "@/lib/data";
import { hariIniWIB, tambahHari } from "@/lib/format";

export default async function PinjamPage({
  searchParams,
}: {
  searchParams: Promise<{ ruang?: string }>;
}) {
  const [{ ruang }, daftarRuang] = await Promise.all([
    searchParams,
    ambilRuangAktif(),
  ]);

  // Terima parameter ?ruang= hanya bila berupa angka dan ada di daftar ruang aktif
  const ruangAwal =
    ruang &&
    /^\d+$/.test(ruang) &&
    daftarRuang.some((r) => String(r.id) === ruang)
      ? ruang
      : "";

  // Hitung batas tanggal di server (WIB) agar konsisten dengan validasi Server Action
  const minTanggal = hariIniWIB();
  const maksTanggal = tambahHari(minTanggal, 60);

  return (
    <>
      <SiteHeader judul="Formulir Peminjaman" />
      <div className="mx-auto w-full max-w-2xl space-y-6 p-4 lg:p-6">
        <Alert>
          <InfoIcon />
          <AlertTitle>Ketentuan Peminjaman</AlertTitle>
          <AlertDescription>
            Hari Senin–Jumat, pukul 07:00–17:00, durasi maksimal 3 jam, dan
            tidak boleh bentrok dengan jadwal yang sudah disetujui.
          </AlertDescription>
        </Alert>

        {daftarRuang.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada ruang aktif yang dapat dipinjam saat ini.
          </p>
        ) : (
          <FormPinjam
            daftarRuang={daftarRuang}
            ruangAwal={ruangAwal}
            minTanggal={minTanggal}
            maksTanggal={maksTanggal}
          />
        )}
      </div>
    </>
  );
}
