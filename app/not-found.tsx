import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <>
      <SiteHeader judul="Tidak Ditemukan" />
      <div className="flex flex-1 flex-col items-start gap-4 p-4 lg:p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Halaman tidak ditemukan</h2>
          <p className="text-sm text-muted-foreground">
            Halaman atau data ruang yang Anda cari tidak tersedia.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Kembali ke Dashboard</Link>
        </Button>
      </div>
    </>
  );
}
