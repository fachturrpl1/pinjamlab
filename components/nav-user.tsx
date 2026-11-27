"use client";

import Link from "next/link";
import {
  EllipsisVerticalIcon,
  LogInIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import { logout } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({ isAdmin }: { isAdmin: boolean }) {
  const { isMobile } = useSidebar();

  // Pengunjung yang belum login melihat tautan menuju halaman /login
  if (!isAdmin) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild tooltip="Login">
            <Link href="/login">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  <UserIcon className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Pengunjung</span>
                <span className="truncate text-xs text-muted-foreground">
                  Login
                </span>
              </div>
              <LogInIcon className="ml-auto size-4" />
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Admin yang sudah login melihat menu dropdown untuk Keluar
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  A
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Admin</span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <form action={logout}>
              <DropdownMenuItem
                asChild
                onSelect={(e) => {
                  // Cegah dropdown tertutup sebelum form sempat dikirim ke Server Action
                  e.preventDefault();
                  (e.currentTarget as HTMLButtonElement).form?.requestSubmit();
                }}
              >
                <button type="submit" className="w-full cursor-pointer">
                  <LogOutIcon />
                  <span>Keluar</span>
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
