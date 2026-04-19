"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Edit2,
  Upload,
  Search,
  Check,
  ChevronDown,
  UserPlus,
  Loader2,
  FileText,
  Users,
  Download,
  Plus,
  Pencil,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Hash,
  Calendar,
  ChevronRight,
  User,
  X,
  History,
  Clock,
  FolderOpen,
  Map,
  MapPin,
  ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function DeedDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [deed, setDeed] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"info" | "pihak" | "dokumen" | "audit">("info");
  const [uploadingStakeholderId, setUploadingStakeholderId] = useState<string | null>(null);

  // New Stakeholder states
  const [isAddingParty, setIsAddingParty] = useState(false);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyRole, setNewPartyRole] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSavingParty, setIsSavingParty] = useState(false);

  const handleStakeholderUpload = async (stakeholderId: string, type: 'stakeholder_ktp' | 'stakeholder_npwp', file: File) => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId || !id) return;

    try {
      setUploadingStakeholderId(stakeholderId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('stakeholderId', stakeholderId);

      const response = await fetch(`/api/deeds/${id}/documents?tenantId=${tenantId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(session as any)?.backendToken}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        await fetchDeed();
      } else {
        alert("Gagal mengunggah dokumen: " + result.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mengunggah dokumen");
    } finally {
      setUploadingStakeholderId(null);
    }
  };

  const handleAddStakeholder = async () => {
    if (!newPartyName || !newPartyRole) {
      alert("Nama dan Peran wajib diisi");
      return;
    }

    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId || !id) return;

    setIsSavingParty(true);
    try {
      const response = await fetch(`/api/deeds/${id}/stakeholders?tenantId=${tenantId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.backendToken}`,
        },
        body: JSON.stringify({
          name: newPartyName,
          role: newPartyRole,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setNewPartyName("");
        setNewPartyRole("");
        setIsAddingParty(false);
        await fetchDeed();
      } else {
        alert("Gagal menambahkan pihak: " + result.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSavingParty(false);
    }
  };

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
    AJB: "Akta Jual Beli (AJB)",
    TUKAR_MENUKAR: "Akta Tukar Menukar",
    INBRENG: "Akta Pemasukan (Inbreng)",
    APHB: "Akta Pembagian Hak Bersama",
    APHT: "Akta Pemberian Hak Tanggungan",
    APHT_NOVASI: "Akta Pemberian Hak Tanggungan Novasi",
    HGB: "Akta Hak Guna Bangunan",
    HGU: "Akta Hak Guna Usaha",
    HP: "Akta Hak Pakai",
    PPAT: "Akta PPAT",
    LAINNYA: "Lainnya"
  };

  const statusConfig: Record<string, { label: string; colors: string; dot: string }> = {
    FINAL: { label: "Selesai / Final", colors: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    PENDING_CLIENT: { label: "Proses Klien", colors: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500 animate-pulse" },
    DRAFT: { label: "Draft", colors: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  };

  const fetchDeed = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId || !id) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/deeds/${id}?tenantId=${tenantId}`, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success) setDeed(result.data);
      else setError(result.message || "Gagal memuat detail akta");
    } catch (err) {
      setError("Kesalahan koneksi ke server");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId || !id) return;
    try {
      const res = await fetch(`/api/audit?tenantId=${tenantId}&resourceId=${id}&limit=50`, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await res.json();
      if (result.success) setAuditLogs(result.data);
    } catch (err) {
      console.error('Audit fetch error:', err);
    }
  };

  const handlePreview = async (gsPath: string | null) => {
    if (!gsPath) return;
    try {
      setIsPreviewing(true);
      const response = await fetch(`/api/deeds/files/preview?gsPath=${encodeURIComponent(gsPath)}`, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success && result.data.url) window.open(result.data.url, '_blank');
      else alert("Gagal membuka dokumen: " + (result.message || "Unknown error"));
    } catch (err) {
      alert("Terjadi kesalahan saat menyiapkan dokumen");
    } finally {
      setIsPreviewing(false);
    }
  };

  useEffect(() => { fetchDeed(); fetchAuditLogs(); }, [id, session]);
  useEffect(() => { if (deed?.status) fetchAuditLogs(); }, [deed?.status]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-indigo-50 border-2 border-indigo-100" />
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 absolute top-5 left-5" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-black text-slate-700 text-sm">Menyiapkan Berkas Akta...</p>
          <p className="text-xs text-slate-400 font-medium animate-pulse">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (error || !deed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="h-20 w-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-400 border border-red-100">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">{error || "Data Tidak Ditemukan"}</h2>
          <p className="text-slate-500 max-w-sm text-sm">Data akta tidak ditemukan atau Anda tidak memiliki akses.</p>
        </div>
        <Button variant="outline" className="rounded-xl font-bold h-11 px-8 cursor-pointer" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
      </div>
    );
  }

  const sConfig = statusConfig[deed.status] || statusConfig.DRAFT;

  const tabs = [
    { id: "info", label: "Ringkasan", icon: FileText },
    { id: "pihak", label: "Pihak Terkait", icon: Users },
    { id: "dokumen", label: "Arsip Dokumen", icon: Download },
    { id: "audit", label: "Riwayat Aktivitas", icon: History },
  ];

  const ACTION_LABELS: Record<string, { label: string; icon: any }> = {
    CREATE_DEED: { label: 'Draft Akta Dibuat', icon: Plus },
    UPDATE_DEED: { label: 'Metadata Diperbarui', icon: Pencil },
    UPLOAD_DEED_DRAFT: { label: 'Revisi Draf Diunggah', icon: History },
    UPLOAD_DEED_SCAN: { label: 'Scan Final Disimpan', icon: CheckCircle2 },
    UPLOAD_DEED_ATTACHMENT: { label: 'Lampiran Ditambahkan', icon: Plus },
    FINALIZE_DEED: { label: 'Akta Difinalisasi', icon: ShieldCheck },
  };

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors w-fit group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Akta
      </button>

      {/* Hero Header — Dark with Indigo accent */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwaC02di02aDZ2NnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-60" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex items-start gap-5 flex-1 min-w-0">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <FileText className="h-7 w-7 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  {DEED_TYPE_LABELS[deed.type] || deed.type}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${sConfig.colors}`}>
                  <span className={`h-1.5 w-1.5 rounded-full inline-block ${sConfig.dot}`} />
                  {sConfig.label}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight mb-1">
                {deed.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-white/50">
                <span className="flex items-center gap-1.5">
                  <Hash className="h-3 w-3" />{deed.deedNumber || "No. Belum Diterbitkan"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {new Date(deed.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={`/dashboard/deeds/${id}/edit`}>
              <Button variant="outline" className="rounded-xl font-bold border-white/20 bg-white/10 text-white hover:bg-white/20 h-10 cursor-pointer backdrop-blur-sm">
                <Pencil className="h-4 w-4 mr-1.5" /> Edit Metadata
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
          {[
            { label: "Klien Utama", value: deed.client?.name || "—", sublabel: deed.client?.nik || "" },
            { label: "Penanggung Jawab", value: deed.createdBy?.name || "Sistem", sublabel: "Notaris" },
            { label: "Target Finalisasi", value: deed.targetFinalization ? new Date(deed.targetFinalization).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "—", sublabel: "" },
            { label: "Pihak Terlibat", value: `${(deed.stakeholders?.length || 0) + (deed.client ? 1 : 0)} Orang`, sublabel: "Terdaftar" },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
              <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.15em] mb-1">{s.label}</p>
              <p className="text-sm font-black text-white leading-tight truncate">{s.value}</p>
              {s.sublabel && <p className="text-[9px] font-bold text-white/30 mt-0.5 truncate">{s.sublabel}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Integritas Data */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 space-y-4 shadow-xl shadow-slate-900/20">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/90">Integritas Data</span>
            </div>
            <p className="text-[11px] text-white/50 font-medium leading-relaxed">
              Seluruh perubahan dicatat permanen dalam sistem Audit Log untuk keamanan hukum.
            </p>
            <Link
              href={`/dashboard/audit?deedId=${deed.id}`}
              className={cn(
                buttonVariants({ variant: "link" }),
                "p-0 h-auto text-indigo-400 text-xs font-bold flex justify-start items-center gap-1 hover:text-indigo-300"
              )}
            >
              Lihat Audit Trail <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Info Card */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-400 to-violet-500" />
            <CardContent className="p-5 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Info Akta</p>
              {[
                { label: "Nomor Akta", value: deed.deedNumber || "Belum Diterbitkan" },
                { label: "Jenis", value: DEED_TYPE_LABELS[deed.type] || deed.type },
                { label: "Dibuat oleh", value: deed.createdBy?.name || "Sistem" },
                { label: "Dibuat pada", value: new Date(deed.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { label: "Terakhir diperbarui", value: new Date(deed.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) },
              ].map(item => (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  <span className="text-xs font-bold text-slate-700 break-words">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* PPAT data teaser if present */}
          {deed.ppatData && (
            <Card className="border-2 border-emerald-100 shadow-sm overflow-hidden bg-emerald-50/20">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-emerald-600" />
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Objek PPAT</p>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NOP</p>
                    <p className="text-xs font-mono font-bold text-slate-700">{deed.ppatData.nop || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alamat</p>
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed">{deed.ppatData.lokasiAlamat || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tab Nav */}
            <div className="flex items-center border-b border-slate-100 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${activeTab === tab.id
                    ? "text-indigo-700 bg-indigo-50/60"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400"}`} />
                  {tab.label}
                  {tab.id === "audit" && auditLogs.length > 0 && (
                    <span className="ml-1 text-[10px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">{auditLogs.length}</span>
                  )}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Ringkasan */}
              {activeTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Metadata Akta</h4>
                    {[
                      { label: "Klien Utama", value: deed.client?.name || "—", icon: User },
                      { label: "Jenis Akta", value: DEED_TYPE_LABELS[deed.type] || deed.type, icon: FileText },
                      { label: "Status", value: sConfig.label, icon: CheckCircle2 },
                    ].map(item => (
                      <div key={item.label} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          <item.icon className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                          <p className="text-sm font-bold text-slate-800 mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl p-5 border border-indigo-100/60 space-y-4">
                    <h4 className="text-[10px] font-black text-indigo-600/70 uppercase tracking-[0.2em]">Timeline Proses</h4>
                    <div className="space-y-4">
                      {[
                        { label: "Draft Dibuat", date: new Date(deed.createdAt).toLocaleDateString('id-ID'), done: true },
                        { label: "Review Klien", date: deed.status !== 'DRAFT' ? "Selesai" : "Menunggu...", done: deed.status !== 'DRAFT' },
                        { label: "Finalisasi & Penandatanganan", date: deed.status === 'FINAL' ? "Selesai" : "Dalam Proses...", done: deed.status === 'FINAL', active: deed.status === 'PENDING_CLIENT' },
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ring-4 ${step.done ? 'bg-indigo-500 ring-indigo-100' :
                            step.active ? 'bg-amber-500 ring-amber-100 animate-pulse' :
                              'bg-slate-300 ring-slate-100'
                            }`} />
                          <div>
                            <p className={`text-sm font-bold ${step.done ? 'text-slate-800' : step.active ? 'text-amber-700' : 'text-slate-400'}`}>
                              {step.label}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {deed.targetFinalization && (
                      <div className="pt-3 border-t border-indigo-100/60">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Finalisasi</p>
                        <p className="text-sm font-black text-indigo-700 mt-0.5">
                          {new Date(deed.targetFinalization).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pihak Terkait */}
              {activeTab === "pihak" && (
                <div className="space-y-4">
                  {/* Header & Add Button */}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Daftar Pihak Terlibat</h4>
                    {!isAddingParty && (
                      <Button
                        onClick={() => setIsAddingParty(true)}
                        className="h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-3 cursor-pointer shadow-md shadow-indigo-600/10"
                      >
                        <UserPlus className="h-3 w-3 mr-1.5" /> Tambah Pihak
                      </Button>
                    )}
                  </div>

                  {/* Add Party Form */}
                  {isAddingParty && (
                    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                            <Plus className="h-4 w-4 text-indigo-400" />
                          </div>
                          <p className="text-xs font-black text-white uppercase tracking-widest">Tambah Pihak Baru</p>
                        </div>
                        <button onClick={() => setIsAddingParty(false)} className="text-slate-500 hover:text-white transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                          <Input
                            value={newPartyName}
                            onChange={(e) => setNewPartyName(e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="bg-slate-800 border-slate-700 text-white text-xs font-bold rounded-xl h-10 placeholder:text-slate-600 focus:ring-indigo-500/20"
                          />
                        </div>
                        <div className="space-y-1.5 relative">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Peran / Jabatan</label>
                          <div
                            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                            className="flex h-10 items-center justify-between border border-slate-700 bg-slate-800 px-4 text-xs font-bold text-white cursor-pointer rounded-xl hover:border-indigo-500/50 transition-colors"
                          >
                            <span className={newPartyRole ? "text-white" : "text-slate-600"}>
                              {newPartyRole || "Pilih peran..."}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                          </div>

                          {isRoleDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)} />
                              <div className="absolute top-full left-0 w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                                <div className="max-h-40 overflow-y-auto p-1.5 space-y-0.5">
                                  {GET_ROLES_FOR_TYPE(deed.type).map((role) => (
                                    <button
                                      key={role}
                                      className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors flex items-center justify-between group"
                                      onClick={() => {
                                        setNewPartyRole(role);
                                        setIsRoleDropdownOpen(false);
                                      }}
                                    >
                                      {role}
                                      {newPartyRole === role && <Check className="h-3 w-3 text-indigo-400" />}
                                    </button>
                                  ))}
                                  <div className="p-1 border-t border-slate-800 mt-1">
                                    <Input
                                      placeholder="Ketik peran kustom..."
                                      className="h-8 text-[10px] bg-transparent border-none focus:ring-0 text-white font-bold"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          setNewPartyRole(e.currentTarget.value);
                                          setIsRoleDropdownOpen(false);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex justify-end">
                        <Button
                          onClick={handleAddStakeholder}
                          disabled={isSavingParty || !newPartyName || !newPartyRole}
                          className="w-full md:w-auto rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 h-10 px-8 text-white border-0 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                        >
                          {isSavingParty ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Pihak"}
                        </Button>
                      </div>
                    </div>
                  )}
                  {/* Klien Utama */}
                  {deed.client && (
                    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/30">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-black text-indigo-700 text-lg uppercase">
                          {deed.client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{deed.client.name}</p>
                          <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Klien Utama</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NIK</p>
                        <p className="text-xs font-mono font-bold text-slate-600">{deed.client.nik || "—"}</p>
                      </div>
                    </div>
                  )}

                  {/* Stakeholders */}
                  {deed.stakeholders?.length > 0 ? deed.stakeholders.map((party: any) => (
                    <div key={party.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 text-lg uppercase">
                          {party.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{party.name}</p>
                          <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">{party.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative group">
                          {party.ktpPath ? (
                            <button
                              onClick={() => handlePreview(party.ktpPath)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              <ShieldCheck className="h-3 w-3" /> KTP
                              <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                            </button>
                          ) : (
                            <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer">
                              <input
                                type="file"
                                className="sr-only"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => e.target.files?.[0] && handleStakeholderUpload(party.id, 'stakeholder_ktp', e.target.files[0])}
                                disabled={uploadingStakeholderId === party.id}
                              />
                              {uploadingStakeholderId === party.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />} Upload KTP
                            </label>
                          )}
                        </div>

                        <div className="relative group">
                          {party.npwpPath ? (
                            <button
                              onClick={() => handlePreview(party.npwpPath)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-colors cursor-pointer"
                            >
                              <FileText className="h-3 w-3" /> NPWP
                              <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                            </button>
                          ) : (
                            <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer">
                              <input
                                type="file"
                                className="sr-only"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => e.target.files?.[0] && handleStakeholderUpload(party.id, 'stakeholder_npwp', e.target.files[0])}
                                disabled={uploadingStakeholderId === party.id}
                              />
                              {uploadingStakeholderId === party.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />} Upload NPWP
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : !deed.client && (
                    <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                      <Users className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Belum ada pihak terdaftar</p>
                    </div>
                  )}
                </div>
              )}

              {/* Arsip Dokumen */}
              {activeTab === "dokumen" && (
                <div className="space-y-6">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-white border border-indigo-100 shadow-sm flex items-center justify-center">
                        <FolderOpen className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">Manajemen Berkas Akta</h4>
                        <p className="text-xs font-bold text-slate-500 mt-0.5">Unggah, revisi, dan kelola semua dokumen pendukung</p>
                      </div>
                    </div>
                    <Link href={`/dashboard/deeds/${id}/documents`}>
                      <Button className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 h-11 px-6 shadow-md shadow-indigo-600/20 text-white border-0 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                        <FolderOpen className="h-4 w-4 mr-2" /> Kelola Dokumen
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Riwayat Draf */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Riwayat Draf Akta</h4>
                        <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                          {deed.versions?.length || 0} file
                        </span>
                      </div>
                      <div className="space-y-2">
                        {deed.versions?.map((ver: any) => (
                          <div key={ver.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                                <FileText className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">Versi {ver.versionNumber}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                  {new Date(ver.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <button
                              className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-pointer"
                              onClick={() => handlePreview(ver.gcsPath)}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        {!deed.versions?.length && (
                          <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                            <FileText className="h-7 w-7 text-slate-200 mx-auto mb-2" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Belum ada draf</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Akta Final */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-indigo-600/60 uppercase tracking-[0.2em]">Berkas Akta Final</h4>
                        {deed.scanPath && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Tersedia
                          </span>
                        )}
                      </div>
                      {deed.scanPath ? (
                        <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50/40 p-8 text-center space-y-5">
                          <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 mx-auto shadow-sm border border-indigo-100">
                            <ShieldCheck className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900">Salinan Akta Resmi</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">
                              {new Date(deed.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <Button
                            className="w-full rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 h-11 cursor-pointer shadow-lg shadow-indigo-500/20 gap-2 text-white border-0"
                            onClick={() => handlePreview(deed.scanPath)}
                            disabled={isPreviewing}
                          >
                            <Download className="h-4 w-4" />
                            {isPreviewing ? "Menyiapkan..." : "Unduh / Lihat Salinan"}
                          </Button>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Format PDF • High Resolution</p>
                        </div>
                      ) : (
                        <div className="rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/30 p-10 text-center space-y-3">
                          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-200 mx-auto border border-slate-100">
                            <Clock className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menunggu Finalisasi</p>
                            <p className="text-[11px] font-bold text-slate-500 max-w-[200px] leading-relaxed mx-auto">
                              Salinan tersedia setelah akta dinyatakan FINAL.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Riwayat Aktivitas (Audit Log) */}
              {activeTab === "audit" && (
                <div className="space-y-4">
                  {auditLogs.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                      <History className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Belum ada aktivitas tercatat</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {auditLogs.map((log, idx) => {
                        const cfg = ACTION_LABELS[log.action] || { label: log.action, icon: History };
                        const Icon = cfg.icon;
                        const isLast = idx === auditLogs.length - 1;
                        return (
                          <div key={log.id} className="flex gap-4 relative">
                            {!isLast && <div className="absolute left-4 top-9 bottom-0 w-px bg-slate-100" />}
                            <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 z-10 bg-indigo-50 border border-indigo-100 text-indigo-500">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="pb-4 min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-800 leading-tight">{cfg.label}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                                {log.user?.name || 'Sistem'} · {new Date(log.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {log.notes && <p className="text-xs text-slate-500 mt-1 italic">{log.notes}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const GET_ROLES_FOR_TYPE = (type: string): string[] => {
  switch (type) {
    case 'PENDIRIAN_PT':
    case 'PENDIRIAN_CV':
    case 'AD_PERUBAHAN':
      return ['Direktur Utama', 'Direktur', 'Komisaris Utama', 'Komisaris', 'Pemegang Saham'];
    case 'PENDIRIAN_YAYASAN':
      return ['Pembina', 'Pengurus', 'Pengawas'];
    case 'JUAL_BELI':
    case 'AJB':
    case 'PPJB':
      return ['Penjual', 'Pembeli', 'Penerima Kuasa'];
    case 'SEWA_MENYUWA':
      return ['Penyewa', 'Pemilik'];
    case 'KREDIT':
    case 'APHT':
      return ['Debitur', 'Kreditur', 'Penjamin'];
    default:
      return ['Pihak I', 'Pihak II', 'Saksi', 'Penerima Kuasa'];
  }
};
