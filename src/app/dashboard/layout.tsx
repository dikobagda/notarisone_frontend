"use client";

import { SidebarStateProvider, useSidebar } from "@/components/sidebar-context";
import { AppSidebar } from "@/components/app-sidebar";
import { UserNav } from "@/components/user-nav";
import { NotificationNav } from "@/components/notification-nav";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  deeds: "Notaris",
  ppat: "PPAT",
  klien: "Database Klien",
  jadwal: "Janji Temu",
  keuangan: "Keuangan",
  settings: "Pengaturan",
  audit: "Audit Log",
  tim: "Manajemen Tim",
  protokol: "Buku Protokol",
  create: "Buat Baru",
  edit: "Ubah Data",
  documents: "Kelola Dokumen",
  subscription: "Langganan",
};

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-semibold text-slate-400">NotarisOne</span>
      {segments.map((segment, index) => {
        const label = BREADCRUMB_MAP[segment] || segment;
        const isLast = index === segments.length - 1;

        // Skip [id] segments or generic UUIDs in labels for cleaner UI
        if (segment.length > 20 || /^[0-9a-f-]{20,}$/.test(segment)) return null;

        return (
          <div key={segment} className="flex items-center gap-2">
            <span className="text-slate-300">/</span>
            <span
              className={cn(
                "transition-colors",
                isLast ? "font-bold text-slate-800" : "font-semibold text-slate-400"
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

import { StorageNav } from "@/components/storage-nav";
import { SubscriptionGuard } from "@/components/subscription-guard";

// Inner layout needs access to the sidebar context
function LayoutInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-[#f8f9fc]">
      <SubscriptionGuard />
      {/* Fixed Dark Sidebar */}
      <AppSidebar />

      {/* Main content — dynamically offset based on sidebar width */}
      <div
        className={cn(
          "flex flex-col flex-1 min-h-screen overflow-hidden transition-all duration-300 ease-in-out",
          collapsed ? "ml-[68px]" : "ml-64"
        )}
      >
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 px-8 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm shadow-slate-100">
          <Breadcrumb />
          <div className="flex items-center gap-6">
            <StorageNav />
            <div className="flex items-center gap-3">
              <NotificationNav />
              <div className="h-6 w-px bg-slate-200 mx-1" />
              <UserNav />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarStateProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarStateProvider>
  );
}
