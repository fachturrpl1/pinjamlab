import { SiteHeader } from "@/components/site-header";
import { wajibAdmin } from "@/lib/session";

export default async function AdminRuangPage() {
  // Penjagaan sebenarnya ada di sini pada setiap halaman admin, bukan di menu sidebar
  await wajibAdmin();

  return (
    <>
      <SiteHeader judul="Kelola Ruang" />
      <div className="p-4 lg:p-6">
        <p className="text-muted-foreground">
          Akan dibuat di langkah berikutnya.
        </p>
      </div>
    </>
  );
}
