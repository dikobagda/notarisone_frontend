"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  FileText, 
  ClipboardList, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileSearch,
  CheckCircle,
  AlertCircle,
  Printer,
  Edit2,
  ChevronRight,
  Eye,
  ExternalLink,
  Loader2,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CustomSelect } from "@/components/ui/custom-select";
import { jsPDF } from "jspdf";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<any>(null);
  const [savedBankAccounts, setSavedBankAccounts] = useState<any[]>([]);
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [uploadingHandover, setUploadingHandover] = useState<string | null>(null);

  const notaryHandoverOptions = [
    { label: "Belum Diterima", value: "PENDING", icon: Clock, description: "Dokumen belum diserahterimakan" },
    { label: "Sudah Diterima", value: "RECEIVED", icon: CheckCircle, description: "Dokumen telah diverifikasi & diterima" }
  ];

  const clientHandoverOptions = [
    { label: "Belum Diterima", value: "PENDING", icon: Clock, description: "Dokumen belum dikembalikan" },
    { label: "Sudah Diterima", value: "RECEIVED", icon: CheckCircle, description: "Dokumen telah dikembalikan ke klien" }
  ];

  const fetchDetail = async () => {
    try {
      const url = getApiUrl(`/api/service-requests/${id}`);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${(session as any)?.backendToken}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setConsultation(result.data);
      } else {
        alert(result.message || "Gagal mengambil detail");
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedBankAccounts = async () => {
    if (!session?.backendToken) {
      console.log("[DEBUG] fetchSavedBankAccounts skipped: No backendToken");
      return;
    }
    try {
      const url = getApiUrl("/api/profile/bank-accounts");
      console.log("[DEBUG] Fetching bank accounts from:", url);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.backendToken}` }
      });
      console.log("[DEBUG] Fetch bank accounts status:", res.status);
      const result = await res.json();
      console.log("[DEBUG] Bank accounts result:", result);
      if (result.success) {
        setSavedBankAccounts(result.data);
        if (result.data.length > 0) {
          const defaultAcc = result.data.find((acc: any) => acc.isDefault) || result.data[0];
          setBankName(defaultAcc.bankName);
          setAccountNumber(defaultAcc.accountNumber);
          setAccountHolder(defaultAcc.accountHolder);
        }
      }
    } catch (err) {
      console.error("Fetch bank accounts error:", err);
    }
  };
  
  const handleDownloadInvoice = (skipDialog: any = false) => {
    if (!consultation) return;

    const shouldSkip = typeof skipDialog === 'boolean' ? skipDialog : false;

    if (!shouldSkip && (!bankName || !accountNumber || !accountHolder || savedBankAccounts.length > 1)) {
      setIsBankDialogOpen(true);
      return;
    }

    const doc = new jsPDF();
    
    // Colors
    const darkBg = "#0F172A"; // Dark Slate
    const redAccent = "#EF4444"; // Red
    const white = "#FFFFFF";
    const textDark = "#1E293B";
    const textLight = "#64748B";
    const tableHeaderBg = "#F1F5F9";

    // 1. Header (Dark Background)
    doc.setFillColor(darkBg);
    doc.rect(0, 0, 210, 50, "F");

    // Red accent at top left
    doc.setFillColor(redAccent);
    doc.rect(15, 0, 20, 10, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(white);
    doc.text("INVOICE", 15, 30);

    // Sub-info (No Invoice, Tanggal, Tgl Jatuh Tempo)
    doc.setFontSize(8);
    doc.setTextColor("#94A3B8"); // Light grey
    doc.text("No Invoice", 15, 42);
    doc.text("Tanggal", 45, 42);
    doc.text("Tgl. Jatuh Tempo", 75, 42);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(white);
    doc.text(`INV/${consultation.id.slice(0, 8).toUpperCase()}`, 15, 47);
    doc.text(new Date(consultation.createdAt).toLocaleDateString('id-ID'), 45, 47);
    // Let's set due date to +7 days
    const dueDate = new Date(consultation.createdAt);
    dueDate.setDate(dueDate.getDate() + 7);
    doc.text(dueDate.toLocaleDateString('id-ID'), 75, 47);

    // Vertical dividers in header
    doc.setDrawColor("#334155"); // Darker grey
    doc.line(40, 40, 40, 48);
    doc.line(70, 40, 70, 48);

    // Client Info (Right aligned)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#94A3B8");
    doc.text("Tagihan kepada:", 140, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(white);
    doc.text(consultation.clientName || consultation.client?.name || "Klien Anonim", 140, 26);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#94A3B8");
    // Split address if long, or just use one line
    const address = consultation.client?.address || "Alamat tidak tersedia";
    const addressLines = doc.splitTextToSize(address, 60);
    doc.text(addressLines, 140, 32);
    
    doc.text(consultation.clientPhone || consultation.client?.phone || "-", 140, 42);
    doc.text(consultation.client?.email || "-", 140, 46);

    // 2. Table
    const startY = 60;
    
    // Table Header
    doc.setFillColor(tableHeaderBg);
    doc.rect(15, startY, 180, 10, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(textDark);
    doc.text("DESKRIPSI", 20, startY + 6);
    doc.text("KUANTITAS", 90, startY + 6);
    doc.text("HARGA", 120, startY + 6);
    doc.text("JUMLAH", 160, startY + 6);

    // Table Row
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    const serviceName = consultation.serviceCategory?.replace('_', ' ') || "Layanan";
    const descLines = doc.splitTextToSize(serviceName, 65);
    doc.text(descLines, 20, startY + 16);
    
    doc.text("1", 95, startY + 16);
    doc.text(`Rp ${Number(consultation.estimatedCost).toLocaleString('id-ID')}`, 120, startY + 16);
    doc.text(`Rp ${Number(consultation.estimatedCost).toLocaleString('id-ID')}`, 160, startY + 16);

    // Additional Jobs as sub-text
    if (consultation.additionalJobs) {
      doc.setFontSize(7);
      doc.setTextColor(textLight);
      const addJobsLines = doc.splitTextToSize(`Pekerjaan Tambahan: ${consultation.additionalJobs}`, 65);
      doc.text(addJobsLines, 20, startY + 22);
      doc.setFontSize(9);
      doc.setTextColor(textDark);
    }

    // Table Border/Lines
    doc.setDrawColor("#E2E8F0");
    doc.line(15, startY + 30, 195, startY + 30);

    // 3. Summary
    const summaryY = startY + 40;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textLight);
    doc.text("Subtotal", 120, summaryY);
    doc.text("Total", 120, summaryY + 10);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textDark);
    doc.text(`Rp ${Number(consultation.estimatedCost).toLocaleString('id-ID')}`, 160, summaryY);
    doc.text(`Rp ${Number(consultation.estimatedCost).toLocaleString('id-ID')}`, 160, summaryY + 10);

    doc.setFontSize(11);
    doc.text("SISA TAGIHAN", 120, summaryY + 20);
    doc.text(`Rp ${Number(consultation.estimatedCost).toLocaleString('id-ID')}`, 160, summaryY + 20);

    // 4. Footer & Signature
    const footerY = 200;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Pesan:", 15, footerY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textLight);
    doc.text("Silahkan transfer ke rekening:", 15, footerY + 6);
    doc.text(`${bankName} ${accountNumber} a/n ${accountHolder}`, 15, footerY + 12);

    // Signature Area
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textDark);
    doc.text("Disetujui Oleh,", 140, footerY);
    
    // Placeholder for signature line or text
    doc.line(140, footerY + 25, 180, footerY + 25);
    doc.text(consultation.tenantName || "Kantor Notaris & PPAT", 140, footerY + 30);

    // Company Info at Bottom
    doc.setFontSize(7);
    doc.setTextColor(textLight);
    doc.text("PENAGRAHA", 140, footerY + 45);
    doc.text("Sistem Manajemen Notaris & PPAT", 140, footerY + 49);

    doc.save(`Invoice-${consultation.id.slice(0, 8)}.pdf`);
  };

  const handleUpdateHandoverStatus = async (type: 'CLIENT_TO_NOTARY' | 'NOTARY_TO_CLIENT', status: string, date: string | null = null, proof: string | null = null) => {
    try {
      const url = getApiUrl(`/api/service-requests/${id}/handover`);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any)?.backendToken}`
        },
        body: JSON.stringify({
          type,
          status,
          date: date || (status === 'RECEIVED' ? new Date().toISOString() : null),
          proof
        })
      });
      const result = await response.json();
      if (result.success) {
        setConsultation(result.data);
      } else {
        alert("Gagal memperbarui status serah terima: " + result.message);
      }
    } catch (error) {
      console.error("Error updating handover status:", error);
      alert("Error memperbarui status serah terima");
    }
  };

  const handleUploadHandoverProof = async (type: 'CLIENT_TO_NOTARY' | 'NOTARY_TO_CLIENT', file: File) => {
    setUploadingHandover(type === 'CLIENT_TO_NOTARY' ? 'toNotary' : 'toClient');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadUrl = getApiUrl('/api/service-requests/upload');
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(session as any)?.backendToken}`
        },
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        const isNotary = type === 'CLIENT_TO_NOTARY';
        const currentStatus = isNotary ? consultation.toNotaryStatus : consultation.toClientStatus;
        const currentDate = isNotary ? consultation.toNotaryDate : consultation.toClientDate;
        
        await handleUpdateHandoverStatus(
          type,
          currentStatus === 'RECEIVED' ? 'RECEIVED' : 'RECEIVED',
          currentDate || new Date().toISOString(),
          result.data.url
        );
      } else {
        alert("Gagal mengunggah bukti: " + result.message);
      }
    } catch (error) {
      console.error("Error uploading handover proof:", error);
      alert("Error mengunggah file bukti");
    } finally {
      setUploadingHandover(null);
    }
  };

  const handleDownloadHandoverPdf = (type: 'CLIENT_TO_NOTARY' | 'NOTARY_TO_CLIENT') => {
    if (!consultation) return;

    const doc = new jsPDF();
    const isClientToNotary = type === 'CLIENT_TO_NOTARY';
    
    // Colors
    const darkBg = "#0F172A"; // Dark Slate
    const redAccent = "#EF4444"; // Red
    const white = "#FFFFFF";
    const textDark = "#1E293B";
    const textLight = "#64748B";
    const tableHeaderBg = "#F1F5F9";

    // 1. Header (Dark Background)
    doc.setFillColor(darkBg);
    doc.rect(0, 0, 210, 50, "F");

    // Red accent at top left
    doc.setFillColor(redAccent);
    doc.rect(15, 0, 20, 10, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(white);
    
    const titleText = isClientToNotary 
      ? "TANDA TERIMA PENYERAHAN DOKUMEN" 
      : "TANDA TERIMA PENGEMBALIAN DOKUMEN";
    const titleLines = doc.splitTextToSize(titleText, 115);
    doc.text(titleLines, 15, 20);
    
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#94A3B8");
    const subtitleText = isClientToNotary
      ? "Tanda terima berkas dari Klien kepada Kantor Notaris & PPAT"
      : "Tanda terima pengembalian berkas dari Kantor Notaris & PPAT kepada Klien";
    const subtitleLines = doc.splitTextToSize(subtitleText, 115);
    doc.text(subtitleLines, 15, 32);

    // Sub-info (No. Serah Terima, Tanggal)
    doc.setFontSize(8);
    doc.setTextColor("#94A3B8");
    doc.text("ID Konsultansi", 15, 41);
    doc.text("Tanggal Serah Terima", 70, 41);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(white);
    doc.text(consultation.id.slice(0, 12).toUpperCase(), 15, 46);
    
    const handoverDate = isClientToNotary ? consultation.toNotaryDate : consultation.toClientDate;
    const dateStr = handoverDate 
      ? new Date(handoverDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(dateStr, 70, 46);

    // Client Info (Right aligned)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#94A3B8");
    doc.text("Klien / Pemohon:", 140, 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(white);
    doc.text(consultation.clientName || consultation.client?.name || "Klien Anonim", 140, 23);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#94A3B8");
    doc.text(`NIK: ${consultation.client?.nik || "-"}`, 140, 28);
    doc.text(`Telp: ${consultation.clientPhone || consultation.client?.phone || "-"}`, 140, 33);
    
    const address = consultation.client?.address || "Alamat tidak tersedia";
    const addressLines = doc.splitTextToSize(address, 60);
    doc.text(addressLines, 140, 38);

    // 2. Body Info Text
    let currentY = 62;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(textDark);
    doc.text("PERNYATAAN SERAH TERIMA", 15, currentY);
    
    currentY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textDark);
    
    const statement = isClientToNotary
      ? `Pada hari ini, telah dilakukan penyerahan berkas/dokumen persyaratan dari Klien kepada Kantor Notaris & PPAT untuk keperluan layanan hukum "${consultation.serviceCategory?.replace(/_/g, ' ')}" dengan rincian dokumen sebagai berikut:`
      : `Pada hari ini, telah dilakukan pengembalian berkas/dokumen asli/salinan dari Kantor Notaris & PPAT kepada Klien selaku pemilik dokumen yang sah untuk layanan hukum "${consultation.serviceCategory?.replace(/_/g, ' ')}" dengan rincian dokumen sebagai berikut:`;
    
    const statementLines = doc.splitTextToSize(statement, 180);
    doc.text(statementLines, 15, currentY);
    currentY += (statementLines.length * 5) + 4;

    // 3. Document Table
    doc.setFillColor(tableHeaderBg);
    doc.rect(15, currentY, 180, 8, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(textDark);
    doc.text("NO.", 18, currentY + 5.5);
    doc.text("NAMA DOKUMEN / PERSYARATAN", 30, currentY + 5.5);
    doc.text("STATUS VERIFIKASI", 120, currentY + 5.5);
    doc.text("KETERANGAN", 160, currentY + 5.5);

    doc.setDrawColor("#E2E8F0");
    doc.line(15, currentY + 8, 195, currentY + 8);
    currentY += 8;

    const checkedDocs = Object.entries(consultation.documents || {})
      .filter(([key, val]: [string, any]) => {
        if (key === 'Sertifikat' || key === 'PBB') {
          return consultation.serviceCategory === 'PPAT';
        }
        return true;
      });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    if (checkedDocs.length === 0) {
      currentY += 8;
      doc.text("Tidak ada dokumen yang dicatat.", 18, currentY);
      doc.line(15, currentY + 4, 195, currentY + 4);
      currentY += 4;
    } else {
      checkedDocs.forEach(([key, val]: [string, any], index) => {
        currentY += 8;
        doc.text(`${index + 1}`, 18, currentY);
        doc.text(key, 30, currentY);
        
        doc.setFont("helvetica", "bold");
        if (val.checked) {
          doc.setTextColor("#10B981"); // Emerald green
          doc.text("DITERIMA", 120, currentY);
        } else {
          doc.setTextColor("#94A3B8"); // Slate grey
          doc.text("BELUM ADA", 120, currentY);
        }
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textDark);
        
        doc.text(val.checked ? "Asli/Copy diverifikasi" : "-", 160, currentY);
        
        doc.line(15, currentY + 4, 195, currentY + 4);
        currentY += 4;
      });
    }

    currentY += 12;

    // 4. Notes
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Catatan Penting:", 15, currentY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textLight);
    const notesStr = isClientToNotary
      ? "1. Dokumen yang diterima akan disimpan dengan aman di Kantor Notaris & PPAT.\n2. Tanda terima ini sah secara elektronik dan dapat dicetak sebagai bukti serah terima berkas yang valid.\n3. Harap simpan tanda terima ini untuk keperluan pelacakan berkas."
      : "1. Dokumen yang dikembalikan telah diperiksa keutuhannya bersama oleh kedua belah pihak.\n2. Tanggung jawab penyimpanan dokumen sepenuhnya beralih kembali kepada Klien setelah penandatanganan tanda terima ini.\n3. Tanda terima ini menjadi bukti mutlak bahwa dokumen telah diserahterimakan kembali.";
    doc.text(notesStr, 15, currentY + 5);

    currentY += 25;

    // 5. Signature Section
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textDark);
    
    const signatureY = currentY;
    
    // Left signature: Client
    doc.text("Yang Menyerahkan,", 25, signatureY);
    doc.line(25, signatureY + 20, 75, signatureY + 20);
    doc.setFont("helvetica", "bold");
    const senderName = isClientToNotary 
      ? (consultation.clientName || consultation.client?.name || "Klien / Customer") 
      : (consultation.tenantName || "Kantor Notaris & PPAT");
    doc.text(senderName, 25, signatureY + 24);
    
    // Right signature: Notary
    doc.setFont("helvetica", "normal");
    doc.text("Yang Menerima,", 130, signatureY);
    doc.line(130, signatureY + 20, 180, signatureY + 20);
    doc.setFont("helvetica", "bold");
    const receiverName = isClientToNotary 
      ? (consultation.tenantName || "Kantor Notaris & PPAT")
      : (consultation.clientName || consultation.client?.name || "Klien / Customer");
    doc.text(receiverName, 130, signatureY + 24);

    // Elegant Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(textLight);
    doc.text("PENAGRAHA - Sistem Informasi Manajemen Notaris & PPAT Terintegrasi", 15, 285);
    
    const docName = isClientToNotary ? "Serah-Terima-Masuk" : "Serah-Terima-Keluar";
    doc.save(`${docName}-${consultation.id.slice(0, 8)}.pdf`);
  };

  useEffect(() => {
    console.log("[DEBUG] useEffect triggered with session:", !!session, "id:", id);
    if (session) {
      fetchDetail();
      fetchSavedBankAccounts();
    }
  }, [session, id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-200 px-4 py-1 rounded-full font-bold">Menunggu</Badge>;
      case 'IN_PROGRESS': return <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-200 px-4 py-1 rounded-full font-bold">Diproses</Badge>;
      case 'COMPLETED': return <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-200 px-4 py-1 rounded-full font-bold">Selesai</Badge>;
      case 'CANCELLED': return <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-200 px-4 py-1 rounded-full font-bold">Batal</Badge>;
      default: return <Badge className="px-4 py-1 rounded-full font-bold">{status}</Badge>;
    }
  };

  const handlePreview = async (gsPath: string) => {
    try {
      const response = await fetch(`/api/deeds/files/preview?gsPath=${gsPath}`, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success) {
        window.open(result.data.url, '_blank');
      } else {
        alert("Gagal mempratinjau file: " + result.message);
      }
    } catch (error) {
      console.error("Preview error:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Clock className="h-12 w-12 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-medium">Memuat rincian konsultansi...</p>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="p-10 text-center">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Konsultansi tidak ditemukan</h2>
        <Button onClick={() => router.back()} className="mt-4">Kembali</Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="p-0 hover:bg-transparent text-slate-500 hover:text-indigo-600 gap-2 mb-2 group transition-all"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Detail Konsultansi</h1>
            {getStatusBadge(consultation.status)}
          </div>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            ID: <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">{consultation.id}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300 mx-1" />
            Dibuat pada {new Date(consultation.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            className="h-12 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 transition-all cursor-pointer shadow-lg shadow-orange-500/20"
            onClick={handleDownloadInvoice}
          >
            <FileText className="h-5 w-5" /> Cetak Invoice
          </Button>
          <Link href={`/dashboard/penerimaan/${id}/edit`}>
            <Button className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20 gap-2 transition-all hover:-translate-y-0.5">
              <Edit2 className="h-5 w-5" /> Edit Data
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Klien & Permohonan */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
               <User className="h-32 w-32" />
            </div>
            
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Informasi Permohonan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap Klien</p>
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {(consultation.clientName || consultation.client?.name || "K")[0].toUpperCase()}
                   </div>
                   <p className="text-lg font-bold text-slate-900">{consultation.clientName || consultation.client?.name || "Klien Anonim"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No. Telepon / WA</p>
                <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50 w-fit pr-6">
                   <Phone className="h-5 w-5" />
                   <p className="font-bold">{consultation.clientPhone || consultation.client?.phone || "-"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kategori Layanan</p>
                <Badge className="bg-slate-900 text-white rounded-xl px-4 py-1.5 font-bold tracking-wide">
                  {consultation.serviceCategory?.replace('_', ' ')}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pekerjaan Tambahan</p>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {consultation.additionalJobs || "Tidak ada pekerjaan tambahan"}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deskripsi Permohonan</p>
               <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/60 text-slate-600 font-medium leading-relaxed italic">
                 "{consultation.description || "Tidak ada deskripsi tambahan"}"
               </div>
            </div>
          </section>

          {/* Section 2: Dokumen */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileSearch className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Kelengkapan Dokumen</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(consultation.documents || {})
                .filter(([key]) => {
                  if (key === 'Sertifikat' || key === 'PBB') {
                    return consultation.serviceCategory === 'PPAT';
                  }
                  return true;
                })
                .map(([key, value]: [string, any]) => (
                <div 
                  key={key} 
                  className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col gap-4 group relative ${
                    value.checked ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                        value.checked ? "bg-emerald-100 text-emerald-600 shadow-sm" : "bg-slate-200 text-slate-400"
                      }`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col min-w-0 overflow-hidden">
                        <span className={`font-black text-sm tracking-tight truncate ${value.checked ? "text-emerald-700" : "text-slate-400"}`}>{key}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                          {value.checked ? "Terverifikasi" : "Belum Ada"}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 pt-1">
                      {value.checked ? (
                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                      ) : (
                        <XCircle className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    {value.url ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePreview(value.url)}
                        className="w-full h-10 rounded-xl text-[9px] font-bold uppercase tracking-wider bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all gap-2 group/btn"
                      >
                        <Eye className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" /> 
                        Lihat Dokumen
                      </Button>
                    ) : (
                      <div className="h-10 flex items-center justify-center rounded-xl bg-slate-100/40 border border-slate-100 border-dashed">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tidak Ada File</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Serah Terima Dokumen */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Printer className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Serah Terima Dokumen</h2>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Kelola & Cetak Tanda Terima Berkas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Client to Notary */}
              <div className="p-6 rounded-[2rem] border border-slate-150 bg-slate-50/40 hover:bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-500/5 transition-all flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em]">Tipe A</span>
                    <h3 className="font-black text-slate-800 text-md tracking-tight leading-tight">Penyerahan: Klien → Notaris</h3>
                    <p className="text-xs text-slate-400 font-medium">Dokumen dari klien diserahkan ke notaris</p>
                  </div>
                  <Badge className={`px-3 py-1 rounded-full font-bold text-[10px] tracking-wide border ${
                    consultation.toNotaryStatus === 'RECEIVED' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {consultation.toNotaryStatus === 'RECEIVED' ? 'Diterima Notaris' : 'Menunggu'}
                  </Badge>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="w-full">
                    <CustomSelect
                      label="Status Terima"
                      options={notaryHandoverOptions}
                      value={consultation.toNotaryStatus || 'PENDING'}
                      onChange={(val) => handleUpdateHandoverStatus('CLIENT_TO_NOTARY', val)}
                    />
                  </div>

                  {consultation.toNotaryStatus === 'RECEIVED' && (
                    <div className="text-xs space-y-1 text-slate-500 font-medium bg-slate-100/60 p-3 rounded-xl">
                      <p>Tanggal Diterima:</p>
                      <p className="font-bold text-slate-700">
                        {consultation.toNotaryDate 
                          ? new Date(consultation.toNotaryDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </p>
                    </div>
                  )}

                  {/* Proof Upload / Display */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bukti Serah Terima</span>
                    {consultation.toNotaryProof ? (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-emerald-800">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold truncate">File Bukti Terunggah</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handlePreview(consultation.toNotaryProof)}
                            className="h-8 px-2 rounded-xl text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateHandoverStatus('CLIENT_TO_NOTARY', 'RECEIVED', consultation.toNotaryDate, null)}
                            className="h-8 px-2 rounded-xl text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          id="upload-to-notary"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadHandoverProof('CLIENT_TO_NOTARY', file);
                          }}
                          disabled={uploadingHandover !== null}
                        />
                        <label
                          htmlFor="upload-to-notary"
                          className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition-colors"
                        >
                          {uploadingHandover === 'toNotary' ? (
                            <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-4 w-4 text-slate-400 mb-1" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unggah Bukti (PDF/Gambar)</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => handleDownloadHandoverPdf('CLIENT_TO_NOTARY')}
                  className="w-full h-11 mt-auto rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Cetak Tanda Terima
                </Button>
              </div>

              {/* Card 2: Notary to Client */}
              <div className="p-6 rounded-[2rem] border border-slate-150 bg-slate-50/40 hover:bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-500/5 transition-all flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em]">Tipe B</span>
                    <h3 className="font-black text-slate-800 text-md tracking-tight leading-tight">Pengembalian: Notaris → Klien</h3>
                    <p className="text-xs text-slate-400 font-medium">Dokumen dikembalikan kembali ke klien</p>
                  </div>
                  <Badge className={`px-3 py-1 rounded-full font-bold text-[10px] tracking-wide border ${
                    consultation.toClientStatus === 'RECEIVED' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {consultation.toClientStatus === 'RECEIVED' ? 'Diterima Customer' : 'Menunggu'}
                  </Badge>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="w-full">
                    <CustomSelect
                      label="Status Terima"
                      options={clientHandoverOptions}
                      value={consultation.toClientStatus || 'PENDING'}
                      onChange={(val) => handleUpdateHandoverStatus('NOTARY_TO_CLIENT', val)}
                    />
                  </div>

                  {consultation.toClientStatus === 'RECEIVED' && (
                    <div className="text-xs space-y-1 text-slate-500 font-medium bg-slate-100/60 p-3 rounded-xl">
                      <p>Tanggal Diterima:</p>
                      <p className="font-bold text-slate-700">
                        {consultation.toClientDate 
                          ? new Date(consultation.toClientDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </p>
                    </div>
                  )}

                  {/* Proof Upload / Display */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bukti Serah Terima</span>
                    {consultation.toClientProof ? (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-emerald-800">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold truncate">File Bukti Terunggah</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handlePreview(consultation.toClientProof)}
                            className="h-8 px-2 rounded-xl text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateHandoverStatus('NOTARY_TO_CLIENT', 'RECEIVED', consultation.toClientDate, null)}
                            className="h-8 px-2 rounded-xl text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          id="upload-to-client"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadHandoverProof('NOTARY_TO_CLIENT', file);
                          }}
                          disabled={uploadingHandover !== null}
                        />
                        <label
                          htmlFor="upload-to-client"
                          className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition-colors"
                        >
                          {uploadingHandover === 'toClient' ? (
                            <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-4 w-4 text-slate-400 mb-1" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unggah Bukti (PDF/Gambar)</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => handleDownloadHandoverPdf('NOTARY_TO_CLIENT')}
                  className="w-full h-11 mt-auto rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-600/10 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Cetak Tanda Terima
                </Button>
              </div>
            </div>
          </section>

          {/* Section 3: Draft Akta Terkait */}
          {consultation.deeds && consultation.deeds.length > 0 && (
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Draft Akta Terkait</h2>
              </div>

              <div className="space-y-5">
                {consultation.deeds.map((deed: any) => {
                  const isPpat = ["AJB", "HIBAH", "TUKAR_MENUKAR", "INBRENG", "APHB", "APHT", "APHT_NOVASI", "SKMHT", "HGB", "HGU", "HP", "JUAL_BELI", "PPAT"].includes(deed.type);
                  const detailUrl = isPpat ? `/dashboard/ppat/${deed.id}` : `/dashboard/deeds/${deed.id}`;
                  
                  return (
                    <Link key={deed.id} href={detailUrl} className="block">
                      <div className="flex items-center justify-between p-5 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all group-hover:scale-110">
                            <FileText className={`h-6 w-6 transition-colors ${isPpat ? 'text-emerald-500 group-hover:text-emerald-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-[15px] tracking-tight">{deed.title}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-0.5">{deed.type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="h-7 px-3 rounded-xl bg-white font-black text-[9px] uppercase tracking-wider border-slate-200 text-slate-500">
                            {deed.status}
                          </Badge>
                          <div className="h-8 w-8 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all group-hover:translate-x-1 shadow-sm">
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-white transition-all" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Financial Summary */}
        <div className="space-y-8">
          <section className="bg-indigo-600 p-8 rounded-3xl text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
               <DollarSign className="h-40 w-40" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                   <DollarSign className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wider">Kesepakatan Biaya</h2>
              </div>

              <div className="space-y-1">
                <p className="text-indigo-100/70 text-sm font-bold uppercase tracking-widest">Total Estimasi</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tighter">Rp {Number(consultation.estimatedCost).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-100/60 font-medium italic">Status Pembayaran</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase">MENUNGGU DRAFT</span>
                </div>
                
                <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-start gap-3">
                   <AlertCircle className="h-5 w-5 text-indigo-200 shrink-0" />
                   <p className="text-xs text-indigo-100/80 leading-relaxed font-medium">
                     Biaya ini merupakan estimasi awal berdasarkan kategori layanan dan pekerjaan tambahan yang dipilih.
                   </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Action Side Card */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Alur Berikutnya</h3>
            <div className="space-y-4">
              {[
                { 
                  icon: <Clock className="h-4 w-4" />, 
                  label: "Proses Pekerjaan", 
                  desc: "Ubah status ke diproses", 
                  color: "blue", 
                  action: () => {
                    // Logic for status update could go here
                  } 
                },
                { 
                  icon: <FileText className="h-4 w-4" />, 
                  label: "Buat Draft Akta", 
                  desc: "Mulai pengetikan akta", 
                  color: "indigo",
                  action: () => {
                    const baseUrl = consultation.serviceCategory === 'PPAT' ? '/dashboard/ppat/create' : '/dashboard/deeds/create';
                    const clientId = consultation.clientId || consultation.client?.id || "";
                    const title = encodeURIComponent(consultation.description || "");
                    const url = `${baseUrl}?serviceRequestId=${id}&clientId=${clientId}&title=${title}`;
                    console.log("Navigating to:", url);
                    router.push(url);
                  }
                },
                { 
                  icon: <CheckCircle2 className="h-4 w-4" />, 
                  label: "Selesaikan", 
                  desc: "Tandai pekerjaan selesai", 
                  color: "emerald", 
                  action: () => {
                    // Logic for completing could go here
                  } 
                }
              ].map((step, i) => (
                <button 
                  key={i} 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    step.action();
                  }}
                  className="w-full flex gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all border-0 bg-transparent text-left outline-none"
                >
                  <div className={`h-10 w-10 rounded-xl bg-${step.color}-50 text-${step.color}-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    {step.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{step.label}</p>
                    <p className="text-xs text-slate-400 font-medium">{step.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Informasi Rekening Bank</DialogTitle>
            <DialogDescription>
              Silakan isi informasi rekening bank untuk ditampilkan di invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {savedBankAccounts.length > 0 && (
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Pilih Rekening Tersimpan</label>
                <select 
                  className="h-10 rounded-md border border-slate-200 p-2 text-sm"
                  onChange={(e) => {
                    const selected = savedBankAccounts.find(acc => acc.id === e.target.value);
                    if (selected) {
                      setBankName(selected.bankName);
                      setAccountNumber(selected.accountNumber);
                      setAccountHolder(selected.accountHolder);
                    }
                  }}
                >
                  <option value="">-- Pilih Rekening --</option>
                  {savedBankAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nama Bank</label>
              <Input 
                value={bankName} 
                onChange={e => setBankName(e.target.value)} 
                placeholder="Contoh: BANK MANDIRI" 
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nomor Rekening</label>
              <Input 
                value={accountNumber} 
                onChange={e => setAccountNumber(e.target.value)} 
                placeholder="Contoh: 123-456-789" 
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Atas Nama</label>
              <Input 
                value={accountHolder} 
                onChange={e => setAccountHolder(e.target.value)} 
                placeholder="Contoh: PENAGRAHA" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBankDialogOpen(false)}>Batal</Button>
            <Button onClick={async () => {
              // Check if account already exists
              const exists = savedBankAccounts.find(acc => 
                acc.bankName === bankName && 
                acc.accountNumber === accountNumber && 
                acc.accountHolder === accountHolder
              );

              if (!exists && bankName && accountNumber && accountHolder) {
                // Save to database
                const url = getApiUrl("/api/profile/bank-accounts");
                try {
                  await fetch(url, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${(session as any)?.backendToken}`
                    },
                    body: JSON.stringify({ bankName, accountNumber, accountHolder })
                  });
                  // Refresh list
                  fetchSavedBankAccounts();
                } catch (error) {
                  console.error("Error saving bank account:", error);
                }
              }

              setIsBankDialogOpen(false);
              setTimeout(() => handleDownloadInvoice(true), 100);
            }}>Cetak Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
