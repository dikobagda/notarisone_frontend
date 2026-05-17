"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Loader2,
  Edit3,
  Trash2,
  Briefcase,
  Save,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
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

export default function MasterPekerjaanTambahanPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchJobs = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/additional-jobs?tenantId=${tenantId}&page=${page}&limit=${limit}&search=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success && result.data) {
        if (Array.isArray(result.data)) {
          setJobs(result.data);
          setTotal(result.data.length);
          setTotalPages(1);
        } else {
          setJobs(result.data.data || []);
          setTotal(result.data.pagination?.total || 0);
          setTotalPages(result.data.pagination?.totalPages || 1);
        }
      }
    } catch (error) {
      console.error("Fetch jobs error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchJobs(); 
  }, [session, page, searchTerm]);

  const openAddForm = () => {
    setEditingId(null);
    setFormData({ name: "", price: "" });
    setIsFormOpen(true);
  };

  const openEditForm = (job: any) => {
    setEditingId(job.id);
    setFormData({ name: job.name, price: job.price.toString() });
    setIsFormOpen(true);
    setActiveMenuId(null);
  };

  const confirmDelete = (job: any) => {
    setSelectedJob(job);
    setIsDeleteOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) return alert("Lengkapi semua kolom");
    
    const tenantId = (session?.user as any)?.tenantId;
    setIsSaving(true);
    try {
      const url = `/api/additional-jobs${editingId ? `/${editingId}` : ''}?tenantId=${tenantId}`;
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${(session as any)?.backendToken}` 
        },
        body: JSON.stringify({
           name: formData.name,
           price: parseFloat(formData.price)
        })
      });
      const result = await response.json();
      if (result.success) {
         fetchJobs();
         setIsFormOpen(false);
      } else {
         alert(result.message || "Gagal menyimpan data");
      }
    } catch {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    const tenantId = (session?.user as any)?.tenantId;
    try {
      const response = await fetch(`/api/additional-jobs/${selectedJob.id}?tenantId=${tenantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success) fetchJobs();
      else alert(result.message || "Gagal menghapus data");
    } catch {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsDeleteOpen(false);
      setSelectedJob(null);
    }
  };

  // const filtered = jobs.filter(j =>
  //   j.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Briefcase className="h-7 w-7 text-indigo-600" strokeWidth={2.5} />
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Pekerjaan Tambahan</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Kelola master data daftar pekerjaan tambahan untuk Konsultansi klien.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={openAddForm} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-95">
            <Plus className="h-4 w-4" />
            Tambah Baru
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-sm bg-white overflow-visible py-0 gap-0 rounded-3xl">
        <div className="bg-slate-50/50 border-b border-slate-100 h-16 px-6 flex flex-row items-center justify-between shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daftar Pekerjaan</span>
            {!isLoading && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                {total}
              </span>
            )}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
            <Input
              placeholder="Cari pekerjaan..."
              className="pl-10 h-10 rounded-2xl border-slate-200 bg-white shadow-sm shadow-indigo-100/50 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-visible">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-none transition-none">
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Nama Pekerjaan
                </TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Estimasi Biaya (Rp)
                </TableHead>
                <TableHead className="py-4 text-right px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-24">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-300" />
                      <p className="text-xs font-bold uppercase tracking-widest">Memuat data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-24">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <Briefcase className="h-8 w-8 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">Tidak ada data ditemukan</p>
                        <p className="text-xs font-medium mt-1 text-slate-400">Coba ubah kata kunci pencarian atau tambah baru.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="group/row hover:bg-slate-50/60 border-slate-100 transition-colors relative"
                  >
                    <TableCell className="px-6 py-4">
                       <p className="font-bold text-slate-900 group-hover/row:text-indigo-600 transition-colors">{job.name}</p>
                    </TableCell>

                    <TableCell className="py-4">
                       <span className="font-bold text-slate-600 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                         {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(job.price)}
                       </span>
                    </TableCell>

                    <TableCell className="py-4 text-right px-6">
                      <div className="relative flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-xl transition-all cursor-pointer ${
                            activeMenuId === job.id
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                          }`}
                          onClick={() => setActiveMenuId(activeMenuId === job.id ? null : job.id)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>

                        {activeMenuId === job.id && (
                          <>
                            <div className="fixed inset-0 z-[60]" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 shadow-xl rounded-2xl z-[70] overflow-hidden">
                              <div className="p-1.5 space-y-0.5">
                                <button onClick={() => openEditForm(job)} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
                                  <Edit3 className="h-4 w-4 opacity-60" /> Edit
                                </button>
                                <div className="h-px bg-slate-100 my-1 mx-2" />
                                <button
                                  onClick={() => confirmDelete(job)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4 opacity-60" /> Hapus
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
        </div>

        {/* Pagination Controls */}
        <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between rounded-b-3xl">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Halaman <span className="text-slate-900">{page}</span> dari <span className="text-slate-900">{totalPages}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200 bg-white shadow-sm disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1.5 px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => {
                  if (totalPages <= 5) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (p >= page - 1 && p <= page + 1) return true;
                  return false;
                })
                .map((p, index, array) => (
                  <React.Fragment key={p}>
                    {index > 0 && array[index - 1] !== p - 1 && (
                      <span className="text-slate-300">...</span>
                    )}
                    <Button
                      variant={page === p ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 w-8 rounded-lg font-bold text-xs ${
                        page === p 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                          : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  </React.Fragment>
                ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200 bg-white shadow-sm disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-slate-900">
               {editingId ? "Edit Pekerjaan Tambahan" : "Tambah Pekerjaan Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Pekerjaan <span className="text-red-500">*</span></label>
                <Input 
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   placeholder="Contoh: Pendaftaran NIB"
                   className="h-12 rounded-xl font-bold border-slate-200"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estimasi Biaya <span className="text-red-500">*</span></label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                   <Input 
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="500000"
                      className="h-12 rounded-xl font-bold border-slate-200 pl-12"
                   />
                </div>
             </div>
          </div>
          <DialogFooter className="mt-8 flex gap-3">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} className="h-11 rounded-xl font-bold w-full border-slate-200">
               Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="h-11 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full shadow-lg shadow-indigo-100 gap-2">
               {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
               Simpan Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="items-center text-center px-8 pt-8 pb-6">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
              <Trash2 className="h-7 w-7" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-slate-900">Konfirmasi Hapus</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2 px-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus pekerjaan <span className="text-slate-900 font-extrabold">"{selectedJob?.name}"</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 p-8 pt-4">
            <Button 
              variant="outline" 
              className="w-full sm:w-1/2 h-11 rounded-xl font-bold border-slate-200"
              onClick={() => setIsDeleteOpen(false)}
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
