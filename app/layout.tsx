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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hasil ini HANYA untuk menentukan menu yang tampil di sidebar, bukan pengaman.
  // Halaman dan Server Action admin tetap wajib memanggil wajibAdmin().
  const admin = await adalahAdmin();

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
          <AppSidebar isAdmin={admin} />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
