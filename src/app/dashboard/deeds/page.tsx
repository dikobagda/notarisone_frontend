"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Calendar,
  User,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DeedsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [deeds, setDeeds] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortKey, setSortKey] = useState<'title' | 'client' | 'targetFinalization' | 'updatedAt'>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const DEED_TYPE_LABELS: Record<string, string> = {
    PENDIRIAN_PT: "Pendirian Perseroan Terbatas (PT)",
    PENDIRIAN_CV: "Pendirian CV / Firma",
    PENDIRIAN_YAYASAN: "Pendirian Yayasan",
    PENDIRIAN_PERKUMPULAN: "Pendirian Perkumpulan",
    AD_PERUBAHAN: "Perubahan Anggaran Dasar",
    JUAL_BELI: "Akta Jual Beli",
    SEWA_MENYUWA: "Perjanjian Sewa Menyewa",
    KERJASAMA: "Perjanjian Kerjasama",
    KREDIT: "Perjanjian Kredit",
    WASIAT: "Akta Wasiat",
    KUASA_MENJUAL: "Akta Kuasa Menjual",
    PPJB: "Pengikatan Jual Beli (PPJB)",
    RUPS: "Berita Acara Rapat (RUPS)",
    SKMHT: "SKMHT",
    HIBAH: "Akta Hibah",
    LAINNYA: "Lainnya"
  };

  const fetchDeeds = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    console.log("[DEBUG] session:", session);
    console.log("[DEBUG] tenantId from session:", tenantId);
    
    if (!tenantId) {
      console.warn("[DEBUG] Fetch aborted: No tenantId in session");
      return;
    }
    try {
      setIsLoading(true);
      const url = `/api/deeds?tenantId=${tenantId}`;
      console.log("[DEBUG] Fetching URL:", url);
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      console.log("[DEBUG] Deeds API result:", result);
      if (result.success) {
        setDeeds(result.data);
      } else {
        console.error("[DEBUG] Deeds API failed:", result.message);
      }
    } catch (error) {
      console.error("Fetch deeds error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDeeds(); }, [session]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  // Exclude ALL PPAT deed types from the Notaris view
  const PPAT_TYPES = [
    "AJB", "HIBAH", "TUKAR_MENUKAR", "INBRENG", "APHB", "APHT", "APHT_NOVASI", "SKMHT", "HGB", "HGU", "HP",
    "PPAT", // legacy value
  ];
  const notarisDeeds = deeds.filter(d => !PPAT_TYPES.includes(d.type));
  console.log("[DEBUG] Total deeds:", deeds.length);
  console.log("[DEBUG] Notaris deeds after filter:", notarisDeeds.length);
  console.log("[DEBUG] PPAT types used for filtering:", PPAT_TYPES);

  const filteredDeeds = notarisDeeds.filter(d =>
    (filterStatus === "all" || d.status === filterStatus) &&
    (
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.client?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.client?.nik || "").includes(searchTerm)
    )
  );

  const sortedDeeds = [...filteredDeeds].sort((a, b) => {
    if (sortKey === 'client') {
      const av = (a.client?.name || '').toLowerCase();
      const bv = (b.client?.name || '').toLowerCase();
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    if (sortKey === 'targetFinalization' || sortKey === 'updatedAt') {
      const av = a[sortKey] ? new Date(a[sortKey]).getTime() : 0;
      const bv = b[sortKey] ? new Date(b[sortKey]).getTime() : 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    }
    const av = (a[sortKey] || '').toLowerCase();
    const bv = (b[sortKey] || '').toLowerCase();
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const totalPages = Math.max(1, Math.ceil(sortedDeeds.length / PAGE_SIZE));
  const paginatedDeeds = sortedDeeds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const finalCount = notarisDeeds.filter(d => d.status === 'FINAL').length;
  const draftCount = notarisDeeds.filter(d => d.status === 'DRAFT').length;
  const pendingCount = notarisDeeds.filter(d => d.status === 'PENDING_CLIENT').length;

  const SortIcon = ({ col }: { col: typeof sortKey }) => (
    sortKey === col
      ? sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-indigo-500" /> : <ArrowDown className="h-3 w-3 text-indigo-500" />
      : <ChevronsUpDown className="h-3 w-3 text-slate-300" />
  );

  const renderStatus = (status: string) => {
    switch (status) {
      case 'FINAL': return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />Final
        </span>
      );
      case 'PENDING_CLIENT': return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />Proses
        </span>
      );
      default: return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 inline-block" />Draft
        </span>
      );
    }
  };

  const getDeadlineBadge = (deadline: string, status: string) => {
    if (!deadline) return <span className="text-slate-400 text-xs font-bold">—</span>;
    if (status === "FINAL") return (
      <span className="w-fit text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
        Selesai
      </span>
    );
    const diffDays = Math.ceil((new Date(deadline).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
    if (diffDays < 0) return (
      <span className="w-fit text-[10px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
        Terlambat {Math.abs(diffDays)} hari
      </span>
    );
    if (diffDays === 0) return (
      <span className="w-fit text-[10px] font-black text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
        Hari ini
      </span>
    );
    if (diffDays <= 3) return (
      <span className="w-fit text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
        {diffDays} hari lagi
      </span>
    );
    return (
      <span className="w-fit text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
        {diffDays} hari lagi
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Modern Hero Header — Indigo accent for Notaris */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white shadow-xl shadow-indigo-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwaC02di02aDZ2NnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-violet-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-indigo-200 uppercase tracking-[0.2em]">Modul Notaris</p>
                <h1 className="text-3xl font-black text-white tracking-tight leading-none">Akta Notaris</h1>
              </div>
            </div>
            <p className="text-sm text-indigo-100/80 font-medium max-w-md">
              Kelola seluruh proses pembuatan akta umum dari draf, persetujuan, hingga finalisasi legal.
            </p>
          </div>
          <Link href="/dashboard/deeds/create">
            <Button className="gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-black h-12 px-6 rounded-2xl shadow-lg border-0 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shrink-0">
              <Plus className="h-4 w-4" />
              Akta Baru
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
          {[
            { label: "Total Akta", value: notarisDeeds.length, icon: FileText, color: "bg-white/10 text-white border-white/10" },
            { label: "Selesai", value: finalCount, icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-100 border-emerald-400/20" },
            { label: "Dalam Proses", value: pendingCount, icon: Clock, color: "bg-amber-500/20 text-amber-100 border-amber-400/20" },
            { label: "Draft", value: draftCount, icon: AlertCircle, color: "bg-white/10 text-white/70 border-white/10" },
          ].map((stat) => (
            <div key={stat.label} className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-sm ${stat.color}`}>
              <stat.icon className="h-5 w-5 shrink-0 opacity-80" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">{stat.label}</p>
                <p className="text-2xl font-black leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 gap-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-slate-800">Daftar Akta</span>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {filteredDeeds.length} akta
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-50 border border-slate-100">
              {[
                { key: "all", label: "Semua" },
                { key: "FINAL", label: "Final" },
                { key: "PENDING_CLIENT", label: "Proses" },
                { key: "DRAFT", label: "Draft" },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => { setFilterStatus(f.key); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                    filterStatus === f.key
                      ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
              <Input
                placeholder="Cari akta, nomor, atau klien..."
                className="pl-10 h-10 rounded-2xl border-slate-200 bg-white shadow-sm shadow-indigo-100/50 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1.4fr_0.9fr_auto] items-center px-6 py-3 bg-slate-50/60 border-b border-slate-100">
          <button onClick={() => handleSort('title')} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer w-fit">
            Judul Akta <SortIcon col="title" />
          </button>
          <button onClick={() => handleSort('client')} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer w-fit">
            Klien <SortIcon col="client" />
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
          <button onClick={() => handleSort('targetFinalization')} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer w-fit">
            Deadline <SortIcon col="targetFinalization" />
          </button>
          <button onClick={() => handleSort('updatedAt')} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer w-fit">
            Update <SortIcon col="updatedAt" />
          </button>
          <span className="w-8" />
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-2 border-indigo-100" />
              <Loader2 className="h-7 w-7 animate-spin text-indigo-500 absolute top-3.5 left-3.5" />
            </div>
            <p className="font-bold text-slate-600 text-sm">Memuat data akta notaris...</p>
          </div>
        ) : sortedDeeds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center border border-indigo-100">
              <FileText className="h-10 w-10 text-indigo-300" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-black text-slate-700">Tidak ada akta ditemukan</p>
              <p className="text-xs font-medium text-slate-400">Coba ubah filter atau buat akta baru</p>
            </div>
            <Link href="/dashboard/deeds/create">
              <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 gap-2 cursor-pointer text-white border-0">
                <Plus className="h-3.5 w-3.5" /> Buat Akta Baru
              </Button>
            </Link>
          </div>
        ) : (
          paginatedDeeds.map((deed) => (
            <div
              key={deed.id}
              className="group grid grid-cols-[2fr_1.5fr_1fr_1.4fr_0.9fr_auto] items-center px-6 py-4 hover:bg-slate-50/80 transition-all relative border-b border-gray-50 last:border-b-0"
            >
              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200" />

              {/* Judul Akta */}
              <div className="min-w-0 pr-4">
                <Link href={`/dashboard/deeds/${deed.id}`} className="flex items-center gap-3 group/title">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover/title:bg-indigo-100 transition-colors">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-bold text-slate-800 truncate group-hover/title:text-indigo-700 transition-colors leading-snug">
                      {deed.title}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                      {DEED_TYPE_LABELS[deed.type] || deed.type?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Klien */}
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center text-[11px] font-black text-violet-600 uppercase shrink-0">
                    {deed.client?.name?.charAt(0) || "K"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-bold text-slate-800 truncate leading-tight">
                      {deed.client?.name || "N/A"}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider truncate">
                      {deed.client?.nik || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>{renderStatus(deed.status)}</div>

              {/* Deadline */}
              <div className="flex flex-col gap-1.5">
                {deed.targetFinalization ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-slate-700 leading-snug">
                        {new Date(deed.targetFinalization).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {getDeadlineBadge(deed.targetFinalization, deed.status)}
                  </>
                ) : (
                  <span className="text-xs font-bold text-slate-300">—</span>
                )}
              </div>

              {/* Updated At */}
              <div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-slate-600">
                    {new Date(deed.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(deed.updatedAt).getFullYear()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="relative flex justify-end pl-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-xl transition-all cursor-pointer ${
                    activeMenuId === deed.id
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                  onClick={() => setActiveMenuId(activeMenuId === deed.id ? null : deed.id)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>

                {activeMenuId === deed.id && (
                  <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setActiveMenuId(null)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 shadow-2xl shadow-slate-200/60 rounded-2xl z-[70] overflow-hidden">
                      <div className="p-1.5 space-y-0.5">
                        <Link href={`/dashboard/deeds/${deed.id}`} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors cursor-pointer">
                          <Eye className="h-4 w-4 text-slate-400" /> Lihat Detail
                        </Link>
                        <Link href={`/dashboard/deeds/${deed.id}/edit`} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                          <Pencil className="h-4 w-4 text-slate-400" /> Edit Metadata
                        </Link>
                        <Link href={`/dashboard/deeds/${deed.id}/documents`} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                          <FolderOpen className="h-4 w-4 text-slate-400" /> Kelola Dokumen
                        </Link>
                        <div className="h-px bg-slate-100 my-1 mx-2" />
                        <button
                          onClick={() => { if (confirm(`Hapus akta "${deed.title}"?`)) setDeeds(deeds.filter(d => d.id !== deed.id)); setActiveMenuId(null); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" /> Hapus Akta
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {sortedDeeds.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-slate-50/30">
            <p className="text-xs text-slate-400 font-medium">
              Menampilkan <span className="font-black text-slate-600">{((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, sortedDeeds.length)}</span>{" "}
              dari <span className="font-black text-slate-600">{sortedDeeds.length}</span> akta
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-black transition-all cursor-pointer ${
                    p === page ? 'bg-indigo-600 text-white shadow-sm' : 'border border-gray-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
