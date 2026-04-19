"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Map,
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
  MapPin,
  Hash,
  Ruler,
  Users,
  X,
  FileText
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

export default function EditPpatPage() {
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
  const [nop, setNop] = useState("");
  const [luasTanah, setLuasTanah] = useState("");
  const [luasBangunan, setLuasBangunan] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Client
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  // Dropdown states
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [typeSearch, setTypeSearch] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

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
          // Find the real PPAT sub-type: check both d.type and d.ppatData.jenisAkta
          // Handles JUAL_BELI <-> AJB and other potential mismatches
          let ppatSubType = PPAT_DEED_TYPES.find(t => t.value === d.type)?.value
            || PPAT_DEED_TYPES.find(t => t.value === d.ppatData?.jenisAkta)?.value
            || "";
          
          // Legacy/Database mismatch fallback
          if (!ppatSubType) {
            if (d.type === "AJB" || d.ppatData?.jenisAkta === "AJB") ppatSubType = "JUAL_BELI";
            else if (d.type === "JUAL_BELI" || d.ppatData?.jenisAkta === "JUAL_BELI") ppatSubType = "JUAL_BELI";
            // Add other fallbacks if needed
          }

          setSelectedType(ppatSubType);
          if (d.targetFinalization) setTargetDate(new Date(d.targetFinalization).toISOString().split('T')[0]);
          if (d.client) setSelectedClient(d.client);
          if (d.ppatData) {
            setNop(d.ppatData.nop || "");
            setLuasTanah(d.ppatData.luasTanah?.toString() || "");
            setLuasBangunan(d.ppatData.luasBangunan?.toString() || "");
            setLokasi(d.ppatData.lokasiAlamat || "");
            setLatitude(d.ppatData.latitude?.toString() || "");
            setLongitude(d.ppatData.longitude?.toString() || "");
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (session) fetchDeed();
  }, [id, session]);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      const tenantId = (session?.user as any)?.tenantId;
      if (!tenantId) return;
      try {
        const res = await fetch(`/api/clients?tenantId=${tenantId}`, {
          headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
        });
        const result = await res.json();
        if (result.success) setAllClients(result.data);
      } catch (err) {
        console.error("Clients fetch error:", err);
      }
    };
    if (session) fetchClients();
  }, [session]);

  const filteredClients = clientSearch
    ? allClients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.nik?.includes(clientSearch))
    : allClients.slice(0, 6);

  const filteredTypes = PPAT_DEED_TYPES.filter(t => t.label.toLowerCase().includes(typeSearch.toLowerCase()));
  const selectedTypeLabel = PPAT_DEED_TYPES.find(t => t.value === selectedType)?.label;

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
          type: selectedType,         // Store the actual PPAT sub-type (AJB, HIBAH, etc.)
          clientId: selectedClient?.id,
          targetFinalization: targetDate || null,
          ppatData: {
            nop,
            jenisAkta: selectedType,  // also persist sub-type inside ppatData as fallback
            luasTanah: luasTanah ? parseFloat(luasTanah) : undefined,
            luasBangunan: luasBangunan ? parseFloat(luasBangunan) : undefined,
            lokasiAlamat: lokasi,
            latitude: latitude ? parseFloat(latitude) : undefined,
            longitude: longitude ? parseFloat(longitude) : undefined,
          }
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSaved(true);
        setTimeout(() => router.push(`/dashboard/ppat/${id}`), 800);
      } else {
        alert("Gagal memperbarui akta: " + result.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat memperbarui akta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    if (address && !lokasi) setLokasi(address);
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-emerald-50 border-2 border-emerald-100" />
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500 absolute top-5 left-5" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-black text-slate-700 text-sm">Memuat data akta PPAT...</p>
          <p className="text-xs text-slate-400 animate-pulse">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // ── Final locked ──
  if (deed?.status === 'FINAL') {
    return (
      <div className="max-w-xl mx-auto mt-20 flex flex-col items-center gap-6 text-center">
        <div className="h-20 w-20 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-400">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Tidak Dapat Diedit</h2>
          <p className="text-slate-500 text-sm max-w-sm">
            Akta yang sudah berstatus <span className="font-bold text-emerald-600">FINAL</span> tidak dapat diubah untuk menjaga integritas data hukum.
          </p>
        </div>
        <Button onClick={() => router.back()} className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8 rounded-xl h-11 cursor-pointer text-white border-0">
          Kembali
        </Button>
      </div>
    );
  }

  const SaveButton = ({ className = "" }: { className?: string }) => (
    <Button
      onClick={handleUpdate}
      disabled={isSubmitting || saved}
      className={`rounded-xl font-bold h-10 px-5 cursor-pointer transition-all border-0 ${
        saved ? 'bg-emerald-500 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
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
        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors w-fit group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Detail PPAT
      </button>

      {/* Dark Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Edit2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Edit Akta PPAT</p>
              <h1 className="text-xl font-black text-white leading-tight line-clamp-2">{deed?.title}</h1>
              <p className="text-xs text-white/40 font-bold mt-1">
                {selectedTypeLabel || PPAT_DEED_TYPES.find(t => t.value === deed?.type)?.label || deed?.type}
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
              <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-sm font-black text-slate-700">Pihak Utama / Pemohon</span>
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
                      <div className="absolute top-full left-6 right-6 mt-1 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
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

          {/* Section 2 — Metadata */}
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
                  {/* Wrapper with explicit min-h so the dropdown doesn't push siblings */}
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

                {/* Target Finalisasi */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Finalisasi</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      type="date"
                      className="rounded-xl border-slate-200 h-12 pl-10 font-bold focus-visible:ring-emerald-500/30 focus-visible:border-emerald-300 transition-all"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3 — Objek Pajak */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-sm font-black text-slate-700">Detail Objek Pajak</span>
            </div>
            <div className="p-6 space-y-5">

              {/* NOP + Luas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* NOP */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                    <Hash className="h-3 w-3" /> NOP (Nomor Objek Pajak)
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

              {/* Lokasi / Alamat */}
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

              {/* Map preview if coordinates available */}
              {latitude && longitude && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Map className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-700">Koordinat Tersimpan</p>
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

          {/* Security Notice */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Peringatan Keamanan</p>
              <p className="text-sm text-amber-700/70 font-medium leading-relaxed">
                Pembaruan ini akan dicatat dalam Log Audit kantor. Pastikan data NOP dan luas tanah sesuai dengan Sertipikat dan PBB resmi.
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
              <span className="text-xs font-black uppercase tracking-widest text-white/90">Kelengkapan Data</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Klien / Pemohon", done: !!selectedClient },
                { label: "Judul & Jenis Akta", done: !!title && !!selectedType },
                { label: "NOP Objek Pajak", done: !!nop },
                { label: "Lokasi / Alamat", done: !!lokasi },
                { label: "Koordinat GPS", done: !!latitude && !!longitude },
              ].map((step, i) => (
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

            <div className="mt-5 pt-5 border-t border-white/10">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Penting</p>
              <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                Data objek pajak harus valid sesuai Sertipikat dan PBB untuk keperluan pelaporan BPN.
              </p>
            </div>
          </div>

          {/* Info sinyal akta */}
          <div className="flex flex-col gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Info Akta</p>
            {[
              { label: "Nomor Akta", value: deed?.deedNumber || "Belum Diterbitkan" },
              { label: "Dibuat", value: deed?.createdAt ? new Date(deed.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "—" },
              { label: "Status", value: deed?.status || "—" },
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
                <div className="flex items-center gap-0 bg-white/10 rounded-xl border border-white/10 overflow-hidden">
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
    </div>
  );
}
