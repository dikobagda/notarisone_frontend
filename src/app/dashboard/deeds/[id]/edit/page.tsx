"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Save,
  Loader2,
  ChevronDown,
  Check,
  Search,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  Hash,
  Users,
  X,
  FileText,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NOTARY_DEED_TYPES = [
  { label: "Pendirian Perseroan Terbatas (PT)", value: "PENDIRIAN_PT" },
  { label: "Pendirian CV / Firma", value: "PENDIRIAN_CV" },
  { label: "Pendirian Yayasan", value: "PENDIRIAN_YAYASAN" },
  { label: "Pendirian Perkumpulan", value: "PENDIRIAN_PERKUMPULAN" },
  { label: "Perubahan Anggaran Dasar", value: "AD_PERUBAHAN" },
  { label: "Perjanjian Sewa Menyewa", value: "SEWA_MENYUWA" },
  { label: "Perjanjian Kerjasama (Joint Venture)", value: "KERJASAMA" },
  { label: "Perjanjian Kredit", value: "KREDIT" },
  { label: "Akta Jual Beli Saham", value: "JUAL_BELI" },
  { label: "Akta Wasiat", value: "WASIAT" },
  { label: "Akta Kuasa Menjual", value: "KUASA_MENJUAL" },
  { label: "Pengikatan Jual Beli (PPJB)", value: "PPJB" },
  { label: "Berita Acara Rapat (RUPS)", value: "RUPS" },
  { label: "Surat Kuasa Membebankan Hak Tanggungan (SKMHT)", value: "SKMHT" },
  { label: "Hibah", value: "HIBAH" },
  { label: "Lainnya", value: "LAINNYA" }
];

export default function EditDeedPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session } = useSession();

  // Core states
  const [deed, setDeed] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // Dropdown states
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [typeSearch, setTypeSearch] = useState("");

  // Fetch deed data
  useEffect(() => {
    const fetchDeed = async () => {
      const tenantId = (session?.user as any)?.tenantId;
      if (!tenantId || !id) return;
      try {
        setIsLoading(true);
        const res = await fetch(`/api/deeds/${id}?tenantId=${tenantId}`, {
          headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
        });
        const result = await res.json();
        if (result.success) {
          const d = result.data;
          setDeed(d);
          setTitle(d.title || "");
          setSelectedType(d.type || "");
          if (d.targetFinalization) setTargetDate(new Date(d.targetFinalization).toISOString().split('T')[0]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (session) fetchDeed();
  }, [id, session]);

  const filteredTypes = NOTARY_DEED_TYPES.filter(t => t.label.toLowerCase().includes(typeSearch.toLowerCase()));
  const selectedTypeLabel = NOTARY_DEED_TYPES.find(t => t.value === selectedType)?.label;

  const handleUpdate = async () => {
    if (!title || !selectedType) {
      alert("Mohon lengkapi Judul dan Jenis Akta.");
      return;
    }
    setIsSubmitting(true);
    try {
      const tenantId = (session?.user as any)?.tenantId || "default-tenant";
      const res = await fetch(`/api/deeds/${id}?tenantId=${tenantId}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any)?.backendToken}`
        },
        body: JSON.stringify({
          title,
          type: selectedType,
          targetFinalization: targetDate || null,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSaved(true);
        setTimeout(() => router.push(`/dashboard/deeds/${id}`), 800);
      } else {
        alert("Gagal memperbarui akta: " + result.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat memperbarui akta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-indigo-50 border-2 border-indigo-100" />
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 absolute top-5 left-5" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-black text-slate-700 text-sm">Memuat data akta Notaris...</p>
          <p className="text-xs text-slate-400 animate-pulse">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // ── Final locked ──
  if (deed?.status === 'FINAL') {
    return (
      <div className="max-w-xl mx-auto mt-20 flex flex-col items-center gap-6 text-center text-white relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-12 border border-slate-800">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="h-20 w-20 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Tidak Dapat Diedit</h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Akta yang sudah berstatus <span className="font-bold text-emerald-400">FINAL</span> tidak dapat diubah untuk menjaga integritas data hukum.
          </p>
        </div>
        <Button onClick={() => router.back()} className="bg-indigo-600 hover:bg-indigo-500 font-bold px-8 rounded-xl h-11 cursor-pointer text-white border-0 shadow-lg shadow-indigo-600/20">
          Kembali
        </Button>
      </div>
    );
  }

  const SaveButton = ({ className = "" }: { className?: string }) => (
    <Button
      onClick={handleUpdate}
      disabled={isSubmitting || saved}
      className={`rounded-xl font-bold h-10 px-5 cursor-pointer transition-all border-0 ${saved ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
        } ${className}`}
    >
      {saved ? (
        <><CheckCircle2 className="h-4 w-4 mr-1.5" />Tersimpan!</>
      ) : isSubmitting ? (
        <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Menyimpan...</>
      ) : (
        <><Save className="h-4 w-4 mr-1.5" />Simpan Perubahan</>
      )}
    </Button>
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
      {/* Breadcrumb */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors w-fit group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Detail Akta
      </button>

      {/* Dark Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Edit2 className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Edit Akta Notaris</p>
              <h1 className="text-xl font-black text-white leading-tight line-clamp-2">{deed?.title}</h1>
              <p className="text-xs text-white/40 font-bold mt-1">
                {selectedTypeLabel || deed?.type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="rounded-xl font-bold border-white/20 bg-white/10 text-white hover:bg-white/20 h-10 cursor-pointer backdrop-blur-sm"
            >
              Batal
            </Button>
            <SaveButton />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Form (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Section 1 — Pihak Utama */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <span className="text-sm font-black text-slate-700">Pihak Utama / Klien</span>
            </div>
            <div className="p-6">
              {deed?.client ? (
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-black text-indigo-700 text-base uppercase">
                      {deed.client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{deed.client.name}</p>
                      <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">NIK: {deed.client.nik || "—"}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="h-7 rounded-lg bg-white border-indigo-100 text-indigo-600 font-bold uppercase text-[9px]">Terkunci</Badge>
                </div>
              ) : (
                <div className="p-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-xs font-bold text-slate-400">Data klien tidak tersedia</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2 — Metadata */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <span className="text-sm font-black text-slate-700">Metadata Akta</span>
            </div>
            <div className="p-6 space-y-5">
              {/* Judul */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Judul Transaksi / Nama Berkas <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="Contoh: Akta Pendirian PT Mandiri Berjaya"
                  className="rounded-2xl border-slate-200 h-12 font-bold focus-visible:ring-indigo-500/30 focus-visible:border-indigo-300 placeholder:font-normal placeholder:text-slate-300 transition-all shadow-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {/* Jenis Akta */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Jenis Akta Notaris <span className="text-red-400">*</span>
                  </label>
                  <div className="relative min-h-[48px]">
                    <div
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      className={`flex h-12 items-center justify-between border px-4 text-sm cursor-pointer transition-all rounded-xl ${isTypeDropdownOpen
                          ? 'border-indigo-400 ring-2 ring-indigo-100'
                          : 'border-slate-200 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-50'
                        }`}
                    >
                      <span className={selectedType ? "font-bold text-slate-900 text-sm" : "text-slate-400 font-medium text-sm"}>
                        {selectedTypeLabel || "Pilih jenis akta..."}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                    </div>
                    {isTypeDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsTypeDropdownOpen(false)} />
                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                          <div className="p-3 border-b border-slate-50 flex items-center gap-2 px-4 bg-slate-50/60">
                            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <input
                              autoFocus
                              type="text"
                              placeholder="Cari jenis akta..."
                              className="w-full bg-transparent border-none text-sm focus:outline-none placeholder:text-slate-300 font-medium text-slate-700 h-7"
                              value={typeSearch}
                              onChange={(e) => setTypeSearch(e.target.value)}
                            />
                          </div>
                          <div className="max-h-52 overflow-y-auto p-2">
                            {filteredTypes.length === 0 ? (
                              <div className="p-6 text-center text-xs font-bold text-slate-400">Tidak ditemukan</div>
                            ) : filteredTypes.map(type => (
                              <button
                                key={type.value}
                                className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-colors flex items-center justify-between cursor-pointer ${selectedType === type.value ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'
                                  }`}
                                onClick={() => { setSelectedType(type.value); setIsTypeDropdownOpen(false); setTypeSearch(""); }}
                              >
                                <span className="font-bold">{type.label}</span>
                                {selectedType === type.value && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Target Finalisasi */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Batas Waktu (SLA)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      type="date"
                      className="rounded-xl border-slate-200 h-12 pl-10 font-bold focus-visible:ring-indigo-500/30 focus-visible:border-indigo-300 transition-all shadow-none"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Catatan Keamanan</p>
              <p className="text-sm text-amber-700/70 font-medium leading-relaxed">
                Pembaruan metadata ini akan dicatat dalam Log Audit sistem. Pastikan data yang diubah sesuai dengan perubahan draf hukum terbaru.
              </p>
            </div>
          </div>
        </div>

        {/* ── Sidebar (1/3) ── */}
        <div className="space-y-4">
          {/* Progress Checklist */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-2.5 mb-5 relative z-10">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/90">Kesiapan Berkas</span>
            </div>
            <div className="space-y-3 relative z-10">
              {[
                { label: "Klien Dasar", done: !!deed?.clientId },
                { label: "Judul & Jenis Akta", done: !!title && !!selectedType },
                { label: "Pihak Terdaftar", done: (deed?.stakeholders?.length || 0) > 0 },
                { label: "Dokumen Draf", done: !!deed?.versions?.length },
                { label: "Target SLA", done: !!targetDate },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all ${step.done ? 'bg-indigo-500 text-white' : 'border border-white/20 text-white/30'
                    }`}>
                    {step.done ? <Check className="h-3 w-3" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                  </div>
                  <span className={`text-sm font-bold transition-colors ${step.done ? 'text-white' : 'text-white/40'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-white/10 relative z-10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Penting</p>
              <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                Perubahan pada judul atau klasifikasi akta akan memengaruhi filter pencarian dan laporan periodik.
              </p>
            </div>
          </div>

          {/* Info Status */}
          <div className="flex flex-col gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Berkas</p>
            {[
              { label: "Nomor Akta", value: deed?.deedNumber || "Belum Diterbitkan" },
              { label: "Dibuat Pada", value: deed?.createdAt ? new Date(deed.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "—" },
              { label: "Status Terakhir", value: deed?.status || "—" },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Save button in sidebar */}
          <SaveButton className="w-full justify-center h-12 text-sm" />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-5 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-400">
          Akta terakhir diperbarui:{" "}
          <span className="text-slate-600">
            {deed?.updatedAt ? new Date(deed.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "—"}
          </span>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting} className="rounded-xl font-bold border-slate-200 cursor-pointer h-10">
            Batal
          </Button>
          <SaveButton />
        </div>
      </div>
    </div>
  );
}
