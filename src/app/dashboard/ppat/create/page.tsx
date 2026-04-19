"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Search,
  Plus,
  Upload,
  CheckCircle2,
  FileText,
  Trash2,
  X,
  Map,
  ChevronDown,
  Check,
  Users,
  Loader2,
  AlertCircle,
  MapPin,
  Hash,
  Ruler,
  Eye,
  BookOpen,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MapPicker from "@/components/MapPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PPAT_DEED_TYPES = [
  { label: "Akta Jual Beli (AJB)", value: "AJB" },
  { label: "Akta Hibah", value: "HIBAH" },
  { label: "Akta Tukar Menukar", value: "TUKAR_MENUKAR" },
  { label: "Akta Pemasukan Ke Dalam Perusahaan (Inbreng)", value: "INBRENG" },
  { label: "Akta Pembagian Hak Bersama (APHB)", value: "APHB" },
  { label: "Akta Pemberian Hak Tanggungan (APHT)", value: "APHT" },
  { label: "Akta Pemberian Hak Tanggungan Novasi (APHT-Novasi)", value: "APHT_NOVASI" },
  { label: "Surat Kuasa Membebankan Hak Tanggungan (SKMHT)", value: "SKMHT" },
  { label: "Akta Pemberian Hak Guna Bangunan (HGB)", value: "HGB" },
  { label: "Akta Pemberian Hak Guna Usaha (HGU)", value: "HGU" },
  { label: "Akta Pemberian Hak Pakai (HP)", value: "HP" },
];

export default function CreatePpatPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [typeSearch, setTypeSearch] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const [nop, setNop] = useState("");
  const [luasTanah, setLuasTanah] = useState("");
  const [luasBangunan, setLuasBangunan] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client states
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [allClients, setAllClients] = useState<any[]>([]);

  const filteredClients = clientSearch
    ? allClients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.nik?.includes(clientSearch)
      )
    : allClients.slice(0, 6);

  const filteredTypes = PPAT_DEED_TYPES.filter(t =>
    t.label.toLowerCase().includes(typeSearch.toLowerCase())
  );

  const selectedTypeLabel = PPAT_DEED_TYPES.find(t => t.value === selectedType)?.label;
  const isFormComplete = title && selectedType && selectedClient && nop;

  // Fetch clients
  useEffect(() => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) return;
    const fetchAllClients = async () => {
      try {
        const response = await fetch(`/api/clients?tenantId=${tenantId}`, {
          headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
        });
        const result = await response.json();
        if (result.success) setAllClients(result.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchAllClients();
  }, [session]);

  const handleSubmit = async () => {
    if (!title || !selectedType || !selectedClient || !nop) {
      alert("Mohon lengkapi isian wajib: Klien, Metadata, dan Detail Objek (NOP).");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const tenantId = (session?.user as any)?.tenantId || "default-tenant";
      const userId = (session?.user as any)?.id || "default-user-id";
      formData.append("metadata", JSON.stringify({
        title,
        type: selectedType,           // Store actual sub-type: AJB, HIBAH, APHT, etc.
        clientId: selectedClient.id || "temp-client-id",
        createdById: userId,
        targetFinalization: targetDate,
        ppatData: {
          nop,
          jenisAkta: selectedType,    // Fallback copy inside ppatData for compatibility
          luasTanah: luasTanah ? parseFloat(luasTanah) : undefined,
          luasBangunan: luasBangunan ? parseFloat(luasBangunan) : undefined,
          lokasiAlamat: lokasi,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
        }
      }));
      if (uploadedFiles.length > 0) formData.append("draft", uploadedFiles[0]);
      formData.append("stakeholders", JSON.stringify([]));

      const response = await fetch(`/api/deeds?tenantId=${tenantId}`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` },
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        router.push("/dashboard/ppat");
      } else {
        alert("Gagal membuat akta: " + JSON.stringify(result.errors || result.message));
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat menyimpan data akta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    if (address && !lokasi) setLokasi(address);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };
  const deleteFile = (index: number) => setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) setUploadedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const steps = [
    { label: "Klien / Pemohon", done: !!selectedClient },
    { label: "Judul & Jenis Akta", done: !!title && !!selectedType },
    { label: "NOP Objek Pajak", done: !!nop },
    { label: "Lokasi / Alamat", done: !!lokasi },
    { label: "Dokumen Pendukung", done: uploadedFiles.length > 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
      {/* Breadcrumb */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors w-fit group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar PPAT
      </button>

      {/* Dark Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Akta PPAT Baru</p>
              <h1 className="text-xl font-black text-white leading-tight">Buat Akta PPAT</h1>
              <p className="text-xs text-white/40 font-bold mt-1">
                {isFormComplete ? "Formulir siap untuk dikirim" : "Lengkapi semua isian yang diperlukan"}
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
            <Button
              onClick={handleSubmit}
              disabled={!isFormComplete || isSubmitting}
              className={`rounded-xl font-bold h-10 px-5 cursor-pointer transition-all border-0 ${
                isFormComplete
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {isSubmitting
                ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Memproses...</>
                : <><CheckCircle2 className="h-4 w-4 mr-1.5" />Buat Akta PPAT</>
              }
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Form (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Section 1 — Pihak Utama */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-sm font-black text-slate-700">Pihak Utama / Pemohon</span>
                <span className="text-red-400 text-xs font-black">*</span>
              </div>
            </div>
            <div className="p-6 relative">
              {selectedClient ? (
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-black text-emerald-700 text-base uppercase">
                      {selectedClient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{selectedClient.name}</p>
                      <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">NIK: {selectedClient.nik || "—"}</p>
                    </div>
                  </div>
                  <button
                    className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                    onClick={() => setSelectedClient(null)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div
                    onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                    className={`flex h-12 items-center justify-between border px-4 text-sm cursor-pointer transition-all rounded-xl ${
                      isClientDropdownOpen
                        ? 'border-emerald-400 ring-2 ring-emerald-100'
                        : 'border-slate-200 hover:border-emerald-300 hover:ring-2 hover:ring-emerald-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-400 font-medium text-sm">Pilih klien utama...</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isClientDropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                  </div>

                  {isClientDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsClientDropdownOpen(false)} />
                      <div className="absolute top-[calc(100%-24px)] left-6 right-6 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-slate-50 flex items-center gap-2 px-4 bg-slate-50/60">
                          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <input
                            autoFocus
                            type="text"
                            placeholder="Cari nama atau NIK..."
                            className="w-full bg-transparent border-none text-sm focus:outline-none placeholder:text-slate-300 font-medium text-slate-700 h-7"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto p-2">
                          {filteredClients.length === 0 ? (
                            <div className="p-6 text-center text-xs font-bold text-slate-400">Klien tidak ditemukan</div>
                          ) : filteredClients.map(c => (
                            <button
                              key={c.id}
                              className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-colors text-left cursor-pointer"
                              onClick={() => { setSelectedClient(c); setIsClientDropdownOpen(false); setClientSearch(""); }}
                            >
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm uppercase">
                                {c.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                                <p className="text-[10px] font-mono text-slate-400">NIK: {c.nik}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Section 2 — Metadata Akta */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <FileText className="h-3.5 w-3.5 text-emerald-600" />
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
                  placeholder="Contoh: AJB Rumah Bpk Budi No. 10"
                  className="rounded-2xl border-slate-200 h-12 font-bold focus-visible:ring-emerald-500/30 focus-visible:border-emerald-300 placeholder:font-normal placeholder:text-slate-300 transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {/* Jenis Akta */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Jenis Akta PPAT <span className="text-red-400">*</span>
                  </label>
                  <div className="relative min-h-[48px]">
                    <div
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      className={`flex h-12 items-center justify-between border px-4 text-sm cursor-pointer transition-all rounded-xl ${
                        isTypeDropdownOpen
                          ? 'border-emerald-400 ring-2 ring-emerald-100'
                          : 'border-slate-200 hover:border-emerald-300 hover:ring-2 hover:ring-emerald-50'
                      }`}
                    >
                      <span className={selectedType ? "font-bold text-slate-900 text-sm" : "text-slate-400 font-medium text-sm"}>
                        {selectedTypeLabel || "Pilih jenis akta..."}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} />
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
                                className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                                  selectedType === type.value ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-600'
                                }`}
                                onClick={() => { setSelectedType(type.value); setIsTypeDropdownOpen(false); setTypeSearch(""); }}
                              >
                                <span className="font-bold">{type.label}</span>
                                {selectedType === type.value && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Target Selesai */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Selesai</label>
                  <div className="relative">
                    <Input
                      type="date"
                      className="rounded-xl border-slate-200 h-12 font-bold focus-visible:ring-emerald-500/30 focus-visible:border-emerald-300 transition-all"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 — Detail Objek Pajak */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-sm font-black text-slate-700">Detail Objek Pajak</span>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* NOP */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                    <Hash className="h-3 w-3" /> NOP (Nomor Objek Pajak) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="32.73.xxx.xxx.xxx-xxxx.x"
                    className="rounded-xl border-slate-200 h-12 font-mono text-sm focus-visible:ring-emerald-500/30 focus-visible:border-emerald-300 transition-all"
                    value={nop}
                    onChange={(e) => setNop(e.target.value)}
                  />
                </div>

                {/* Luas */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                    <Ruler className="h-3 w-3" /> Luas (Tanah &amp; Bangunan)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Input
                        placeholder="0"
                        type="number"
                        className="rounded-xl border-slate-200 h-12 pr-10 font-bold focus-visible:ring-emerald-500/30 focus-visible:border-emerald-300 transition-all"
                        value={luasTanah}
                        onChange={(e) => setLuasTanah(e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase pointer-events-none">m² T</span>
                    </div>
                    <div className="relative">
                      <Input
                        placeholder="0"
                        type="number"
                        className="rounded-xl border-slate-200 h-12 pr-10 font-bold focus-visible:ring-emerald-500/30 focus-visible:border-emerald-300 transition-all"
                        value={luasBangunan}
                        onChange={(e) => setLuasBangunan(e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase pointer-events-none">m² B</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lokasi */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> Lokasi Objek / Alamat Lahan
                  </label>
                  <button
                    onClick={() => setIsMapModalOpen(true)}
                    className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest cursor-pointer"
                  >
                    <Map className="h-3 w-3" /> Pilih di Google Maps
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <textarea
                    placeholder="Masukkan alamat lengkap objek tanah..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all font-medium placeholder:text-slate-300 resize-none"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                  />
                </div>
              </div>

              {/* Koordinat */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitude</span>
                  <Input
                    placeholder="-6.123456"
                    readOnly
                    className="rounded-xl border-slate-100 h-10 font-mono text-xs bg-slate-50 text-slate-500 cursor-default"
                    value={latitude}
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Longitude</span>
                  <Input
                    placeholder="106.123456"
                    readOnly
                    className="rounded-xl border-slate-100 h-10 font-mono text-xs bg-slate-50 text-slate-500 cursor-default"
                    value={longitude}
                  />
                </div>
              </div>

              {latitude && longitude && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Map className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-700">Koordinat Terpilih</p>
                      <p className="text-[10px] font-mono text-emerald-600">{latitude}, {longitude}</p>
                    </div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                  >
                    Lihat Maps ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Section 4 — Dokumen Pendukung */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-colors ${uploadedFiles.length > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  <Upload className={`h-3.5 w-3.5 transition-colors ${uploadedFiles.length > 0 ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <span className="text-sm font-black text-slate-700">Dokumen Pendukung</span>
                <span className="text-xs font-bold text-slate-400">(Opsional)</span>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-emerald-700 uppercase tracking-widest border border-slate-200 hover:border-emerald-200 rounded-xl px-3 py-1.5 transition-all cursor-pointer"
              >
                <BookOpen className="h-3 w-3" /> Gunakan Template
              </button>
            </div>

            <div className="p-6 space-y-4">
              {uploadedFiles.length === 0 && (
                <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Info className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-700">Sifatnya Opsional</p>
                    <p className="text-xs font-medium text-amber-700/70 leading-relaxed mt-0.5">
                      Dokumen dapat diunggah kapan saja melalui Document Center setelah akta dibuat.
                    </p>
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div
                className={`flex flex-col items-center justify-center text-center border-2 border-dashed rounded-2xl py-10 px-6 transition-all cursor-pointer relative overflow-hidden ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-50/40 scale-[1.01]'
                    : 'border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10'
                }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${uploadedFiles.length > 0 ? 'bg-emerald-100' : 'bg-slate-50'}`}>
                  {uploadedFiles.length > 0
                    ? <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                    : <Upload className="h-7 w-7 text-slate-300" />
                  }
                </div>
                <p className="font-bold text-slate-700 text-sm">
                  {uploadedFiles.length > 0 ? "Tambah dokumen lainnya" : "Unggah dokumen pendukung"}
                </p>
                <p className="text-xs font-medium text-slate-400 mt-1">Drag & Drop atau klik untuk memilih berkas</p>
              </div>

              {/* File list */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors shadow-sm">
                          {file.type.includes('image') ? <Eye className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-700 truncate max-w-[220px]">{file.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); deleteFile(index); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Peringatan Keamanan</p>
              <p className="text-sm text-amber-700/70 font-medium leading-relaxed">
                Akta yang dibuat akan tercatat dalam sistem dan Log Audit kantor. Pastikan data NOP dan luas tanah sesuai dengan Sertipikat dan PBB resmi.
              </p>
            </div>
          </div>
        </div>

        {/* ── Sidebar (1/3) ── */}
        <div className="space-y-4">
          {/* Progress Checklist */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 shadow-xl">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/90">Progress Pengisian</span>
            </div>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    step.done ? 'bg-emerald-500 text-white' : 'border border-white/20 text-white/30'
                  }`}>
                    {step.done ? <Check className="h-3 w-3" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                  </div>
                  <span className={`text-sm font-bold transition-colors ${step.done ? 'text-white' : 'text-white/40'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-5 pt-5 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Kelengkapan</p>
                <p className="text-[10px] font-black text-emerald-400">{steps.filter(s => s.done).length}/{steps.length}</p>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(steps.filter(s => s.done).length / steps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Penting</p>
              <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                Data objek pajak harus valid sesuai Sertipikat dan PBB untuk keperluan pelaporan BPN.
              </p>
            </div>
          </div>

          {/* BPN Info */}
          <div className="flex items-start gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Map className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm leading-tight">Terhubung ke BPN</p>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                Sistem otomatis menyusun draf laporan bulanan untuk dikirim ke Kantor Pertanahan.
              </p>
            </div>
          </div>

          {/* Submit button in sidebar */}
          <Button
            onClick={handleSubmit}
            disabled={!isFormComplete || isSubmitting}
            className={`w-full h-12 rounded-xl font-bold cursor-pointer transition-all border-0 ${
              isFormComplete
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting
              ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Memproses...</>
              : <><CheckCircle2 className="h-4 w-4 mr-1.5" />Buat Akta PPAT</>
            }
          </Button>
        </div>
      </div>

      {/* Map Modal */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="max-w-[60vw] w-[60vw] h-[80vh] flex flex-col p-0 overflow-hidden border-none rounded-3xl gap-0">
          <DialogHeader className="p-6 bg-slate-900 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-black tracking-tight">Pilih Lokasi Objek Tanah</DialogTitle>
                <DialogDescription className="text-white/50 font-medium text-sm mt-0.5">
                  Klik pada peta atau geser marker untuk menentukan koordinat.
                </DialogDescription>
              </div>
              {latitude && longitude && (
                <div className="flex items-center bg-white/10 rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-3 py-2 text-[10px] font-mono font-bold text-emerald-400">Lat: {latitude}</div>
                  <div className="px-3 py-2 text-[10px] font-mono font-bold text-emerald-400 border-l border-white/10">Lng: {longitude}</div>
                </div>
              )}
            </div>
          </DialogHeader>
          <div className="flex-1 relative bg-slate-100 min-h-0">
            <MapPicker
              onLocationSelect={handleLocationSelect}
              initialLat={latitude ? parseFloat(latitude) : undefined}
              initialLng={longitude ? parseFloat(longitude) : undefined}
            />
            <div className="absolute bottom-6 right-6 z-10">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8 shadow-2xl rounded-xl h-11 cursor-pointer text-white border-0"
                onClick={() => setIsMapModalOpen(false)}
              >
                Konfirmasi Lokasi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selector Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight text-white">Template Akta PPAT</DialogTitle>
              <DialogDescription className="text-white/50 font-medium mt-1">
                Pilih kerangka akta yang sesuai untuk mempercepat proses draf.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 1, name: "Akta Jual Beli (AJB)", desc: "Standar terbaru BPN 2024" },
                { id: 2, name: "Akta Hibah", desc: "Format peralihan hak keluarga" },
                { id: 3, name: "APHT (Peringkat I)", desc: "Jaminan hak tanggungan bank" },
                { id: 4, name: "Akta Tukar Menukar", desc: "Barter aset antar pihak" },
                { id: 5, name: "APHB (Pembagian Hak)", desc: "Pemisahan hak bersama" },
                { id: 6, name: "Pemberian HGB", desc: "Peralihan hak atas tanah negara" },
              ].map((template) => (
                <button
                  key={template.id}
                  className="flex items-center justify-between text-left p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => {
                    setIsTemplateModalOpen(false);
                    const dummyFile = new File(
                      ["dummy content"],
                      `Template_${template.name.replace(/\s+/g, '_')}.docx`,
                      { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
                    );
                    setUploadedFiles(prev => [...prev, dummyFile]);
                  }}
                >
                  <div>
                    <span className="text-sm font-black text-slate-800 group-hover:text-emerald-700 block">{template.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600/70 mt-0.5 block">{template.desc}</span>
                  </div>
                  <Plus className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
          <div className="p-5 border-t border-slate-100 bg-white flex justify-end">
            <Button variant="ghost" className="font-bold text-slate-400 cursor-pointer" onClick={() => setIsTemplateModalOpen(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
