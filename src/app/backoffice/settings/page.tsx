"use client";

import { useState } from "react";
import { 
  Settings, 
  Save, 
  ShieldAlert, 
  Bell, 
  Globe, 
  Database, 
  Cloud,
  Lock,
  RefreshCw,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [mtMode, setMtMode] = useState(false);
  const [bannerMode, setBannerMode] = useState(true);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-orange-500" />
            Konfigurasi Sistem
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Pengaturan global platform, pemeliharaan, dan parameter sistem keamanan.</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 font-bold px-8 h-12 rounded-xl shadow-lg shadow-orange-500/20">
          <Save className="h-4 w-4" />
          Simpan Perubahan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Platform Status */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                Mode Pemeliharaan (Maintenance)
              </CardTitle>
              <CardDescription className="font-medium">Matikan akses publik untuk perbaikan sistem mendadak.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/30">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-red-700">Aktifkan Maintenance Mode</p>
                  <p className="text-xs text-red-600/70 font-medium">Seluruh tenant tidak akan bisa login ke dashboard mereka.</p>
                </div>
                <Switch 
                  checked={mtMode}
                  onCheckedChange={setMtMode}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Pesan Maintenance</label>
                <Input 
                  placeholder="Contoh: Kami sedang melakukan pemeliharaan sistem rutin..." 
                  className="rounded-xl border-slate-200 h-11"
                  disabled={!mtMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Global Communication */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Pengumuman Global
              </CardTitle>
              <CardDescription className="font-medium">Tampilkan banner notifikasi di seluruh dashboard tenant.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-800">Aktifkan Banner Pengumuman</p>
                  <p className="text-xs text-slate-500 font-medium">Bermanfaat untuk info update fitur atau promo terbaru.</p>
                </div>
                <Switch 
                  checked={bannerMode}
                  onCheckedChange={setBannerMode}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Isi Pengumuman</label>
                <Input 
                  placeholder="Masukkan isi banner..." 
                  className="rounded-xl border-slate-200 h-11 font-medium"
                  defaultValue="🎉 Selamat datang di NotarisOne v1.5! Nikmati fitur manajemen tim terbaru."
                  disabled={!bannerMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Integration Config */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Konfigurasi Integrasi</CardTitle>
              <CardDescription className="font-medium text-slate-500">Koneksi ke third-party service provider.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Google Cloud Path</label>
                    <div className="relative">
                      <Cloud className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input defaultValue="gs://notarisone-prod-deeds" className="pl-9 rounded-lg border-slate-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Auth0 Domain</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input defaultValue="auth.notarisone.id" className="pl-9 rounded-lg border-slate-200" />
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">System Health Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <Globe className="h-4 w-4" /> SSL Certificate
                </span>
                <span className="font-bold text-green-400">Valid (322 Days)</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <Database className="h-4 w-4" /> DB Connections
                </span>
                <span className="font-bold text-slate-200">12 / 100</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" /> Last Backup
                </span>
                <span className="font-bold text-slate-200">2h Ago</span>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100">
             <div className="h-10 w-10 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-4">
                <Info className="h-5 w-5" />
             </div>
             <p className="font-bold text-slate-900">Tips Konfigurasi</p>
             <p className="text-slate-600 text-xs mt-2 leading-relaxed font-medium"> 
                Pastikan Anda mengetest konfigurasi di environment STAGING sebelum menerapkannya di backoffice PRODUCTION. Perubahan status maintenance berdampak instan.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
