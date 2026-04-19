"use client";

import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  Activity,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BackofficeDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-2 font-medium">Selamat datang kembali, System Admin. Pemantauan platform secara real-time.</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 font-bold px-6 h-12 rounded-xl">
          <Activity className="h-4 w-4" />
          Lihat System Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Tenant</CardTitle>
            <Building2 className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">24</div>
            <div className="flex items-center text-xs text-green-600 font-bold mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% dari bulan lalu
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total User</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">156</div>
            <div className="flex items-center text-xs text-green-600 font-bold mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% dari bulan lalu
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Dokumen Akta</CardTitle>
            <FileText className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">1,204</div>
            <div className="flex items-center text-xs text-green-600 font-bold mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              +24% dari minggu lalu
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Rata-rata Akurasi</CardTitle>
            <UserCheck className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">98.2%</div>
            <div className="flex items-center text-xs text-slate-500 font-bold mt-2">
              Sistem AI Berjalan Normal
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Aktivitas Terbaru Platform</CardTitle>
            <CardDescription>Event audit log lintas tenant secara real-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 text-sm border-b border-slate-50 pb-4 last:border-0">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Activity className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-slate-900 font-semibold truncate leading-none">Pendaftaran Tenant Baru: Kantor Notaris Budi S.</p>
                    <p className="text-slate-500 text-xs mt-1">Status: Menunggu Verifikasi Dokumen</p>
                  </div>
                  <div className="text-xs text-slate-400 font-medium shrink-0">
                    {i * 10} menit yang lalu
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-orange-600 font-bold hover:bg-orange-50">
              Lihat Semua Aktivitas
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Maintenance Info</CardTitle>
            <CardDescription className="text-slate-400">Status core engine NotarisOne</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Database Engine</span>
                <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">Stable</span>
              </div>
              <p className="text-sm font-medium">MySQL Instance 01: Latency 12ms</p>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Storage API</span>
                <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">Stable</span>
              </div>
              <p className="text-sm font-medium">GCS Bucket: 85% Free Space</p>
            </div>

            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-orange-400 text-sm font-bold">Pemberitahuan Sistem</p>
              <p className="text-slate-300 text-xs mt-1">Upgrade server dijadwalkan pada hari Sabtu pukul 02:00 WIB.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
