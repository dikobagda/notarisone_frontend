"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Download,
  Phone,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-violet-500", "bg-emerald-500", 
  "bg-amber-500", "bg-rose-500", "bg-sky-500"
];

export default function ConsultationListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  const fetchConsultations = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) return;

    try {
      const response = await fetch(`/api/service-requests?tenantId=${tenantId}`, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setConsultations(result.data);
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchConsultations();
  }, [session]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/service-requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any)?.backendToken}`
        },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (result.success) {
        fetchConsultations();
        setActiveMenuId(null);
      }
    } catch (error) {
      alert("Gagal memperbarui status");
    }
  };

  const filtered = consultations.filter(c => 
    (c.clientName || c.client?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.serviceCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered]; // Default sort by date desc is usually handled by backend, but we can ensure it here
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Menunggu</Badge>;
      case 'IN_PROGRESS': return <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Diproses</Badge>;
      case 'COMPLETED': return <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Selesai</Badge>;
      case 'CANCELLED': return <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Batal</Badge>;
      default: return <Badge className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Konsultansi</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Kelola konsultansi awal dan kesepakatan biaya sebelum pendaftaran akta.
          </p>
        </div>
        <Link href="/dashboard/penerimaan/baru">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-95">
            <Plus className="h-4 w-4" />
            Mulai Konsultansi Baru
          </Button>
        </Link>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-sm bg-white overflow-visible py-0 gap-0 rounded-3xl">
        
        {/* Card Toolbar */}
        <div className="bg-slate-50/50 border-b border-slate-100 h-16 px-6 flex flex-row items-center justify-between shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daftar Konsultansi</span>
            {!loading && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                {sorted.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
              <Input
                placeholder="Cari nama klien atau permohonan..."
                className="pl-10 h-10 rounded-2xl border-slate-200 bg-white shadow-sm shadow-indigo-100/50 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-10 rounded-2xl border-slate-200 bg-white font-bold gap-2 text-slate-600 shadow-sm">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-visible">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-none transition-none">
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Tanggal</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Klien</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Permohonan</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Estimasi Biaya</TableHead>
                <TableHead className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Status</TableHead>
                <TableHead className="py-4 text-right px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-24">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-300" />
                      <p className="text-xs font-bold uppercase tracking-widest">Memuat data konsultansi…</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-24">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <ClipboardList className="h-8 w-8 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">Belum ada data konsultansi</p>
                        <p className="text-xs font-medium mt-1 text-slate-400">Mulai konsultansi awal untuk memproses layanan baru.</p>
                      </div>
                      <Link href="/dashboard/penerimaan/baru">
                        <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 gap-2 cursor-pointer text-white border-0 font-bold px-6">
                          <Plus className="h-4 w-4" /> Mulai Baru
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="group/row hover:bg-slate-50/60 border-slate-100 transition-colors relative cursor-pointer"
                    onClick={() => router.push(`/dashboard/penerimaan/${item.id}`)}
                  >
                    {/* Date */}
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 leading-snug">
                          {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      </div>
                    </TableCell>

                    {/* Client */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 shrink-0 rounded-2xl ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover/row:scale-105 transition-transform`}>
                          {(item.clientName || item.client?.name || "K").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate group-hover/row:text-indigo-600 transition-colors">
                            {item.clientName || item.client?.name || "Klien Anonim"}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                            <Phone className="h-3 w-3" />
                            <span>{item.clientPhone || item.client?.phone || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Service Category */}
                    <TableCell className="py-4">
                       <div className="flex flex-col">
                         <span className="text-xs font-bold text-slate-700">{item.serviceCategory?.replace('_', ' ')}</span>
                         <span className="text-[10px] text-slate-400 font-medium line-clamp-1 italic max-w-[150px]">
                           {item.description || 'Tanpa deskripsi'}
                         </span>
                       </div>
                    </TableCell>

                    {/* Cost */}
                    <TableCell className="py-4">
                      <span className="text-sm font-bold text-slate-900">
                        Rp {Number(item.estimatedCost || 0).toLocaleString('id-ID')}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        {getStatusBadge(item.status)}
                        {item._count?.deeds > 0 && (
                          <Badge variant="outline" className="bg-white border-indigo-100 text-indigo-600 text-[9px] font-bold px-1.5 py-0 rounded-md">
                             {item._count.deeds} Draf Akta
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 text-right px-6">
                      <div className="relative flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-xl transition-all cursor-pointer ${
                            activeMenuId === item.id
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === item.id ? null : item.id);
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>

                        {activeMenuId === item.id && (
                          <>
                            <div className="fixed inset-0 z-[60]" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                            <div 
                              className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 shadow-xl rounded-2xl z-[70] overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="p-1.5 space-y-0.5 text-left">
                                <Link href={`/dashboard/penerimaan/${item.id}`} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
                                  <Eye className="h-4 w-4 opacity-60" /> Lihat Detail
                                </Link>
                                <Link href={`/dashboard/penerimaan/${item.id}/edit`} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
                                  <Pencil className="h-4 w-4 opacity-60" /> Edit Konsultansi
                                </Link>
                                <div className="h-px bg-slate-100 my-1 mx-2" />
                                
                                <button onClick={() => updateStatus(item.id, 'IN_PROGRESS')} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-left">
                                  <Clock className="h-4 w-4 opacity-60" /> Proses Pekerjaan
                                </button>
                                <button onClick={() => updateStatus(item.id, 'COMPLETED')} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors text-left">
                                  <CheckCircle2 className="h-4 w-4 opacity-60" /> Selesai
                                </button>
                                <button onClick={() => updateStatus(item.id, 'CANCELLED')} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left">
                                  <XCircle className="h-4 w-4 opacity-60" /> Batalkan
                                </button>
                                
                                <div className="h-px bg-slate-100 my-1 mx-2" />
                                <Link 
                                  href={`${item.serviceCategory === 'PPAT' ? '/dashboard/ppat/create' : '/dashboard/deeds/create'}?serviceRequestId=${item.id}&clientId=${item.clientId || ""}&title=${encodeURIComponent(item.description || "")}`} 
                                  className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-tight text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                >
                                  <ArrowRight className="h-4 w-4" /> Buat Draft Akta
                                </Link>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!loading && sorted.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-medium">
                Menampilkan <span className="font-bold text-slate-600">{((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, sorted.length)}</span> dari <span className="font-bold text-slate-600">{sorted.length}</span> data
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      p === page
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
