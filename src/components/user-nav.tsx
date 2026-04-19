"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { 
  User, 
  LogOut, 
  Zap, 
  Settings,
  Shield,
  Loader2,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const planConfig: Record<string, { label: string; color: string; bg: string; border: string; quota: number; used: number }> = {
  TRIAL:        { label: "Free Trial",   color: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-200",    quota: 5,   used: 0.5 },
  STARTER:      { label: "Starter",      color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200", quota: 5,   used: 1.2 },
  PROFESSIONAL: { label: "Professional", color: "text-violet-600",  bg: "bg-violet-50",   border: "border-violet-200",  quota: 50,  used: 18.7 },
  ENTERPRISE:   { label: "Enterprise",   color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200",   quota: 500, used: 120.4 },
};

export function UserNav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!session?.user) return null;

  const user = session.user;
  const userName = user.name || "Pengguna";
  const userEmail = user.email || "";
  const plan = (user as any)?.plan || "STARTER";
  const cfg = planConfig[plan] || planConfig.STARTER;

  const handleUpgrade = async () => {
    const nextTier =
      plan === "TRIAL" ? "STARTER" :
      plan === "STARTER" ? "PROFESSIONAL" :
      plan === "PROFESSIONAL" ? "ENTERPRISE" :
      null;

    if (!nextTier) return;

    setIsUpgrading(true);
    try {
      const token = (session as any)?.backendToken;
      const res = await fetch(`http://127.0.0.1:3001/api/subscription/checkout`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tier: nextTier }),
      });

      const data = await res.json();
      if (data.success && data.data.invoiceUrl) {
        window.location.href = data.data.invoiceUrl;
      } else {
        toast.error(data.message || "Gagal membuat invoice.");
        setIsUpgrading(false);
      }
    } catch (error) {
      console.error("Upgrade Error:", error);
      toast.error("Terjadi kesalahan jaringan.");
      setIsUpgrading(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title={userName}
        className={`h-8 w-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm transition-all cursor-pointer select-none ${
          open ? "bg-indigo-700 ring-2 ring-indigo-300 ring-offset-1 shadow-lg shadow-indigo-300/50" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300/50"
        }`}
      >
        {userName.charAt(0).toUpperCase()}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <>
          {/* Invisible overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2.5 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-slate-200/60 z-50 overflow-hidden">
            
            {/* User Info Header */}
            <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                <p className="text-xs text-slate-400 truncate">{userEmail}</p>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                {cfg.label}
              </span>
            </div>

            {/* Upgrade CTA */}
            {plan !== "ENTERPRISE" && (
              <div className="px-4 py-3 border-b border-gray-100">
                <button 
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 hover:from-indigo-100 hover:to-violet-100 transition-all group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    {isUpgrading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                    ) : (
                      <Zap className="h-3.5 w-3.5 text-indigo-500" />
                    )}
                    {isUpgrading ? "Memproses..." : `Upgrade ke ${plan === "TRIAL" ? "Starter" : plan === "STARTER" ? "Professional" : "Enterprise"}`}
                  </div>
                  {!isUpgrading && <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="p-2">
              <Link
                href="/dashboard/settings"
                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <div className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Settings className="h-3.5 w-3.5 text-slate-500" />
                </div>
                Pengaturan Akun
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-0.5 cursor-pointer"
              >
                <div className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center">
                  <LogOut className="h-3.5 w-3.5" />
                </div>
                Keluar Aplikasi
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
