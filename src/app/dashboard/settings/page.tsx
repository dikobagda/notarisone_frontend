"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  ShieldCheck,
  Building2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Settings,
  Lock,
  MapPin,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Unlink,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";

type Tab = "profile" | "security" | "office" | "google";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [profileData, setProfileData] = useState({ name: "", email: "", phone: "" });
  const [securityData, setSecurityData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [officeData, setOfficeData] = useState({ name: "", address: "" });
  const [googleStatus, setGoogleStatus] = useState<{ isConnected: boolean; email: string | null }>({ isConnected: false, email: null });
  const [isGoogleStatusLoading, setIsGoogleStatusLoading] = useState(false);

  const fetchData = async () => {
    if (!session?.backendToken) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.backendToken}` }
      });
      const result = await res.json();
      if (result.success) {
        setProfileData({
          name: result.data.user.name,
          email: result.data.user.email,
          phone: result.data.user.phone || ""
        });
        setOfficeData({
          name: result.data.tenant.name,
          address: result.data.tenant.address || ""
        });
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGoogleStatus = async () => {
    if (!session?.backendToken) return;
    try {
      setIsGoogleStatusLoading(true);
      const res = await fetch("/api/google/status", {
        headers: { Authorization: `Bearer ${session.backendToken}` }
      });
      const result = await res.json();
      if (result.success) {
        setGoogleStatus(result.data);
      }
    } catch (err) {
      console.error("Fetch Google status error:", err);
    } finally {
      setIsGoogleStatusLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
      fetchGoogleStatus();
    }
  }, [session]);

  const handleLinkGoogle = () => {
    // Set cookie as a bridge for NextAuth to know which user were linking
    document.cookie = `notarisone-link-userid=${(session?.user as any)?.id}; path=/; max-age=600`;
    signIn('google', { callbackUrl: window.location.href });
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm("Putuskan integrasi Google Workspace? Sinkronisasi otomatis dan pengeditan draf via Google Docs tidak akan berjalan lagi.")) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/google/disconnect", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.backendToken}` }
      });
      const result = await res.json();
      if (result.success) {
        setSuccessMessage("Integrasi Google berhasil diputuskan");
        setGoogleStatus({ isConnected: false, email: null });
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan sistem saat memutuskan integrasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.backendToken}`
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        })
      });
      const result = await res.json();
      if (result.success) {
        setSuccessMessage("Profil berhasil diperbarui");
        // Update local session to reflect new name/email if needed
        await updateSession();
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      return setErrorMessage("Konfirmasi password tidak cocok");
    }

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.backendToken}`
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword
        })
      });
      const result = await res.json();
      if (result.success) {
        setSuccessMessage("Password berhasil diperbarui");
        setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/profile/tenant", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.backendToken}`
        },
        body: JSON.stringify({ name: officeData.name, address: officeData.address })
      });
      const result = await res.json();
      if (result.success) {
        setSuccessMessage("Informasi kantor berhasil diperbarui");
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-indigo-50 border-2 border-indigo-100" />
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 absolute top-5 left-5" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-black text-slate-700 text-sm italic">Memuat pengaturan Anda...</p>
          <p className="text-xs text-slate-400 animate-pulse">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  const isNotaris = (session?.user as any)?.role === "NOTARIS";

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Breadcrumb */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors w-fit group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Dashboard
      </Link>

      {/* Dark Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-10 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 backdrop-blur-md shadow-inner">
              <Settings className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-[9px] font-black text-indigo-300 uppercase tracking-widest border border-indigo-500/30">
                  Settings / Configuration
                </span>
              </div>
              <h1 className="text-3xl font-black text-white leading-tight mb-2">Pengaturan Akun</h1>
              <p className="text-xs text-white/40 font-bold max-w-sm">
                Kelola informasi personal, keamanan akun, dan konfigurasi kantor Anda di sini.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-white/5 p-4 rounded-xl backdrop-blur-md border border-white/10 hidden md:flex">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Login Terakhir</p>
              <p className="text-sm font-bold text-white uppercase">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-4">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          {[
            { id: "profile", label: "Profil Saya", icon: User, desc: "Info personal & email" },
            { id: "security", label: "Keamanan", icon: ShieldCheck, desc: "Password & keamanan" },
            { id: "google", label: "Integrasi Google", icon: Calendar, desc: "Calendar & Docs" },
            ...(isNotaris ? [{ id: "office", label: "Info Kantor", icon: Building2, desc: "Detail agensi & alamat" }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as Tab);
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl transition-all group text-left",
                activeTab === tab.id
                  ? "bg-white shadow-xl shadow-slate-200/50 border border-slate-100 ring-4 ring-indigo-50"
                  : "hover:bg-slate-50 border border-transparent"
              )}
            >
              <div className={cn(
                "h-10 w-10 flex items-center justify-center rounded-xl transition-all shadow-sm",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
              )}>
                <tab.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className={cn(
                  "text-sm font-black transition-colors uppercase tracking-tight",
                  activeTab === tab.id ? "text-slate-900" : "text-slate-500"
                )}>
                  {tab.label}
                </p>
                <p className="text-[10px] text-slate-400 font-bold truncate italic">{tab.desc}</p>
              </div>
              {activeTab === tab.id && <ChevronRight className="h-4 w-4 text-indigo-400" />}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div className="md:col-span-3 space-y-6">
          {successMessage && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="text-sm font-bold">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl animate-in fade-in zoom-in duration-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-bold">{errorMessage}</p>
            </div>
          )}

          <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden p-0">
            <CardContent className="p-8 md:p-12">
              {activeTab === "profile" && (
                <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-2xl">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <User className="h-6 w-6 text-indigo-500" /> Profil Saya
                    </h3>
                    <p className="text-sm text-slate-400 font-medium italic">Data ini digunakan untuk identifikasi Anda di dalam platform.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="h-12 rounded-2xl border-slate-200 font-bold text-slate-800 focus:ring-indigo-500"
                        placeholder="Nama Anda"
                        required
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Utama</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="h-12 pl-11 rounded-2xl border-slate-200 font-bold text-slate-800 focus:ring-indigo-500"
                          placeholder="email@kantornotaris.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nomor Handphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="h-12 pl-11 rounded-2xl border-slate-200 font-bold text-slate-800 focus:ring-indigo-500"
                          placeholder="0812xxxx"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-200 border-0 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === "security" && (
                <form onSubmit={handleUpdatePassword} className="space-y-8 max-w-2xl">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-indigo-500" /> Keamanan Akun
                    </h3>
                    <p className="text-sm text-slate-400 font-medium italic">Pastikan password Anda kuat dan diganti secara berkala.</p>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password Saat Ini</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input
                          type="password"
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="h-12 pl-11 rounded-2xl border-slate-200 font-bold focus:ring-indigo-500"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password Baru</Label>
                        <Input
                          type="password"
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="h-12 rounded-xl border-slate-200 font-bold focus:ring-indigo-500"
                          placeholder="Minimal 8 karakter"
                          required
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Konfirmasi Pass Baru</Label>
                        <Input
                          type="password"
                          value={securityData.confirmPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="h-12 rounded-xl border-slate-200 font-bold focus:ring-indigo-500"
                          placeholder="Ulangi password baru"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-200 border-0 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      Perbarui Password
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === "google" && (
                <div className="space-y-8 max-w-2xl">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <Calendar className="h-6 w-6 text-indigo-500" /> Integrasi Google Workspace
                    </h3>
                    <p className="text-sm text-slate-400 font-medium italic">Hubungkan akun Google Anda untuk sinkronisasi jadwal akta secara otomatis dan integrasi Google Docs Editor.</p>
                  </div>

                  <Card className={cn(
                    "rounded-2xl border-2 transition-all p-6",
                    googleStatus.isConnected 
                      ? "bg-emerald-50/50 border-emerald-100 shadow-sm" 
                      : "bg-slate-50 border-slate-100"
                  )}>
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                        googleStatus.isConnected ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-300 border border-slate-200"
                      )}>
                        <Calendar className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-slate-800 uppercase tracking-tight">Koneksi Google Aktif</h4>
                          {googleStatus.isConnected && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-[8px] font-black text-white uppercase tracking-widest">Aktif</span>
                          )}
                        </div>
                        {googleStatus.isConnected ? (
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-500">Terhubung dengan:</p>
                            <p className="text-sm font-black text-slate-800">{googleStatus.email}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Aktifkan integrasi ini untuk menambahkan jadwal ke Google Calendar secara otomatis dan mengedit draf langsung via Google Docs.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/50 flex justify-end gap-3">
                      {googleStatus.isConnected ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleDisconnectGoogle}
                            disabled={isSubmitting}
                            className="h-11 px-6 rounded-xl border-red-100 text-red-500 font-black hover:bg-red-50 hover:text-red-600 transition-all text-[11px] uppercase tracking-widest gap-2 bg-white"
                          >
                            <Unlink className="h-3.5 w-3.5" /> Putus Hubungan
                          </Button>
                          <Button
                            variant="outline"
                            onClick={fetchGoogleStatus}
                            disabled={isGoogleStatusLoading}
                            className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-black hover:bg-slate-50 transition-all text-[11px] uppercase tracking-widest gap-2 bg-white"
                          >
                            <RefreshCw className={cn("h-3.5 w-3.5", isGoogleStatusLoading && "animate-spin")} /> Refresh Status
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={handleLinkGoogle}
                          disabled={isSubmitting}
                          className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-100 border-0 transition-all flex items-center gap-2 text-xs"
                        >
                          <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Hubungkan Google Workspace
                        </Button>
                      )}
                    </div>
                  </Card>

                  <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-4">
                    <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-indigo-900 uppercase tracking-tight">Penting</p>
                      <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                        Kami hanya meminta akses untuk mengelola kalender (Events) untuk sinkronisasi jadwal kalender dan pengelolaan File di Google Drive khusus untuk draf akta aplikasi ini. Data lain dalam akun Google Anda tetap bersifat pribadi.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "office" && isNotaris && (
                <form onSubmit={handleUpdateOffice} className="space-y-8 max-w-2xl">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <Building2 className="h-6 w-6 text-indigo-500" /> Identitas Kantor
                    </h3>
                    <p className="text-sm text-slate-400 font-medium italic">Informasi ini akan muncul pada dokumen yang Anda terbitkan.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Kantor Notaris/PPAT</Label>
                      <Input
                        value={officeData.name}
                        onChange={(e) => setOfficeData(prev => ({ ...prev, name: e.target.value }))}
                        className="h-12 rounded-xl border-slate-200 font-bold text-slate-800 focus:ring-indigo-500"
                        placeholder="Contoh: Kantor Notaris Budi Santoso, S.H., M.Kn."
                        required
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Alamat Resmi Kantor</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
                        <textarea
                          value={officeData.address}
                          onChange={(e) => setOfficeData(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full min-h-[120px] p-4 pl-11 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-medium placeholder:text-slate-300 resize-none"
                          placeholder="Alamat lengkap kantor..."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-200 border-0 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                      Simpan Info Kantor
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="text-[11px] text-slate-400 font-bold italic px-8 text-center uppercase tracking-[0.2em] opacity-40">
            Securely managed by NotarisOne Infrastructure &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
