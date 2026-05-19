"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Building2, Search, RefreshCw, Ban, CheckCircle2,
  Calendar, Users as UsersIcon, FileText, Loader2,
  AlertCircle, Clock, Filter, ChevronDown, Plus,
  TrendingUp, Shield, LayoutGrid, List, ArrowUpRight,
  Globe, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Tenant = {
  id: string;
  name: string;
  subdomain: string | null;
  address: string | null;
  status: "ACTIVE" | "SUSPENDED" | "TRIAL";
  subscription: "TRIAL" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  createdAt: string;
  trialExpiresAt: string | null;
  _count: { users: number; deeds: number };
};

const SUBSCRIPTION_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ENTERPRISE: { label: "Enterprise", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  PROFESSIONAL: { label: "Professional", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  STARTER: { label: "Starter", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  TRIAL: { label: "Trial", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; dot: string }> = {
  ACTIVE: { label: "Aktif", icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  SUSPENDED: { label: "Ditangguhkan", icon: <Ban className="h-3.5 w-3.5" />, color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
  TRIAL: { label: "Trial", icon: <Clock className="h-3.5 w-3.5" />, color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, icon: null, color: "text-slate-600", bg: "bg-slate-50", dot: "bg-slate-400" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border", cfg.bg, cfg.color, "border-current/20")}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function SubscriptionBadge({ sub }: { sub: string }) {
  const cfg = SUBSCRIPTION_CONFIG[sub] ?? { label: sub, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border", cfg.bg, cfg.color, cfg.border)}>
      {cfg.label}
    </span>
  );
}

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterSub, setFilterSub] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("list");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterSub]);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/backoffice/tenants");
      const data = await res.json();
      if (data.success) {
        setTenants(data.data);
      } else {
        setError(data.message || "Gagal memuat data tenant.");
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const handleToggleStatus = async (tenant: Tenant) => {
    const newStatus = tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUpdatingId(tenant.id);
    try {
      const res = await fetch(`/api/backoffice/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTenants((prev) => prev.map((t) => t.id === tenant.id ? { ...t, status: newStatus } : t));
      } else {
        alert(data.message || "Gagal mengubah status.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = tenants
    .filter((t) => filterStatus === "ALL" || t.status === filterStatus)
    .filter((t) => filterSub === "ALL" || t.subscription === filterSub)
    .filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.subdomain ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === "ACTIVE").length,
    suspended: tenants.filter(t => t.status === "SUSPENDED").length,
    trial: tenants.filter(t => t.status === "TRIAL").length,
    totalUsers: tenants.reduce((s, t) => s + t._count.users, 0),
    totalDeeds: tenants.reduce((s, t) => s + t._count.deeds, 0),
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
            <Shield className="h-4 w-4 text-orange-500" />
            <span>Backoffice</span>
            <span>/</span>
            <span className="text-slate-700 font-bold">Manajemen Tenant</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daftar Tenant</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {loading ? "Memuat..." : `${tenants.length} kantor notaris terdaftar di platform`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-slate-200 rounded-lg font-semibold text-slate-600"
            onClick={fetchTenants}
            disabled={loading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
          <a href="/backoffice/tenants/onboard">
            <Button size="sm" className="h-9 gap-2 bg-slate-900 hover:bg-slate-800 rounded-lg font-semibold">
              <Plus className="h-3.5 w-3.5" />
              Onboard Tenant
            </Button>
          </a>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, icon: <Building2 className="h-4 w-4 text-slate-400" />, color: "text-slate-900" },
          { label: "Aktif", value: stats.active, icon: <div className="h-2 w-2 rounded-full bg-green-500 mt-0.5" />, color: "text-green-700" },
          { label: "Ditangguhkan", value: stats.suspended, icon: <div className="h-2 w-2 rounded-full bg-red-500 mt-0.5" />, color: "text-red-700" },
          { label: "Trial", value: stats.trial, icon: <div className="h-2 w-2 rounded-full bg-amber-500 mt-0.5" />, color: "text-amber-700" },
          { label: "Total User", value: stats.totalUsers, icon: <UsersIcon className="h-4 w-4 text-blue-400" />, color: "text-blue-700" },
          { label: "Total Akta", value: stats.totalDeeds, icon: <FileText className="h-4 w-4 text-violet-400" />, color: "text-violet-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              {s.icon}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
            <p className={cn("text-2xl font-black", s.color)}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-300" /> : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nama kantor atau subdomain..."
            className="pl-9 h-10 bg-white border-slate-200 rounded-xl text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2 border-slate-200 rounded-xl font-semibold text-slate-600">
                <Filter className="h-3.5 w-3.5" />
                {filterStatus === "ALL" ? "Semua Status" : STATUS_CONFIG[filterStatus]?.label}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setFilterStatus("ALL")}>Semua Status</DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <DropdownMenuItem key={k} onClick={() => setFilterStatus(k)} className="gap-2">
                  <span className={cn("h-2 w-2 rounded-full", v.dot)} />
                  {v.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Subscription filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2 border-slate-200 rounded-xl font-semibold text-slate-600">
                <TrendingUp className="h-3.5 w-3.5" />
                {filterSub === "ALL" ? "Semua Paket" : SUBSCRIPTION_CONFIG[filterSub]?.label}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setFilterSub("ALL")}>Semua Paket</DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.entries(SUBSCRIPTION_CONFIG).map(([k, v]) => (
                <DropdownMenuItem key={k} onClick={() => setFilterSub(k)}>{v.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setView("list")}
              className={cn("p-1.5 rounded-lg transition-all", view === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600")}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={cn("p-1.5 rounded-lg transition-all", view === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-32 gap-3 text-slate-400">
          <Loader2 className="h-7 w-7 animate-spin" />
          <span className="text-base font-semibold">Memuat data dari database...</span>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-4 text-red-500">
          <AlertCircle className="h-12 w-12 opacity-60" />
          <div className="text-center">
            <p className="font-bold text-base">{error}</p>
            <p className="text-sm text-slate-400 mt-1">Pastikan backend server berjalan dan coba refresh.</p>
          </div>
          <Button onClick={fetchTenants} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Coba Lagi
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-4">
          <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Building2 className="h-10 w-10 text-slate-300" />
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-600">Tidak ada tenant ditemukan</p>
            <p className="text-sm text-slate-400 mt-1">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        </div>
      ) : view === "list" ? (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kantor Notaris</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Volume</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Paket</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</span>
          </div>
          <div className="divide-y divide-slate-50">
            {paginated.map((tenant) => (
              <div 
                key={tenant.id} 
                onClick={() => router.push(`/backoffice/tenants/${tenant.id}`)}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors group cursor-pointer"
              >
                {/* Name */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200/50 flex items-center justify-center shrink-0">
                    <span className="text-orange-600 font-black text-sm">{tenant.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{tenant.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {tenant.subdomain ? (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <Globe className="h-3 w-3" />
                          {tenant.subdomain}.penagraha.id
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-300 italic">Tanpa subdomain</span>
                      )}
                      <span className="text-slate-200">·</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(tenant.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                    <UsersIcon className="h-3.5 w-3.5 text-blue-400" /> {tenant._count.users}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                    <FileText className="h-3.5 w-3.5 text-violet-400" /> {tenant._count.deeds}
                  </span>
                </div>

                {/* Subscription */}
                <div className="flex justify-center">
                  <SubscriptionBadge sub={tenant.subscription} />
                </div>

                {/* Status */}
                <div className="flex justify-center">
                  <StatusBadge status={tenant.status} />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={updatingId === tenant.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(tenant);
                    }}
                    className={cn(
                      "h-8 px-3 rounded-lg text-xs font-bold gap-1.5 transition-all",
                      tenant.status === "ACTIVE"
                        ? "text-slate-500 hover:bg-red-50 hover:text-red-600"
                        : "text-slate-500 hover:bg-green-50 hover:text-green-600"
                    )}
                  >
                    {updatingId === tenant.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : tenant.status === "ACTIVE" ? (
                      <><Ban className="h-3.5 w-3.5" /> Suspend</>
                    ) : (
                      <><CheckCircle2 className="h-3.5 w-3.5" /> Aktifkan</>
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="gap-2 text-xs" onClick={() => router.push(`/backoffice/tenants/${tenant.id}`)}>
                        <ArrowUpRight className="h-3.5 w-3.5" /> Lihat Detail
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((tenant) => (
            <div 
              key={tenant.id} 
              onClick={() => router.push(`/backoffice/tenants/${tenant.id}`)}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all overflow-hidden group cursor-pointer"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200/50 flex items-center justify-center shrink-0">
                      <span className="text-orange-600 font-black">{tenant.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{tenant.name}</p>
                      {tenant.subdomain && (
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {tenant.subdomain}.penagraha.id
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={tenant.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <UsersIcon className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">User</span>
                    </div>
                    <p className="text-xl font-black text-slate-900">{tenant._count.users}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText className="h-3.5 w-3.5 text-violet-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Akta</span>
                    </div>
                    <p className="text-xl font-black text-slate-900">{tenant._count.deeds}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SubscriptionBadge sub={tenant.subscription} />
                    <span className="text-[10px] text-slate-400">
                      {new Date(tenant.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={updatingId === tenant.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(tenant);
                    }}
                    className={cn(
                      "h-7 px-2.5 rounded-lg text-xs font-bold gap-1",
                      tenant.status === "ACTIVE"
                        ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
                        : "text-slate-400 hover:bg-green-50 hover:text-green-600"
                    )}
                  >
                    {updatingId === tenant.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : tenant.status === "ACTIVE" ? (
                      <><Ban className="h-3.5 w-3.5" /> Suspend</>
                    ) : (
                      <><CheckCircle2 className="h-3.5 w-3.5" /> Aktifkan</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mt-4">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Menampilkan <span className="text-slate-900 font-black">{Math.min(startIndex + 1, filtered.length)}</span> - <span className="text-slate-900 font-black">{Math.min(startIndex + itemsPerPage, filtered.length)}</span> dari <span className="text-slate-900 font-black">{filtered.length}</span> tenant
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="h-9 px-3 rounded-xl border-slate-200 text-xs font-bold gap-1 text-slate-500 hover:text-slate-900 disabled:opacity-50"
            >
              Sebelumnya
            </Button>
            
            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "h-9 w-9 rounded-xl text-xs font-bold transition-all",
                      currentPage === pageNum 
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="h-9 px-3 rounded-xl border-slate-200 text-xs font-bold gap-1 text-slate-500 hover:text-slate-900 disabled:opacity-50"
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
