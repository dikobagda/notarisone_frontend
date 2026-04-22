'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { getApiUrl } from "@/lib/api";
import Link from "next/link";
import { 
  ArrowLeft, 
  FolderOpen,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileBadge2,
  Paperclip,
  History,
  Plus,
  ExternalLink,
  ShieldCheck,
  Search,
  ChevronRight,
  FileUp,
  Image as ImageIcon,
  File,
  PenTool,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DocumentCenterPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [deed, setDeed] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleStatusLoading, setIsGoogleStatusLoading] = useState(false);
  
  const [isUploadingDraft, setIsUploadingDraft] = useState(false);
  const [isUploadingScan, setIsUploadingScan] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  
  // Finalization states
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  const [suggestedNumber, setSuggestedNumber] = useState("");
  const [manualNumber, setManualNumber] = useState("");
  const [pendingScanFile, setPendingScanFile] = useState<File | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Google Docs states
  const [isOpeningGDocs, setIsOpeningGDocs] = useState(false);
  const [isSyncingGDocs, setIsSyncingGDocs] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean | null>(null);

  const fetchGoogleStatus = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) return;
    try {
      setIsGoogleStatusLoading(true);
      const url = getApiUrl("/api/google/status");
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await res.json();
      if (result.success) {
        setIsGoogleConnected(result.data.isConnected);
      }
    } catch (err) {
      console.error("Fetch Google status error:", err);
    }
  };

  const fetchDeed = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId || !id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/deeds/${id}?tenantId=${tenantId}`, {
        headers: {
          'Authorization': `Bearer ${(session as any)?.backendToken}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setDeed(result.data);
      }
    } catch (error) {
      console.error("Error fetching deed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextNumber = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) return;

    try {
      const response = await fetch(`/api/deeds/next-number?tenantId=${tenantId}`, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setSuggestedNumber(result.data.suggestedNumber);
        setManualNumber(result.data.suggestedNumber);
      }
    } catch (error) {
      console.error("Error fetching next number:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDeed();
      fetchGoogleStatus();
    }
  }, [id, session]);

  const handleLinkGoogle = () => {
    document.cookie = `notarisone-link-userid=${(session?.user as any)?.id}; path=/; max-age=600`;
    signIn('google', { callbackUrl: window.location.href });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'draft' | 'scan' | 'attachment') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const tenantId = (session?.user as any)?.tenantId;
    
    // If scanning, show finalization dialog
    if (type === 'scan' && deed.status !== 'FINAL') {
      setPendingScanFile(file);
      await fetchNextNumber();
      setIsFinalizeDialogOpen(true);
      return;
    }

    if (type === 'draft') setIsUploadingDraft(true);
    if (type === 'scan') setIsUploadingScan(true);
    if (type === 'attachment') setIsUploadingAttachment(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

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
    } catch (error) {
      console.error("Upload error:", error);
      alert("Terjadi kesalahan sistem saat mengunggah dokumen.");
    } finally {
      if (type === 'draft') setIsUploadingDraft(false);
      if (type === 'scan') setIsUploadingScan(false);
      if (type === 'attachment') setIsUploadingAttachment(false);
    }
  };

  const handleConfirmFinalize = async () => {
    if (!pendingScanFile || !manualNumber) return;
    
    const tenantId = (session?.user as any)?.tenantId;
    setIsFinalizing(true);
    setIsUploadingScan(true);

    try {
      const formData = new FormData();
      formData.append('type', 'scan');
      formData.append('deedNumber', manualNumber);
      formData.append('file', pendingScanFile);

      const response = await fetch(`/api/deeds/${id}/documents?tenantId=${tenantId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(session as any)?.backendToken}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        setIsFinalizeDialogOpen(false);
        setPendingScanFile(null);
        await fetchDeed();
      } else {
        alert("Gagal melakukan finalisasi: " + result.message);
      }
    } catch (error) {
      console.error("Finalize error:", error);
      alert("Terjadi kesalahan sistem saat finalisasi akta.");
    } finally {
      setIsFinalizing(false);
      setIsUploadingScan(false);
    }
  };

  const handlePreview = async (type: string, pathUrl: string) => {
    try {
      const tenantId = (session?.user as any)?.tenantId;
      const res = await fetch(`/api/deeds/files/preview?gsPath=${encodeURIComponent(pathUrl)}&tenantId=${tenantId}`, {
         headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
         window.open(data.data.url, '_blank');
      } else {
         alert('Gagal membuka dokumen');
      }
    } catch (error) {
      alert('Gagal membuka pratinjau dokumen');
    }
  };

  const handleOpenGDocs = async (versionId: string) => {
    // Buka jendela baru SEGERA setelah klik agar tidak diblokir popup blocker
    const newWindow = window.open('about:blank', '_blank');
    if (!newWindow) {
      alert('Browser Anda memblokir popup. Harap izinkan popup untuk situs ini.');
      return;
    }

    // Tampilkan pesan loading di tab baru tersebut
    newWindow.document.write('<div style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;color:#4f46e5;"><h2>Membuka Google Docs...</h2><p>Memproses dokumen Anda dengan aman.</p></div>');
    
    setIsOpeningGDocs(true);
    try {
      const response = await fetch(`/api/gdocs/${id}/documents/${versionId}/open`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success && result.data?.url) {
        newWindow.location.href = result.data.url;
        await fetchDeed();
      } else {
        newWindow.close();
        alert(result.message || 'Gagal membuka di Google Docs');
      }
    } catch (error) {
      newWindow.close();
      alert('Terjadi kesalahan sistem saat menghubungi server.');
    } finally {
      setIsOpeningGDocs(false);
    }
  };

  const handleSyncGDocs = async (versionId: string) => {
    setIsSyncingGDocs(true);
    try {
      const response = await fetch(`/api/gdocs/${id}/documents/${versionId}/sync`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success) {
        await fetchDeed();
      } else {
        alert(result.message || 'Gagal menarik perubahan.');
      }
    } catch (error) {
      alert('Terjadi kesalahan sistem saat menyinkronkan dokumen.');
    } finally {
      setIsSyncingGDocs(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return <FileText className="h-5 w-5 text-rose-500" />;
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) return <FileText className="h-5 w-5 text-blue-600" />;
    return <File className="h-5 w-5 text-slate-500" />;
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Draf",
    IN_PROGRESS: "Diproses",
    REVIEW: "Peninjauan",
    FINAL: "Final",
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-indigo-50 border-2 border-indigo-100" />
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 absolute top-5 left-5" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-extrabold text-slate-700 text-sm">Menyiapkan Ruang Dokumen...</p>
          <p className="text-xs text-slate-400 animate-pulse font-medium">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (!deed) {
    return (
      <div className="max-w-xl mx-auto mt-20 flex flex-col items-center gap-6 text-center text-white relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-12 border border-slate-800">
        <div className="h-16 w-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-extrabold">Data Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400 font-medium">Akta yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Button onClick={() => router.back()} className="rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100">Kembali</Button>
      </div>
    );
  }

  const latestDraft = deed.versions && deed.versions.length > 0 ? deed.versions[0] : null;
  const isDocx = latestDraft?.gcsPath?.toLowerCase().endsWith('.docx');

  let attachments: any[] = [];
  try {
    attachments = typeof deed.attachments === 'string' ? JSON.parse(deed.attachments) : (deed.attachments || []);
  } catch (e) {
    attachments = [];
  }

  const totalFiles = (deed.versions?.length || 0) + (deed.scanPath ? 1 : 0) + (attachments?.length || 0);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-20">
      {/* Breadcrumb style back link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors w-fit group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Detail Akta
      </button>

      {/* Modern Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 md:p-10 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 backdrop-blur-md shadow-inner">
              <FolderOpen className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-[10px] font-bold text-indigo-300 uppercase tracking-widest border border-indigo-500/30">
                  Pusat Dokumen
                </span>
                {deed.status === 'FINAL' && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-[10px] font-bold text-emerald-300 uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Akta Final
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-1.5">{deed.title}</h1>
              <div className="flex items-center gap-4 text-white/40 text-xs font-medium">
                <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {deed.type}</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> {STATUS_LABELS[deed.status] || deed.status}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 bg-white/5 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="text-center">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap">Total Berkas</p>
              <p className="text-2xl font-extrabold text-white">{totalFiles}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section 1: Draf Akta (Full Width) ─── */}
      <Card className="rounded-3xl border-0 shadow-sm transition-all hover:shadow-lg bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Draf Akta</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Dokumen Word atau PDF untuk penyusunan</p>
            </div>
          </div>
          {latestDraft && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {deed.versions?.length || 0} Versi
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-6 space-y-4">
          {latestDraft ? (
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-white overflow-hidden">
              {/* File info row */}
              <div className="flex items-center gap-4 p-5 border-b border-indigo-100/60">
                <div className="h-14 w-14 rounded-2xl bg-white border border-indigo-100 flex flex-col items-center justify-center shadow-sm shrink-0 relative">
                  <FileText className="h-6 w-6 text-indigo-500" />
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter mt-0.5">
                    {latestDraft.gcsPath?.split('.').pop()?.toUpperCase() || 'DOC'}
                  </span>
                  <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white shadow">
                    {latestDraft.versionNumber}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-extrabold text-slate-800 text-base">Versi {latestDraft.versionNumber}</p>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-[9px] font-bold text-white uppercase tracking-wider">Terbaru</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200">
                      .{latestDraft.gcsPath?.split('.').pop()?.toUpperCase() || 'DOC'}
                    </span>
                    {latestDraft.googleDriveFileId && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[9px] font-bold text-amber-700 uppercase tracking-wider border border-amber-200 flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Di Google Docs
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Diunggah {new Date(latestDraft.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year:'numeric'})}
                    {latestDraft.fileSize && <span className="ml-2 text-slate-300">· {(latestDraft.fileSize / 1024).toFixed(0)} KB</span>}
                  </p>
                </div>
                {/* Preview button on the right */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-indigo-200 text-indigo-600 font-bold h-9 px-4 bg-white hover:bg-indigo-50 shadow-sm shrink-0"
                  onClick={() => handlePreview('draft', latestDraft.gcsPath)}
                >
                  Buka <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>

              {/* Action row — for Google Docs */}
              {isDocx && deed.status !== 'FINAL' && isGoogleConnected !== null && (
                <div className="px-5 py-3.5 flex items-center gap-3 flex-wrap bg-white/50">
                  {!isGoogleConnected ? (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-blue-700">Integrasi Google Workspace Belum Tersambung</p>
                        <p className="text-[10px] text-slate-400 font-medium">Hubungkan akun Google Anda untuk mengaktifkan fitur live editing Google Docs</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 shadow-sm flex items-center gap-1.5 shrink-0"
                        onClick={handleLinkGoogle}
                      >
                        <svg className="h-3 w-3 mr-0.5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Hubungkan Google
                      </Button>
                    </>
                  ) : latestDraft.googleDriveFileId ? (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-amber-600">Sedang dalam sesi pengeditan Google Docs</p>
                        <p className="text-[10px] text-slate-400 font-medium">Tarik perubahan untuk menyimpan versi baru</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl border-amber-200 text-amber-600 font-bold h-9 px-4 bg-white hover:bg-amber-50 shadow-sm"
                          onClick={() => handleOpenGDocs(latestDraft.id)}
                          disabled={isOpeningGDocs || isSyncingGDocs}
                        >
                          {isOpeningGDocs ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><PenTool className="h-3.5 w-3.5 mr-1.5" /> Lanjut Edit<ExternalLink className="h-3 w-3 ml-1" /></>}
                        </Button>
                        <Button 
                          size="sm" 
                          className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold h-9 px-4 shadow-sm shadow-amber-200"
                          onClick={() => handleSyncGDocs(latestDraft.id)}
                          disabled={isSyncingGDocs || isOpeningGDocs}
                        >
                          {isSyncingGDocs ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Tarik Perubahan</>}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-blue-700">Edit langsung di Google Docs</p>
                        <p className="text-[10px] text-slate-400 font-medium">Draf akan otomatis terkonversi ke format Google Docs</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-blue-200 text-blue-600 font-bold h-9 px-4 bg-white hover:bg-blue-50 shadow-sm flex items-center gap-1.5 shrink-0"
                        onClick={() => handleOpenGDocs(latestDraft.id)}
                        disabled={isOpeningGDocs || isSyncingGDocs}
                      >
                        {isOpeningGDocs ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><PenTool className="h-3.5 w-3.5" /> Edit di Google Docs</>}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/30">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="h-7 w-7 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">Belum ada draf</p>
              <p className="text-xs text-slate-400 font-medium">Unggah file .doc, .docx, atau .pdf pertama Anda</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {deed.status !== 'FINAL' ? (
              <div className="relative group/upload flex-1">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'draft')}
                  disabled={isUploadingDraft}
                />
                <Button className="w-full h-12 rounded-xl bg-white border-2 border-dashed border-slate-200 text-slate-500 group-hover/upload:border-indigo-600 group-hover/upload:bg-indigo-600 group-hover/upload:text-white transition-all duration-300 font-bold flex items-center justify-center gap-2.5 shadow-none group-hover/upload:scale-[1.01] active:scale-[0.99]">
                  {isUploadingDraft ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Mengunggah dokumen...</>
                  ) : (
                    <><FileUp className="h-4 w-4 transition-transform duration-300 group-hover/upload:-translate-y-1" /> {latestDraft ? "Unggah Revisi Baru" : "Unggah Draf Pertama"}</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex-1 p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Akta sudah final — tidak dapat diubah</p>
              </div>
            )}
          </div>

          {deed.versions && deed.versions.length > 1 && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" /> Riwayat Versi
                </span>
                <span className="text-[10px] font-medium text-slate-300">{deed.versions.length - 1} versi lama</span>
              </div>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {deed.versions.slice(1).map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-slate-50 group/row transition-all">
                    <div className="flex items-center gap-2.5">
                      <span className="h-6 w-6 rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 flex items-center justify-center">{v.versionNumber}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-600">Versi {v.versionNumber}</p>
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200">.{v.gcsPath?.split('.').pop()?.toUpperCase() || 'DOC'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{new Date(v.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'})}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase text-slate-400 hover:text-indigo-600" onClick={() => handlePreview('draft', v.gcsPath)}>
                      Lihat <ChevronRight className="h-3 w-3 ml-0.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Section 2 & 3: 2-Column Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ─── Col 1: Scan Akta Final ─── */}
        <Card className="rounded-3xl border-0 shadow-sm transition-all hover:shadow-lg bg-white overflow-hidden relative flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-white">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FileBadge2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Scan Akta Final</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Minuta atau salinan yang sudah ditandatangani</p>
              </div>
            </div>
            {deed.status === 'FINAL' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Final</span>
              </div>
            )}
          </div>
          <CardContent className="p-6 flex-1 flex flex-col gap-4">
            {deed.scanPath ? (
              /* ─── Scan sudah ada ─── */
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-4 p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30">
                  <div className="h-14 w-14 rounded-full bg-white border-2 border-emerald-200 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-extrabold text-emerald-800 text-sm">Dokumen Final Tersedia</h4>
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">PDF</span>
                    </div>
                    <p className="text-xs text-emerald-600/60 font-medium">Arsip digital tersimpan dengan aman di cloud</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button 
                    className="flex-1 rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 text-sm"
                    onClick={() => handlePreview('scan', deed.scanPath)}
                  >
                    Buka Scan <ExternalLink className="h-4 w-4 ml-1.5" />
                  </Button>
                  <div className="relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, 'scan')}
                      disabled={isUploadingScan}
                    />
                    <Button variant="outline" className="h-11 w-11 rounded-xl border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 hover:border-emerald-300 shadow-sm flex items-center justify-center px-0" title="Ganti scan">
                      {isUploadingScan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* ─── Empty State Scan — dengan panduan langkah ─── */
              <div className="flex-1 flex flex-col">
                {/* Step guide */}
                <div className="space-y-2.5 mb-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Cara mengunggah scan final:</p>
                  {[
                    { step: '1', text: 'Tanda tangani akta fisik oleh seluruh penghadap' },
                    { step: '2', text: 'Scan dokumen menggunakan scanner atau kamera' },
                    { step: '3', text: 'Simpan sebagai file PDF lalu unggah di bawah' },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center justify-center shrink-0 border border-emerald-200">{step}</div>
                      <p className="text-xs text-slate-500 font-medium">{text}</p>
                    </div>
                  ))}
                </div>

                {/* Upload CTA */}
                <div className="relative group/scan mt-auto">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" 
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e, 'scan')}
                    disabled={isUploadingScan}
                  />
                  <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-5 flex flex-col items-center gap-3 text-center group-hover/scan:border-emerald-500 group-hover/scan:bg-emerald-50/40 transition-all duration-300 cursor-pointer">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-100 group-hover/scan:bg-emerald-200 flex items-center justify-center transition-colors">
                      {isUploadingScan 
                        ? <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                        : <Upload className="h-6 w-6 text-emerald-600 group-hover/scan:-translate-y-0.5 transition-transform" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-emerald-700">{isUploadingScan ? 'Mengunggah...' : 'Klik untuk Unggah Scan'}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Format PDF · Otomatis finalisasi akta</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Col 2: Lampiran Pendukung ─── */}
        <Card className="rounded-3xl border-0 shadow-sm transition-all hover:shadow-lg bg-white overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <Paperclip className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Lampiran Pendukung</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">KTP, sertifikat, bukti pembayaran, dan lainnya</p>
              </div>
            </div>
            {attachments.length > 0 && (
              <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                {attachments.length} berkas
              </span>
            )}
          </div>
          <CardContent className="p-6 flex-1 flex flex-col gap-4">
            {/* Upload button */}
            <div className="relative group/attach">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'attachment')}
                disabled={isUploadingAttachment}
              />
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex items-center gap-3 group-hover/attach:border-indigo-400 group-hover/attach:bg-indigo-50/30 transition-all duration-300 cursor-pointer">
                <div className="h-10 w-10 rounded-xl bg-slate-100 group-hover/attach:bg-indigo-100 flex items-center justify-center shrink-0 transition-colors">
                  {isUploadingAttachment 
                    ? <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                    : <Plus className="h-5 w-5 text-slate-500 group-hover/attach:text-indigo-600 transition-colors" />
                  }
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-600 group-hover/attach:text-indigo-700 transition-colors">{isUploadingAttachment ? 'Mengunggah...' : 'Tambah Berkas Lampiran'}</p>
                  <p className="text-[10px] text-slate-400 font-medium">PDF, JPG, atau PNG</p>
                </div>
              </div>
            </div>

            {/* Attachment list */}
            {attachments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 rounded-2xl border border-dashed border-slate-100 bg-slate-50/30 text-center">
                <Paperclip className="h-7 w-7 text-slate-200 mb-3" />
                <p className="text-xs font-bold text-slate-400">Belum ada lampiran</p>
                <p className="text-[10px] text-slate-300 font-medium mt-0.5">Unggah KTP, sertifikat, atau dokumen pendukung lainnya</p>
              </div>
            ) : (
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[280px] pr-1">
                {attachments.map((att: any) => (
                  <div 
                    key={att.id || att.path} 
                    className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group/item cursor-pointer"
                    onClick={() => handlePreview('attachment', att.path)}
                  >
                    <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover/item:border-indigo-100 group-hover/item:bg-indigo-50 transition-colors">
                      {getFileIcon(att.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-700 truncate group-hover/item:text-indigo-600 transition-colors">{att.name}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">{new Date(att.uploadedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{getFileExtension(att.name)}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover/item:text-indigo-500 transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      
      {/* Security Tip */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-200">
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-800 mb-0.5">Penyimpanan Aman & Terenkripsi</p>
          <p className="text-[11px] text-indigo-600/70 font-medium leading-relaxed">
            Semua dokumen disimpan di Google Cloud Storage dengan enkripsi dan akses terbatas hanya untuk staf berwenang.
          </p>
        </div>
      </div>

      {/* Finalization Dialog */}
      <Dialog open={isFinalizeDialogOpen} onOpenChange={setIsFinalizeDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl border-0 p-0 overflow-hidden shadow-2xl">
          <div className="h-1.5 bg-emerald-500 w-full" />
          <div className="p-8 pt-6">
            <DialogHeader className="mb-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">Finalisasi Akta Notaris</DialogTitle>
              <DialogDescription className="font-medium text-slate-500 leading-relaxed text-sm mt-1.5">
                Anda akan mengunggah berkas scan final. Masukkan Nomor Akta resmi untuk pencatatan Repertorium.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="deedNumber" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-0.5">Nomor Akta Resmi <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">#</span>
                  <Input 
                    id="deedNumber" 
                    value={manualNumber} 
                    onChange={(e) => setManualNumber(e.target.value)}
                    placeholder="000/Tahun/Bulan"
                    className="h-13 pl-10 rounded-xl border-slate-200 font-bold text-slate-900 text-lg focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-none placeholder:font-normal placeholder:text-slate-300"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium px-1 flex items-center gap-1.5 justify-end">
                   Saran sistem: <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono text-[10px]">{suggestedNumber}</span>
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-amber-700">Perhatian</p>
                  <p className="text-[11px] text-amber-700/70 font-medium leading-relaxed">
                    Tindakan ini bersifat permanen. Akta yang sudah difinalisasi akan terkunci dan tidak dapat diubah lagi.
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6 gap-3 sm:flex-row-reverse sm:justify-start">
              <Button 
                onClick={handleConfirmFinalize} 
                disabled={isFinalizing || !manualNumber}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-200 border-0 text-sm transition-all"
              >
                {isFinalizing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...</> : "Konfirmasi & Finalisasi"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setIsFinalizeDialogOpen(false)} 
                disabled={isFinalizing} 
                className="font-bold text-slate-400 h-12 px-6 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Batal
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
