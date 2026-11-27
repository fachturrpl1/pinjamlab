"use client";

import { Suspense } from "react";
import Link from "next/link";
import { CommandIcon } from "lucide-react";
import { NavAdmin } from "@/components/nav-admin";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <TooltipProvider>
      <Sidebar collapsible="offcanvas" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <Link href="/">
                  <CommandIcon className="size-5!" />
                  <span className="text-base font-semibold">PinjamLab</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {/* Bungkus dengan Suspense karena NavMain dan NavAdmin memakai useSearchParams */}
          <Suspense fallback={null}>
            <NavMain />
          </Suspense>
          {isAdmin && (
            <Suspense fallback={null}>
              <NavAdmin />
            </Suspense>
          )}
        </SidebarContent>

        <SidebarFooter>
          <NavUser isAdmin={isAdmin} />
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
