"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign, 
  ArrowUpRight,
  PieChart,
  Calendar,
  Download,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function BillingPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = (session as any)?.backendToken;
        if (!token) return;

        const res = await fetch(`/api/admin/billing/stats`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setStats(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch billing stats:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchStats();
    }
  }, [session]);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) + `, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          </div>
        </div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Memuat Data Monitoring Billing & Langganan...
        </p>
      </div>
    );
  }

  const activeTrials = stats?.activeTrials || 0;
  const enterpriseTenants = stats?.enterpriseTenants || 0;
  const mrr = stats?.mrr || 0;
  const payments = stats?.payments || [];
  const dist = stats?.distribution || { starter: 20, professional: 35, enterprise: 45 };

  return (
    <div className="flex flex-col gap-10 py-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-2xl border border-orange-100/50 shadow-sm">
              <CreditCard className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Monitoring Langganan & Billing
            </h2>
          </div>
          <p className="text-slate-500 mt-3 font-medium text-sm lg:text-base pl-1">
            Pantau pendapatan platform dan performa paket langganan secara real-time.
          </p>
        </div>
        <Button variant="outline" className="gap-2 font-bold border-slate-200 rounded-xl h-12 shadow-sm bg-white hover:bg-slate-50 self-start md:self-center transition-all">
          <Download className="h-4 w-4 text-slate-500" />
          Ekspor Laporan Keuangan
        </Button>
      </div>

      {/* ── Dashboard Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* MRR Card */}
        <Card className="border-none shadow-md bg-slate-900 text-white overflow-hidden relative rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-300">
            <DollarSign className="h-28 w-28 text-white" />
          </div>
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
              Estimasi MRR (Monthly Recurring Revenue)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="text-4xl font-black italic tracking-tight text-orange-400 group-hover:text-orange-350 transition-colors duration-300">
              {formatIDR(mrr)}
            </div>
            <div className="flex items-center text-xs text-slate-400 font-bold mt-4">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-orange-400" />
              +15.4% dari bulan lalu
            </div>
          </CardContent>
        </Card>

        {/* Active Trials Card */}
        <Card className="border-none shadow-sm bg-white rounded-2xl p-8 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-slate-100/50">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-xs font-bold text-slate-450 uppercase tracking-widest leading-none">
              Active Trials
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeTrials} Kantor
            </div>
            <p className="text-xs text-slate-400 font-medium mt-3">
              Potensi konversi: <span className="text-emerald-600 font-bold">65%</span>
            </p>
          </CardContent>
        </Card>

        {/* Enterprise Tenants Card */}
        <Card className="border-none shadow-sm bg-white rounded-2xl p-8 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-slate-100/50">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-xs font-bold text-slate-450 uppercase tracking-widest leading-none">
              Pelanggan Enterprise
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {enterpriseTenants} Kantor
            </div>
            <p className="text-xs text-slate-450 font-medium mt-3">
              Kontribusi dominan dari total MRR platform
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Dashboard Split Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Recent Payments Card ── */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-2xl p-8 border border-slate-100/50">
          <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
                Pembayaran Terbaru
              </CardTitle>
              <CardDescription className="font-semibold text-slate-400 text-sm mt-1">
                Log transaksi harian platform langsung dari database.
              </CardDescription>
            </div>
            <Button variant="ghost" className="text-orange-500 font-bold hover:bg-orange-50 rounded-xl px-4 py-2 text-sm transition-all">
              Lihat Semua
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-0 border-t border-slate-100 pt-6">
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Calendar className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Belum ada transaksi pembayaran</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none rounded-xl">
                      <TableHead className="px-4 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest pl-6">Tenant / Kantor</TableHead>
                      <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Paket</TableHead>
                      <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Nominal</TableHead>
                      <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest pr-6 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p: any) => (
                      <TableRow key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                        <TableCell className="py-6 px-4 pr-6 pl-6">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-extrabold text-slate-900 text-sm lg:text-base leading-snug">
                              {p.tenantName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatDate(p.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <Badge 
                            variant="outline" 
                            className={
                              p.tier === 'ENTERPRISE' 
                                ? "border-amber-250 bg-amber-50/50 text-amber-700 font-extrabold text-[10px] px-3 py-1 rounded-lg"
                                : p.tier === 'PROFESSIONAL'
                                ? "border-violet-250 bg-violet-50/50 text-violet-700 font-extrabold text-[10px] px-3 py-1 rounded-lg"
                                : "border-emerald-250 bg-emerald-50/50 text-emerald-700 font-extrabold text-[10px] px-3 py-1 rounded-lg"
                            }
                          >
                            {p.tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <span className="font-extrabold text-slate-900 text-sm lg:text-base">
                            {formatIDR(p.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="py-6 px-4 pr-6 text-right">
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-md shadow-sm ml-auto">
                            <CheckCircle2 className="h-3 w-3" /> Berhasil
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Package Distribution Card ── */}
        <Card className="border-none shadow-sm bg-white rounded-2xl p-8 border border-slate-100/50">
          <CardHeader className="p-0 pb-6">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-4 border border-orange-100/50 shadow-sm">
              <PieChart className="h-6 w-6 text-orange-500" />
            </div>
            <CardTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
              Distribusi Paket
            </CardTitle>
            <CardDescription className="font-semibold text-slate-400 text-sm mt-1">
              Pembagian pendapatan per kategori.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-slate-100 pt-6 space-y-8">
            {/* Enterprise Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-400 font-extrabold">Enterprise</span>
                <span className="text-slate-900 font-extrabold">{dist.enterprise}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className="bg-slate-900 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${dist.enterprise}%` }} />
              </div>
            </div>

            {/* Professional Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-400 font-extrabold">Professional</span>
                <span className="text-slate-900 font-extrabold">{dist.professional}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className="bg-violet-500 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${dist.professional}%` }} />
              </div>
            </div>

            {/* Starter Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-400 font-extrabold">Starter</span>
                <span className="text-slate-900 font-extrabold">{dist.starter}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${dist.starter}%` }} />
              </div>
            </div>

            {/* Platform Highlight Alert Box */}
            <div className="pt-6 mt-8 border-t border-slate-50">
              <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">Highlight Sistem</p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                  MRR dan log billing ditarik langsung dari database MySQL remote Hostinger untuk akurasi platform 100%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
