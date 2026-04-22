"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getApiUrl } from "@/lib/api";
import { 
  Loader2, 
  Check, 
  Building2, 
  ShieldCheck, 
  UserPlus, 
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token undangan tidak ditemukan.");
      setValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/backauth/invite-info?token=${token}`);
        
        if (!res.ok) {
          setError("Link undangan tidak valid atau sudah kadaluarsa.");
          setLoading(false);
          setValidating(false);
          return;
        }

        const data = await res.json();
        
        if (data.success) {
          setInviteData(data.data);
          setName(""); 
        } else {
          setError(data.message || "Link undangan sudah tidak valid atau kadaluarsa.");
        }
      } catch (err) {
        setError("Gagal terhubung ke server.");
      } finally {
        setValidating(false);
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(getApiUrl("/api/backauth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: inviteData.email,
          password,
          token
        })
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Gagal bergabung ke tim");
        setSubmitting(false);
        return;
      }

      toast.success("Berhasil bergabung! Mengarahkan ke dashboard...");
      
      // Auto-login
      await signIn("credentials", { 
        email: inviteData.email, 
        password, 
        redirect: false 
      });
      
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-white/40 text-sm animate-pulse tracking-widest uppercase">Memvalidasi Undangan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-center space-y-6">
          <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Undangan Tidak Valid</h1>
            <p className="text-white/40 text-sm leading-relaxed">{error}</p>
          </div>
          <button 
            onClick={() => router.push("/auth/login")}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <UserPlus className="h-32 w-32 rotate-12" />
            </div>
            <div className="relative z-10 flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-2xl shadow-inner">
                N
              </div>
              <div>
                <h2 className="font-bold text-xl tracking-tight">NotarisOne</h2>
                <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Undangan Tim</p>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight">
              Selamat Datang di<br/>
              <span className="text-white/90">{inviteData.kantorName}</span>
            </h1>
          </div>

          <div className="p-8 sm:p-10 space-y-8">
            <div className="flex items-start gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">Undangan Terverifikasi</p>
                <p className="text-white/40 text-xs leading-relaxed">
                  Anda diundang sebagai <span className="text-indigo-400 font-bold uppercase">{inviteData.role}</span>. Akun Anda akan dikaitkan dengan email <span className="text-white font-medium">{inviteData.email}</span>.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  placeholder="Masukkan nama lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Email</label>
                <input 
                  type="email" 
                  disabled
                  value={inviteData.email}
                  className="w-full bg-white/[0.02] border border-white/5 text-white/30 rounded-2xl px-5 py-4 text-sm cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Buat Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl px-5 py-4 pr-12 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="flex gap-1.5 mt-3 px-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                          password.length >= level * 2 + 2 
                            ? level <= 2 ? "bg-amber-500/50" : "bg-emerald-500/50" 
                            : "bg-white/5"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full group mt-4 relative flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Gabung Sekarang
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[10px] text-white/20 uppercase tracking-widest leading-loose">
              Dengan bergabung, Anda menyetujui<br/> 
              <span className="text-white/40 cursor-pointer hover:text-indigo-400">Syarat & Ketentuan</span> dan <span className="text-white/40 cursor-pointer hover:text-indigo-400">Kebijakan Privasi</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-white/40 text-sm animate-pulse tracking-widest uppercase">Memuat...</p>
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  );
}
