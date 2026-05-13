"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Scale, 
  Loader2, 
  CheckCircle2, 
  Users, 
  Search, 
  ChevronDown, 
  X, 
  UserPlus, 
  FileText,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CustomSelect } from "@/components/ui/custom-select";

const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Selesai", value: "SELESAI" },
  { label: "Dibatalkan", value: "DIBATALKAN" },
];

const EMPTY_FORM = {
  pemohon: "",
  perihal: "",
  keterangan: "",
  jumlahHalaman: 1,
  biaya: "",
  status: "PENDING",
  tanggalDaftar: new Date().toISOString().split("T")[0],
  nomorDaftar: "",
};

export default function CreateWaarmerkingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const tenantId = (session?.user as any)?.tenantId;
  const token = (session as any)?.backendToken;

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Client selection states
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
      } catch (err) {
        console.error("Failed to fetch clients", err);
      }
    };
    fetchClients();
  }, [tenantId, token]);

  const filteredClients = clientSearch
    ? clients.filter(c => 
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
        c.nik?.includes(clientSearch)
      )
    : clients.slice(0, 5);

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    setFormData(prev => ({ 
      ...prev, 
      clientId: client.id, 
      pemohon: client.name 
    }));
    setIsClientPickerOpen(false);
    setClientSearch("");
  };

  const handleClearClient = () => {
    setSelectedClient(null);
    setFormData(prev => ({ ...prev, clientId: "" }));
  };

  const set = (key: string, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.pemohon.trim()) e.pemohon = "Nama pemohon wajib diisi";
    if (!formData.perihal.trim()) e.perihal = "Perihal wajib diisi";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setIsSaving(true);
    try {
      const body = {
        ...formData,
        jumlahHalaman: Number(formData.jumlahHalaman),
        biaya: formData.biaya ? Number(formData.biaya) : undefined,
        nomorDaftar: formData.nomorDaftar || undefined,
      };

      const res = await fetch(`/api/waarmerking?tenantId=${tenantId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => router.push("/dashboard/non-akta/waarmerking"), 1800);
      } else {
        setErrors({ global: result.message || "Gagal menyimpan data" });
      }
    } catch (err: any) {
      setErrors({ global: "Terjadi kesalahan koneksi" });
    } finally {
      setIsSaving(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-900">Waarmerking Berhasil Didaftarkan!</h2>
          <p className="text-slate-500 font-medium mt-2">Mengalihkan ke daftar waarmerking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-20">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Waarmerking
        </button>

        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Scale className="h-6 w-6 text-indigo-600" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Registrasi Waarmerking Baru</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Lengkapi data dokumen yang akan didaftarkan.</p>
          </div>
        </div>
      </div>

      {errors.global && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-600">
          {errors.global}
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-visible">
            <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pihak Pemohon</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              {/* Client Picker */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Pilih dari Database Klien (Opsional)</label>
                {selectedClient ? (
                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-black text-indigo-700 text-base uppercase">
                        {selectedClient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{selectedClient.name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">NIK: {selectedClient.nik || "—"}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClearClient}
                      className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={() => setIsClientPickerOpen(!isClientPickerOpen)}
                      className={cn(
                        "flex h-12 items-center justify-between border px-4 text-sm cursor-pointer transition-all rounded-xl",
                        isClientPickerOpen ? "border-indigo-400 ring-2 ring-indigo-100" : "border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      <div className="flex items-center gap-3 text-slate-400">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Cari klien terdaftar...</span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isClientPickerOpen && "rotate-180 text-indigo-500")} />
                    </div>

                    {isClientPickerOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsClientPickerOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                          <div className="p-3 border-b border-slate-50 flex items-center gap-2 px-4 bg-slate-50/60">
                            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <input
                              autoFocus
                              type="text"
                              placeholder="Cari nama atau NIK..."
                              className="w-full bg-transparent border-none text-sm focus:outline-none placeholder:text-slate-300 font-medium text-slate-700 h-8"
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                            />
                          </div>
                          <div className="max-h-52 overflow-y-auto p-2">
                            {filteredClients.length === 0 ? (
                              <div className="p-6 text-center text-xs font-bold text-slate-400">Klien tidak ditemukan</div>
                            ) : (
                              filteredClients.map((c) => (
                                <button
                                  key={c.id}
                                  className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl transition-colors text-left"
                                  onClick={() => handleSelectClient(c)}
                                >
                                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm uppercase">
                                    {c.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                                    <p className="text-[10px] font-mono text-slate-400">NIK: {c.nik}</p>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="h-px bg-slate-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                    Nama Pemohon <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.pemohon}
                    onChange={e => set("pemohon", e.target.value)}
                    placeholder="Nama lengkap pemohon..."
                    className={`rounded-xl border-slate-200 h-11 font-bold ${errors.pemohon ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  />
                  {errors.pemohon && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.pemohon}</p>}
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                    No. Daftar <span className="text-slate-300 normal-case tracking-normal font-medium">(otomatis jika kosong)</span>
                  </label>
                  <Input
                    value={formData.nomorDaftar}
                    onChange={e => set("nomorDaftar", e.target.value)}
                    placeholder="WM-2025-01-001"
                    className="rounded-xl border-slate-200 h-11 font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Detail Waarmerking</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                  Perihal / Jenis Dokumen <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.perihal}
                  onChange={e => set("perihal", e.target.value)}
                  placeholder="Contoh: Surat Perjanjian Jual Beli, Akta Hibah..."
                  className={`rounded-xl border-slate-200 h-11 font-bold ${errors.perihal ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.perihal && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.perihal}</p>}
              </div>

              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Keterangan Tambahan</label>
                <textarea
                  value={formData.keterangan}
                  onChange={e => set("keterangan", e.target.value)}
                  rows={4}
                  placeholder="Catatan atau keterangan lainnya..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Tanggal Daftar</label>
                  <Input
                    type="date"
                    value={formData.tanggalDaftar}
                    onChange={e => set("tanggalDaftar", e.target.value)}
                    className="rounded-xl border-slate-200 h-11"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Jumlah Halaman</label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.jumlahHalaman}
                    onChange={e => set("jumlahHalaman", e.target.value)}
                    className="rounded-xl border-slate-200 h-11 font-bold"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Biaya (Rp)</label>
                  <Input
                    type="number"
                    value={formData.biaya}
                    onChange={e => set("biaya", e.target.value)}
                    placeholder="0"
                    className="rounded-xl border-slate-200 h-11 font-bold"
                  />
                </div>
              </div>

              <CustomSelect
                label="Status"
                options={STATUS_OPTIONS}
                value={formData.status}
                onChange={v => set("status", v)}
                placeholder="Pilih status..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900 text-white p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Info className="h-5 w-5 text-indigo-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white/70">Panduan</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 text-[10px] font-black text-indigo-400 border border-indigo-500/30">1</div>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">Pilih klien jika pemohon sudah terdaftar di database untuk mempermudah pelacakan.</p>
                </div>
                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 text-[10px] font-black text-indigo-400 border border-indigo-500/30">2</div>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">Nomor daftar akan dibuat otomatis berdasarkan format <span className="text-white font-bold">WM-YYYY-MM-000</span> jika dikosongkan.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Penting</p>
                <p className="text-[11px] text-white/40 leading-relaxed italic">Pastikan dokumen fisik sudah diperiksa kelengkapannya sebelum dicatat dalam buku pendaftaran waarmerking.</p>
              </div>
            </div>
          </div>

          <Card className="border-none shadow-sm bg-indigo-50/50 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-indigo-600" />
              </div>
              <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Format Output</p>
            </div>
            <p className="text-xs text-indigo-700/70 leading-relaxed font-medium">
              Data yang Anda masukkan akan tercetak secara otomatis ke dalam Buku Daftar Waarmerking di modul Protokol Digital.
            </p>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 max-w-3xl">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="h-12 px-8 rounded-xl font-bold border-slate-200 text-slate-600"
        >
          Batal
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-12 px-10 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex-1"
        >
          {isSaving ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Menyimpan...</>
          ) : (
            "Daftarkan Waarmerking"
          )}
        </Button>
      </div>
    </div>
  );
}
