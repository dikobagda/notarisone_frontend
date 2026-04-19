"use client";

import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign, 
  ArrowUpRight,
  PieChart,
  Calendar,
  Download
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
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-orange-500" />
            Monitoring Langganan & Billing
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Pantau pendapatan platform dan performa paket langganan secara real-time.</p>
        </div>
        <Button variant="outline" className="gap-2 font-bold border-slate-200 rounded-xl h-12 shadow-sm">
          <Download className="h-4 w-4" />
          Ekspor Laporan Keuangan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <DollarSign className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">Estimasi MRR (Monthly Recurring Revenue)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold italic tracking-tight">Rp 45.200.000</div>
            <div className="flex items-center text-xs text-orange-400 font-bold mt-3">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.4% dari bulan lalu
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Trials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">8 Kantor</div>
            <p className="text-xs text-slate-500 font-medium mt-1">Potensi konversi: 65%</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pelanggan Enterprise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">4 Kantor</div>
            <p className="text-xs text-slate-500 font-medium mt-1">Kontribusi 70% dari total MRR</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Pembayaran Terbaru</CardTitle>
              <CardDescription className="font-medium text-slate-500">Log transaksi harian platform.</CardDescription>
            </div>
            <Button variant="ghost" className="text-orange-500 font-bold hover:bg-orange-50">
              Lihat Semua
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 border-t border-slate-50">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                  <TableHead className="px-6 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Tenant</TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Paket</TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Nominal</TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4].map((i) => (
                  <TableRow key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-none">Kantor Notaris {i === 1 ? 'Ahmad Muzaki' : 'Mitra Legal'}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> 14 Apr 2026, 09:15
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-200 font-bold text-[10px]">{i % 2 === 0 ? 'ENTERPRISE' : 'PROFESSIONAL'}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-slate-900">Rp 2.500.000</span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500 text-white font-bold text-[9px] uppercase tracking-tighter">Berhasil</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader>
            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center mb-2">
              <PieChart className="h-5 w-5 text-orange-600" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900">Distribusi Paket</CardTitle>
            <CardDescription className="font-medium text-slate-500">Pembagian pendapatan per kategori.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-500">Enterprise</span>
                <span className="text-slate-900">Rp 20jt (45%)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-slate-900 h-full w-[45%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-500">Professional</span>
                <span className="text-slate-900">Rp 15jt (35%)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[35%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-500">Starter</span>
                <span className="text-slate-900">Rp 10jt (20%)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full w-[20%]" />
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-50">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Highlight Bulan Ini</p>
                <p className="text-sm font-bold text-slate-900">Pertumbuhan pendaftaran naik 25% dibandingkan kuartal sebelumnya.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
