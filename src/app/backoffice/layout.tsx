import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { BackofficeSidebar } from "@/components/backoffice-sidebar";
import { Separator } from "@/components/ui/separator";
import { UserNav } from "@/components/user-nav";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <BackofficeSidebar />
      <SidebarInset className="bg-slate-50">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 bg-white shadow-sm sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">NOTARISONE BACKOFFICE</span>
            <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">STAFF ONLY</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 text-xs text-slate-500 font-medium tracking-tight mr-4">
              <span>Environment: Production v1.5</span>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
