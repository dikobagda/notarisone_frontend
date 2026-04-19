"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Map,
  FileText,
  Users,
  Calendar,
  MapPin,
  Ruler,
  ShieldCheck,
  Download,
  Clock,
  ExternalLink,
  ChevronRight,
  Edit2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LandPlot,
  Building2,
  Hash,
  User,
  Phone,
  Fingerprint,
  Upload,
  StampIcon,
  X,
  FolderOpen,
  Pencil,
  History,
  Plus
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MapView from "@/components/MapView";

export default function PpatDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"info" | "objek" | "dokumen" | "audit">("info");

  const [deed, setDeed] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchDeed = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId || !params.id) return;

    try {
      setIsLoading(true);
      const url = `/api/deeds/${params.id}?tenantId=${tenantId}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setDeed(result.data);
      } else {
        setError(result.message || "Gagal memuat detail akta");
      }
    } catch (err) {
      setError("Kesalahan koneksi ke server");
    } finally {
      setIsLoading(false);
    }
  };

  const [uploadingStakeholderId, setUploadingStakeholderId] = useState<string | null>(null);

  const handleStakeholderUpload = async (stakeholderId: string, type: 'stakeholder_ktp' | 'stakeholder_npwp', file: File) => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId || !params.id) return;

    try {
      setUploadingStakeholderId(stakeholderId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('stakeholderId', stakeholderId);

      const response = await fetch(`/api/deeds/${params.id}/documents?tenantId=${tenantId}`, {
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

  const fetchAuditLogs = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId || !params.id) return;
    try {
      const res = await fetch(`/api/audit?tenantId=${tenantId}&resourceId=${params.id}&limit=50`, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await res.json();
      if (result.success) setAuditLogs(result.data);
    } catch (err) {
      console.error('Audit fetch error:', err);
    }
  };

  useEffect(() => { 
    fetchDeed(); 
    fetchAuditLogs(); 
  }, [params.id, session]);

  useEffect(() => { 
    if (deed?.status) fetchAuditLogs(); 
  }, [deed?.status]);

  const DEED_TYPE_LABELS: Record<string, string> = {
    AJB: "Akta Jual Beli",
    HIBAH: "Akta Hibah",
    TUKAR_MENUKAR: "Akta Tukar Menukar",
    INBRENG: "Akta Pemasukan (Inbreng)",
    APHB: "Akta Pembagian Hak Bersama",
    APHT: "Akta Pemberian Hak Tanggungan",
    APHT_NOVASI: "Akta Pemberian Hak Tanggungan Novasi",
    SKMHT: "SKMHT",
    HGB: "Akta Hak Guna Bangunan",
    HGU: "Akta Hak Guna Usaha",
    HP: "Akta Hak Pakai",
    PPAT: "Akta PPAT",
  };

  const statusConfig: Record<string, { label: string; colors: string; dot: string }> = {
    FINAL: { label: "Selesai / Final", colors: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    PENDING_CLIENT: { label: "Proses Klien", colors: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500 animate-pulse" },
    DRAFT: { label: "Draft", colors: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  };

  const sConfig = statusConfig[deed?.status] || statusConfig.DRAFT;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-emerald-50 border-2 border-emerald-100" />
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500 absolute top-5 left-5" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-black text-slate-700 text-sm">Menyiapkan Detail Akta PPAT...</p>
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
          <p className="text-slate-500 max-w-sm text-sm">Data akta PPAT tidak ditemukan atau Anda tidak memiliki akses.</p>
        </div>
        <Button variant="outline" className="rounded-xl font-bold h-11 px-8 cursor-pointer" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: "info", label: "Ringkasan", icon: FileText },
    { id: "objek", label: "Objek Pajak", icon: Map },
    { id: "dokumen", label: "Dokumen Pendukung", icon: Download },
    { id: "audit", label: "Riwayat Aktivitas", icon: History },
  ];

  const ACTION_LABELS: Record<string, { label: string; icon: any }> = {
    CREATE_DEED:            { label: 'Draft Akta Dibuat',       icon: Plus },
    UPDATE_DEED:            { label: 'Metadata Diperbarui',     icon: Pencil },
    UPLOAD_DEED_DRAFT:      { label: 'Revisi Draf Diunggah',    icon: History },
    UPLOAD_DEED_SCAN:       { label: 'Scan Final Disimpan',     icon: CheckCircle2 },
    UPLOAD_DEED_ATTACHMENT: { label: 'Lampiran Ditambahkan',    icon: Plus },
    FINALIZE_DEED:          { label: 'Akta Difinalisasi',       icon: ShieldCheck },
  };

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors w-fit group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar PPAT
      </button>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwaC02di02aDZ2NnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-60" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex items-start gap-5 flex-1 min-w-0">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <Map className="h-7 w-7 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
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
                  <Hash className="h-3 w-3" /> {deed.deedNumber || "No. —"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {new Date(deed.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={`/dashboard/ppat/${deed.id}/edit`}>
              <Button variant="outline" className="rounded-xl font-bold border-white/20 bg-white/10 text-white hover:bg-white/20 h-10 cursor-pointer backdrop-blur-sm">
                <Pencil className="h-4 w-4 mr-1.5" /> Edit Metadata
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
          {[
            { label: "Pemohon", value: deed.client?.name || "—", sublabel: deed.client?.nik || "" },
            { label: "NOP Objek", value: deed.ppatData?.nop || "Belum Diisi", sublabel: "Nomor Objek Pajak" },
            { label: "Luas Tanah", value: `${deed.ppatData?.luasTanah || 0} m²`, sublabel: "Tanah" },
            { label: "Luas Bangunan", value: `${deed.ppatData?.luasBangunan || 0} m²`, sublabel: "Bangunan" },
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
          {/* Integritas Data Card */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 space-y-4 shadow-xl shadow-slate-900/20">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
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
                "p-0 h-auto text-emerald-400 text-xs font-bold flex justify-start items-center gap-1 hover:text-emerald-300"
              )}
            >
              Lihat Audit Trail <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Minuta Info */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />
            <CardContent className="p-5 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Info Akta</p>
              {[
                { label: "Nomor Akta", value: deed.deedNumber || "—" },
                { label: "Jenis", value: DEED_TYPE_LABELS[deed.type] || deed.type },
                { label: "Dibuat oleh", value: deed.createdBy?.name || "—" },
                { label: "Dibuat pada", value: new Date(deed.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) },
              ].map(item => (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  <span className="text-xs font-bold text-slate-700 break-words">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tab Nav */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center border-b border-slate-100 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "text-emerald-700 bg-emerald-50/60"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-emerald-600" : "text-slate-400"}`} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Ringkasan Tab */}
              {activeTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Metadata Akta</h4>
                    {[
                      { label: "Pemohon Utama", value: deed.client?.name || "—", icon: User },
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
                  
                  <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl p-5 border border-emerald-100/60 space-y-4">
                    <h4 className="text-[10px] font-black text-emerald-600/70 uppercase tracking-[0.2em]">Timeline Proses</h4>
                    <div className="space-y-4">
                      {[
                        { label: "Draft Dibuat", date: new Date(deed.createdAt).toLocaleDateString('id-ID'), done: true },
                        { label: "Penandatanganan", date: deed.status !== 'DRAFT' ? "Selesai" : "Menunggu...", done: deed.status !== 'DRAFT' },
                        { label: "Registrasi BPN", date: deed.status === 'FINAL' ? "Selesai" : "Dalam Proses...", done: deed.status === 'FINAL', active: deed.status === 'PENDING_CLIENT' },
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ring-4 ${
                            step.done ? 'bg-emerald-500 ring-emerald-100' :
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
                  </div>
                </div>
              )}

              {/* Objek Pajak Tab */}
              {activeTab === "objek" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {/* Alamat */}
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat Objek</h4>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed">
                          {deed.ppatData?.lokasiAlamat || "—"}
                        </p>
                      </div>
                    </div>

                    {/* NOP */}
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <Hash className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NOP (Nomor Objek Pajak)</h4>
                        <p className="text-sm font-mono font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 inline-block w-full">
                          {deed.ppatData?.nop || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Luas */}
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <Ruler className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Luas Tanah & Bangunan</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                            <LandPlot className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                            <p className="text-lg font-black text-slate-900">{deed.ppatData?.luasTanah || 0}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">m² Tanah</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                            <Building2 className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                            <p className="text-lg font-black text-slate-900">{deed.ppatData?.luasBangunan || 0}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">m² Bangunan</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lokasi di Peta</h4>
                    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm h-64 relative">
                      {deed.ppatData?.latitude && deed.ppatData?.longitude ? (
                        <>
                          <MapView lat={parseFloat(deed.ppatData.latitude)} lng={parseFloat(deed.ppatData.longitude)} />
                          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none z-10">
                            <div className="bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 max-w-[60%]">
                              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Koordinat</p>
                              <p className="text-[10px] font-mono text-white">{deed.ppatData.latitude}, {deed.ppatData.longitude}</p>
                            </div>
                            <a
                              href={`https://maps.google.com/?q=${deed.ppatData.latitude},${deed.ppatData.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pointer-events-auto h-8 px-3 rounded-xl bg-white/90 border border-white/30 text-[10px] font-black text-slate-700 flex items-center gap-1.5 shadow-lg hover:bg-white transition-colors"
                            >
                              Buka Maps <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-2">
                          <Map className="h-8 w-8 text-slate-200" />
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Peta tidak tersedia</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}



              {/* Dokumen Pendukung Tab */}
              {activeTab === "dokumen" && (
                <div className="space-y-6">
                  {/* Document Center Shortcut */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-white border border-emerald-100 shadow-sm flex items-center justify-center">
                        <FolderOpen className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">Manajemen Berkas Pendukung</h4>
                        <p className="text-xs font-bold text-slate-500 mt-0.5">Unggah dan kelola semua dokumen persyaratan PPAT</p>
                      </div>
                    </div>
                    <Link href={`/dashboard/ppat/${deed.id}/documents`}>
                      <Button className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 h-11 px-6 shadow-md shadow-emerald-600/20 text-white border-0 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
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
                      {deed.versions?.map((doc: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                              <FileText className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">Versi {doc.versionNumber}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">
                                {new Date(doc.createdAt).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                          <button
                            className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all cursor-pointer"
                            onClick={() => window.open(`/api/deeds/files/preview?gsPath=${encodeURIComponent(doc.gcsPath)}`, '_blank')}
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
                      <h4 className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Berkas Akta Final</h4>
                      {deed.scanPath && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Tersedia
                        </span>
                      )}
                    </div>
                    {deed.scanPath ? (
                      <div className="rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-8 text-center space-y-5">
                        <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center text-emerald-600 mx-auto shadow-sm border border-emerald-100">
                          <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900">Salinan Akta Resmi</h3>
                          <p className="text-xs font-bold text-slate-500 mt-1">
                            {new Date(deed.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <Button
                          className="w-full rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 h-11 cursor-pointer shadow-lg shadow-emerald-500/20 gap-2 text-white border-0"
                          onClick={() => window.open(`/api/deeds/files/preview?gsPath=${encodeURIComponent(deed.scanPath)}`, '_blank')}
                        >
                          <Download className="h-4 w-4" /> Unduh / Lihat Salinan
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
                          <p className="text-[11px] font-bold text-slate-500 max-w-[240px] leading-relaxed mx-auto text-slate-600">
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
                            <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 z-10 bg-emerald-50 border border-emerald-100 text-emerald-500">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="pb-4 min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-800 leading-tight">{cfg.label}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                                {log.user?.name || 'Sistem'} · {new Date(log.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
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
