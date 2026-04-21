"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { 
  Bell, 
  CheckCheck, 
  Loader2, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  Clock 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useApiAuth } from "@/hooks/use-api-auth";

const fetcher = (url: string, headers: HeadersInit) =>
  fetch(url, { headers }).then(async (res) => {
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal menghubungi server");
    }
    return res.json();
  });

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "INFO" | "SUCCESS" | "URGENT" | "WARNING";
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const apiAuth = useApiAuth();
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  
  // Safe API URL helper to prevent "undefined" string concatenations
  const getApiUrl = (path: string) => {
    const base = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (!base || base === "undefined") return path;
    return `${base}${path}`;
  };

  const { data, error, isLoading, mutate } = useSWR(
    status === "authenticated" ? ["/api/notifications", apiAuth.headers] : null,
    ([url, headers]) => fetcher(getApiUrl(url), headers),
    { refreshInterval: 30000 } // Auto refresh every 30s
  );

  const notifications: Notification[] = data?.data?.notifications || [];
  
  const filteredNotifications = notifications.filter(n => 
    filter === "ALL" ? true : !n.isRead
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    setIsMarkingAll(true);
    try {
      const res = await fetch(getApiUrl("/api/notifications/read-all"), {
        method: "PATCH",
        headers: apiAuth.headers,
      });

      if (!res.ok) throw new Error("Gagal menandai notifikasi");
      
      toast.success("Semua notifikasi telah ditandai dibaca");
      mutate(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan sistem");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return; // Already read
    
    try {
      // Optimistic update
      mutate(
        { data: { notifications: notifications.map(n => n.id === id ? { ...n, isRead: true } : n) } },
        false 
      );

      const res = await fetch(getApiUrl(`/api/notifications/${id}/read`), {
        method: "PATCH",
        headers: apiAuth.headers,
      });

      if (!res.ok) throw new Error();
      
      // Re-validate
      mutate();
    } catch (error) {
      toast.error("Gagal mengubah status notifikasi");
      mutate(); // Revert on error
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "URGENT": return <AlertCircle className="h-5 w-5" />;
      case "WARNING": return <AlertTriangle className="h-5 w-5" />;
      case "SUCCESS": return <CheckCircle2 className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getColorClass = (type: string, isRead: boolean) => {
    if (isRead) return "bg-slate-50 text-slate-400 border-slate-100";
    
    switch (type) {
      case "URGENT": return "bg-red-50 text-red-600 border-red-100";
      case "WARNING": return "bg-orange-50 text-orange-600 border-orange-100";
      case "SUCCESS": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default: return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Bell className="h-6 w-6" />
            </span>
            Pusat Notifikasi
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Kelola semua pemberitahuan dan aktivitas sistem Anda di sini.
          </p>
        </div>

        <Button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || isMarkingAll}
          variant="outline"
          className="rounded-xl h-11 px-6 font-bold text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-indigo-600"
        >
          {isMarkingAll ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="mr-2 h-4 w-4" />
          )}
          Tandai Semua Dibaca
        </Button>
      </div>

      <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
              filter === "ALL" 
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:bg-slate-100"
            )}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2",
              filter === "UNREAD" 
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:bg-slate-100"
            )}
          >
            Belum Dibaca
            {unreadCount > 0 && (
              <span className="bg-destructive text-white text-[10px] px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
              <p className="font-bold">Memuat notifikasi...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <AlertCircle className="h-12 w-12 mb-4 text-red-300" />
              <p className="font-bold text-red-500">Gagal mengambil data notifikasi.</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Bell className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-700 mb-2">Tidak Ada Notifikasi</h3>
              <p className="text-slate-500 font-medium max-w-sm">
                Bagus! Anda telah membaca semua notifikasi atau belum ada aktivitas baru yang perlu diperhatikan.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                  className={cn(
                    "p-6 sm:px-8 flex gap-4 transition-all duration-200 cursor-pointer group",
                    !notification.isRead ? "bg-indigo-50/20 hover:bg-indigo-50/40" : "hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors",
                    getColorClass(notification.type, notification.isRead)
                  )}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                      <h4 className={cn(
                        "text-base font-bold",
                        !notification.isRead ? "text-slate-900" : "text-slate-600"
                      )}>
                        {notification.title}
                      </h4>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 whitespace-nowrap mt-1 sm:mt-0">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: idLocale })}
                      </span>
                    </div>
                    
                    <p className={cn(
                      "mt-1.5 text-sm font-medium leading-relaxed",
                      !notification.isRead ? "text-slate-600" : "text-slate-500"
                    )}>
                      {notification.description}
                    </p>
                    
                    {notification.actionUrl && (
                      <div className="mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-lg text-xs font-bold h-8 border-slate-200 text-slate-600 hover:text-indigo-600 group-hover:border-indigo-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = notification.actionUrl!;
                            handleMarkAsRead(notification.id, notification.isRead);
                          }}
                        >
                          Lihat Detail
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {!notification.isRead && (
                    <div className="shrink-0 flex items-center">
                      <div className="h-2.5 w-2.5 bg-indigo-500 rounded-full ring-4 ring-indigo-50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
