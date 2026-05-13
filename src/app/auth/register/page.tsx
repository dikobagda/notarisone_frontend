"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getApiUrl } from "@/lib/api";
import {
  Check,
  Loader2,
  ShieldCheck,
  Zap,
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Activity,
  Database,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  FileText,
  BarChart3,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

// ──────────────────────────────────────────────
// Plan Config
// ──────────────────────────────────────────────
const staticPlansMetadata = [
  {
    id: "TRIAL",
    name: "Free Trial",
    tagline: "Coba semua fitur gratis selama 21 hari.",
    price: "Gratis",
    priceNote: "selama 21 hari",
    badge: "Masa Uji Coba",
    color: "indigo",
    icon: Zap,
    features: [
      "Akses penuh fitur Professional",
      "Kapasitas 5 Notaris & 20 Staf",
      "Cloud storage 50 GB",
      "Tanpa kartu kredit",
      "Batal kapan saja",
      "Catatan: Data dihapus setelah 21 hari",
    ],
    limitations: [],
    cta: "Mulai Trial Gratis",
    highlight: false,
  },
  {
    id: "STARTER",
    name: "Starter",
    tagline: "Solusi cerdas untuk Notaris dengan praktik mandiri atau baru memulai.",
    price: "",
    priceNote: "per bulan",
    badge: "Terpopuler",
    color: "emerald",
    icon: User,
    features: [
      "1 Notaris & Staf",
      "Manajemen Akta Dasar",
      "Cloud storage 5 GB",
      "Laporan & analitik lanjutan",
      "Audit Trail",
      "Dukungan Email",
    ],
    limitations: [],
    cta: "Pilih Starter",
    highlight: true,
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    tagline: "Pilihan tepat untuk kantor Notaris yang berkembang dengan tim dan staf.",
    price: "",
    priceNote: "per bulan",
    badge: null,
    color: "violet",
    icon: ShieldCheck,
    features: [
      "5 Notaris & 20 Pegawai",
      "Akta tidak terbatas",
      "Cloud storage 50 GB",
      "Laporan & analitik lanjutan",
      "Notifikasi otomatis klien",
      "Integrasi e-signature",
    ],
    limitations: [],
    cta: "Pilih Professional",
    highlight: false,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    tagline: "Infrastruktur lengkap dengan keamanan berlapis untuk jaringan kantor skala besar.",
    price: "",
    priceNote: "per bulan",
    badge: "Custom",
    color: "amber",
    icon: Building2,
    features: [
      "Notaris & pegawai tidak terbatas",
      "Multi-kantor & cabang",
      "Cloud storage tak terbatas",
      "SLA 99.9% & dedicated support",
      "Integrasi API custom",
      "Audit Trail lengkap",
    ],
    limitations: [],
    cta: "Pilih Enterprise",
    highlight: false,
  },
];

const STEPS = [
  { id: 1, label: "Pilih Paket" },
  { id: 2, label: "Info Kantor" },
  { id: 3, label: "Akun Notaris" },
];

type Plan = (typeof staticPlansMetadata)[0];

// ──────────────────────────────────────────────
// Step Indicator
// ──────────────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${currentStep === step.id
              ? "bg-primary/20 text-primary border border-primary/30"
              : currentStep > step.id
                ? "text-emerald-500"
                : "text-muted-foreground/25"
              }`}
          >
            {currentStep > step.id ? (
              <Check className="h-3 w-3" />
            ) : (
              <span>{step.id}</span>
            )}
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-6 mx-1 ${currentStep > step.id ? "bg-emerald-500/50" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Plan Card
// ──────────────────────────────────────────────
function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = plan.icon;

  const themes = {
    indigo: {
      base: "border-border",
      selected: "border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]",
      bg: selected ? "bg-indigo-500/10 dark:bg-indigo-500/20" : "bg-card",
      icon: "bg-indigo-500/20 text-indigo-500",
      check: "text-indigo-500",
      badge: "bg-indigo-500 shadow-indigo-500/50",
      glow: "bg-indigo-500/15",
      ring: "ring-2 ring-indigo-500/40",
      featureText: selected ? "text-foreground" : "text-muted-foreground",
    },
    violet: {
      base: "border-border",
      selected: "border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.2)]",
      bg: selected ? "bg-violet-500/10 dark:bg-violet-500/20" : "bg-card",
      icon: "bg-violet-500/20 text-violet-500",
      check: "text-violet-500",
      badge: "bg-violet-500 shadow-violet-500/50",
      glow: "bg-violet-500/15",
      ring: "ring-2 ring-violet-500/40",
      featureText: selected ? "text-foreground" : "text-muted-foreground",
    },
    amber: {
      base: "border-border",
      selected: "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.20)]",
      bg: selected ? "bg-amber-500/10 dark:bg-amber-500/20" : "bg-card",
      icon: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
      check: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-500 shadow-amber-500/50",
      glow: "bg-amber-500/10",
      ring: "ring-2 ring-amber-500/40",
      featureText: selected ? "text-foreground" : "text-muted-foreground",
    },
    emerald: {
      base: "border-border",
      selected: "border-emerald-500 shadow-[0_0_30px_rgba(52,211,153,0.2)]",
      bg: selected ? "bg-emerald-500/10 dark:bg-emerald-500/20" : "bg-card",
      icon: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      check: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-500 shadow-emerald-500/50",
      glow: "bg-emerald-500/15",
      ring: "ring-2 ring-emerald-500/40",
      featureText: selected ? "text-foreground" : "text-muted-foreground",
    },
  };

  const theme = themes[plan.color as keyof typeof themes] || themes.indigo;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        group relative w-full text-left rounded-2xl border p-5
        transition-all duration-300 ease-out cursor-pointer
        ${theme.bg}
        ${selected
          ? `${theme.selected} ${theme.ring}`
          : `${theme.base} opacity-70 hover:opacity-100 hover:border-white/20 hover:bg-white/[0.05]`
        }
      `}
    >
      {/* Glow spot */}
      {selected && (
        <div className={`absolute inset-0 rounded-2xl ${theme.glow} blur-2xl pointer-events-none`} />
      )}

      {/* Popular badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <div className={`flex items-center gap-1 ${theme.badge} text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg`}>
            <Star className="h-2.5 w-2.5 fill-white" />
            {plan.badge}
          </div>
        </div>
      )}

      {/* Selected checkmark badge */}
      <div className={`
        absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center
        transition-all duration-300
        ${selected
          ? `${theme.badge} shadow-lg`
          : "bg-white/10 border border-white/15"
        }
      `}>
        <Check className={`h-3.5 w-3.5 transition-all ${selected ? "text-white" : "text-white/20"}`} />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-start gap-4 min-h-[50px] pr-10">
          <div className={`p-2.5 rounded-xl ${theme.icon} transition-all shrink-0 mt-0.5`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-[15px] leading-snug transition-colors ${selected ? "text-foreground" : "text-foreground/80"}`}>
              {plan.name}
            </p>
            <p className="text-muted-foreground text-[11px] leading-tight mt-1">{plan.tagline}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-0">
          <div className="flex items-baseline gap-2">
            <span className={`font-black text-3xl tracking-tight transition-colors ${selected ? "text-foreground" : "text-foreground/70"}`}>
              {plan.price}
            </span>
            <span className="text-muted-foreground/40 text-xs font-medium">{plan.priceNote}</span>
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px ${selected ? "bg-foreground/10" : "bg-border/50"} transition-colors`} />

        {/* Features */}
        <ul className="space-y-2">
          {plan.features.map((f) => (
            <li key={f} className={`flex items-center gap-2 text-xs transition-colors ${theme.featureText}`}>
              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${selected ? theme.check.replace("text-", "bg-") : "bg-white/20"} transition-colors`} />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
}

// ──────────────────────────────────────────────
// Main Page Content
// ──────────────────────────────────────────────
function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string>("STARTER");
  const [plans, setPlans] = useState<Plan[]>(staticPlansMetadata);

  // Fetch plans from backend for dynamic pricing
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch(getApiUrl("/api/subscription/plans"));
        if (res.ok) {
          const { data } = await res.json();
          // Merge dynamic prices into our metadata-rich PLANS
          const dynamicPlans = staticPlansMetadata.map(staticPlan => {
            const dbPlan = data.find((p: any) => p.slug === staticPlan.id);
            if (dbPlan) {
              const priceNum = Number(dbPlan.price);
              // Normalize name to Capitalized (e.g. STARTER -> Starter)
              const normalizedName = dbPlan.name.charAt(0).toUpperCase() + dbPlan.name.slice(1).toLowerCase();
              return {
                ...staticPlan,
                name: normalizedName,
                tagline: dbPlan.tagline || staticPlan.tagline,
                price: priceNum === 0 ? "Gratis" :
                  priceNum >= 1000000 ? `Rp ${(priceNum / 1000000).toFixed(0)} Juta` :
                    `Rp ${(priceNum / 1000).toFixed(0)}K`
              };
            }
            return staticPlan;
          });
          setPlans(dynamicPlans);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic plans:", err);
      }
    }
    fetchPlans();
  }, []);
  const [kantorName, setKantorName] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Redirect if invite token is present
  useEffect(() => {
    if (token) {
      router.push(`/auth/join?token=${token}`);
    }
  }, [token, router]);

  const isPaidPlan = selectedPlan !== "STARTER";

  const handleNext = () => {
    setError("");
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!kantorName.trim() || kantorName.length < 3) {
        setError("Nama kantor minimal 3 karakter");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { setError("Anda harus menyetujui syarat & ketentuan"); return; }
    if (password.length < 8) { setError("Password minimal 8 karakter"); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(getApiUrl("/api/backauth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kantorName,
          address,
          name,
          email,
          password,
          plan: selectedPlan
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registrasi gagal");
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Auto-login setelah register
      const signInResult = await signIn("credentials", { email, password, redirect: false });
      
      if (signInResult?.error) {
        // Login failed, redirect to login page instead
        setTimeout(() => router.push("/auth/login"), 1500);
        return;
      }

      // Wait a bit longer than default to ensure NextAuth session cookie is propagated
      // Then redirect – subscription page will retry if token not yet ready
      setTimeout(() => {
        if (selectedPlan === "TRIAL") {
          router.push("/dashboard");
        } else {
          router.push(`/dashboard/subscription?checkout=true&plan=${selectedPlan}`);
        }
      }, 2500);
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
            <Check className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Selamat Datang!</h2>
          <p className="text-muted-foreground text-sm">Akun Anda berhasil dibuat. Mengarahkan ke dashboard...</p>
          <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // If redirecting, show nothing or a loader
  if (token) return null;

  return (
    <div className="min-h-screen w-full bg-background flex relative">
      {/* Theme Toggle Button */}
      <div className="fixed top-6 right-6 z-50">
        <ModeToggle />
      </div>
      {/* Left Branding Panel */}
      <div className="hidden xl:flex xl:w-[420px] shrink-0 flex-col justify-between p-10 border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-xl">
              N
            </div>
            <div>
              <span className="text-foreground font-bold text-xl">NotarisOne</span>
              <p className="text-muted-foreground text-[10px] tracking-widest uppercase">Premium SaaS</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-bold text-foreground leading-tight">
            Bergabung dengan<br />
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              1,200+ Notaris
            </span>
          </h2>

          <div className="space-y-4">
            {[
              { icon: FileText, label: "Kelola akta digital dengan mudah" },
              { icon: User, label: "Manajemen klien terintegrasi" },
              { icon: BarChart3, label: "Laporan otomatis & analitik" },
              { icon: ShieldCheck, label: "Keamanan data berlapis" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-muted-foreground/80 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-card border border-border rounded-xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-muted-foreground text-xs font-medium">Platform Status</p>
          </div>
          <p className="text-foreground font-semibold text-sm">Semua sistem beroperasi normal</p>
          <p className="text-muted-foreground/60 text-xs">Uptime 99.9% · Terakhir diperbarui hari ini</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center p-6 sm:p-10 overflow-y-auto">
        <div className={cn(
          "w-full py-8 transition-all duration-500",
          step === 1 ? "max-w-5xl" : "max-w-2xl"
        )}>
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 xl:hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white">
              N
            </div>
            <span className="text-foreground font-bold text-lg">NotarisOne</span>
          </div>

          <StepIndicator currentStep={step} />

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* ── STEP 1: Plan Selection ── */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center md:text-left space-y-4">
                <h2 className="text-4xl font-black text-foreground leading-tight">
                  Pilih Paket <br />
                  <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Langganan Anda.</span>
                </h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Pilih paket yang paling sesuai dengan kebutuhan kantor Notaris Anda.
                  Semua paket dilengkapi dengan keamanan data standar industri. 
                  <span className="block mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">* Khusus Trial: Data akan dihapus otomatis setelah masa uji coba (21 hari) berakhir jika tidak melakukan upgrade.</span>
                </p>
              </div>

              {/* Top Trial Card */}
              {plans.filter(p => p.id === "TRIAL").map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                  }}
                  className={cn(
                    "relative w-full rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer transition-all duration-300",
                    selectedPlan === plan.id
                      ? "bg-indigo-500/10 border-indigo-500/30 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10"
                      : "bg-card border-border hover:bg-muted/50 opacity-90 hover:opacity-100"
                  )}
                >
                  <div className="flex items-start md:items-center gap-5">
                    <div className={cn(
                      "h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center transition-all",
                      selectedPlan === plan.id ? "bg-indigo-500/20 text-indigo-500" : "bg-muted text-muted-foreground"
                    )}>
                      <plan.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                        {plan.badge && (
                          <span className="bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-indigo-500/30">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm max-w-md line-clamp-2 md:line-clamp-none">{plan.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:pl-6 md:border-l border-border shrink-0">
                    <div className="text-left md:text-right">
                      <div className="text-2xl font-black text-foreground">{plan.price}</div>
                      <div className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">{plan.priceNote}</div>
                    </div>
                    <div className={cn(
                      "h-10 w-10 shrink-0 rounded-full border-2 flex items-center justify-center transition-all",
                      selectedPlan === plan.id
                        ? "bg-indigo-500 border-indigo-500"
                        : "border-border"
                    )}>
                      {selectedPlan === plan.id && <Check className="h-5 w-5 text-white" />}
                    </div>
                  </div>
                </div>
              ))}

              {/* Main Plans grid (Excluding TRIAL) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {plans.filter(p => p.id !== "TRIAL").map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    selected={selectedPlan === plan.id}
                    onSelect={() => setSelectedPlan(plan.id)}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-4">
                <a href="/auth/login" className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors">
                  Sudah punya akun? <span className="text-primary font-semibold">Masuk</span>
                </a>
                {true && (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-primary/5 border border-primary/10 text-foreground font-bold text-sm px-6 py-3 rounded-xl hover:bg-primary/10 transition-all cursor-pointer ml-auto"
                  >
                    Lanjutkan dengan {plans.find(p => p.id === selectedPlan)?.name || selectedPlan}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2: Kantor Info ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className={cn(
                  "inline-flex items-center gap-2 border text-xs font-bold px-3 py-1 rounded-full mb-3",
                  selectedPlan === "TRIAL" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400" :
                    selectedPlan === "STARTER" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                      selectedPlan === "PROFESSIONAL" ? "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400" :
                        "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                )}>
                  Paket: {plans.find(p => p.id === selectedPlan)?.name || selectedPlan}
                </div>
                <h2 className="text-3xl font-bold text-foreground">Info Kantor</h2>
                <p className="text-muted-foreground text-sm mt-1">Informasi kantor notaris Anda</p>
              </div>

              <div className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Nama Kantor Notaris <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Kantor Notaris Dr. Ahmad Wijaya, SH., M.Kn."
                    value={kantorName}
                    onChange={(e) => setKantorName(e.target.value)}
                    className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                  <p className="text-muted-foreground/40 text-xs">Sesuai dengan nama resmi yang terdaftar di Kemenkumham</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Alamat Kantor
                  </label>
                  <textarea
                    placeholder="Jl. Sudirman No. 123, Kel. Senayan, Kec. Kebayoran Baru, Jakarta Selatan"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground text-sm font-medium transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Kembali
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Lanjutkan
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Account Info ── */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "inline-flex items-center gap-2 border text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full",
                    selectedPlan === "TRIAL" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400" :
                      selectedPlan === "STARTER" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                        selectedPlan === "PROFESSIONAL" ? "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400" :
                          "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                  )}>
                    {plans.find(p => p.id === selectedPlan)?.name || selectedPlan}
                  </div>
                  <div className="text-muted-foreground/30 text-xs">·</div>
                  <div className="text-muted-foreground/60 text-xs truncate max-w-[200px] font-medium uppercase tracking-widest">{kantorName}</div>
                </div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Akun Notaris</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Data ini akan menjadi akun utama (admin) kantor Anda
                </p>
              </div>

              <div className="space-y-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Nama Lengkap (Sesuai KTP) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. Ahmad Wijaya, SH., M.Kn."
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="notaris@kantor.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 8 karakter"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground/30 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {password && (
                    <div className="flex gap-1 mt-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${password.length > i * 3 + 2
                            ? password.length < 8
                              ? "bg-destructive"
                              : password.length < 12
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            : "bg-muted"
                            }`}
                        />
                      ))}
                      <span className="text-[10px] text-muted-foreground/40 ml-1">
                        {password.length < 8 ? "Lemah" : password.length < 12 ? "Sedang" : "Kuat"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Paket summary */}
              {selectedPlan && (
                <div className={cn(
                  "flex items-start gap-4 rounded-2xl p-5 border shadow-sm",
                  selectedPlan === "TRIAL" ? "bg-indigo-500/5 border-indigo-500/10" :
                    selectedPlan === "STARTER" ? "bg-emerald-500/5 border-emerald-500/10" :
                      selectedPlan === "PROFESSIONAL" ? "bg-violet-500/5 border-violet-500/10" :
                        "bg-amber-500/5 border-amber-500/10"
                )}>
                  <div className={cn(
                    "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border",
                    selectedPlan === "TRIAL" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400" :
                      selectedPlan === "STARTER" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                        selectedPlan === "PROFESSIONAL" ? "bg-violet-500/10 border-violet-500/10 text-violet-600 dark:text-violet-400" :
                          "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                  )}>
                    <Check className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-bold text-sm">
                      {selectedPlan === "TRIAL"
                        ? "Masa Uji Coba Gratis 21 Hari — Akses Penuh"
                        : `Paket ${plans.find(p => p.id === selectedPlan)?.name || selectedPlan} — ${plans.find(p => p.id === selectedPlan)?.price}`}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                      {selectedPlan === "TRIAL"
                        ? "Nikmati semua fitur sistem NotarisOne secara gratis selama 21 hari. Seluruh data akan dihapus otomatis jika tidak melakukan upgrade setelah masa trial habis."
                        : `Anda telah memilih paket ${plans.find(p => p.id === selectedPlan)?.name}. Pembayaran akan diproses setelah pendaftaran.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Agreement */}
              <label
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => setAgree(!agree)}
              >
                <div
                  className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center shrink-0 border transition-all ${agree ? "bg-primary border-primary shadow-sm" : "border-border group-hover:border-primary/50"
                    }`}
                >
                  {agree && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                </div>
                <span className="text-muted-foreground text-xs leading-relaxed select-none">
                  Saya menyetujui{" "}
                  <a href="/legal/terms" target="_blank" className="text-primary hover:text-primary/80 underline font-medium">
                    Syarat & Ketentuan
                  </a>{" "}
                  dan{" "}
                  <a href="/legal/privacy" target="_blank" className="text-primary hover:text-primary/80 underline font-medium">
                    Kebijakan Privasi
                  </a>{" "}
                  NotarisOne
                </span>
              </label>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground text-sm font-medium transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={loading || !agree}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Membuat Akun...
                    </>
                  ) : (
                    <>
                      Buat Akun Sekarang
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-muted-foreground/40 text-xs">
                Sudah punya akun?{" "}
                <a href="/auth/login" className="text-primary hover:text-primary/80 font-semibold">
                  Masuk di sini
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground/20">Memuat...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
