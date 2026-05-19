"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Building2, Globe, Calendar, Users as UsersIcon,
  FileText, Shield, Key, Mail, Clock, RefreshCw, Ban,
  CheckCircle2, AlertTriangle, ArrowUpRight, ShieldAlert,
  UserCheck, UserX, Loader2, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isLocked: boolean;
  createdAt: string;
};

type Tenant = {
  id: string;
  name: string;
  subdomain: string | null;
  address: string | null;
  status: "ACTIVE" | "SUSPENDED" | "TRIAL";
  subscription: "TRIAL" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  createdAt: string;
  users?: User[];
  _count?: {
    users: number;
    deeds: number;
  };
};

const SUBSCRIPTION_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; desc: string }> = {
  ENTERPRISE: { label: "Enterprise", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", desc: "Kapasitas Tanpa Batas & Dedicated Support" },
  PROFESSIONAL: { label: "Professional", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", desc: "Hingga 5 Notaris & 20 Pegawai" },
  STARTER: { label: "Starter", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", desc: "Praktik Mandiri & 1 Pegawai" },
  TRIAL: { label: "Trial", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", desc: "Masa Uji Coba Gratis 21 Hari" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  ACTIVE: { label: "Aktif", color: "text-green-700 dark:text-green-300", bg: "bg-green-50 dark:bg-green-950/30", dot: "bg-green-500" },
  SUSPENDED: { label: "Ditangguhkan", color: "text-red-700 dark:text-red-300", bg: "bg-red-50 dark:bg-red-950/30", dot: "bg-red-500" },
  TRIAL: { label: "Trial", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/30", dot: "bg-amber-500" },
};

const ROLE_COLORS: Record<string, string> = {
  NOTARIS: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800",
  ASISTEN: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800",
  STAF: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  KEUANGAN: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
  SUPERADMIN: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800",
};

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTenantDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/backoffice/tenants/${id}`);
      const data = await res.json();
      if (data.success) {
        setTenant(data.data);
      } else {
        setError(data.message || "Gagal mengambil rincian data tenant.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan saat memuat rincian tenant.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTenantDetail();
  }, [fetchTenantDetail]);

  const handleToggleStatus = async () => {
    if (!tenant) return;
    const newStatus = tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/backoffice/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTenant(prev => prev ? { ...prev, status: newStatus } : null);
      } else {
        alert(data.message || "Gagal mengubah status tenant");
      }
    } catch {
      alert("Kesalahan koneksi saat mengubah status tenant");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Breadcrumbs Skeleton */}
        <div className="h-4 w-48 bg-slate-200 animate-pulse rounded-md" />
        
        {/* Header Skeleton */}
        <div className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-60 bg-slate-200 animate-pulse rounded-md" />
              <div className="h-4 w-40 bg-slate-200 animate-pulse rounded-md" />
            </div>
          </div>
          <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-lg" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>

        {/* Layout Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white border border-slate-100 rounded-2xl animate-pulse" />
          <div className="lg:col-span-2 h-96 bg-white border border-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 shadow-sm">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Gagal Memuat Detail Tenant</h2>
          <p className="text-sm text-slate-500 max-w-md">{error || "Data tenant tidak ditemukan di platform."}</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => router.push("/backoffice/tenants")}>
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Tenant
        </Button>
      </div>
    );
  }

  const subCfg = SUBSCRIPTION_CONFIG[tenant.subscription] ?? { label: tenant.subscription, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", desc: "" };
  const statusCfg = STATUS_CONFIG[tenant.status] ?? { label: tenant.status, color: "text-slate-600", bg: "bg-slate-50", dot: "bg-slate-400" };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
        <span className="cursor-pointer hover:text-slate-600 transition-colors" onClick={() => router.push("/backoffice")}>Backoffice</span>
        <span>/</span>
        <span className="cursor-pointer hover:text-slate-600 transition-colors" onClick={() => router.push("/backoffice/tenants")}>Daftar Tenant</span>
        <span>/</span>
        <span className="text-slate-900 truncate max-w-[200px] font-black">{tenant.name}</span>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative corner gradient */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push("/backoffice/tenants")}
            className="h-11 w-11 rounded-xl hover:bg-slate-50 border-slate-200 shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>

          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200/50 flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="h-8 w-8 text-orange-600" />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">{tenant.name}</h1>
              <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0", statusCfg.bg, statusCfg.color, "border-current/20")}>
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusCfg.dot)} />
                {statusCfg.label}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 font-semibold tracking-tight">
              {tenant.subdomain && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <a href={`https://${tenant.subdomain}.penagraha.id`} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 hover:underline">
                    {tenant.subdomain}.penagraha.id
                  </a>
                </span>
              )}
              <span className="hidden sm:inline text-slate-200">·</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                Registrasi: {new Date(tenant.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            size="lg"
            variant={tenant.status === "ACTIVE" ? "destructive" : "default"}
            disabled={updatingStatus}
            onClick={handleToggleStatus}
            className={cn(
              "rounded-xl text-xs font-black uppercase tracking-wider h-12 px-6 gap-2 shadow-sm transition-all hover:shadow-md",
              tenant.status !== "ACTIVE" && "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 border-none"
            )}
          >
            {updatingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : tenant.status === "ACTIVE" ? (
              <><Ban className="h-4.5 w-4.5" /> Tangguhkan Tenant</>
            ) : (
              <><CheckCircle2 className="h-4.5 w-4.5" /> Aktifkan Tenant</>
            )}
          </Button>
        </div>
      </div>

      {/* Core Statistics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Pengguna",
            value: tenant._count?.users ?? 0,
            icon: <UsersIcon className="h-5 w-5 text-blue-500" />,
            bg: "from-blue-50/60 to-indigo-50/20 border-blue-100/40",
            desc: "Staf kantor notaris aktif"
          },
          {
            label: "Total Akta",
            value: tenant._count?.deeds ?? 0,
            icon: <FileText className="h-5 w-5 text-violet-500" />,
            bg: "from-violet-50/60 to-fuchsia-50/20 border-violet-100/40",
            desc: "Dokumen terdaftar"
          },
          {
            label: "Paket Langganan",
            value: subCfg.label,
            icon: <Shield className="h-5 w-5 text-purple-500" />,
            bg: "from-purple-50/60 to-pink-50/20 border-purple-100/40",
            desc: subCfg.desc
          },
          {
            label: "Status Integrasi",
            value: tenant.status === "ACTIVE" ? "Lancar" : "Terblokir",
            icon: <UserCheck className="h-5 w-5 text-emerald-500" />,
            bg: "from-emerald-50/60 to-teal-50/20 border-emerald-100/40",
            desc: "Sistem otentikasi API"
          }
        ].map((stat, i) => (
          <Card key={i} className={cn("overflow-hidden bg-gradient-to-br border shadow-sm rounded-2xl p-2", stat.bg)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
              <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 shrink-0">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
              <p className="text-[10px] text-slate-400 font-semibold leading-tight">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content sections layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Office Profile card */}
        <Card className="rounded-[20px] border-slate-100 shadow-sm h-fit">
          <CardHeader className="border-b border-slate-50 p-6">
            <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-500" /> Detail Kantor
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">Informasi operasional dan legalitas tenant</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* ID */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ID Tenant</span>
              <div className="font-mono text-xs text-slate-600 bg-slate-50/70 border border-slate-100/80 rounded-xl px-4 py-3 select-all truncate">
                {tenant.id}
              </div>
            </div>

            {/* Subdomain */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Domain Akses</span>
              <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-100/80 rounded-xl px-4 py-3 text-sm font-bold text-slate-800">
                <Globe className="h-4 w-4 text-slate-400" />
                {tenant.subdomain ? (
                  <a href={`https://${tenant.subdomain}.penagraha.id`} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:text-orange-500 hover:underline truncate">
                    {tenant.subdomain}.penagraha.id
                  </a>
                ) : (
                  <span className="text-slate-300 italic font-medium">Tanpa subdomain</span>
                )}
              </div>
            </div>

            {/* Subscription */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Paket Langganan</span>
              <div className="flex items-center gap-2.5 bg-slate-50/70 border border-slate-100/80 rounded-xl px-4 py-3 text-sm font-bold text-slate-800">
                <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shrink-0", subCfg.bg, subCfg.color, subCfg.border)}>
                  {subCfg.label}
                </span>
                <span className="text-xs text-slate-500 font-medium truncate">{subCfg.desc}</span>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Alamat Kantor</span>
              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 rounded-xl p-4 border border-slate-100/80">
                {tenant.address || "Belum melengkapi alamat lengkap."}
              </div>
            </div>

            {/* Security Note if Suspended */}
            {tenant.status === "SUSPENDED" && (
              <div className="bg-red-50/70 border border-red-100/80 rounded-xl p-4 text-xs text-red-600 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-red-700">Status Tangguh Aktif</span>
                  Semua kredensial, integrasi, dan hak akses staf kantor ini telah dinonaktifkan di server utama platform.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column: User & Staff management table */}
        <Card className="lg:col-span-2 rounded-[20px] border-slate-100 shadow-sm h-fit">
          <CardHeader className="border-b border-slate-50 p-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-blue-500" /> Pengguna & Staf Kantor
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">Daftar staf yang memiliki akses ke kantor notaris ini</CardDescription>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full shrink-0">
              {tenant.users?.length || 0} Pengguna
            </span>
          </CardHeader>
          <CardContent className="p-6">
            {tenant.users && tenant.users.length > 0 ? (
              <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email / Akses</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Peran</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenant.users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4.5">
                          <div className="font-bold text-slate-900 text-sm leading-snug">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            Gabung: {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="text-xs font-medium text-slate-600 block">{u.email}</span>
                          <span className="font-mono text-[9px] text-slate-300 block select-all mt-0.5">{u.id}</span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shrink-0", ROLE_COLORS[u.role] || "bg-slate-100 text-slate-600 border-slate-200")}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          {u.isLocked ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 text-red-600 border border-red-100 text-[9px] font-black uppercase shrink-0">
                              <UserX className="h-3 w-3" /> Terkunci
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-50 text-green-600 border border-green-100 text-[9px] font-black uppercase shrink-0">
                              <UserCheck className="h-3 w-3" /> Aktif
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <UsersIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                Belum ada staf yang terdaftar di kantor ini.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
