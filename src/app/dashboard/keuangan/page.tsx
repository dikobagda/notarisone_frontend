"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Plus,
  Search,
  MoreHorizontal,
  Download,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  Loader2,
  CheckCircle2,
  Banknote,
  Briefcase,
  Edit,
  Trash2,
  X
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types mapping backend
type Invoice = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  deedId: string | null;
  status: "UNPAID" | "PARTIAL" | "PAID" | "VOID" | "OVERDUE";
  subtotal: string | number;
  taxAmount: string | number;
  totalAmount: string | number;
  dueDate: string | null;
  createdAt: string;
  client: { name: string };
  deed: { title: string } | null;
  items: any[];
  payments?: any[];
};

export default function KeuanganDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Payment internal tracking state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  // Delete state
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInvoices = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!session?.backendToken || !tenantId) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/billing/invoices", {
        headers: {
          Authorization: `Bearer ${session.backendToken}`,
          "X-Tenant-Id": tenantId
        }
      });
      const result = await res.json();
      if (result.success) {
        setInvoices(result.data);
      }
    } catch (err) {
      toast.error("Gagal memuat data keuangan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchInvoices();
  }, [session]);

  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return;

    const currentPaid = selectedInvoice.payments?.reduce((s, p) => s + Number(p.amount), 0) || 0;
    const remaining = Number(selectedInvoice.totalAmount) - currentPaid;
    const amount = parseFloat(paymentAmount);

    if (amount > remaining) {
      toast.error(`Nominal melebihi sisa tagihan (Maks: ${formatIDR(remaining)})`);
      return;
    }

    setIsPaying(true);
    try {
      const payload = {
        invoiceId: selectedInvoice.id,
        amount: parseFloat(paymentAmount),
        method: "TRANSFER" // Default internal record method
      };

      const res = await fetch("/api/billing/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.backendToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Pembayaran berhasil dicatat");
        setSelectedInvoice(null);
        setPaymentAmount("");
        fetchInvoices();
      } else {
        toast.error(result.message || "Gagal mencatat pembayaran");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsPaying(false);
    }
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/billing/invoices/${invoiceToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.backendToken}`,
          "X-Tenant-Id": (session?.user as any)?.tenantId
        }
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Invoice berhasil dihapus");
        setInvoiceToDelete(null);
        fetchInvoices();
      } else {
        toast.error(result.message || "Gagal menghapus invoice");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsDeleting(false);
    }
  };

  // derived state
  const totalInvoices = invoices.length;

  // Total Revenue = Semua pembayaran yang terkumpul
  const totalRevenue = invoices.reduce((sum, inv) => {
    const paid = inv.payments?.reduce((s, p) => s + Number(p.amount), 0) || 0;
    return sum + paid;
  }, 0);

  // Total Pending = Total Tagihan - Total Terbayar (hanya untuk invoice yang belum lunas/void)
  const totalPending = invoices
    .filter(i => i.status !== "PAID" && i.status !== "VOID")
    .reduce((sum, i) => {
      const paid = i.payments?.reduce((s, p) => s + Number(p.amount), 0) || 0;
      return sum + (Number(i.totalAmount) - paid);
    }, 0);

  const eff = totalInvoices === 0 ? 0 : Math.round((invoices.filter(i => i.status === "PAID").length / totalInvoices) * 100);

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-none px-3 font-bold uppercase tracking-widest text-[9px] py-1 shadow-sm"><CheckCircle2 className="w-3 h-3 mr-1" />Lunas</Badge>;
      case "PARTIAL":
        return <Badge className="bg-blue-500/15 text-blue-600 border-none px-3 font-bold uppercase tracking-widest text-[9px] py-1 shadow-sm">Sebagian</Badge>;
      case "UNPAID":
        return <Badge className="bg-amber-500/15 text-amber-600 border-none px-3 font-bold uppercase tracking-widest text-[9px] py-1 shadow-sm"><AlertCircle className="w-3 h-3 mr-1" />Menunggu</Badge>;
      case "OVERDUE":
        return <Badge className="bg-red-500/15 text-red-600 border-none px-3 font-bold uppercase tracking-widest text-[9px] py-1 shadow-sm">Terlambat</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatIDR = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(val));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Dark Hero Header - Similar to Protocol/Settings for Premium feel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 p-10 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-3xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0 backdrop-blur-md shadow-inner">
              <Banknote className="h-10 w-10 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-orange-500/20 text-[10px] font-black text-orange-300 uppercase tracking-widest border border-orange-500/30">
                  Panel Pembukuan Internal
                </span>
              </div>
              <h1 className="text-3xl font-black text-white leading-tight mb-2 tracking-tight">Kinerja Keuangan</h1>
              <p className="text-sm text-white/50 font-bold max-w-md">
                Kelola pencatatan *invoice*, pantau pembayaran, dan rekapitulasi pendapatan kantor secara real-time.
              </p>
            </div>
          </div>

          <div className="flex shrink-0">
            <Button
              onClick={() => router.push("/dashboard/keuangan/create")}
              className="bg-orange-500 hover:bg-orange-400 text-white font-black h-14 px-8 rounded-2xl shadow-[0_8px_30px_rgb(249,115,22,0.3)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.5)] transition-all border-0 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Buat Invoice Baru
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
          <p className="text-sm font-bold text-slate-500 animate-pulse">Memuat data keuangan...</p>
        </div>
      ) : (
        <>
          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all rounded-3xl ring-1 ring-slate-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest text-emerald-500 border-emerald-100 bg-emerald-50">Diterima</Badge>
                </div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Total Pendapatan</h3>
                <div className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {formatIDR(totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all rounded-3xl ring-1 ring-slate-100 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[50px] pointer-events-none" />
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  </div>
                  <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest text-amber-500 border-amber-100 bg-amber-50">Menunggu</Badge>
                </div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Piutang Belum Tertagih</h3>
                <div className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  {formatIDR(totalPending)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-orange-600 text-white overflow-hidden rounded-3xl relative p-0">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
              <CardContent className="p-6 relative h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-orange-200 uppercase tracking-widest mb-1 mix-blend-plus-lighter">Efisiensi Penagihan</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter drop-shadow-md">{eff}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-orange-950/30 rounded-full mt-6 overflow-hidden backdrop-blur-sm">
                  <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: `${eff}%` }} />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-orange-200 mt-3 mix-blend-plus-lighter">
                  Rasio faktur lunas dari {totalInvoices} total faktur terbit.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* TABLE SECTION */}
          <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-slate-50 bg-slate-50/50">
              <div className="flex flex-col">
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Daftar Invoice Aktif</CardTitle>
                <CardDescription className="font-bold text-slate-500 tracking-tight">
                  Pantau dan kelola rincian tagihan dari klien Anda secara internal.
                </CardDescription>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Cari no. invoice atau klien..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-12 rounded-2xl border-slate-200 text-sm font-bold bg-white focus-visible:ring-orange-500 shadow-sm"
                  />
                </div>
                <Button variant="outline" className="hidden lg:flex gap-2 border-slate-200 rounded-2xl h-12 px-6 font-bold text-slate-600 hover:text-slate-900">
                  <Download className="h-4 w-4" /> Ekspor Laporan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-none">
                      <TableHead className="px-8 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest bg-transparent">Klien & Profil</TableHead>
                      <TableHead className="py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest bg-transparent">Nomor Invoice</TableHead>
                      <TableHead className="py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest bg-transparent">Terkait Akta</TableHead>
                      <TableHead className="py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest bg-transparent">Total Tagihan</TableHead>
                      <TableHead className="py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest bg-transparent">Status</TableHead>
                      <TableHead className="text-right px-8 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest bg-transparent">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                            <FileText className="h-12 w-12 opacity-20" />
                            <p className="font-bold text-sm">Tidak ada dokumen invoice ditemukan.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <TableRow
                          key={inv.id}
                          className="border-b border-slate-50 last:border-0 hover:bg-orange-50/30 transition-colors group cursor-pointer"
                          onClick={() => router.push(`/dashboard/keuangan/${inv.id}`)}
                        >
                          <TableCell className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                                <Briefcase className="h-5 w-5 text-orange-600" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-slate-900 group-hover:text-orange-600 transition-colors">{inv.client?.name || "Klien Dihapus"}</span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ID: {inv.clientId?.split("-")[0]}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="font-black text-slate-700 font-mono tracking-tight">{inv.invoiceNumber}</div>
                            <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 mt-1">
                              <Calendar className="h-3 w-3" /> {formatDate(inv.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex flex-col">
                              {inv.deed ? (
                                <>
                                  <span className="text-xs font-bold text-slate-800">{inv.deed.title}</span>
                                  <span className="text-[10px] font-medium text-slate-400">Terlampir</span>
                                </>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tidak ada</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <span className="font-black text-slate-900 tracking-tight text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{formatIDR(inv.totalAmount)}</span>
                          </TableCell>
                          <TableCell className="py-6">
                            {getStatusBadge(inv.status)}
                          </TableCell>
                          <TableCell className="text-right px-8 py-6" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg">
                                  <MoreHorizontal className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-xl border-slate-100">
                                <DropdownMenuItem
                                  className="rounded-xl font-bold text-xs gap-3 p-3 cursor-pointer"
                                  onClick={() => router.push(`/dashboard/keuangan/${inv.id}`)}
                                >
                                  <FileText className="h-4 w-4 text-slate-400" /> Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="rounded-xl font-bold text-xs gap-3 p-3 cursor-pointer"
                                  onClick={() => router.push(`/dashboard/keuangan/${inv.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4 text-slate-400" /> Ubah Data
                                </DropdownMenuItem>
                                {inv.status !== "PAID" && (
                                  <DropdownMenuItem
                                    className="rounded-xl font-bold text-xs gap-3 p-3 cursor-pointer text-emerald-600 hover:text-emerald-700"
                                    onClick={() => setSelectedInvoice(inv)}
                                  >
                                    <DollarSign className="h-4 w-4" /> Catat Bayar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="rounded-xl font-bold text-xs gap-3 p-3 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setInvoiceToDelete(inv)}
                                >
                                  <Trash2 className="h-4 w-4" /> Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Internal Payment Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-2xl bg-white [&>button]:hidden">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white relative">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute right-4 top-3 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-md transition-all group z-50"
            >
              <X className="h-4 w-4 text-white group-hover:scale-110" />
            </button>
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <DialogTitle className="text-xl font-black mb-0.5">Catat Pembayaran Masuk</DialogTitle>
              <DialogDescription className="text-white/80 font-medium text-xs">
                Status pencatatan pelunasan untuk internal.
              </DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <span>Target Tagihan</span>
                  <span className="text-slate-800 font-mono font-black">{selectedInvoice?.invoiceNumber}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Tagihan</p>
                    <p className="text-sm font-black text-slate-900">{selectedInvoice ? formatIDR(selectedInvoice.totalAmount) : "Rp 0"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Telah Dibayar</p>
                    <p className="text-sm font-black text-emerald-600">
                      {selectedInvoice ? formatIDR(selectedInvoice.payments?.reduce((s, p) => s + Number(p.amount), 0) || 0) : "Rp 0"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex justify-between items-end ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Jumlah Pembayaran (IDR)</label>
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">
                    Sisa: {selectedInvoice ? formatIDR(Number(selectedInvoice.totalAmount) - (selectedInvoice.payments?.reduce((s, p) => s + Number(p.amount), 0) || 0)) : 0}
                  </span>
                </div>
                <Input
                  type="number"
                  placeholder="Masukkan nominal..."
                  className="pl-5 text-xl font-black h-14 rounded-2xl border-slate-200 focus-visible:ring-orange-500 focus-visible:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-row items-center justify-center gap-3 px-8">
            <Button
              variant="ghost"
              onClick={() => setSelectedInvoice(null)}
              className="font-bold rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 h-10 px-6 transition-all text-xs mb-2"
            >
              Batal
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl px-10 h-10 shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-xs mb-2"
              onClick={handleRecordPayment}
              disabled={isPaying || !paymentAmount}
            >
              {isPaying ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <CheckCircle2 className="h-3 w-3 mr-2" />}
              Konfirmasi & Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <DialogContent className="rounded-3xl bg-white border-0 shadow-2xl p-0 overflow-hidden max-w-md [&>button]:hidden">
          <div className="bg-red-50 p-8 flex flex-col items-center text-center gap-3 relative">
            <button
              onClick={() => setInvoiceToDelete(null)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full bg-red-100/50 hover:bg-red-100 flex items-center justify-center transition-all group"
            >
              <X className="h-4 w-4 text-red-600 group-hover:scale-110" />
            </button>
            <div className="h-16 w-16 rounded-3xl bg-red-100 flex items-center justify-center text-red-600 mb-2">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Hapus Invoice?</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">
              Nomor Invoice: <span className="font-black text-red-600 font-mono">{invoiceToDelete?.invoiceNumber}</span><br />
              Tindakan ini permanen dan tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter className="p-6 gap-3 sm:gap-0 bg-white border-t border-slate-50 flex flex-row items-center justify-end px-8">
            <Button variant="ghost" onClick={() => setInvoiceToDelete(null)} className="rounded-xl font-bold text-slate-400 hover:bg-slate-50 h-11 px-6 transition-all">
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl h-11 px-8 shadow-lg shadow-red-500/10 border-0 active:scale-95 transition-all"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

