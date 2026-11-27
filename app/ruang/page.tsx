import Link from "next/link";
import { DaftarKartuRuang } from "@/components/kartu-ruang";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import type { Jenis } from "@/data/types";
import { ambilRuangAktif } from "@/lib/data";

const FILTER_JENIS: { label: string; href: string; nilai?: Jenis }[] = [
  { label: "Semua", href: "/ruang" },
  { label: "Lab", href: "/ruang?jenis=lab", nilai: "lab" },
  { label: "Kelas", href: "/ruang?jenis=kelas", nilai: "kelas" },
  { label: "Aula", href: "/ruang?jenis=aula", nilai: "aula" },
];

const JENIS_VALID: Jenis[] = ["lab", "kelas", "aula"];

export default async function RuangPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>;
}) {
  const { jenis } = await searchParams;

  // Abaikan nilai ?jenis= yang tidak dikenal dan tampilkan semua ruang tanpa error
  const jenisTerpilih = JENIS_VALID.includes(jenis as Jenis)
    ? (jenis as Jenis)
    : undefined;

  const daftarRuang = await ambilRuangAktif(jenisTerpilih);

  return (
    <>
      <SiteHeader judul="Daftar Ruang" />
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex flex-wrap gap-2">
          {FILTER_JENIS.map((item) => {
            const aktif = item.nilai === jenisTerpilih;
            return (
              <Button
                key={item.href}
                asChild
                size="sm"
                variant={aktif ? "default" : "outline"}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            );
          })}
        </div>

        <DaftarKartuRuang daftarRuang={daftarRuang} />
      </div>
    </>
  );
}
