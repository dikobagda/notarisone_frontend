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
  ChevronDown,
  Check,
  Users,
  Loader2,
  BookOpen,
  Info,
  ShieldCheck,
  Eye,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  { label: "Lainnya", value: "LAINNYA" },
];

const GET_ROLES_FOR_TYPE = (typeValue: string) => {
  if (typeValue === "PENDIRIAN_PT") return ["Direktur Utama", "Direktur", "Komisaris Utama", "Komisaris", "Pemegang Saham"];
  if (typeValue === "PENDIRIAN_CV") return ["Sekutu Aktif (Direktur)", "Sekutu Pasif (Komanditer)"];
  if (["JUAL_BELI", "PPJB"].includes(typeValue)) return ["Penjual", "Pembeli", "Saksi"];
  if (typeValue === "KREDIT") return ["Debitur", "Bank/Kreditur", "Penjamin", "Saksi"];
  return ["Pihak I", "Pihak II", "Pihak III", "Saksi"];
};

export default function CreateDeedPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ktpInputRef = useRef<HTMLInputElement>(null);
  const npwpInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [typeSearch, setTypeSearch] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Client states
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [allClients, setAllClients] = useState<any[]>([]);

  // Parties/Stakeholders
  const [parties, setParties] = useState<any[]>([]);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyRole, setNewPartyRole] = useState("");
  const [newPartyKtp, setNewPartyKtp] = useState<File | null>(null);
  const [newPartyNpwp, setNewPartyNpwp] = useState<File | null>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const filteredClients = clientSearch
    ? allClients.filter(
        (c) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.nik?.includes(clientSearch)
      )
    : allClients.slice(0, 6);

  const filteredTypes = NOTARY_DEED_TYPES.filter((t) =>
    t.label.toLowerCase().includes(typeSearch.toLowerCase())
  );

  const selectedTypeLabel = NOTARY_DEED_TYPES.find((t) => t.value === selectedType)?.label;
  const isFormComplete = !!(title && selectedType && selectedClient);
  const suggestedRoles = selectedType ? GET_ROLES_FOR_TYPE(selectedType) : ["Pihak I", "Pihak II", "Saksi"];

  // Fetch clients
  useEffect(() => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) return;
    const fetchAllClients = async () => {
      try {
        const response = await fetch(`/api/clients?tenantId=${tenantId}`, {
          headers: { Authorization: `Bearer ${(session as any)?.backendToken}` },
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
    if (!title || !selectedType || !selectedClient) {
      alert("Mohon lengkapi isian wajib: Klien, Judul, dan Jenis Akta.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const tenantId = (session?.user as any)?.tenantId || "default-tenant";
      const userId = (session?.user as any)?.id || "default-user-id";
      formData.append(
        "metadata",
        JSON.stringify({
          title,
          type: selectedType,
          clientId: selectedClient.id,
          createdById: userId,
          targetFinalization: targetDate || null,
        })
      );
      if (uploadedFiles.length > 0) formData.append("draft", uploadedFiles[0]);
      formData.append(
        "stakeholders",
        JSON.stringify(
          parties.map((p) => ({ name: p.name, role: p.role, clientId: p.clientId }))
        )
      );
      parties.forEach((p, idx) => {
        if (p.ktp) formData.append(`ktp_${idx}`, p.ktp);
        if (p.npwp) formData.append(`npwp_${idx}`, p.npwp);
      });

      const response = await fetch(`/api/deeds?tenantId=${tenantId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${(session as any)?.backendToken}` },
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        router.push("/dashboard/deeds");
      } else {
        alert("Gagal membuat akta: " + JSON.stringify(result.errors || result.message));
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Terjadi kesalahan sistem saat menyimpan akta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addParty = () => {
    if (!newPartyName.trim()) return;
    setParties((prev) => [
      ...prev,
      { 
        id: Date.now(), 
        name: newPartyName.trim(), 
        role: newPartyRole || "Pihak I", 
        ktp: newPartyKtp, 
        npwp: newPartyNpwp, 
        clientId: null 
      },
    ]);
    setNewPartyName("");
    setNewPartyRole("");
    setNewPartyKtp(null);
    setNewPartyNpwp(null);
  };

  const removeParty = (id: number) => setParties((prev) => prev.filter((p) => p.id !== id));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };
  const deleteFile = (index: number) => setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) setUploadedFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const steps = [
    { label: "Klien / Principal", done: !!selectedClient },
    { label: "Judul & Jenis Akta", done: !!title && !!selectedType },
    { label: "Pihak Terkait", done: parties.length > 0 },
    { label: "Draf / Lampiran", done: uploadedFiles.length > 0 },
    { label: "Target Penyelesaian", done: !!targetDate },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
      {/* Breadcrumb */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors w-fit group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Akta
      </button>

      {/* Dark Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Akta Notaris Baru</p>
              <h1 className="text-xl font-black text-white leading-tight">Buat Akta Notaris</h1>
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
                  ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Memproses...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4 mr-1.5" />Buat Akta Notaris</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Form (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Section 1 — Pihak Utama / Klien */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <span className="text-sm font-black text-slate-700">Pihak Utama / Principal</span>
                <span className="text-red-400 text-xs font-black">*</span>
              </div>
            </div>
            <div className="p-6 relative">
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
                        ? "border-indigo-400 ring-2 ring-indigo-100"
                        : "border-slate-200 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-400 font-medium text-sm">Pilih klien utama...</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isClientDropdownOpen ? "rotate-180 text-indigo-500" : ""}`} />
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
                          ) : (
                            filteredClients.map((c) => (
                              <button
                                key={c.id}
                                className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl transition-colors text-left cursor-pointer"
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
                            ))
                          )}
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
              <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <span className="text-sm font-black text-slate-700">Metadata Akta</span>
            </div>
            <div className="p-6 space-y-5">
              {/* Judul */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Judul Akta / Nama Berkas <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="Contoh: Pendirian PT Maju Bersama"
                  className="rounded-2xl border-slate-200 h-12 font-bold focus-visible:ring-indigo-500/30 focus-visible:border-indigo-300 placeholder:font-normal placeholder:text-slate-300 transition-all"
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
                      className={`flex h-12 items-center justify-between border px-4 text-sm cursor-pointer transition-all rounded-xl ${
                        isTypeDropdownOpen
                          ? "border-indigo-400 ring-2 ring-indigo-100"
                          : "border-slate-200 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-50"
                      }`}
                    >
                      <span className={selectedType ? "font-bold text-slate-900 text-sm" : "text-slate-400 font-medium text-sm"}>
                        {selectedTypeLabel || "Pilih jenis akta..."}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isTypeDropdownOpen ? "rotate-180 text-indigo-500" : ""}`} />
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
                            ) : (
                              filteredTypes.map((type) => (
                                <button
                                  key={type.value}
                                  className={`w-full text-left px-4 py-2 text-xs rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                                    selectedType === type.value
                                      ? "bg-indigo-50 text-indigo-700"
                                      : "hover:bg-slate-50 text-slate-600"
                                  }`}
                                  onClick={() => { 
                                    if (selectedType !== type.value) {
                                      setSelectedType(type.value); 
                                      setParties([]); 
                                      setNewPartyRole("");
                                    }
                                    setIsTypeDropdownOpen(false); 
                                    setTypeSearch(""); 
                                  }}
                                >
                                  <span className="font-bold">{type.label}</span>
                                  {selectedType === type.value && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Target Selesai */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Selesai</label>
                  <Input
                    type="date"
                    className="rounded-xl border-slate-200 h-12 font-bold focus-visible:ring-indigo-500/30 focus-visible:border-indigo-300 transition-all"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 — Pihak Terkait (Stakeholders) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <UserPlus className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <span className="text-sm font-black text-slate-700">Pihak Terkait</span>
              <span className="text-xs font-bold text-slate-400">(Opsional)</span>
            </div>
            <div className="p-6 space-y-4">
              {parties.length === 0 && (
                <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <Info className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-indigo-700">Pihak Terkait Opsional</p>
                    <p className="text-xs font-medium text-indigo-700/70 leading-relaxed mt-0.5">
                      Tambahkan para pihak dalam akta ini (Direktur, Penjual, Pembeli, Saksi, dll.)
                    </p>
                  </div>
                </div>
              )}

              {/* Daftar pihak */}
              {parties.length > 0 && (
                <div className="space-y-2">
                  {parties.map((party) => (
                    <div key={party.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-600 text-sm uppercase shadow-sm">
                          {party.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-700">{party.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{party.role}</p>
                            {party.ktp && (
                              <span className="flex items-center gap-1 text-[8px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 uppercase">
                                <ShieldCheck className="h-2 w-2" /> KTP Siap
                              </span>
                            )}
                            {party.npwp && (
                              <span className="flex items-center gap-1 text-[8px] font-black bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded border border-sky-100 uppercase">
                                <FileText className="h-2 w-2" /> NPWP Siap
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                        onClick={() => removeParty(party.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Form tambah pihak */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_150px_auto_auto] gap-3 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Pihak</label>
                  <Input
                    placeholder="Contoh: Budi Santoso"
                    className="rounded-xl border-slate-200 h-10 text-sm font-medium focus-visible:ring-indigo-500/30 focus-visible:border-indigo-300"
                    value={newPartyName}
                    onChange={(e) => setNewPartyName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addParty(); }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Peran</label>
                  <div className="relative min-h-[40px]">
                    <div
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                      className={`flex h-10 items-center justify-between border px-3 text-xs cursor-pointer transition-all rounded-xl ${
                        isRoleDropdownOpen
                          ? "border-indigo-400 ring-2 ring-indigo-100"
                          : "border-slate-200 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-50"
                      }`}
                    >
                      <span className={newPartyRole ? "font-bold text-slate-900" : "text-slate-400 font-medium"}>
                        {newPartyRole || "Pilih peran..."}
                      </span>
                      <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isRoleDropdownOpen ? "rotate-180 text-indigo-500" : ""}`} />
                    </div>
                    {isRoleDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)} />
                        <div className="absolute bottom-full left-0 w-full mb-1 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                          <div className="p-1.5">
                            {suggestedRoles.map((r) => (
                              <button
                                key={r}
                                className={`w-full text-left px-4 py-2 text-xs rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                                  newPartyRole === r
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "hover:bg-slate-50 text-slate-600"
                                }`}
                                onClick={() => { setNewPartyRole(r); setIsRoleDropdownOpen(false); }}
                              >
                                <span className="font-bold">{r}</span>
                                {newPartyRole === r && <Check className="h-3 w-3 text-indigo-600 shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-0.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">KTP</label>
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={ktpInputRef} 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setNewPartyKtp(e.target.files?.[0] || null)}
                    />
                    <button
                      onClick={() => ktpInputRef.current?.click()}
                      className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        newPartyKtp ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">NPWP</label>
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={npwpInputRef} 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setNewPartyNpwp(e.target.files?.[0] || null)}
                    />
                    <button
                      onClick={() => npwpInputRef.current?.click()}
                      className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        newPartyNpwp ? "bg-sky-50 border-sky-200 text-sky-600" : "bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-transparent ml-1 select-none">_</label>
                  <button
                    onClick={addParty}
                    disabled={!newPartyName.trim()}
                    className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-300 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed text-sm shrink-0 whitespace-nowrap shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 — Draf & Lampiran */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-colors ${uploadedFiles.length > 0 ? "bg-indigo-50 border-indigo-100" : "bg-slate-50 border-slate-100"}`}>
                  <Upload className={`h-3.5 w-3.5 transition-colors ${uploadedFiles.length > 0 ? "text-indigo-600" : "text-slate-400"}`} />
                </div>
                <span className="text-sm font-black text-slate-700">Draf & Lampiran</span>
                <span className="text-xs font-bold text-slate-400">(Opsional)</span>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-indigo-700 uppercase tracking-widest border border-slate-200 hover:border-indigo-200 rounded-xl px-3 py-1.5 transition-all cursor-pointer"
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
                      Draf dapat diunggah kapan saja melalui Document Center setelah akta dibuat.
                    </p>
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div
                className={`flex flex-col items-center justify-center text-center border-2 border-dashed rounded-2xl py-10 px-6 transition-all cursor-pointer relative overflow-hidden ${
                  isDragging
                    ? "border-indigo-400 bg-indigo-50/40 scale-[1.01]"
                    : "border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10"
                }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${uploadedFiles.length > 0 ? "bg-indigo-100" : "bg-slate-50"}`}>
                  {uploadedFiles.length > 0 ? (
                    <CheckCircle2 className="h-7 w-7 text-indigo-600" />
                  ) : (
                    <Upload className="h-7 w-7 text-slate-300" />
                  )}
                </div>
                <p className="font-bold text-slate-700 text-sm">
                  {uploadedFiles.length > 0 ? "Tambah dokumen lainnya" : "Unggah draf atau lampiran"}
                </p>
                <p className="text-xs font-medium text-slate-400 mt-1">Drag & Drop atau klik untuk memilih berkas</p>
              </div>

              {/* File list */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                          {file.type.includes("image") ? <Eye className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
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
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Peringatan Keamanan</p>
              <p className="text-sm text-amber-700/70 font-medium leading-relaxed">
                Akta yang dibuat akan tercatat dalam sistem dan Log Audit kantor. Pastikan semua data pihak terkait sesuai dengan dokumen identitas resmi yang telah diverifikasi.
              </p>
            </div>
          </div>
        </div>

        {/* ── Sidebar (1/3) ── */}
        <div className="space-y-4">
          {/* Progress Checklist */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 shadow-xl">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/90">Progress Pengisian</span>
            </div>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    step.done ? "bg-indigo-500 text-white" : "border border-white/20 text-white/30"
                  }`}>
                    {step.done ? <Check className="h-3 w-3" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                  </div>
                  <span className={`text-sm font-bold transition-colors ${step.done ? "text-white" : "text-white/40"}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-5 pt-5 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Kelengkapan</p>
                <p className="text-[10px] font-black text-indigo-400">{steps.filter((s) => s.done).length}/{steps.length}</p>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${(steps.filter((s) => s.done).length / steps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Penting</p>
              <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                Minimal Klien, Judul, dan Jenis Akta harus terisi sebelum akta dapat disimpan ke sistem.
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="flex items-start gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm leading-tight">Modul Notaris</p>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                Sistem otomatis menyusun register akta dan daftar bulanan untuk kebutuhan laporan Notaris.
              </p>
            </div>
          </div>

          {/* Submit button in sidebar */}
          <Button
            onClick={handleSubmit}
            disabled={!isFormComplete || isSubmitting}
            className={`w-full h-12 rounded-xl font-bold cursor-pointer transition-all border-0 ${
              isFormComplete
                ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Memproses...</>
            ) : (
              <><CheckCircle2 className="h-4 w-4 mr-1.5" />Buat Akta Notaris</>
            )}
          </Button>
        </div>
      </div>

      {/* Template Selector Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight text-white">Template Akta Notaris</DialogTitle>
              <DialogDescription className="text-white/50 font-medium mt-1">
                Pilih kerangka akta yang sesuai untuk mempercepat proses draf.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 1, name: "Pendirian PT", desc: "Akta standar pendirian Perseroan Terbatas" },
                { id: 2, name: "PPJB / Jual Beli Saham", desc: "Format perjanjian pengikatan jual beli" },
                { id: 3, name: "Berita Acara RUPS", desc: "Notulen rapat umum pemegang saham" },
                { id: 4, name: "Perjanjian Kerjasama", desc: "MOU / Joint Venture antar pihak" },
                { id: 5, name: "Akta Hibah", desc: "Peralihan aset antar keluarga atau lembaga" },
                { id: 6, name: "Perjanjian Kredit", desc: "Format perjanjian pinjam meminjam resmi" },
              ].map((template) => (
                <button
                  key={template.id}
                  className="flex items-center justify-between text-left p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => {
                    setIsTemplateModalOpen(false);
                    const dummyFile = new File(
                      ["dummy content"],
                      `Template_${template.name.replace(/\s+/g, "_")}.docx`,
                      { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
                    );
                    setUploadedFiles((prev) => [...prev, dummyFile]);
                  }}
                >
                  <div>
                    <span className="text-sm font-black text-slate-800 group-hover:text-indigo-700 block">{template.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600/70 mt-0.5 block">{template.desc}</span>
                  </div>
                  <Plus className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
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
