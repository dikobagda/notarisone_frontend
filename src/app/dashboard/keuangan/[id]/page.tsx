"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Receipt,
  Calendar,
  UserCircle2,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Printer,
  Edit,
  Trash2,
  Loader2,
  DollarSign,
  Download,
  X
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface InvoiceItem {
  id: string;
  description: string;
  unitPrice: number;
  taxable: boolean;
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  createdAt: string;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  status: 'DRAFT' | 'UNPAID' | 'PAID' | 'CANCELLED';
  createdAt: string;
  dueDate: string | null;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  client: { name: string; nik: string };
  deed: { title: string; deedNumber: string | null } | null;
  items: InvoiceItem[];
  payments: Payment[];
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Payment recording states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("TRANSFER");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [params.id, session]);

  const fetchInvoice = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId || !params.id) return;

    try {
      const res = await fetch(`/api/billing/invoices/${params.id}`, {
        headers: {
          "X-Tenant-Id": tenantId,
          "Authorization": `Bearer ${(session as any)?.backendToken}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setInvoice(result.data);
      } else {
        toast.error(result.message || "Gagal memuat detail invoice");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const tenantId = (session?.user as any)?.tenantId;
    try {
      const res = await fetch(`/api/billing/invoices/${params.id}`, {
        method: "DELETE",
        headers: {
          "X-Tenant-Id": tenantId,
          "Authorization": `Bearer ${(session as any)?.backendToken}`
        }
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Invoice berhasil dihapus");
        router.push("/dashboard/keuangan");
      } else {
        toast.error(result.message || "Gagal menghapus invoice");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleRecordPayment = async () => {
    const totalPaid = invoice?.payments.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const remaining = Number(invoice?.totalAmount || 0) - totalPaid;

    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toast.error("Masukkan jumlah pembayaran yang valid");
      return;
    }

    if (Number(paymentAmount) > remaining) {
      toast.error(`Nominal melebihi sisa tagihan (Maks: ${formatIDR(remaining)})`);
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const res = await fetch("/api/billing/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(session as any)?.backendToken}`
        },
        body: JSON.stringify({
          invoiceId: params.id,
          amount: Number(paymentAmount),
          method: paymentMethod
        })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Pembayaran berhasil dicatat");
        setIsPaymentModalOpen(false);
        setPaymentAmount("");
        fetchInvoice(); // Refresh data
      } else {
        toast.error(result.message || "Gagal mencatat pembayaran");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const formatIDR = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(val));
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="font-bold text-sm">Memuat detail invoice...</p>
      </div>
    );
  }

  if (!invoice) return null;

  const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Number(invoice.totalAmount) - totalPaid;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Top Navigation & Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="w-fit p-0 h-auto hover:bg-transparent text-slate-400 hover:text-orange-600 transition-colors font-bold text-xs uppercase tracking-widest gap-2"
            onClick={() => router.push("/dashboard/keuangan")}
          >
            <ArrowLeft className="h-3 w-3" /> Kembali ke Keuangan
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">{invoice.invoiceNumber}</h1>
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
              invoice.status === 'PAID' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                invoice.status === 'UNPAID' ? "bg-orange-50 text-orange-600 border border-orange-100" :
                  "bg-slate-50 text-slate-500 border border-slate-200"
            )}>
              {invoice.status}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="rounded-xl font-bold h-11 border-slate-200 hover:bg-slate-50 transition-all gap-2 flex-1 md:flex-initial">
            <Printer className="h-4 w-4" /> Cetak
          </Button>
          <Button
            variant="outline"
            className="rounded-xl font-bold h-11 border-slate-200 hover:bg-slate-50 transition-all gap-2 flex-1 md:flex-initial"
            onClick={() => router.push(`/dashboard/keuangan/${params.id}/edit`)}
          >
            <Edit className="h-4 w-4" /> Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-200">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
              <DropdownMenuItem className="rounded-xl font-bold text-xs gap-2 p-3 cursor-pointer">
                <Download className="h-4 w-4" /> Unduh PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="rounded-xl font-bold text-xs gap-2 p-3 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4" /> Hapus Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Invoice Information */}
        <div className="lg:col-span-2 space-y-8">

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-3xl border-slate-50 shadow-sm ring-1 ring-slate-100 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Klien</p>
                    <h3 className="font-black text-slate-800">{invoice.client.name}</h3>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">NIK / Identitas</span>
                    <span className="text-slate-600 font-bold font-mono">{invoice.client.nik}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-50 shadow-sm ring-1 ring-slate-100 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dokumen Akta</p>
                    <h3 className="font-black text-slate-800">{invoice.deed?.title || "Tidak terikat akta"}</h3>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">No. Akta</span>
                    <span className="text-slate-600 font-bold">{invoice.deed?.deedNumber || "—"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Line Items Table */}
          <Card className="rounded-3xl border-slate-50 shadow-sm ring-1 ring-slate-100">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Receipt className="h-4 w-4 text-orange-600" /> Rincian Tagihan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-y border-slate-100">
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">#</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Layanan</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">PPN</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoice.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.description}</td>
                        <td className="px-6 py-4 text-center">
                          {item.taxable ? (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase ring-1 ring-inset ring-emerald-600/10">11%</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-black uppercase">0%</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-black text-slate-900">{formatIDR(item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <Card className="rounded-3xl border-slate-50 shadow-sm ring-1 ring-slate-100">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Riwayat Pembayaran Internal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="space-y-3">
                  {invoice.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-emerald-900 uppercase tracking-widest">{p.method}</p>
                          <p className="text-[10px] font-bold text-emerald-600/60 mt-0.5">
                            Dicatat pada {format(new Date(p.createdAt), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-emerald-700">{formatIDR(p.amount)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Summary & Status */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-50 shadow-xl ring-1 ring-slate-100 overflow-hidden bg-gradient-to-br from-white to-orange-50/20 sticky top-24">
            <CardHeader className="p-5 border-b border-slate-50 bg-white/50 backdrop-blur-sm">
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Receipt className="h-4 w-4 text-orange-600" /> Ringkasan Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-slate-500 font-bold">
                  <span>Subtotal</span>
                  <span>{formatIDR(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 font-bold">
                  <span>PPN (11%)</span>
                  <span>{formatIDR(invoice.taxAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900 uppercase">Total Tagihan</span>
                  <span className="text-xl font-black text-orange-600 underline decoration-orange-200 decoration-4 underline-offset-4 tracking-tight">
                    {formatIDR(invoice.totalAmount)}
                  </span>
                </div>
              </div>

              {invoice.status !== 'PAID' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Sisa Piutang</span>
                    <span className="text-xs font-black text-amber-700">{formatIDR(remaining)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-amber-200/50 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all duration-1000"
                      style={{ width: `${(totalPaid / Number(invoice.totalAmount)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {invoice.status === 'PAID' ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-900">Lunas</p>
                    <p className="text-[10px] font-bold text-emerald-600/70">Pembayaran penuh telah diterima</p>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full h-12 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/20 gap-2 border-0"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  <DollarSign className="h-4 w-4" /> Catat Pembayaran
                </Button>
              )}

              <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest">Tgl Terbit</label>
                    <p className="text-xs font-bold text-slate-600">{format(new Date(invoice.createdAt), "dd MMMM yyyy", { locale: idLocale })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest">Jatuh Tempo</label>
                    <p className="text-xs font-bold text-slate-600">
                      {invoice.dueDate ? format(new Date(invoice.dueDate), "dd MMMM yyyy", { locale: idLocale }) : "Segera"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="rounded-[2.5rem] bg-white border-0 shadow-2xl p-0 overflow-hidden max-w-md">
          <div className="bg-red-50 p-8 flex flex-col items-center text-center gap-3">
            <div className="h-16 w-16 rounded-3xl bg-red-100 flex items-center justify-center text-red-600 mb-2">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Hapus Invoice?</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">
              Tindakan ini tidak dapat dibatalkan. Seluruh data tagihan dan riwayat pembayaran akan terhapus permanen dari sistem.
            </p>
          </div>
          <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-row items-center justify-end gap-3 px-8">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="font-bold rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 h-11 px-6 transition-all">
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-black rounded-xl px-8 h-11 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Ya, Hapus Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="rounded-3xl bg-white border-0 shadow-2xl p-0 overflow-hidden max-w-lg [&>button]:hidden">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white relative">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute right-4 top-3 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-md transition-all group z-50"
            >
              <X className="h-4 w-4 text-white group-hover:scale-110" />
            </button>
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <DialogHeader className="relative z-10 text-left">
              <DialogTitle className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-white border border-white/30">
                  <DollarSign className="h-5 w-5" />
                </div>
                Catat Pembayaran
              </DialogTitle>
              <DialogDescription className="font-bold text-white/80 pt-1 text-xs">
                Masukkan detail pembayaran yang telah diterima dari klien untuk invoice ini.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <span>Ringkasan Tagihan</span>
                <span className="text-slate-800 font-mono font-black">{invoice.invoiceNumber}</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Tagihan</p>
                  <p className="text-sm font-black text-slate-900">{formatIDR(invoice.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Telah Dibayar</p>
                  <p className="text-sm font-black text-emerald-600">{formatIDR(totalPaid)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-end ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah Pembayaran (IDR)</label>
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">
                  Sisa: {formatIDR(remaining)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">Rp</span>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-14 pl-12 rounded-2xl border-slate-200 font-black text-lg focus:ring-orange-500/20 focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Metode Pembayaran</label>
              <div className="grid grid-cols-3 gap-2">
                {['TRANSFER', 'CASH', 'GATEWAY'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={cn(
                      "h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                      paymentMethod === method
                        ? "bg-orange-600 text-white shadow-md shadow-orange-500/20"
                        : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-row items-center justify-center gap-4 px-8">
            <Button
              variant="ghost"
              onClick={() => setIsPaymentModalOpen(false)}
              className="font-bold rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 h-11 px-8 transition-all"
            >
              Batal
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl px-10 h-11 shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2 mb-2"
              onClick={handleRecordPayment}
              disabled={isSubmittingPayment}
            >
              {isSubmittingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Konfirmasi & Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
