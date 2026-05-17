"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const adminItems = [
  {
    title: "Dashboard",
    url: "/backoffice",
    icon: LayoutDashboard,
  },
  {
    title: "Daftar Tenant",
    url: "/backoffice/tenants",
    icon: Building2,
  },
  {
    title: "Manajemen User",
    url: "/backoffice/users",
    icon: Users,
  },
  {
    title: "Langganan",
    url: "/backoffice/billing",
    icon: CreditCard,
  },
  {
    title: "Konfigurasi Sistem",
    url: "/backoffice/settings",
    icon: Settings,
  },
];

export function BackofficeSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-slate-900 text-white dark">
      <SidebarHeader className="p-4 bg-slate-950">
        <div className="flex items-center gap-3 px-3">
          <div className="h-9 w-9 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 bg-white">
            <img src="/logo-penagraha.png" alt="Penagraha" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight">Penagraha</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Admin Portal</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-slate-900 border-none">
        <SidebarGroup>
          <SidebarGroupLabel className="px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-6 mb-2">
            Platform Control
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
                {adminItems.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        tooltip={item.title} 
                        render={<a href={item.url} />}
                        isActive={isActive}
                        className={cn(
                          "group/item relative px-5 py-6 transition-all duration-300 rounded-lg my-1",
                          isActive 
                            ? "bg-slate-800 text-orange-400 shadow-md scale-[1.01]" 
                            : "hover:bg-slate-800/50 text-slate-400"
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-all duration-300",
                          isActive ? "scale-110 text-orange-400" : "text-slate-500 group-hover/item:text-white"
                        )} />
                        <span className={cn(
                          "tracking-tight transition-colors duration-300",
                          isActive ? "font-bold text-white" : "text-slate-400 group-hover/item:text-white"
                        )}>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-800 bg-slate-950">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => {
                const { signOut } = require("next-auth/react");
                signOut({ callbackUrl: "/auth/login" });
              }}
              className="hover:bg-red-500/10 hover:text-red-500 px-5 py-6 transition-all h-auto w-full group/logout"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 group-hover/logout:bg-red-500/20 group-hover/logout:border-red-500/50 transition-all">
                  <LogOut className="h-5 w-5 text-slate-500 group-hover/logout:text-red-500 transition-colors" />
                </div>
                <span className="font-bold text-sm text-slate-300 group-hover/logout:text-red-500 transition-colors">Keluar Portal Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
