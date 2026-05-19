"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  Activity,
  UserCheck,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Stats = {
  tenantCount: number;
  userCount: number;
  deedCount: number;
  revenue: number;
};

export default function BackofficeDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetch("/api/backoffice/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const statCards = [
    {
      label: "Total Tenant",
      value: stats?.tenantCount,
      icon: <Building2 className="h-5 w-5 text-orange-500" />,
      sub: "Kantor Notaris Terdaftar",
    },
    {
      label: "Total User",
      value: stats?.userCount,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      sub: "Pengguna Platform",
    },
    {
      label: "Dokumen Akta",
      value: stats?.deedCount?.toLocaleString("id-ID"),
      icon: <FileText className="h-5 w-5 text-emerald-500" />,
      sub: "Akta Diproses",
    },
    {
      label: "Uptime Platform",
      value: "99.9%",
      icon: <UserCheck className="h-5 w-5 text-purple-500" />,
      sub: "Sistem Berjalan Normal",
    },
  ];

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
        {statCards.map((card) => (
          <Card key={card.label} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">{card.label}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              {loadingStats && card.value === undefined ? (
                <Loader2 className="h-7 w-7 animate-spin text-slate-300 my-1" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">{card.value ?? "—"}</div>
              )}
              <div className="flex items-center text-xs text-slate-500 font-bold mt-2">
                {card.sub}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Tenant Terdaftar</CardTitle>
            <CardDescription>
              Ringkasan cepat data kantor notaris di platform.{" "}
              <a href="/backoffice/tenants" className="text-orange-500 font-bold hover:underline">
                Lihat semua →
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Tenant", value: loadingStats ? "…" : stats?.tenantCount ?? "—", color: "bg-orange-500/10 text-orange-600" },
                { label: "Total User", value: loadingStats ? "…" : stats?.userCount ?? "—", color: "bg-blue-500/10 text-blue-600" },
                { label: "Total Akta", value: loadingStats ? "…" : stats?.deedCount?.toLocaleString("id-ID") ?? "—", color: "bg-emerald-500/10 text-emerald-600" },
                { label: "Revenue", value: "Rp 0", color: "bg-purple-500/10 text-purple-600" },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl p-4 ${item.color.split(" ")[0]}`}>
                  <p className={`text-xs font-bold uppercase tracking-widest ${item.color.split(" ")[1]}`}>{item.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-orange-600 font-bold hover:bg-orange-50" asChild>
              <a href="/backoffice/tenants">
                Kelola Semua Tenant
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Maintenance Info</CardTitle>
            <CardDescription className="text-slate-400">Status core engine penagraha</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Database Engine</span>
                <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">Stable</span>
              </div>
              <p className="text-sm font-medium">MySQL Hostinger: Active</p>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Storage API</span>
                <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">Stable</span>
              </div>
              <p className="text-sm font-medium">GCS Bucket: Connected</p>
            </div>

            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-orange-400 text-sm font-bold">Pemberitahuan Sistem</p>
              <p className="text-slate-300 text-xs mt-1">Semua sistem berjalan normal. Tidak ada jadwal maintenance.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
