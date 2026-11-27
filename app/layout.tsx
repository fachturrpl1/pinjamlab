import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { adalahAdmin } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PinjamLab",
  description: "Aplikasi peminjaman ruang dan laboratorium sekolah",
};

// Dipisah ke komponen async agar pembacaan cookie (adalahAdmin) berada di dalam <Suspense>
// sesuai aturan Cache Components Next.js 16.
async function SidebarDenganStatus() {
  // Hasil ini HANYA untuk menentukan menu yang tampil di sidebar, bukan pengaman.
  // Halaman dan Server Action admin tetap wajib memanggil wajibAdmin().
  const admin = await adalahAdmin();
  return <AppSidebar isAdmin={admin} />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <Suspense fallback={<AppSidebar isAdmin={false} />}>
            <SidebarDenganStatus />
          </Suspense>
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
