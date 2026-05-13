"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Scale, Plus, Search, MoreHorizontal, Eye, Edit3, Trash2, CheckCircle2, Clock, XCircle, Loader2, ChevronLeft, ChevronRight, X, Users, Search as SearchIcon, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Selesai", value: "SELESAI" },
  { label: "Dibatalkan", value: "DIBATALKAN" },
];

const STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "" },
  ...STATUS_OPTIONS,
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; className: string; icon: any }> = {
    PENDING:    { label: "Pending",    className: "bg-amber-50 text-amber-700 border-amber-200",   icon: Clock },
    SELESAI:    { label: "Selesai",    className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    DIBATALKAN: { label: "Dibatalkan", className: "bg-red-50 text-red-600 border-red-200",         icon: XCircle },
  };
  const { label, className, icon: Icon } = map[status] || map.PENDING;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider", className)}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
};

const EMPTY_FORM = { pemohon: "", perihal: "", keterangan: "", jumlahHalaman: 1, biaya: "", status: "PENDING", tanggalDaftar: new Date().toISOString().split("T")[0], clientId: "", nomorDaftar: "" };

export default function WaarmerkingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const tenantId = (session?.user as any)?.tenantId;
  const token = (session as any)?.backendToken;

  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [formData, setFormData] = useState<any>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Client picker states for Edit
  const [clients, setClients] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [isClientPickerOpen, setIsClientPickerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  useEffect(() => {
    if (!tenantId || !token) return;
    const fetchClients = async () => {
      try {
        const res = await fetch(`/api/clients?tenantId=${tenantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) setClients(result.data);
      } catch (err) { console.error(err); }
    };
    fetchClients();
  }, [tenantId, token]);

  const filteredClients = clientSearch
    ? clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.nik?.includes(clientSearch))
    : clients.slice(0, 5);

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    setFormData((prev: any) => ({ ...prev, clientId: client.id, pemohon: client.name }));
    setIsClientPickerOpen(false);
  };

  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ tenantId, page: String(page), limit: String(PAGE_SIZE) });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/waarmerking?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) { setRecords(result.data.data); setTotal(result.data.total); }
    } finally { setIsLoading(false); }
  }, [tenantId, token, page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { router.push("/dashboard/non-akta/waarmerking/create"); };
  const openEdit = (r: any) => {
    setEditTarget(r);
    setSelectedClient(r.client || null);
    setFormData({ pemohon: r.pemohon, perihal: r.perihal, keterangan: r.keterangan || "", jumlahHalaman: r.jumlahHalaman, biaya: r.biaya ? String(r.biaya) : "", status: r.status, tanggalDaftar: r.tanggalDaftar ? r.tanggalDaftar.split("T")[0] : "", clientId: r.clientId || "", nomorDaftar: r.nomorDaftar || "" });
    setIsFormOpen(true); setActiveMenu(null);
  };

  const handleSave = async () => {
    if (!formData.pemohon || !formData.perihal) return;
    setIsSaving(true);
    try {
      const body = { ...formData, jumlahHalaman: Number(formData.jumlahHalaman), biaya: formData.biaya ? Number(formData.biaya) : undefined };
      const params = new URLSearchParams({ tenantId });
      const url = editTarget ? `/api/waarmerking/${editTarget.id}?${params}` : `/api/waarmerking?${params}`;
      const res = await fetch(url, { method: editTarget ? "PATCH" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) { setIsFormOpen(false); fetchData(); }
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const params = new URLSearchParams({ tenantId });
    await fetch(`/api/waarmerking/${deleteTarget.id}?${params}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setIsDeleteOpen(false); setDeleteTarget(null); fetchData();
  };

  const countByStatus = (s: string) => records.filter(r => r.status === s).length;

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Scale className="h-7 w-7 text-indigo-600" strokeWidth={2.5} />
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Waarmerking</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">Pencatatan surat di bawah tangan ke dalam buku pendaftaran.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
          <Plus className="h-4 w-4" /> Registrasi Baru
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total", value: isLoading ? "—" : total, accent: "bg-indigo-50", color: "text-indigo-600", icon: Scale },
          { label: "Pending", value: isLoading ? "—" : countByStatus("PENDING"), accent: "bg-amber-50", color: "text-amber-600", icon: Clock },
          { label: "Selesai", value: isLoading ? "—" : countByStatus("SELESAI"), accent: "bg-emerald-50", color: "text-emerald-600", icon: CheckCircle2 },
          { label: "Dibatalkan", value: isLoading ? "—" : countByStatus("DIBATALKAN"), accent: "bg-red-50", color: "text-red-600", icon: XCircle },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm bg-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
                <div className={`h-9 w-9 rounded-xl ${s.accent} flex items-center justify-center`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-none shadow-sm bg-white rounded-3xl overflow-visible py-0 gap-0">
        <div className="bg-slate-50/50 border-b border-slate-100 h-16 px-6 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daftar Waarmerking</span>
            {!isLoading && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">{total}</span>}
          </div>
          <div className="flex items-center gap-3">
            <CustomSelect options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} placeholder="Semua Status" className="w-44" />
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Cari pemohon, perihal..." className="pl-10 h-10 w-72 rounded-2xl border-slate-200" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["No. Daftar", "Pemohon", "Perihal", "Tgl. Daftar", "Halaman", "Biaya", "Status", ""].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-300 mx-auto" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-20">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Scale className="h-12 w-12 text-slate-200" />
                    <p className="font-bold text-slate-700">Belum ada data waarmerking</p>
                    <p className="text-xs">Klik "Registrasi Baru" untuk menambahkan.</p>
                  </div>
                </td></tr>
              ) : records.map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4"><span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{r.nomorDaftar || "—"}</span></td>
                  <td className="px-6 py-4"><p className="font-bold text-slate-900 text-sm">{r.pemohon}</p>{r.client && <p className="text-[11px] text-slate-400 mt-0.5">{r.client.name}</p>}</td>
                  <td className="px-6 py-4"><p className="text-sm text-slate-600 max-w-[200px] truncate">{r.perihal}</p></td>
                  <td className="px-6 py-4"><p className="text-xs font-medium text-slate-500">{r.tanggalDaftar ? new Date(r.tanggalDaftar).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p></td>
                  <td className="px-6 py-4 text-center"><span className="text-sm font-bold text-slate-700">{r.jumlahHalaman}</span></td>
                  <td className="px-6 py-4"><p className="text-sm font-bold text-slate-700">{r.biaya ? Number(r.biaya).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }) : "—"}</p></td>
                  <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                  <td className="px-6 py-4">
                    <div className="relative flex justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => setActiveMenu(activeMenu === r.id ? null : r.id)}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {activeMenu === r.id && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-100 shadow-xl rounded-2xl z-[70] overflow-hidden p-1.5 space-y-0.5">
                            <button onClick={() => openEdit(r)} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
                              <Edit3 className="h-4 w-4 opacity-60" /> Edit Data
                            </button>
                            <div className="h-px bg-slate-100 mx-2" />
                            <button onClick={() => { setDeleteTarget(r); setIsDeleteOpen(true); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                              <Trash2 className="h-4 w-4 opacity-60" /> Hapus
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">Menampilkan <span className="font-bold text-slate-600">{((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)}</span> dari <span className="font-bold text-slate-600">{total}</span></p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={cn("h-8 w-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all", p === page ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-500 hover:bg-indigo-50")}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl bg-white border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-extrabold text-slate-900">Edit Waarmerking</DialogTitle>
                <p className="text-sm text-slate-500 font-medium mt-1">Perbarui data dokumen waarmerking.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="h-8 w-8 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="px-8 pb-8 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Client Picker in Edit Modal */}
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Pihak Pemohon (Klien Database)</label>
              {selectedClient ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-100 bg-indigo-50/50">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">{selectedClient.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{selectedClient.name}</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedClient(null); setFormData((p: any) => ({ ...p, clientId: "" })); }} className="text-slate-300 hover:text-red-500"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <>
                  <div onClick={() => setIsClientPickerOpen(!isClientPickerOpen)} className="flex h-11 items-center justify-between border border-slate-200 px-4 rounded-xl cursor-pointer text-sm text-slate-400">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4" /> Cari klien...</div>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isClientPickerOpen && "rotate-180")} />
                  </div>
                  {isClientPickerOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-[100] overflow-hidden p-2 space-y-1">
                      <Input placeholder="Cari..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="h-8 text-xs mb-1" />
                      {filteredClients.map(c => (
                        <button key={c.id} onClick={() => handleSelectClient(c)} className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700">{c.name}</button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Nama Pemohon <span className="text-red-500">*</span></label>
                <Input value={formData.pemohon} onChange={e => setFormData({ ...formData, pemohon: e.target.value })} placeholder="Nama lengkap pemohon..." className="rounded-xl border-slate-200 h-11 font-bold" />
              </div>
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">No. Daftar (Otomatis jika kosong)</label>
                <Input value={formData.nomorDaftar} onChange={e => setFormData({ ...formData, nomorDaftar: e.target.value })} placeholder="WM-2025-01-001" className="rounded-xl border-slate-200 h-11 font-mono" />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Perihal / Jenis Dokumen <span className="text-red-500">*</span></label>
              <Input value={formData.perihal} onChange={e => setFormData({ ...formData, perihal: e.target.value })} placeholder="Contoh: Surat Perjanjian Jual Beli..." className="rounded-xl border-slate-200 h-11 font-bold" />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Keterangan Tambahan</label>
              <textarea value={formData.keterangan} onChange={e => setFormData({ ...formData, keterangan: e.target.value })} rows={3} placeholder="Catatan atau keterangan lainnya..." className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all" />
            </div>
            <div className="grid grid-cols-3 gap-5">
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Tanggal Daftar</label>
                <Input type="date" value={formData.tanggalDaftar} onChange={e => setFormData({ ...formData, tanggalDaftar: e.target.value })} className="rounded-xl border-slate-200 h-11" />
              </div>
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Jumlah Halaman</label>
                <Input type="number" min={1} value={formData.jumlahHalaman} onChange={e => setFormData({ ...formData, jumlahHalaman: e.target.value })} className="rounded-xl border-slate-200 h-11 font-bold" />
              </div>
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Biaya (Rp)</label>
                <Input type="number" value={formData.biaya} onChange={e => setFormData({ ...formData, biaya: e.target.value })} placeholder="0" className="rounded-xl border-slate-200 h-11 font-bold" />
              </div>
            </div>
            <CustomSelect label="Status" options={STATUS_OPTIONS} value={formData.status} onChange={v => setFormData({ ...formData, status: v })} placeholder="Pilih status..." />
          </div>

          <DialogFooter className="px-8 pb-8 pt-2 flex gap-3">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1 h-11 rounded-xl font-bold border-slate-200">Batal</Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 h-11 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="items-center text-center px-8 pt-8 pb-4">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto"><Trash2 className="h-7 w-7" /></div>
            <DialogTitle className="text-xl font-extrabold text-slate-900">Hapus Waarmerking</DialogTitle>
            <p className="text-sm text-slate-500 mt-2">Yakin hapus <span className="font-bold text-slate-900">{deleteTarget?.nomorDaftar}</span>? Tindakan ini tidak dapat dibatalkan.</p>
          </DialogHeader>
          <DialogFooter className="flex gap-3 px-8 pb-8">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="flex-1 h-11 rounded-xl font-bold">Batal</Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1 h-11 rounded-xl font-bold bg-red-500 hover:bg-red-600">Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
