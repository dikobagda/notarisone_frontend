"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Zap, 
  Crown, 
  ArrowRight,
  Info,
  Clock,
  CheckCircle2,
  Lock,
  History,
  HardDrive,
  FileText,
  Star,
  Building2,
  Shield,
  Loader2,
  BadgeCheck,
  CalendarDays,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  Users,
  FileText,
  HardDrive,
  CheckCircle2,
  ShieldCheck,
  History,
  Lock,
  Zap,
  Crown,
  Sparkles,
  Building2,
  Shield,
};

const TIER_ORDER: Record<string, number> = {
  NONE: -1,
  TRIAL: 0,
  STARTER: 1,
  PROFESSIONAL: 2,
  ENTERPRISE: 3,
};

const PLAN_META: Record<string, {
  gradient: string;
  glow: string;
  badge: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
  featureIconBg: string;
  featureIconColor: string;
  btnClass: string;
  borderActive: string;
  icon: any;
  accentText: string;
}> = {
  STARTER: {
    gradient: "from-emerald-500/5 via-white to-white",
    glow: "shadow-[0_8px_40px_rgba(16,185,129,0.15)]",
    badge: "bg-emerald-500",
    badgeText: "Terjangkau",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    featureIconBg: "bg-emerald-50",
    featureIconColor: "text-emerald-500",
    btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200",
    borderActive: "border-emerald-400",
    icon: Users,
    accentText: "text-emerald-600",
  },
  PROFESSIONAL: {
    gradient: "from-violet-500/8 via-white to-white",
    glow: "shadow-[0_8px_40px_rgba(139,92,246,0.2)]",
    badge: "bg-gradient-to-r from-violet-600 to-indigo-600",
    badgeText: "Paling Populer",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    featureIconBg: "bg-violet-50",
    featureIconColor: "text-violet-500",
    btnClass: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-200",
    borderActive: "border-violet-400",
    icon: Shield,
    accentText: "text-violet-600",
  },
  ENTERPRISE: {
    gradient: "from-amber-500/5 via-white to-white",
    glow: "shadow-[0_8px_40px_rgba(245,158,11,0.15)]",
    badge: "bg-gradient-to-r from-amber-500 to-orange-500",
    badgeText: "Terlengkap",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    featureIconBg: "bg-amber-50",
    featureIconColor: "text-amber-500",
    btnClass: "bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-300",
    borderActive: "border-amber-400",
    icon: Building2,
    accentText: "text-amber-600",
  },
};

// Fallback features – used when backend returns fewer than 6 items
const PLAN_FEATURES_FALLBACK: Record<string, { text: string; icon: string }[]> = {
  STARTER: [
    { text: "1 Akun Notaris", icon: "Users" },
    { text: "Manajemen Akta Dasar", icon: "FileText" },
    { text: "Penyimpanan 5 GB", icon: "HardDrive" },
    { text: "Riwayat 30 Hari", icon: "History" },
    { text: "Keamanan Standar", icon: "ShieldCheck" },
    { text: "Dukungan Email", icon: "CheckCircle2" },
  ],
  PROFESSIONAL: [
    { text: "Hingga 5 Anggota Tim", icon: "Users" },
    { text: "Manajemen Tim & Izin", icon: "ShieldCheck" },
    { text: "Template Akta Kustom", icon: "FileText" },
    { text: "Penyimpanan 50 GB", icon: "HardDrive" },
    { text: "Audit Log (Basic)", icon: "History" },
    { text: "Dukungan Prioritas", icon: "CheckCircle2" },
  ],
  ENTERPRISE: [
    { text: "Anggota Tim Tanpa Batas", icon: "Users" },
    { text: "Enkripsi Data Berlapis", icon: "Lock" },
    { text: "Audit Log Lengkap", icon: "History" },
    { text: "Penyimpanan 500 GB", icon: "HardDrive" },
    { text: "Subdomain Kustom", icon: "Zap" },
    { text: "Manager Pendamping Khusus", icon: "Crown" },
  ],
};

function PricingCard({
  plan,
  isActive,
  isUpgrade,
  loading,
  onSelect,
}: {
  plan: any;
  isActive: boolean;
  isUpgrade: boolean;
  loading: boolean;
  onSelect: (slug: string) => void;
}) {
  const meta = PLAN_META[plan.slug] || {
    gradient: "from-indigo-500/5 via-white to-white",
    glow: "shadow-[0_8px_40px_rgba(99,102,241,0.15)]",
    badge: "bg-indigo-600",
    badgeText: "Standar",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    featureIconBg: "bg-indigo-50",
    featureIconColor: "text-indigo-500",
    btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200",
    borderActive: "border-indigo-400",
    icon: Zap,
    accentText: "text-indigo-600",
  };

  const IconComp = meta.icon;
  const priceNum = Number(plan.price);
  const priceDisplay = priceNum === 0 ? "Gratis" : 
    priceNum >= 1000000 ? `${(priceNum / 1000000).toFixed(0)} Juta` :
    `${(priceNum / 1000).toFixed(0)}rb`;
  const isPriceZero = priceNum === 0;
  const isPro = plan.slug === "PROFESSIONAL";

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-3xl border-2 transition-all duration-500 overflow-hidden",
        isActive 
          ? `${meta.borderActive} ${meta.glow} scale-[1.02] z-10 bg-gradient-to-br ${meta.gradient}` 
          : `border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100/80 hover:-translate-y-1`
      )}
    >
      {/* Popular ribbon */}
      {isPro && !isActive && (
        <div className={cn("absolute top-0 inset-x-0 h-1", meta.badge)} />
      )}
      {isPro && !isActive && (
        <div className="absolute top-4 right-4">
          <span className={cn("text-[9px] font-bold text-white uppercase tracking-[0.15em] px-3 py-1 rounded-full", meta.badge)}>
            Populer
          </span>
        </div>
      )}

      {/* Active badge */}
      {isActive && (
        <div className="absolute top-4 right-4">
          <span className={cn("text-[9px] font-bold text-white uppercase tracking-[0.15em] px-3 py-1 rounded-full flex items-center gap-1", meta.badge)}>
            <BadgeCheck className="h-3 w-3" /> Aktif
          </span>
        </div>
      )}

      <div className="p-7 flex flex-col flex-1">
        {/* Icon + Name */}
        <div className="flex items-start gap-4 mb-6">
          <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center shrink-0", meta.iconBg)}>
            <IconComp className={cn("h-5 w-5", meta.iconColor)} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{plan.name}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5 leading-snug">{plan.tagline}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            {!isPriceZero && (
              <span className="text-sm font-bold text-slate-400 self-start mt-2">Rp</span>
            )}
            <span className="text-4xl font-black text-slate-900 tracking-tight">
              {priceDisplay}
            </span>
            {!isPriceZero && (
              <span className="text-xs text-slate-400 font-medium">/bulan</span>
            )}
          </div>
          <div className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", meta.accentText)}>
            {meta.badgeText}
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => onSelect(plan.slug)}
          disabled={loading || isActive}
          className={cn(
            "w-full h-11 rounded-xl font-bold text-sm transition-all mb-7 border-0",
            isActive
              ? "bg-slate-100 text-slate-400 cursor-default"
              : loading
              ? "opacity-70 cursor-wait"
              : meta.btnClass
          )}
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...</>
          ) : isActive ? (
            <><BadgeCheck className="h-4 w-4 mr-1.5" /> Paket Aktif</>
          ) : isUpgrade ? (
            <>Upgrade ke {plan.name} <ChevronRight className="h-4 w-4 ml-1" /></>
          ) : (
            <>Pilih Paket {plan.name}</>
          )}
        </Button>

        {/* Divider */}
        <div className="border-t border-slate-100 pt-6 mt-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5">
            {plan.slug === "STARTER" ? "Yang Anda dapatkan:" : plan.slug === "PROFESSIONAL" ? "Semua Starter, ditambah:" : "Fitur Enterprise:"}
          </p>
          <div className="space-y-3">
            {(plan.features?.length > 0 ? plan.features : (PLAN_FEATURES_FALLBACK[plan.slug] || [])).map((feature: any, i: number) => {
              const FeatIcon = ICON_MAP[feature.icon] || CheckCircle2;
              return (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={cn("h-5 w-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5", meta.featureIconBg)}>
                    <FeatIcon className={cn("h-3 w-3", meta.featureIconColor)} />
                  </div>
                  <span className="text-xs text-slate-600 font-medium leading-snug">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [isFetchingStatus, setIsFetchingStatus] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.tenantId) {
        setIsFetchingStatus(false);
        return;
      }
      try {
        const token = (session as any)?.backendToken;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const [statusRes, plansRes] = await Promise.all([
          fetch(`/api/subscription/status`, { headers }),
          fetch(`/api/subscription/plans`)
        ]);

        if (statusRes.ok && statusRes.headers.get("content-type")?.includes("application/json")) {
          const statusData = await statusRes.json();
          if (statusData.success) setCurrentSubscription(statusData.data);
        }

        if (plansRes.ok && plansRes.headers.get("content-type")?.includes("application/json")) {
          const plansData = await plansRes.json();
          if (plansData.success) setAvailablePlans(plansData.data);
        }
      } catch (err) {
        console.error("Failed to fetch subscription data", err);
      } finally {
        setIsFetchingStatus(false);
      }
    }
    fetchData();
  }, [session]);

  useEffect(() => {
    const status = searchParams.get("status");
    const autoCheckout = searchParams.get("checkout") === "true";
    const targetPlan = searchParams.get("plan");

    if (status === "success") {
      toast.success("Pembayaran Berhasil!", {
        description: "Status langganan Anda akan diperbarui dalam beberapa menit."
      });
      router.replace("/dashboard/subscription");
    } else if (status === "failed") {
      toast.error("Pembayaran Gagal", {
        description: "Silakan coba lagi atau hubungi dukungan kami."
      });
      router.replace("/dashboard/subscription");
    } else if (autoCheckout && targetPlan && session) {
      const hasTriggered = (window as any)._autoCheckoutTriggered;
      if (!hasTriggered) {
        (window as any)._autoCheckoutTriggered = true;
        handleSelectPlan(targetPlan);
      }
    }
  }, [searchParams, router, session]);

  const handleSelectPlan = async (tier: string) => {
    if (tier === currentSubscription?.subscription) {
      toast.info("Anda sudah menggunakan paket ini.");
      return;
    }

    if (!session?.user?.tenantId) {
      toast.error("Sesi tidak valid. Silakan login kembali.");
      return;
    }

    setLoadingTier(tier);
    try {
      const token = (session as any)?.backendToken;
      const res = await fetch(`/api/subscription/checkout`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tier }),
      });

      if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
        const text = await res.text();
        console.error("[Checkout] Non-JSON response:", text.substring(0, 100));
        throw new Error("Gagal menghubungi server pembayaran");
      }

      const data = await res.json();
      if (data.success && data.data.invoiceUrl) {
        window.location.href = data.data.invoiceUrl;
      } else {
        alert("Checkout Failed Result: " + JSON.stringify(data, null, 2));
        toast.error(data.message || "Gagal membuat invoice. Cek log backend.");
        setLoadingTier(null);
      }
    } catch (error: any) {
      console.error("Checkout Error:", error);
      alert("Checkout Error Exception: " + String(error) + "\n\nDetails: " + JSON.stringify(error, null, 2));
      toast.error("Terjadi kesalahan jaringan. Pastikan backend di port 3001 menyala.");
      setLoadingTier(null);
    }
  };

  const currentTier = currentSubscription?.subscription || "NONE";

  const expiryLabel = (() => {
    if (!currentSubscription) return null;
    if (currentSubscription.subscriptionExpiresAt)
      return new Date(currentSubscription.subscriptionExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    if (currentSubscription.trialExpiresAt)
      return `${new Date(currentSubscription.trialExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (Trial)`;
    return null;
  })();

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24">

      {/* ── Active Status Banner ── */}
      {!isFetchingStatus && currentSubscription && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-[1px] shadow-xl shadow-slate-200">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-transparent to-violet-600/10 pointer-events-none rounded-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-indigo-300" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Langganan Aktif</p>
                <h4 className="text-lg font-extrabold text-white tracking-tight">Paket {currentTier}</h4>
              </div>
            </div>
            {expiryLabel && (
              <div className="relative flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                <CalendarDays className="h-4 w-4 text-white/40" />
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Berlaku Hingga</p>
                  <p className="text-sm font-bold text-white/90">{expiryLabel}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0f1629] to-slate-900 p-8 md:p-12 shadow-2xl">
        {/* Decorative orbs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="space-y-5 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[10px] font-bold uppercase tracking-[0.15em]">
              <Sparkles className="h-3 w-3" />
              NotarisOne Premium
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Kantor yang Lebih Efisien<br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Dimulai dari Paket Tepat.</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm leading-relaxed">
              Pilih paket yang sesuai dengan skala kantor Anda. Tanpa biaya tersembunyi, batalkan kapan saja.
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              {[
                { icon: ShieldCheck, text: "Data Aman & Enkripsi" },
                { icon: Zap, text: "Setup Instan" },
                { icon: Star, text: "Dukungan Prioritas" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-white/40 text-xs font-medium">
                  <Icon className="h-3.5 w-3.5" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => {
              document.getElementById('pricing-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group h-12 px-8 rounded-xl bg-white text-slate-900 hover:bg-indigo-50 font-bold text-sm shadow-2xl shadow-black/20 transition-all active:scale-95 border-none shrink-0"
          >
            Lihat Paket
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      {/* ── Section Header ── */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pilih Paket Langganan</h2>
        <p className="text-sm text-slate-500 font-medium">Semua paket sudah termasuk akses penuh ke fitur inti NotarisOne</p>
      </div>

      {/* ── Pricing Cards ── */}
      {isFetchingStatus ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-indigo-50 border-2 border-indigo-100" />
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 absolute top-4 left-4" />
          </div>
          <p className="text-sm font-bold text-slate-500">Memuat data paket...</p>
        </div>
      ) : (
        <div id="pricing-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.filter(p => p.slug !== "TRIAL").map((plan) => {
            const currentTierRank = TIER_ORDER[currentTier] || 0;
            const cardTierRank = TIER_ORDER[plan.slug] || 0;
            const isUpgrade = cardTierRank > currentTierRank;

            return (
              <PricingCard
                key={plan.id}
                plan={plan}
                isActive={currentTier === plan.slug}
                isUpgrade={isUpgrade}
                loading={loadingTier === plan.slug}
                onSelect={handleSelectPlan}
              />
            );
          })}
        </div>
      )}

      {/* ── Help Footer ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 px-8 py-6 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <p className="text-slate-800 font-bold text-sm">Butuh bantuan memilih paket?</p>
            <p className="text-slate-500 text-xs font-medium mt-0.5">Diskusikan kebutuhan kantor Anda dengan tim kami, gratis.</p>
          </div>
        </div>
        <Button variant="outline" className="h-10 px-5 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm bg-white shadow-sm">
          Hubungi Tim Sales
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Menyiapkan Halaman Langganan...
          </p>
        </div>
      }
    >
      <SubscriptionPageContent />
    </Suspense>
  );
}
