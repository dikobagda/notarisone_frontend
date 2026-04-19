"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Mail, 
  MapPin,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    officeName: "",
    address: "",
    notaryName: "",
    notaryEmail: "",
  });

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Onboarding Berhasil!</h2>
          <p className="text-slate-500 mt-2 font-medium max-w-md">
            Kantor <strong>{formData.officeName}</strong> telah terdaftar. 
            Undangan aktivasi akun Notaris telah dikirimkan ke <strong>{formData.notaryEmail}</strong>.
          </p>
        </div>
        <div className="flex gap-4 mt-4">
          <Button 
            className="bg-orange-500 hover:bg-orange-600 font-bold px-8 h-12 rounded-xl"
            onClick={() => router.push("/backoffice/tenants")}
          >
            Kembali ke Daftar Tenant
          </Button>
          <Button variant="outline" className="font-bold px-8 h-12 rounded-xl border-slate-200">
            Cetak Ringkasan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Onboarding Tenant Baru</h1>
        <p className="text-slate-500 font-medium tracking-tight">Daftarkan kantor Notaris dan aktivasi lisensi perdana dalam hitungan menit.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between px-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: step === 1 ? '50%' : '100%' }}
        />
        
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all duration-300",
            step >= 1 ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-white text-slate-400 border-2 border-slate-100"
          )}>
            {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : "1"}
          </div>
          <span className={cn("text-xs font-bold uppercase tracking-widest", step >= 1 ? "text-orange-600" : "text-slate-400")}>Kantor</span>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all duration-300",
            step === 2 ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-white text-slate-400 border-2 border-slate-100"
          )}>
            2
          </div>
          <span className={cn("text-xs font-bold uppercase tracking-widest", step === 2 ? "text-orange-600" : "text-slate-400")}>Notaris</span>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardContent className="p-10">
          {step === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" />
                  Informasi Kantor
                </h3>
                <p className="text-sm font-medium text-slate-500 tracking-tight">Masukkan detail resmi kantor Notaris yang akan didaftarkan.</p>
              </div>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nama Kantor Notaris <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="Contoh: Kantor Notaris Ahmad, S.H." 
                    className="h-12 px-4 rounded-xl border-slate-200 focus:ring-orange-500 transition-all font-medium" 
                    value={formData.officeName}
                    onChange={(e) => updateForm("officeName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Alamat Lengkap</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                    <textarea 
                      placeholder="Masukkan alamat kantor..."
                      className="w-full min-h-[120px] pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium text-sm"
                      value={formData.address}
                      onChange={(e) => updateForm("address", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" />
                  Profil Notaris Utama
                </h3>
                <p className="text-sm font-medium text-slate-500 tracking-tight">Akun ini akan menjadi administrator utama bagi kantor tersebut.</p>
              </div>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nama Lengkap Notaris <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="Masukkan nama lengkap beserta gelar" 
                    className="h-12 px-4 rounded-xl border-slate-200 focus:ring-orange-500 transition-all font-medium" 
                    value={formData.notaryName}
                    onChange={(e) => updateForm("notaryName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Kerja Notaris <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="email@notarisone.id" 
                      className="h-12 pl-12 pr-4 rounded-xl border-slate-200 focus:ring-orange-500 transition-all font-medium" 
                      value={formData.notaryEmail}
                      onChange={(e) => updateForm("notaryEmail", e.target.value)}
                    />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3 mt-4">
                  <ShieldCheck className="h-5 w-5 text-orange-600 shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    User ini akan otomatis mendapatkan role <strong>NOTARIS</strong> dengan akses penuh ke sistem manajemen repertorium dan akta.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-50">
            {step === 1 ? (
              <div />
            ) : (
              <Button 
                variant="ghost" 
                className="font-bold text-slate-500 hover:text-slate-900 gap-2"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" /> Kembali
              </Button>
            )}

            {step === 1 ? (
              <Button 
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-8 rounded-xl gap-2 transition-all active:scale-95"
                disabled={!formData.officeName}
                onClick={handleNext}
              >
                Langkah Selanjutnya <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 px-8 rounded-xl gap-2 transition-all active:scale-95 min-w-[180px] shadow-lg shadow-orange-500/20"
                disabled={!formData.notaryName || !formData.notaryEmail || loading}
                onClick={handleSubmit}
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</> : "Selesaikan Registrasi"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
        Platform Management System • Securing Legal Documents
      </p>
    </div>
  );
}
