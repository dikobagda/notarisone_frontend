"use client";

import {
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Search,
  MoreHorizontal,
  Download,
  Calendar,
  AlertCircle
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
import { useRouter } from "next/navigation";

export default function BillingDashboard() {
  const router = useRouter();

  const invoices = [
    {
      id: "1",
      number: "INV/2026/04/001",
      client: "PT Maju Bersama",
      deed: "Pendirian PT",
      amount: 15500000,
      status: "PAID",
      date: "12 Apr 2026"
    },
    {
      id: "2",
      number: "INV/2026/04/002",
      client: "Budi Santoso",
      deed: "Jual Beli Tanah",
      amount: 4200000,
      status: "UNPAID",
      date: "14 Apr 2026"
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Lunas</Badge>;
      case "UNPAID":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-200">Menunggu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Keuangan</h2>
          <p className="text-slate-500 mt-2 font-medium tracking-tight">Manajemen invoice, pembayaran, dan pendapatan kantor.</p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 font-bold px-6 h-12 rounded-xl"
          onClick={() => router.push("/dashboard/billing/create")}
        >
          <Plus className="h-4 w-4" />
          Buat Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pendapatan (Bulan Ini)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">Rp 124.500.000</div>
            <div className="flex items-center text-xs text-green-600 font-bold mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% dari bulan lalu
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Piutang Belum Tertagih</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 text-orange-600">Rp 18.200.000</div>
            <div className="flex items-center text-xs text-slate-500 font-medium mt-2 gap-1">
              <AlertCircle className="h-3 w-3" />
              Dari 5 invoice aktif
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efisiensi Penagihan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">94.2%</div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-orange-500 w-[94.2%]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-bold">Daftar Invoice</CardTitle>
            <CardDescription className="font-medium">Total 24 invoice ditemukan.</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Cari invoice/klien..." className="pl-9 h-10 rounded-xl border-slate-200 text-sm" />
            </div>
            <Button variant="outline" className="gap-2 border-slate-200 rounded-xl font-bold">
              <Download className="h-4 w-4" /> Ekspor
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 border-t border-slate-50">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                <TableHead className="px-6 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">No. Invoice</TableHead>
                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Klien & Akta</TableHead>
                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total Tagihan</TableHead>
                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                <TableHead className="text-right px-6 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                  <TableCell className="px-6 py-5">
                    <div className="font-bold text-slate-900">{inv.number}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" /> {inv.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{inv.client}</span>
                      <span className="text-xs text-slate-500 font-medium">{inv.deed}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-slate-900">Rp {inv.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(inv.status)}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Button variant="ghost" size="icon" className="hover:bg-white border-transparent hover:border-slate-100 border">
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
