"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, AlertCircle, FileText, UserPlus, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "URGENT" | "INFO" | "SUCCESS";
  icon: any;
  read: boolean;
}

export function NotificationNav() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock Notifications
  const [notifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Akta Perlu Review",
      description: "Pendirian PT Maju Jaya menunggu persetujuan Anda.",
      time: "5m yang lalu",
      type: "URGENT",
      icon: AlertCircle,
      read: false,
    },
    {
      id: "2",
      title: "Pendaftaran Client",
      description: "Client baru 'Budi Santoso' telah didaftarkan ke sistem.",
      time: "1j yang lalu",
      type: "SUCCESS",
      icon: UserPlus,
      read: false,
    },
    {
      id: "3",
      title: "Update Keamanan",
      description: "Sistem akan melakukan maintenance besok pukul 02:00 WIB.",
      time: "2j yang lalu",
      type: "INFO",
      icon: FileText,
      read: true,
    },
    {
       id: "4",
       title: "Tagihan Berhasil",
       description: "Tagihan INV/2026/04/001 telah dibayar lunas.",
       time: "1d yang lalu",
       type: "SUCCESS",
       icon: Check,
       read: true,
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

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
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">
                {unreadCount} Baru
              </Badge>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="flex flex-col">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group",
                      !n.read && "bg-indigo-50/30"
                    )}
                  >
                    <div className="flex gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
                        n.type === "URGENT" ? "bg-red-50 text-red-600 border-red-100" :
                        n.type === "SUCCESS" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        <n.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={cn(
                            "text-sm font-bold truncate transition-colors",
                            !n.read ? "text-slate-900" : "text-slate-600 group-hover:text-primary"
                          )}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap mt-0.5 uppercase tracking-tighter">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">
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

          <div className="p-3 border-t border-slate-50 bg-white">
            <Button 
              variant="ghost" 
              className="w-full h-10 text-xs font-bold text-slate-500 hover:text-primary hover:bg-slate-50 transition-all rounded-xl gap-2 group"
            >
              Lihat Semua Notifikasi
              <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
      {children}
    </span>
  );
}
