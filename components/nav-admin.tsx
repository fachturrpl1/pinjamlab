"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Building2Icon, ClipboardListIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const menuAdmin = [
  {
    judul: "Permohonan",
    url: "/admin",
    ikon: ClipboardListIcon,
    submenu: [
      { judul: "Semua", url: "/admin", status: null },
      { judul: "Menunggu", url: "/admin?status=menunggu", status: "menunggu" },
      { judul: "Disetujui", url: "/admin?status=disetujui", status: "disetujui" },
      { judul: "Ditolak", url: "/admin?status=ditolak", status: "ditolak" },
    ],
  },
  {
    judul: "Kelola Ruang",
    url: "/admin/ruang",
    ikon: Building2Icon,
  },
];

const STATUS_VALID = ["menunggu", "disetujui", "ditolak"];

export function NavAdmin() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusAktif = searchParams.get("status");

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuAdmin.map((item) => {
            const Ikon = item.ikon;
            const aktif = pathname === item.url;

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
                      // Nilai ?status= tak dikenal dianggap menampilkan semua permohonan
                      const subAktif =
                        pathname === "/admin" &&
                        (sub.status === null
                          ? !STATUS_VALID.includes(statusAktif ?? "")
                          : statusAktif === sub.status);

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
