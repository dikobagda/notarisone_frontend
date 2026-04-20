"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  AlertCircle, 
  FileText, 
  UserPlus, 
  Check, 
  ChevronRight,
  Info,
  AlertTriangle,
  Loader2,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { useApiAuth } from "@/hooks/use-api-auth";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "INFO" | "SUCCESS" | "URGENT" | "WARNING";
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

const fetcher = (url: string, headers: HeadersInit) =>
  fetch(url, { headers }).then((res) => res.json());

export function NotificationNav() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { status } = useSession();
  const apiAuth = useApiAuth();
  const router = useRouter();

  const { data, mutate, isLoading } = useSWR(
    status === "authenticated" ? ["/api/notifications", apiAuth.headers] : null,
    ([url, headers]) => fetcher(process.env.NEXT_PUBLIC_API_URL + url, headers),
    { refreshInterval: 60000 } // Refresh every minute
  );

  const notifications: NotificationItem[] = data?.data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string, isRead: boolean, actionUrl?: string | null) => {
    if (isRead) {
      if (actionUrl) {
        setIsOpen(false);
        router.push(actionUrl);
      }
      return;
    }

    try {
      // Optimistic update
      mutate(
        { data: { notifications: notifications.map(n => n.id === id ? { ...n, isRead: true } : n) } },
        false
      );

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: apiAuth.headers,
      });

      if (!res.ok) throw new Error();
      
      mutate(); // Re-validate

      if (actionUrl) {
        setIsOpen(false);
        router.push(actionUrl);
      }
    } catch (error) {
      mutate(); // Revert
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "URGENT": return <AlertCircle className="h-4 w-4" />;
      case "WARNING": return <AlertTriangle className="h-4 w-4" />;
      case "SUCCESS": return <Check className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center justify-center h-10 w-10 rounded-xl transition-all outline-none",
          isOpen 
            ? "bg-slate-100 ring-2 ring-primary/20" 
            : "bg-background/50 border border-border/50 hover:bg-slate-50 hover:border-slate-300"
        )}
      >
        <Bell className={cn(
          "h-5 w-5 transition-colors",
          isOpen ? "text-primary" : "text-muted-foreground"
        )} />
        
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive text-[9px] font-black text-white items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notifikasi</h3>
            {unreadCount > 0 && (
              <Badge className="bg-destructive/10 text-destructive border-none text-[10px] font-black">
                {unreadCount} Baru
              </Badge>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary/30" />
                <p className="text-sm font-medium">Memuat data...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="flex flex-col">
                {notifications.slice(0, 8).map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleMarkAsRead(n.id, n.isRead, n.actionUrl)}
                    className={cn(
                      "p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group",
                      !n.isRead && "bg-indigo-50/30"
                    )}
                  >
                    <div className="flex gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                        n.isRead ? "bg-slate-50 text-slate-400 border-slate-100" :
                        n.type === "URGENT" ? "bg-red-50 text-red-600 border-red-100" :
                        n.type === "WARNING" ? "bg-orange-50 text-orange-600 border-orange-100" :
                        n.type === "SUCCESS" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={cn(
                            "text-sm font-bold truncate transition-colors",
                            !n.isRead ? "text-slate-900" : "text-slate-600 group-hover:text-primary"
                          )}>
                            {n.title}
                          </p>
                          <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap mt-0.5 uppercase tracking-tighter">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: idLocale })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5 line-clamp-2">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-10" />
                <p className="text-sm font-medium">Bagus! Tidak ada notifikasi baru.</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 bg-white">
            <Link href="/dashboard/notifications" onClick={() => setIsOpen(false)}>
              <Button 
                variant="ghost" 
                className="w-full h-10 text-xs font-bold text-slate-500 hover:text-primary hover:bg-indigo-50/50 transition-all rounded-xl gap-2 group"
              >
                Lihat Semua Notifikasi
                <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
      {children}
    </span>
  );
}
