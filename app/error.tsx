"use client";

import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <SiteHeader judul="Terjadi Kesalahan" />
      <div className="flex flex-1 flex-col items-start gap-4 p-4 lg:p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            Data belum dapat dimuat, coba lagi
          </h2>
          <p className="text-sm text-muted-foreground">
            Silakan muat ulang halaman ini beberapa saat lagi.
          </p>
        </div>
        <Button onClick={reset}>Coba Lagi</Button>
      </div>
    </>
  );
}
