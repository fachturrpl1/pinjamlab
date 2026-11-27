"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CalendarDaysIcon,
  CirclePlusIcon,
  DoorOpenIcon,
  LayoutDashboardIcon,
  SearchCheckIcon,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const menuUtama = [
  {
    judul: "Dashboard",
    url: "/",
    ikon: LayoutDashboardIcon,
  },
  {
    judul: "Ruang",
    url: "/ruang",
    ikon: DoorOpenIcon,
    submenu: [
      { judul: "Semua", url: "/ruang", jenis: null },
      { judul: "Lab", url: "/ruang?jenis=lab", jenis: "lab" },
      { judul: "Kelas", url: "/ruang?jenis=kelas", jenis: "kelas" },
      { judul: "Aula", url: "/ruang?jenis=aula", jenis: "aula" },
    ],
  },
  {
    judul: "Peminjaman",
    url: "/peminjaman",
    ikon: CalendarDaysIcon,
  },
  {
    judul: "Cek",
    url: "/cek",
    ikon: SearchCheckIcon,
  },
];

const JENIS_VALID = ["lab", "kelas", "aula"];

export function NavMain() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const jenisAktif = searchParams.get("jenis");

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Tombol utama untuk mengajukan peminjaman baru */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Ajukan Peminjaman"
              isActive={pathname === "/pinjam"}
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <Link href="/pinjam">
                <CirclePlusIcon />
                <span>Ajukan Peminjaman</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Daftar menu navigasi publik */}
        <SidebarMenu>
          {menuUtama.map((item) => {
            const Ikon = item.ikon;
            const aktif =
              item.url === "/"
                ? pathname === "/"
                : pathname === item.url || pathname.startsWith(`${item.url}/`);

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild tooltip={item.judul} isActive={aktif}>
                  <Link href={item.url}>
                    <Ikon />
                    <span>{item.judul}</span>
                  </Link>
                </SidebarMenuButton>

                {item.submenu && (
                  <SidebarMenuSub>
                    {item.submenu.map((sub) => {
                      // Nilai ?jenis= tak dikenal dianggap menampilkan semua ruang
                      const subAktif =
                        pathname === "/ruang" &&
                        (sub.jenis === null
                          ? !JENIS_VALID.includes(jenisAktif ?? "")
                          : jenisAktif === sub.jenis);

                      return (
                        <SidebarMenuSubItem key={sub.url}>
                          <SidebarMenuSubButton asChild isActive={subAktif}>
                            <Link href={sub.url}>
                              <span>{sub.judul}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
