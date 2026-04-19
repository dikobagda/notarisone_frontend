"use client";

import { useSession } from "next-auth/react";
import { 
  Zap, 
  Shield, 
  Building2, 
  Check, 
  ArrowRight, 
  CreditCard, 
  History,
  Info,
  BadgeCheck,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const plan = (session?.user as any)?.plan || "STARTER";

  const plans = [
    {
      id: "STARTER",
      name: "Starter",
      description: "Untuk Notaris mandiri yang baru mulai.",
      price: "Rp 0",
      period: "/ selamanya",
      icon: Zap,
      color: "emerald",
      features: [
        "1 Notaris & 2 Pegawai",
        "Maksimum 50 Akta/bulan",
        "Manajemen Klien Dasar",
        "Cloud Storage 1GB",
        "Support Standar"
      ]
    },
    {
      id: "PROFESSIONAL",
      name: "Professional",
      description: "Untuk kantor Notaris dengan volume tinggi.",
      price: "Rp 299.000",
      period: "/ bulan",
      icon: Shield,
      color: "violet",
      popular: true,
      features: [
        "5 Notaris & 20 Pegawai",
        "Akta Tanpa Batas",
        "Cloud Storage 50GB",
        "Laporan & Analitik Lanjutan",
        "Integrasi e-Signature",
        "Priority Support"
      ]
    },
    {
      id: "ENTERPRISE",
      name: "Enterprise",
      description: "Solusi kustom untuk jaringan kantor Notaris.",
      price: "Custom",
      period: "",
      icon: Building2,
      color: "amber",
      features: [
        "User Tidak Terbatas",
        "Multi-Kantor & Cabang",
        "Penyimpanan Kustom",
        "Dedicated Account Manager",
        "Audit Log Lengkap",
        "SLA 99.9%"
      ]
    }
  ];

  const currentPlanData = plans.find(p => p.id === plan) || plans[0];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl shadow-slate-200/50 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-500" />
        <div className="relative z-10 flex flex-col gap-2">
          <Badge className="w-fit bg-emerald-500 hover:bg-emerald-500 text-white border-none font-bold px-3 py-1 uppercase tracking-widest text-[10px]">
            Paket Aktif
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Paket {currentPlanData.name}</h1>
          <p className="text-slate-400 font-medium text-sm">
            Kantor Anda saat ini menggunakan paket {currentPlanData.name}. 
            {plan === "STARTER" && " Tingkatkan paket Anda untuk mendapatkan fitur lebih lengkap."}
          </p>
        </div>
        <div className="relative z-10 hidden md:block">
          <currentPlanData.icon className="h-24 w-24 text-emerald-500/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Plan Details & Usage */}
        <div className="lg:col-span-2 space-y-8">
          {/* Usage Metrics */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-bold">Penggunaan Fitur</CardTitle>
                  <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-1">Siklus Penagihan: 14 Mei 2026</CardDescription>
                </div>
                <Badge variant="outline" className="gap-1 border-slate-200 text-slate-500 font-bold px-3">
                  <Info className="h-3 w-3" /> Info Limit
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">Jumlah Akta (Bulan ini)</span>
                  <span className="text-slate-500 font-medium">8 <span className="text-slate-300">/ 50</span></span>
                </div>
                <Progress value={16} className="h-2 bg-slate-100" indicatorClassName="bg-emerald-500" />
                <p className="text-[11px] text-slate-400 font-medium italic">Anda telah menggunakan 16% dari kuota bulanan paket Starter.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">Penyimpanan Cloud</span>
                  <span className="text-slate-500 font-medium">124 MB <span className="text-slate-300">/ 1 GB</span></span>
                </div>
                <Progress value={12} className="h-2 bg-slate-100" indicatorClassName="bg-indigo-500" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">Jumlah Pegawai</span>
                  <span className="text-slate-500 font-medium">2 <span className="text-slate-300">/ 2</span></span>
                </div>
                <Progress value={100} className="h-2 bg-slate-100" indicatorClassName="bg-orange-500" />
                <div className="flex items-center gap-2 bg-orange-500/5 border border-orange-500/10 p-3 rounded-xl mt-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                  <p className="text-xs text-orange-700 font-medium">
                    Limit pegawai tercapai. Tingkatkan ke <strong>Professional</strong> untuk menambah hingga 20 pegawai.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Section */}
          <div>
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Pilih Paket Lain</h2>
              <p className="text-slate-500 text-sm font-medium">Temukan paket yang sesuai dengan pertumbuhan kantor Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.filter(p => p.id !== plan).map((p) => (
                <Card key={p.id} className={`border-none shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${p.popular ? 'ring-2 ring-violet-500/50' : ''}`}>
                  {p.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-violet-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg">
                        Paling Populer
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className={`h-10 w-10 rounded-xl bg-${p.color}-500/10 text-${p.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <p.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl font-bold">{p.name}</CardTitle>
                    <CardDescription className="text-slate-500 font-medium text-xs h-8 leading-relaxed">
                      {p.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900">{p.price}</span>
                      <span className="text-slate-400 text-xs font-medium">{p.period}</span>
                    </div>
                    <ul className="space-y-2">
                      {p.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Check className={`h-3 w-3 text-${p.color}-500 shrink-0`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button className={`w-full h-11 rounded-xl font-bold bg-${p.color}-600 hover:bg-${p.color}-700 gap-2 transition-all`}>
                      Pilih Paket {p.name}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Billing Info & History */}
        <div className="space-y-8">
          {/* Payment Method */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              {plan === "STARTER" ? (
                <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-xs font-medium">Belum ada metode pembayaran yang terdaftar karena Anda menggunakan paket Gratis.</p>
                  <Button variant="outline" className="mt-4 w-full rounded-xl border-slate-200 text-slate-600 font-bold gap-2">
                    <CreditCard className="h-4 w-4" /> Tambah Kartu
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl text-white">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Visa Ending in 4242</p>
                    <p className="text-[10px] text-slate-500 font-medium">Expires 12/28</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Riwayat Penagihan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan === "STARTER" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="h-8 w-8 text-slate-200 mb-2" />
                  <p className="text-slate-400 text-xs font-medium">Tidak ada riwayat transaksi.</p>
                </div>
              ) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 pb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Professional Plan</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">14 Apr 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">Rp 299.000</p>
                      <Badge variant="outline" className="text-[8px] h-4 bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase px-1">Lunas</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            {plan !== "STARTER" && (
              <CardFooter className="pt-0 pb-6 border-t border-slate-50 pt-4 px-6 flex justify-center">
                <Button variant="link" className="text-slate-400 text-xs font-bold hover:text-indigo-600 gap-1">
                  Lihat Semua Riwayat <ArrowRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Support Banner */}
          <div className="bg-indigo-600 rounded-2xl p-6 text-white text-center space-y-4 shadow-lg shadow-indigo-200">
             <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <BadgeCheck className="h-6 w-6 text-indigo-200" />
             </div>
             <div className="space-y-1">
               <p className="font-bold text-lg leading-tight">Butuh Bantuan?</p>
               <p className="text-indigo-200 text-xs font-medium">Tim kami siap membantu optimasi kantor Notaris Anda.</p>
             </div>
             <Button className="w-full bg-white text-indigo-600 hover:bg-slate-100 font-bold rounded-xl border-none">
                Hubungi Konsultan
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
