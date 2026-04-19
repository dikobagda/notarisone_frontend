"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Printer,
  Download,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
  FileText,
  Clock,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CalendarDays,
  Loader2,
  FileSearch,
  Briefcase,
  BarChart3,
  Hash,
  User,
  Scale,
  Sparkles,
  TrendingUp,
  Eye,
  ChevronDown,
  LayoutGrid,
  List,
  AlertCircle,
} from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format, parseISO } from "date-fns";
import { id as localesId } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DEED_TYPE_LABELS: Record<string, string> = {
  PENDIRIAN_PT: "Pendirian PT",
  PENDIRIAN_CV: "Pendirian CV",
  PENDIRIAN_YAYASAN: "Pendirian Yayasan",
  JUAL_BELI: "Jual Beli",
  SEWA_MENYUWA: "Sewa Menyewa",
  HIBAH: "Hibah",
  WASIAT: "Wasiat",
  KERJASAMA: "Perjanjian Kerja Sama",
  KREDIT: "Kredit",
  KUASA_MENJUAL: "Kuasa Menjual",
  PPJB: "PPJB",
  RUPS: "RUPS",
  SKMHT: "SKMHT",
  AD_PERUBAHAN: "Perubahan AD",
  LAINNYA: "Lainnya",
};

const DEED_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  PENDIRIAN_PT:      { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200" },
  PENDIRIAN_CV:      { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200" },
  PENDIRIAN_YAYASAN: { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200" },
  JUAL_BELI:         { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  SEWA_MENYUWA:      { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
  HIBAH:             { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200" },
  WASIAT:            { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200" },
  KREDIT:            { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200" },
  RUPS:              { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200" },
};

export default function ProtokolPage() {
  const { data: session } = useSession();
  const [monthName, setMonthName] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchProtokol = useCallback(async () => {
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token) return;

    try {
      setIsLoading(true);
      const monthIndex = MONTHS.indexOf(monthName) + 1;

      const res = await fetch(`/api/repertorium/monthly?tenantId=${tenantId}&month=${monthIndex}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Non-JSON response");
      }

      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Gagal memuat data protokol");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [session, monthName, year]);

  useEffect(() => {
    fetchProtokol();
  }, [fetchProtokol]);

  const filteredEntries = entries.filter(entry =>
    entry.repertoriumNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.deed?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.deed?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute quick stats
  const uniqueClients = new Set(filteredEntries.map(e => e.deed?.client?.name).filter(Boolean)).size;
  const deedTypeCounts: Record<string, number> = {};
  filteredEntries.forEach(e => {
    const t = e.deed?.type || "LAINNYA";
    deedTypeCounts[t] = (deedTypeCounts[t] || 0) + 1;
  });
  const topDeedType = Object.entries(deedTypeCounts).sort(([,a], [,b]) => b - a)[0];

  const handleDownloadPDF = () => {
    if (entries.length === 0) {
      toast.error("Tidak ada data untuk diunduh");
      return;
    }

    try {
      const doc = new jsPDF({ orientation: "landscape" });
      
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("BUKU REPERTORIUM NOTARIS / PPAT", 14, 15);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Periode Laporan : ${monthName.toUpperCase()} ${year}`, 14, 22);
      doc.text(`Nama Kantor     : ${(session?.user as any)?.tenantName || "Kantor Notaris"}`, 14, 27);
      doc.text(`Waktu Cetak    : ${format(new Date(), "dd MMMM yyyy HH:mm", { locale: localesId })}`, 14, 32);

      const tableData = filteredEntries.map((entry) => [
        entry.repertoriumNumber,
        format(parseISO(entry.date), "dd/MM/yyyy"),
        entry.deed?.client?.name || "-",
        entry.deed?.title || "-",
        DEED_TYPE_LABELS[entry.deed?.type] || entry.deed?.type || "-",
        "" // Keterangan Column
      ]);

      autoTable(doc, {
        startY: 38,
        head: [["NO. URUT", "TANGGAL AKTA", "NAMA PENGHADAP", "SIFAT / JUDUL AKTA", "JENIS AKTA", "KETERANGAN"]],
        body: tableData,
        theme: "grid",
        headStyles: { 
          fillColor: [67, 56, 202], // indigo-700
          textColor: 255, 
          halign: "center", 
          fontSize: 9,
          fontStyle: "bold"
        },
        bodyStyles: { 
          fontSize: 8,
          textColor: 50
        },
        columnStyles: {
          0: { cellWidth: 30, halign: "center" },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 50 },
          3: { cellWidth: "auto" },
          4: { cellWidth: 35 },
          5: { cellWidth: 25 }
        },
        margin: { top: 38 },
        didDrawPage: (data) => {
          // Footer Page Number
          doc.setFontSize(8);
          doc.text(
            `Halaman ${data.pageNumber}`,
            doc.internal.pageSize.width - 25,
            doc.internal.pageSize.height - 10
          );
        }
      });

      doc.save(`Repertorium_${monthName}_${year}.pdf`);
      toast.success("PDF berhasil diunduh");
    } catch (err) {
      console.error("PDF Generation Error:", err);
      toast.error("Gagal membuat file PDF");
    }
  };

  const handlePrint = () => {
    handleDownloadPDF();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const currentIdx = MONTHS.indexOf(monthName);
    if (direction === "prev") {
      if (currentIdx === 0) {
        setMonthName(MONTHS[11]);
        setYear((parseInt(year) - 1).toString());
      } else {
        setMonthName(MONTHS[currentIdx - 1]);
      }
    } else {
      if (currentIdx === 11) {
        setMonthName(MONTHS[0]);
        setYear((parseInt(year) + 1).toString());
      } else {
        setMonthName(MONTHS[currentIdx + 1]);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* ─── Premium Hero Banner ─── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-10 text-white shadow-2xl">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03]">
          <BookOpen className="w-full h-full" strokeWidth={0.5} />
        </div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-widest">
              <Scale className="h-3.5 w-3.5" />
              Buku Repertorium Digital
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Protokol <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Digital</span>
            </h1>
            <p className="text-slate-400 text-base font-medium max-w-lg">
              Laporan repertorium bulanan otomatis sesuai standar UUJN. Kelola kepatuhan dengan mudah.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button 
              variant="outline" 
              onClick={handleDownloadPDF}
              className="h-11 px-5 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md font-semibold gap-2 text-sm"
            >
              <Download className="h-4 w-4" />
              Unduh PDF
            </Button>
            <Button 
              onClick={handlePrint}
              className="h-11 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold gap-2 text-sm shadow-lg shadow-indigo-500/30"
            >
              <Printer className="h-4 w-4" />
              Cetak Repertorium
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Period Navigator ─── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigateMonth("prev")} 
            className="h-10 w-10 rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-sm">
            <CalendarDays className="h-4 w-4 text-indigo-500" />
            <span className="text-lg font-extrabold text-slate-900 tracking-tight uppercase">
              {monthName} {year}
            </span>
          </div>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigateMonth("next")} 
            className="h-10 w-10 rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "h-10 w-10 flex items-center justify-center transition-all",
                viewMode === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={cn(
                "h-10 w-10 flex items-center justify-center transition-all",
                viewMode === "card" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={fetchProtokol}
            disabled={isLoading}
            variant="outline"
            className="h-10 rounded-xl border-slate-200 text-slate-600 font-bold gap-2 shadow-sm"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Entries */}
        <div className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="flex items-start justify-between mb-4">
            <div className="h-11 w-11 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Hash className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {monthName}
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-blue-300" /> : filteredEntries.length}
          </div>
          <div className="text-xs text-slate-500 font-medium">Entri Tercatat <span className="text-slate-400">· Periode Ini</span></div>
        </div>

        {/* Unique Clients */}
        <div className="group relative bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="flex items-start justify-between mb-4">
            <div className="h-11 w-11 bg-violet-500/10 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-violet-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Penghadap
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-violet-300" /> : uniqueClients}
          </div>
          <div className="text-xs text-slate-500 font-medium">Klien Unik <span className="text-slate-400">· Bulan Ini</span></div>
        </div>

        {/* Top Deed Type */}
        <div className="group relative bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="flex items-start justify-between mb-4">
            <div className="h-11 w-11 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <BarChart3 className="h-3.5 w-3.5" />
              Terbanyak
            </div>
          </div>
          <div className="text-lg font-extrabold text-slate-900 tracking-tight mb-1 truncate">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-emerald-300" /> : (topDeedType ? (DEED_TYPE_LABELS[topDeedType[0]] || topDeedType[0]) : "—")}
          </div>
          <div className="text-xs text-slate-500 font-medium">Jenis Akta Dominan <span className="text-slate-400">· {topDeedType ? `${topDeedType[1]} akta` : ""}</span></div>
        </div>

        {/* Compliance Status */}
        <div className="group relative bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-300 cursor-default overflow-hidden">
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/5 blur-xl" />
          <div className="flex items-start justify-between mb-4">
            <div className="h-11 w-11 bg-white/10 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-white/80" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-white/60">
              <Sparkles className="h-3.5 w-3.5" />
              Validasi
            </div>
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight mb-1">SIAP LAPOR</div>
          <div className="text-xs text-white/50 font-medium">Status Kepatuhan <span className="text-white/40">· Sistem OK</span></div>
        </div>
      </div>

      {/* ─── Compliance Info ─── */}
      <Alert className="bg-gradient-to-r from-indigo-50/80 via-violet-50/50 to-indigo-50/80 border-indigo-100/50 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <AlertTitle className="text-indigo-900 font-black mb-1 text-sm">Informasi Kepatuhan Protokol</AlertTitle>
            <AlertDescription className="text-indigo-700/70 font-medium leading-relaxed text-xs">
              Data ini dibuat secara otomatis setiap kali akta diberi nomor repertorium.
              Pastikan data klien dan sifat akta sudah lengkap sebelum melakukan pelaporan ke Majelis Pengawas Daerah (MPD).
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* ─── Search Bar ─── */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
          <Input
            placeholder="Cari berdasarkan nomor repertorium, judul akta, atau nama klien..."
            className="pl-11 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest shrink-0">
          <FileSearch className="h-4 w-4" />
          {filteredEntries.length} hasil
        </div>
      </div>

      {/* ─── Content Area ─── */}
      {viewMode === "table" ? (
        /* ─── TABLE VIEW ─── */
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-none hover:bg-transparent bg-slate-50/50">
                    <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[160px]">No. Repertorium</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-[140px]">Tanggal Akta</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Penghadap</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sifat / Judul Akta</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-[140px]">Jenis</TableHead>
                    <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                      <TableRow key={i} className="animate-pulse border-b border-slate-50">
                        <TableCell className="px-6 py-5"><div className="h-5 bg-slate-100 rounded-lg w-24" /></TableCell>
                        <TableCell><div className="h-4 bg-slate-50 rounded-lg w-20" /></TableCell>
                        <TableCell><div className="h-4 bg-slate-50 rounded-lg w-40" /></TableCell>
                        <TableCell><div className="h-4 bg-slate-50 rounded-lg w-full" /></TableCell>
                        <TableCell><div className="h-5 bg-slate-50 rounded-full w-20" /></TableCell>
                        <TableCell className="text-right pr-6"><div className="h-8 w-8 bg-slate-50 rounded-lg ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 text-slate-300">
                          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                            <FileSearch className="h-10 w-10 opacity-20 text-slate-900" />
                          </div>
                          <p className="font-black text-lg text-slate-400">Data Tidak Ditemukan</p>
                          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest max-w-sm">
                            Atur filter periode atau kata kunci di atas untuk mencari entri repertorium
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry, idx) => {
                      const deedType = entry.deed?.type || "LAINNYA";
                      const typeStyle = DEED_TYPE_STYLES[deedType] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };
                      const isExpanded = expandedRow === entry.id;

                      return (
                        <TableRow 
                          key={entry.id} 
                          className={cn(
                            "border-b border-slate-50 transition-all duration-200 group/row cursor-pointer",
                            isExpanded ? "bg-indigo-50/30" : "hover:bg-slate-50/60"
                          )}
                          onClick={() => setExpandedRow(isExpanded ? null : entry.id)}
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 tracking-tight text-sm block">{entry.repertoriumNumber}</span>
                                <span className="text-[10px] text-slate-400 font-medium">#{(idx + 1).toString().padStart(3, '0')}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700">{format(parseISO(entry.date), "dd MMM yyyy", { locale: localesId })}</span>
                              <span className="text-[10px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(parseISO(entry.date), "HH:mm")} WIB
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-500 text-[10px] font-black border border-slate-200 shadow-sm">
                                {entry.deed?.client?.name?.charAt(0) || "K"}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-800 tracking-tight block">{entry.deed?.client?.name || "Klien Tidak Terdata"}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col max-w-[280px]">
                              <span className="text-xs font-bold text-slate-800 group-hover/row:text-indigo-600 transition-colors truncate">{entry.deed?.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                              typeStyle.bg, typeStyle.text, typeStyle.border
                            )}>
                              {DEED_TYPE_LABELS[deedType] || deedType}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all" 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/dashboard/deeds/${entry.deedId}`;
                              }}
                            >
                              <ExternalLink className="h-4 w-4 text-slate-400 group-hover/row:text-indigo-500 transition-colors" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="px-8 py-6 border-t border-slate-50 bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                — Akhir buku repertorium digital —
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                Periode: <span className="font-bold text-slate-600">{monthName} {year}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ─── CARD VIEW ─── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-slate-100 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-100 rounded-lg w-24" />
                    <div className="h-3 bg-slate-50 rounded-lg w-16" />
                  </div>
                </div>
                <div className="h-4 bg-slate-50 rounded-lg w-full mb-2" />
                <div className="h-3 bg-slate-50 rounded-lg w-3/4" />
              </div>
            ))
          ) : filteredEntries.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-100">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <FileSearch className="h-10 w-10 text-slate-200" />
              </div>
              <p className="font-black text-lg text-slate-400">Data Tidak Ditemukan</p>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-2">
                Atur filter periode untuk mencari entri
              </p>
            </div>
          ) : (
            filteredEntries.map((entry, idx) => {
              const deedType = entry.deed?.type || "LAINNYA";
              const typeStyle = DEED_TYPE_STYLES[deedType] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };

              return (
                <div 
                  key={entry.id} 
                  className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/deeds/${entry.deedId}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 tracking-tight text-sm block">{entry.repertoriumNumber}</span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                           {format(parseISO(entry.date), "dd MMM yyyy", { locale: localesId })}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2 leading-relaxed">
                    {entry.deed?.title || "—"}
                  </h3>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-[9px] font-black border border-slate-200">
                        {entry.deed?.client?.name?.charAt(0) || "K"}
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 truncate max-w-[120px]">{entry.deed?.client?.name || "—"}</span>
                    </div>
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                      typeStyle.bg, typeStyle.text, typeStyle.border
                    )}>
                      {DEED_TYPE_LABELS[deedType] || deedType}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
