import { FormCek } from "@/components/form-cek";
import { SiteHeader } from "@/components/site-header";

export default function CekPage() {
  return (
    <>
      <SiteHeader judul="Cek Status Peminjaman" />
      <div className="mx-auto w-full max-w-2xl p-4 lg:p-6">
        <FormCek />
      </div>
    </>
  );
}
