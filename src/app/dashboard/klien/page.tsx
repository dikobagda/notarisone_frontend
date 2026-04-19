"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal,
  Loader2,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  UserCheck,
  Phone,
  MapPin,
  FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-violet-500", "bg-emerald-500", 
  "bg-amber-500", "bg-rose-500", "bg-sky-500"
];

export default function ClientsPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{id: string, name: string} | null>(null);
  const [sortKey, setSortKey] = useState<'name' | 'nik' | 'phone'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const handleSort = (key: 'name' | 'nik' | 'phone') => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const fetchClients = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) return;
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3001/api/clients?tenantId=${tenantId}`, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success) setClients(result.data);
    } catch (error) {
      console.error("Fetch clients error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, [session]);

  const handleDelete = async () => {
    if (!clientToDelete) return;
    const { id } = clientToDelete;
    const tenantId = (session?.user as any)?.tenantId;
    try {
      const response = await fetch(`http://localhost:3001/api/clients/${id}?tenantId=${tenantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success) fetchClients();
      else alert(result.message || "Gagal menghapus klien");
    } catch {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
      setActiveMenuId(null);
    }
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nik.includes(searchTerm)
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = (a[sortKey] || '').toLowerCase();
    const bv = (b[sortKey] || '').toLowerCase();
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ col }: { col: 'name' | 'nik' | 'phone' }) => (
    sortKey === col
      ? sortDir === 'asc'
        ? <ArrowUp className="h-3 w-3 text-indigo-500" />
        : <ArrowDown className="h-3 w-3 text-indigo-500" />
      : <ChevronsUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
  );

  return (
    <div className="flex flex-col gap-8 pb-20">

      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Users className="h-7 w-7 text-indigo-600" strokeWidth={2.5} />
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Manajemen Klien</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Kelola data pemohon, identitas, dan informasi kontak klien secara digital.
          </p>
        </div>
        <Link href="/dashboard/klien/create">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-95">
            <Plus className="h-4 w-4" />
            Tambah Klien
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Klien", value: isLoading ? "—" : clients.length, sub: "Klien terdaftar", icon: Users, accent: "bg-indigo-50", iconColor: "text-indigo-600" },
          { label: "Memiliki Akta", value: "—", sub: "Sedang dalam proses", icon: FileText, accent: "bg-emerald-50", iconColor: "text-emerald-600" },
          { label: "Klien Baru", value: "—", sub: "Bulan ini", icon: UserCheck, accent: "bg-violet-50", iconColor: "text-violet-600" },
        ].map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden rounded-3xl gap-0 py-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                <div className={`h-9 w-9 rounded-xl ${stat.accent} flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
              <p className="text-xs font-bold mt-1 text-slate-400">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-sm bg-white overflow-visible py-0 gap-0 rounded-3xl">
        
        {/* Card Toolbar */}
        <div className="bg-slate-50/50 border-b border-slate-100 h-16 px-6 flex flex-row items-center justify-between shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Semua Klien</span>
            {!isLoading && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                {sorted.length}
              </span>
            )}
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

        {/* Table */}
        <div className="overflow-visible">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-none transition-none">
                <TableHead className="px-6 py-4">
                  <button onClick={() => handleSort('name')} className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
                    Klien <SortIcon col="name" />
                  </button>
                </TableHead>
                <TableHead className="py-4">
                  <button onClick={() => handleSort('nik')} className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
                    NIK <SortIcon col="nik" />
                  </button>
                </TableHead>
                <TableHead className="py-4">
                  <button onClick={() => handleSort('phone')} className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
                    Telepon <SortIcon col="phone" />
                  </button>
                </TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Domisili</TableHead>
                <TableHead className="py-4 text-right px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-300" />
                      <p className="text-xs font-bold uppercase tracking-widest">Memuat data klien…</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <Users className="h-8 w-8 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">Tidak ada klien ditemukan</p>
                        <p className="text-xs font-medium mt-1 text-slate-400">Coba ubah kata kunci atau tambah klien baru.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((client, index) => (
                  <TableRow
                    key={client.id}
                    className="group/row hover:bg-slate-50/60 border-slate-100 transition-colors relative"
                  >
                    {/* Client Name + Avatar */}
                    <TableCell className="px-6 py-4">
                      <Link href={`/dashboard/klien/${client.id}`} className="flex items-center gap-4 min-w-0">
                        <div className={`h-10 w-10 shrink-0 rounded-2xl ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover/row:scale-105 transition-transform`}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate group-hover/row:text-indigo-600 transition-colors">{client.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{client.email || '—'}</p>
                        </div>
                      </Link>
                    </TableCell>

                    {/* NIK */}
                    <TableCell className="py-4">
                      <span className="font-mono text-sm text-slate-600 tracking-wide bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{client.nik}</span>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="text-sm font-medium">{client.phone || '—'}</span>
                      </div>
                    </TableCell>

                    {/* Address */}
                    <TableCell className="py-4 pr-4">
                      <div className="flex items-start gap-1.5 text-slate-500 max-w-[200px]">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] font-medium line-clamp-2 leading-relaxed" title={client.address}>
                          {client.address || '—'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 text-right px-6">
                      <div className="relative flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-xl transition-all cursor-pointer ${
                            activeMenuId === client.id
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                          }`}
                          onClick={() => setActiveMenuId(activeMenuId === client.id ? null : client.id)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>

                        {activeMenuId === client.id && (
                          <>
                            <div className="fixed inset-0 z-[60]" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl z-[70] overflow-hidden">
                              <div className="p-1.5 space-y-0.5">
                                <Link href={`/dashboard/klien/${client.id}`} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
                                  <Eye className="h-4 w-4 opacity-60" /> Detail Klien
                                </Link>
                                <Link href={`/dashboard/klien/${client.id}/edit`} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
                                  <Edit3 className="h-4 w-4 opacity-60" /> Edit Data
                                </Link>
                                <div className="h-px bg-slate-100 my-1 mx-2" />
                                <button
                                  onClick={() => {
                                    setClientToDelete({ id: client.id, name: client.name });
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4 opacity-60" /> Hapus Klien
                                </button>
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
          {!isLoading && sorted.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-medium">
                Menampilkan <span className="font-bold text-slate-600">{((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, sorted.length)}</span> dari <span className="font-bold text-slate-600">{sorted.length}</span> klien
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="items-center text-center px-8 pt-8 pb-6">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
              <Trash2 className="h-7 w-7" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-slate-900">Konfirmasi Hapus</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2 px-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus data klien <span className="text-slate-900 font-extrabold">"{clientToDelete?.name}"</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 pb-2">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs font-medium text-amber-700 leading-relaxed">
              Tindakan ini akan mengarsipkan data. Klien tidak akan muncul di daftar utama Anda.
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3 p-8 pt-4">
            <Button 
              variant="outline" 
              className="w-full sm:w-1/2 h-11 rounded-xl font-bold border-slate-200"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button 
              variant="destructive" 
              className="w-full sm:w-1/2 h-11 rounded-xl font-bold bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100 text-white"
              onClick={handleDelete}
            >
              Hapus Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
