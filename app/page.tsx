import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader judul="Dashboard" />
      <div className="p-4 lg:p-6">
        <p className="text-muted-foreground">
          Daftar ruang akan tampil di sini.
        </p>
      </div>
    </>
  );
}
