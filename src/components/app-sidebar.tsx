"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/sidebar-context";
import {
  FileText,
  LayoutDashboard,
  CreditCard,
  Users,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  ShieldCheck,
  Scale,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Map,
  History,
  Database,
  Library,
} from "lucide-react";

const navItems = [
  {
    section: "UTAMA",
    items: [
      { title: "Beranda", url: "/dashboard", icon: LayoutDashboard, exact: true },
      { title: "Konsultansi", url: "/dashboard/penerimaan", icon: ShieldCheck, exact: false },
      { title: "Manajemen Klien", url: "/dashboard/klien", icon: Users, exact: false },
      { title: "Akta Notaris", url: "/dashboard/deeds", icon: FileText, exact: false },
      { title: "Akta PPAT", url: "/dashboard/ppat", icon: Map, exact: false },
      { 
        title: "Non-Akta", 
        url: "/dashboard/non-akta", 
        icon: Scale, 
        exact: false,
        subItems: [
          { title: "Waarmerking", url: "/dashboard/non-akta/waarmerking" },
          { title: "Legalisasi", url: "/dashboard/non-akta/legalisasi" },
        ]
      },
      { title: "Keuangan", url: "/dashboard/keuangan", icon: CreditCard, exact: false },
    ],
  },
  {
    section: "DATA & PENDUKUNG",
    items: [
      { title: "Laporan Repertorium", url: "/dashboard/protokol", icon: BookOpen, exact: false },
      { title: "Manajemen Tim", url: "/dashboard/tim", icon: ShieldCheck, exact: false },
      { title: "Penjadwalan", url: "/dashboard/jadwal", icon: Calendar, exact: false },
      { title: "Perpustakaan", url: "/dashboard/perpustakaan", icon: Library, exact: false },
      { 
        title: "Master Data", 
        url: "/dashboard/master", 
        icon: Database, 
        exact: false,
        subItems: [
          { title: "Pekerjaan Tambahan", url: "/dashboard/master/pekerjaan-tambahan" },
        ]
      },
    ],
  },
  {
    section: "SISTEM",
    items: [
      { title: "Langganan", url: "/dashboard/subscription", icon: CreditCard, exact: false },
      { title: "Audit Log", url: "/dashboard/audit", icon: History, exact: false },
      { title: "Pengaturan", url: "/dashboard/settings", icon: Settings, exact: false },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { collapsed, toggle } = useSidebar();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleExpand = (title: string, e: React.MouseEvent) => {
    if (collapsed) return;
    e.preventDefault();
    setExpandedMenus(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const user = session?.user;
  const userName = user?.name || "Pengguna";
  const plan = (user as any)?.plan || "STARTER";

  const planBadge: Record<string, string> = {
    TRIAL: "bg-blue-50 text-blue-600 border border-blue-200",
    STARTER: "bg-emerald-100 text-emerald-600 border border-emerald-200",
    PROFESSIONAL: "bg-violet-100 text-violet-600 border border-violet-200",
    ENTERPRISE: "bg-amber-100 text-amber-600 border border-amber-200",
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full flex flex-col bg-gray-50 border-r border-gray-200 z-50 transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* ── Logo + Toggle ── */}
      <div className="px-3 flex items-center gap-2 border-b border-gray-200 h-20">
        <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
          <img src="/logo-penagraha.png" alt="Penagraha" className="h-full w-full object-contain" />
        </div>

        {!collapsed && (
          <div className="flex-1 overflow-hidden" />
        )}

        <button
          onClick={toggle}
          className={cn(
            "shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-gray-200 transition-all",
            collapsed && "mx-auto"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <PanelLeftOpen className="h-4 w-4" />
            : <PanelLeftClose className="h-4 w-4" />
          }
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="relative flex-1 overflow-y-auto py-4 px-2 space-y-5 scrollbar-none">
        {navItems.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                {group.section}
              </p>
            )}
            {collapsed && <div className="h-px bg-gray-200 mb-3 mx-2" />}

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.url
                  : pathname.startsWith(item.url);

                return (
                  <li key={item.url}>
                    <Link
                      href={item.subItems ? "#" : item.url}
                      onClick={(e) => item.subItems && toggleExpand(item.title, e)}
                      title={collapsed ? item.title : undefined}
                      className={cn(
                        "group flex items-center gap-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative",
                        collapsed ? "px-2 justify-center" : "px-3",
                        isActive
                          ? "bg-white text-indigo-700 shadow-sm border border-gray-200"
                          : "text-slate-500 hover:text-slate-800 hover:bg-white"
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-indigo-500" />
                      )}

                      <div className={cn(
                        "h-8 w-8 shrink-0 flex items-center justify-center rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-400 group-hover:bg-gray-100 group-hover:text-slate-700"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>

                      {!collapsed && (
                        <>
                          <span className="flex-1 leading-none whitespace-nowrap overflow-hidden">
                            {item.title}
                          </span>
                          {(item as any).subItems && (
                            <ChevronRight className={cn(
                              "h-3.5 w-3.5 text-indigo-400 shrink-0 transition-transform duration-200",
                              (isActive || expandedMenus.includes(item.title)) && "rotate-90"
                            )} />
                          )}
                        </>
                      )}
                    </Link>

                    {/* Render sub-items if expanded or parent is active */}
                    {(isActive || expandedMenus.includes(item.title)) && !collapsed && (item as any).subItems && (
                      <ul className="mt-1 ml-9 space-y-1 border-l-2 border-slate-100 pl-4 animate-in fade-in slide-in-from-top-1 duration-300">
                        {(item as any).subItems.map((sub: any) => {
                          const isSubActive = pathname === sub.url;
                          return (
                            <li key={sub.url}>
                              <Link
                                href={sub.url}
                                className={cn(
                                  "block py-2 text-xs font-bold transition-all",
                                  isSubActive 
                                    ? "text-indigo-600" 
                                    : "text-slate-400 hover:text-slate-700"
                                )}
                              >
                                {sub.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── User Profile + Logout ── */}
      <div className="border-t border-gray-200 p-3 space-y-1">
        {/* User card */}
        {collapsed ? (
          <div className="flex justify-center py-1">
            <div
              title={userName}
              className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-default"
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white border border-gray-200">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-slate-800 text-xs font-bold truncate leading-none mb-1">{userName}</p>
              <span className={cn(
                "text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest",
                planBadge[plan] || planBadge.STARTER
              )}>
                {plan === "TRIAL" ? "Free Trial" : plan}
              </span>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          title="Keluar Aplikasi"
          className={cn(
            "w-full flex items-center gap-3 py-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs font-bold transition-all duration-200 group cursor-pointer",
            collapsed ? "px-0 justify-center" : "px-3"
          )}
        >
          <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-red-100 transition-colors shrink-0">
            <LogOut className="h-3.5 w-3.5" />
          </div>
          {!collapsed && <span className="whitespace-nowrap">Keluar Aplikasi</span>}
        </button>
      </div>
    </aside>
  );
}
