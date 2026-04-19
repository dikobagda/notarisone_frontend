"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  BarChart3,
  Sparkles,
  Loader2,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ActivityLogs from "@/components/dashboard/ActivityLogs";
import { cn } from "@/lib/utils";



const DEED_TYPE_LABELS: Record<string, string> = {
  PENDIRIAN_PT: "Pendirian PT",
  PENDIRIAN_CV: "Pendirian CV",
  PENDIRIAN_YAYASAN: "Pendirian Yayasan",
  JUAL_BELI: "Jual Beli",
  SEWA_MENYUWA: "Sewa Menyewa",
  HIBAH: "Hibah",
  WASIAT: "Wasiat",
  KERJASAMA: "Perjanjian Kerja Sama",
  KREDIT: "Kredit",
  KUASA_MENJUAL: "Kuasa Menjual",
  PPJB: "PPJB",
  RUPS: "RUPS",
  SKMHT: "SKMHT",
  AD_PERUBAHAN: "Perubahan AD",
  LAINNYA: "Lainnya",
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string; icon: any }> = {
  FINAL:          { label: "Final",          dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: CheckCircle2 },
  DRAFT:          { label: "Draft",          dot: "bg-slate-400",   badge: "bg-slate-50 text-slate-600 border border-slate-200",       icon: Clock },
  PENDING_CLIENT: { label: "Menunggu Klien", dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border border-amber-200",       icon: AlertCircle },
  INVALIDATED:    { label: "Dibatalkan",     dot: "bg-red-400",     badge: "bg-red-50 text-red-600 border border-red-200",             icon: AlertCircle },
};

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [recentDeeds, setRecentDeeds] = useState<any[]>([]);
  const [storageUsage, setStorageUsage] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isStorageLoading, setIsStorageLoading] = useState(true);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const tenantId = (session?.user as any)?.tenantId;
      const token = (session as any)?.backendToken;

      console.log(`[DEBUG DASHBOARD] Fetching stats for tenantId: "${tenantId}"`);

      if (!tenantId || !token || tenantId.trim() === "") {
        console.warn("[DEBUG DASHBOARD] Cannot fetch stats: Missing tenantId or token");
        return;
      }

      try {
        setIsStatsLoading(true);
        const res = await fetch(`/api/tenant/stats?tenantId=${tenantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`[DEBUG DASHBOARD] Stats Status: ${res.status}`);
        const result = await res.json();
        
        console.log("[DEBUG DASHBOARD] Stats Result:", result);

        if (result.success) {
          setDashboardStats(result.data);
        } else {
          console.error("[DEBUG DASHBOARD] API Error:", result.message || result.error || "Unknown Error");
        }
      } catch (err) {
        console.error("[DEBUG DASHBOARD] Failed to fetch dashboard stats:", err);
      } finally {
        setIsStatsLoading(false);
      }
    };

    const fetchRecentDeeds = async () => {
      const tenantId = (session?.user as any)?.tenantId;
      const token = (session as any)?.backendToken;
      if (!tenantId || !token) return;

      try {
        setIsLoading(true);
        const res = await fetch(`/api/deeds?tenantId=${tenantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response from server");
        }

        const result = await res.json();
        if (result.success) {
          // Take only the 5 most recent
          setRecentDeeds(result.data.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to fetch recent deeds:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStorageUsage = async () => {
      const tenantId = (session?.user as any)?.tenantId;
      const token = (session as any)?.backendToken;
      if (!tenantId || !token) return;

      try {
        setIsStorageLoading(true);
        const res = await fetch(`/api/tenant/storage-usage?tenantId=${tenantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response from server");
        }

        const result = await res.json();
        if (result.success) {
          setStorageUsage(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch storage usage:", err);
      } finally {
        setIsStorageLoading(false);
      }
    };

    if (session) {
      fetchDashboardStats();
      fetchRecentDeeds();
      fetchStorageUsage();
    }
  }, [session]);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  const statsList = [
    {
      title: "Total Akta",
      value: dashboardStats?.deeds?.total?.toLocaleString('id-ID') || "0",
      change: dashboardStats?.deeds?.growth || "0%",
      period: "dari bulan lalu",
      icon: FileText,
      gradient: "from-blue-500/10 to-blue-600/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      changeColor: "text-blue-600",
      border: "border-blue-100",
    },
    {
      title: "Klien Baru",
      value: dashboardStats?.clients?.total?.toLocaleString('id-ID') || "0",
      change: dashboardStats?.clients?.growth || "+0",
      period: "bulan ini",
      icon: Users,
      gradient: "from-violet-500/10 to-violet-600/5",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
      changeColor: "text-violet-600",
      border: "border-violet-100",
    },
    {
      title: "Pemasukan",
      value: formatCurrency(dashboardStats?.revenue?.total || 0),
      change: dashboardStats?.revenue?.growth || "0%",
      period: "bulan ini",
      icon: TrendingUp,
      gradient: "from-emerald-500/10 to-emerald-600/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      changeColor: "text-emerald-600",
      border: "border-emerald-100",
    },
    {
      title: "Janji Temu",
      value: dashboardStats?.appointments?.totalWeekly?.toLocaleString('id-ID') || "0",
      change: `${dashboardStats?.appointments?.today || 0} hari ini`,
      period: "minggu ini",
      icon: Calendar,
      gradient: "from-amber-500/10 to-amber-600/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      changeColor: "text-amber-600",
      border: "border-amber-100",
    },
  ];

  const userName = session?.user?.name || "Notaris";

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-8 pb-8">

      {/* ─── Hero Banner ─── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-10 text-white shadow-2xl">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              {today}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Selamat datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">{userName}</span>
            </h1>
            <p className="text-slate-400 text-base font-medium max-w-md">
              Inilah ringkasan aktivitas kantor Anda hari ini. ✨
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" className="h-11 px-5 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md font-semibold gap-2 text-sm">
              <BarChart3 className="h-4 w-4" /> Lihat Laporan
            </Button>
            <Link href="/dashboard/deeds/create">
              <Button className="h-11 px-5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold gap-2 text-sm shadow-lg shadow-blue-500/30">
                <Plus className="h-4 w-4" /> Buat Akta Baru
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stat Cards ─── */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsList.map((s) => (
          <div key={s.title} className={`group relative bg-gradient-to-br ${s.gradient} border ${s.border} rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default min-h-[160px] flex flex-col justify-between`}>
            {isStatsLoading ? (
              <div className="space-y-4 w-full h-full animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="h-11 w-11 bg-slate-100 rounded-xl" />
                  <div className="h-4 w-12 bg-slate-50 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-24 bg-slate-200 rounded" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-11 w-11 ${s.iconBg} rounded-xl flex items-center justify-center`}>
                    <s.icon className={`h-5 w-5 ${s.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${s.changeColor}`}>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {s.change}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{s.value}</div>
                  <div className="text-xs text-slate-500 font-medium">{s.title} <span className="text-slate-400">· {s.period}</span></div>
                </div>
              </>
            )}
          </div>
        ))}
      </section>

      {/* ─── Main Content ─── */}
      <div className="grid gap-6 lg:grid-cols-7">

        {/* Akta Terbaru */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Akta Terbaru</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">5 akta paling baru dari database</p>
            </div>
            <Link href="/dashboard/deeds">
              <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-slate-800 gap-1 font-bold cursor-pointer">
                Semua Akta <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-300" />
              <p className="text-xs font-bold uppercase tracking-widest">Memuat akta terbaru…</p>
            </div>
          ) : recentDeeds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <FileText className="h-10 w-10 text-slate-200" />
              <p className="text-sm font-bold text-slate-500">Belum ada akta yang dibuat</p>
              <Link href="/dashboard/deeds/create">
                <Button size="sm" className="mt-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl">
                  <Plus className="h-3.5 w-3.5" /> Buat Akta Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentDeeds.map((deed, idx) => {
                const cfg = STATUS_CONFIG[deed.status] ?? STATUS_CONFIG["DRAFT"];
                const StatusIcon = cfg.icon;
                return (
                  <Link key={deed.id} href={`/dashboard/deeds/${deed.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors group cursor-pointer">
                    <div className={`h-9 w-9 rounded-xl ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0`}>
                      {deed.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{deed.title}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {deed.client?.name || "—"} · {DEED_TYPE_LABELS[deed.type] || deed.type}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${cfg.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Aktivitas Terbaru (Audit Trail) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[400px]">
            <ActivityLogs />
          </div>

          {/* Storage Usage Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <HardDrive className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest italic">Penyimpanan</h3>
              </div>
              {storageUsage && (
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  PAKET {storageUsage.plan}
                </span>
              )}
            </div>

            {isStorageLoading ? (
              <div className="flex flex-col gap-2 py-4">
                <div className="h-2 bg-slate-50 rounded-full animate-pulse w-full" />
                <div className="h-3 bg-slate-50 rounded w-1/2 animate-pulse" />
              </div>
            ) : storageUsage ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500 italic">
                    <span>{formatBytes(storageUsage.usedBytes)} digunakan</span>
                    <span>{formatBytes(storageUsage.limitBytes)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        Number(storageUsage.percentage) > 90 ? "bg-rose-500" : 
                        Number(storageUsage.percentage) > 70 ? "bg-amber-500" : "bg-indigo-500"
                      )}
                      style={{ width: `${storageUsage.percentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Draf / Revisi</p>
                      <p className="text-xs font-bold text-slate-700 mt-1">{formatBytes(storageUsage.breakdown.drafts)}</p>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scan Akta</p>
                      <p className="text-xs font-bold text-slate-700 mt-1">{formatBytes(storageUsage.breakdown.finalScans)}</p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-300 italic text-xs font-bold">
                Gagal memuat data penyimpanan
              </div>
            )}
            
            <p className="text-[9px] text-slate-400 font-medium leading-tight">
              Kapasitas penyimpanan otomatis menyesuaikan dengan paket NotarisOne Anda.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
