"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Server, ShieldAlert, ArrowRight } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function BackofficeLoginPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in and has access
  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role === "SUPERADMIN" || role === "STAFF") {
        router.replace("/backoffice");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [status, session, router]);

  // Prevent showing form while checking session
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm animate-pulse">Menyiapkan sesi Anda...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      const errorMessage = res.error === "CredentialsSignin" 
        ? "Email atau password salah. Silakan coba lagi."
        : res.error;
      
      setError(errorMessage);
      setLoading(false);
    } else {
      // Fetch session immediately to check role using getSession
      const sessionData = await getSession();
      const role = (sessionData?.user as any)?.role;

      if (role !== "SUPERADMIN" && role !== "STAFF") {
        await signOut({ redirect: false });
        setError("Akses ditolak. Halaman ini khusus untuk Administrator.");
        setLoading(false);
        return;
      }

      router.push("/backoffice");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Theme Toggle Button */}
      <div className="fixed top-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 overflow-hidden bg-slate-950">
        {/* Background gradient blobs - different colors for backoffice */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-slate-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-sky-600/10 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/30 bg-white">
              <img src="/logo-penagraha.png" alt="Penagraha" className="h-full w-full object-contain p-1" />
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight">Penagraha</span>
              <p className="text-blue-300 text-[10px] font-medium tracking-widest uppercase">Backoffice System</p>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-200 text-xs font-medium">Sistem Admin Pusat</span>
            </div>
            <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight">
              Portal<br />
              <span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
                Administrator
              </span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md">
              Akses khusus untuk manajemen platform, konfigurasi tenant, dan pengelolaan sistem terpusat.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {["Manajemen Tenant", "Konfigurasi Sistem", "Log Aktivitas", "Keamanan Tingkat Tinggi"].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-3 py-1.5"
              >
                <Server className="h-3 w-3 text-blue-400" />
                <span className="text-slate-300 text-xs font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="relative z-10 flex items-center gap-2 text-slate-400">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          <p className="text-xs font-medium">Akses terbatas. Segala aktivitas di dalam sistem ini dipantau dan dicatat.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-12 bg-card relative">
        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="h-9 w-9 rounded-xl overflow-hidden bg-primary/10">
              <img src="/logo-penagraha.png" alt="Penagraha" className="h-full w-full object-contain p-1" />
            </div>
            <span className="text-foreground font-bold text-lg tracking-tight">Backoffice</span>
          </div>

          <div className="space-y-2 mb-10">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Admin Login</h2>
            <p className="text-muted-foreground text-sm">Masuk untuk mengelola platform</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
              <svg className="h-4 w-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Email Administrator
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@penagraha.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground/30 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden rounded-xl bg-slate-900 dark:bg-blue-600 py-3 px-6 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 hover:bg-slate-800 dark:hover:bg-blue-500"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  Masuk Backoffice
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-border space-y-4">
            <p className="text-muted-foreground/40 text-xs text-center">
              &copy; {new Date().getFullYear()} Penagraha Backoffice System.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
