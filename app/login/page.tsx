import { redirect } from "next/navigation";
import { sudahLogin } from "@/app/actions";
import { FormLogin } from "@/components/form-login";
import { SiteHeader } from "@/components/site-header";

export default async function LoginPage() {
  // Admin yang sudah masuk tidak perlu login lagi, langsung arahkan ke /admin
  if (await sudahLogin()) {
    redirect("/admin");
  }

  return (
    <>
      <SiteHeader judul="Login Admin" />
      <div className="mx-auto w-full max-w-md p-4 lg:p-6">
        <FormLogin />
      </div>
    </>
  );
}
