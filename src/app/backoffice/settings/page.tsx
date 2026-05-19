"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { 
  Settings, 
  Save, 
  ShieldAlert, 
  Bell, 
  Globe, 
  Database, 
  RefreshCw,
  Info,
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // System Settings States
  const [mtMode, setMtMode] = useState(false);
  const [mtMsg, setMtMsg] = useState("");
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [logoUrl, setLogoUrl] = useState("/logo-penagraha.png");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = (session as any)?.backendToken;
        if (!token) return;

        const res = await fetch(`/api/admin/settings`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            setMtMode(data.maintenanceMode);
            setMtMsg(data.maintenanceMsg);
            setBannerActive(data.bannerActive);
            setBannerText(data.bannerText);
            setLogoUrl(data.logoUrl || "/logo-penagraha.png");
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        toast.error("Gagal memuat konfigurasi dari database");
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchSettings();
    }
  }, [session]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran logo maksimal adalah 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoUrl(base64String);
      toast.success("Preview logo diperbarui! Klik Simpan Perubahan untuk menyimpan ke database.");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const token = (session as any)?.backendToken;
      if (!token) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        return;
      }

      const res = await fetch(`/api/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          maintenanceMode: mtMode,
          maintenanceMsg: mtMsg,
          bannerActive: bannerActive,
          bannerText: bannerText,
          logoUrl: logoUrl
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Konfigurasi sistem berhasil disimpan ke database remote Hostinger!");
      } else {
        toast.error(json.message || "Gagal menyimpan konfigurasi sistem");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("Terjadi kesalahan jaringan saat menyimpan konfigurasi");
    } finally {
      setIsSaving(false);
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
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Memuat Konfigurasi Sistem...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 py-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-2xl border border-orange-100/50 shadow-sm">
              <Settings className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Konfigurasi Sistem
            </h2>
          </div>
          <p className="text-slate-500 mt-3 font-medium text-sm lg:text-base pl-1">
            Pengaturan global platform, logo branding, pemeliharaan, dan parameter sistem keamanan.
          </p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 font-bold px-8 h-12 rounded-xl shadow-lg shadow-orange-500/20 self-start md:self-center transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Logo Configuration Card */}
          <Card className="border-none shadow-sm bg-white rounded-2xl p-8 border border-slate-100/50">
            <CardHeader className="p-0 pb-6 border-b border-slate-50">
              <CardTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <div className="p-2 bg-orange-50 text-orange-500 rounded-xl border border-orange-100/50 shadow-sm">
                  <ImageIcon className="h-5 w-5" />
                </div>
                Logo Platform & Branding
              </CardTitle>
              <CardDescription className="font-semibold text-slate-400 text-sm mt-1">
                Unggah dan atur gambar logo resmi platform penagraha.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Logo Frame Preview */}
                <div className="h-32 w-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={logoUrl} 
                      alt="Logo Platform" 
                      className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-350"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  )}
                </div>

                {/* Upload & Actions */}
                <div className="flex-1 space-y-4">
                  <p className="text-sm font-bold text-slate-800">Ubah Logo Utama Platform</p>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-md">
                    Gunakan file dengan rasio kotak atau lanskap tipis. Format yang didukung adalah PNG atau JPG dengan ukuran maksimal 2 Megabytes.
                  </p>
                  <div className="flex gap-3">
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/png, image/jpeg"
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2 font-bold border-slate-200 rounded-xl h-11 shadow-sm bg-white hover:bg-slate-50 transition-all text-xs lg:text-sm"
                    >
                      <Upload className="h-4 w-4 text-slate-500" />
                      Unggah Logo Baru
                    </Button>
                    {logoUrl !== "/logo-penagraha.png" && (
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          setLogoUrl("/logo-penagraha.png");
                          toast.success("Logo di-reset ke aset default.");
                        }}
                        className="gap-2 font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-11 transition-all text-xs lg:text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        Reset Default
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Mode Card */}
          <Card className="border-none shadow-sm bg-white rounded-2xl p-8 border border-slate-100/50">
            <CardHeader className="p-0 pb-6 border-b border-slate-50">
              <CardTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <div className="p-2 bg-red-50 text-red-500 rounded-xl border border-red-100/50 shadow-sm">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                Mode Pemeliharaan (Maintenance)
              </CardTitle>
              <CardDescription className="font-semibold text-slate-400 text-sm mt-1">
                Matikan akses publik untuk pemeliharaan atau perbaikan sistem krusial.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6 space-y-6">
              <div className="flex items-center justify-between p-5 rounded-2xl border border-red-100 bg-red-50/20">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-red-800">Aktifkan Maintenance Mode</p>
                  <p className="text-xs text-red-600/70 font-medium leading-relaxed max-w-sm">
                    Seluruh tenant tidak akan dapat melakukan login ke dashboard kerja selama status ini aktif.
                  </p>
                </div>
                <Switch 
                  checked={mtMode}
                  onCheckedChange={setMtMode}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-extrabold text-slate-800">Pesan Pengguna Maintenance</label>
                <Input 
                  value={mtMsg}
                  onChange={(e) => setMtMsg(e.target.value)}
                  placeholder="Contoh: Kami sedang melakukan pemeliharaan sistem rutin..." 
                  className="rounded-xl border-slate-200 h-12 shadow-sm font-medium"
                  disabled={!mtMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Global Announcement Card */}
          <Card className="border-none shadow-sm bg-white rounded-2xl p-8 border border-slate-100/50">
            <CardHeader className="p-0 pb-6 border-b border-slate-50">
              <CardTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <div className="p-2 bg-orange-50 text-orange-500 rounded-xl border border-orange-100/50 shadow-sm">
                  <Bell className="h-5 w-5" />
                </div>
                Pengumuman Global Platform
              </CardTitle>
              <CardDescription className="font-semibold text-slate-400 text-sm mt-1">
                Tampilkan banner promosi atau pembaruan di seluruh dashboard tenant.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6 space-y-6">
              <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">Aktifkan Banner Pengumuman</p>
                  <p className="text-xs text-slate-400 font-medium">
                    Sangat berguna untuk menyebarkan rilis fitur baru atau update ketentuan.
                  </p>
                </div>
                <Switch 
                  checked={bannerActive}
                  onCheckedChange={setBannerActive}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-extrabold text-slate-800">Isi Pesan Pengumuman</label>
                <Input 
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="Masukkan isi banner pengumuman global..." 
                  className="rounded-xl border-slate-200 h-12 shadow-sm font-medium"
                  disabled={!bannerActive}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side Sidebar Info Panel */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-slate-900 text-white rounded-2xl p-8 overflow-hidden relative">
            <CardHeader className="p-0 pb-4 border-b border-slate-800">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                System Health Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-6 space-y-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-orange-400" /> SSL Certificate
                </span>
                <span className="font-extrabold text-green-400">Valid (322 Days)</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <Database className="h-4 w-4 text-orange-400" /> DB Connection Pool
                </span>
                <span className="font-extrabold text-slate-200">12 / 100</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-orange-400" /> Auto-Backup Schedule
                </span>
                <span className="font-extrabold text-slate-200">2h Ago (Successful)</span>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-100">
             <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 border border-orange-200/50 flex items-center justify-center mb-4">
                <Info className="h-5 w-5" />
             </div>
             <p className="font-bold text-slate-900">Petunjuk Konfigurasi</p>
             <p className="text-slate-600 text-xs mt-3 leading-relaxed font-medium"> 
                Perubahan pada halaman Konfigurasi Sistem ini bersifat instan dan langsung mempengaruhi fungsionalitas publik. Modifikasi pada status Pemeliharaan akan langsung mencegah akses masuk bagi semua client notaris yang aktif.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
