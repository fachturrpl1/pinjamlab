import Link from "next/link";
import { DaftarKartuRuang } from "@/components/kartu-ruang";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ambilRuangAktif } from "@/lib/data";

export default async function HomePage() {
  const daftarRuang = await ambilRuangAktif();

  return (
    <>
      <SiteHeader judul="Dashboard" />
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">
              Selamat datang di PinjamLab
            </h2>
            <p className="text-sm text-muted-foreground">
              Lihat ketersediaan laboratorium, ruang kelas, dan aula sekolah
              serta ajukan peminjaman tanpa jadwal bentrok.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/ruang">Lihat Semua Ruang</Link>
          </Button>
        </div>

        <section className="space-y-3">
          <h3 className="text-base font-medium">Ruang Aktif</h3>
          <DaftarKartuRuang daftarRuang={daftarRuang} />
        </section>
      </div>
    </>
  );
}
