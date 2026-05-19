"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";

export function SubscriptionGuard() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      // 1. Skip if not logged in or session is loading
      if (status !== "authenticated" || !session?.user) return;

      // 2. Skip if already on the subscription page (prevent loops)
      if (pathname.startsWith("/dashboard/subscription")) return;

      const plan = (session.user as any).plan;
      
      // 3. TRIAL plan has its own expiry logic, but we focus on "non trial" enforcement first
      // If the plan is TRIAL, we allow access for now (or until trial expires, handled separately)
      if (plan === "TRIAL") return;

      setIsChecking(true);
      try {
        const token = (session as any).backendToken;
        
        if (!token) {
          console.warn("[Guard] Backend token is missing. Skipping subscription check.");
          return;
        }

        // Fetch real status from backend using absolute URL
        const res = await fetch(getApiUrl("/api/subscription/status"), {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        const contentType = res.headers.get("content-type");
        if (!res.ok) {
          if (res.status === 403) {
            try {
              const data = await res.json();
              if (data.error === "Akses ditangguhkan" || data.message) {
                console.warn("[Guard] Tenant is suspended. Forcing logout.");
                await signOut({ 
                  callbackUrl: `/auth/login?error=suspended&message=${encodeURIComponent(data.message || "Akses kantor Anda telah ditangguhkan oleh administrator platform.")}` 
                });
                return;
              }
            } catch (e) {
              console.error("[Guard] Failed to parse 403 response:", e);
            }
          }
          if (res.status === 401) {
            console.error("[Guard] Session expired or invalid token. User might need to re-login.");
          } else {
            const text = await res.text();
            console.error(`[Guard] API Error (${res.status}):`, text.substring(0, 100));
          }
          return;
        }

        const result = await res.json();
        
        if (result.success) {
          const data = result.data;
          const expiresAt = data.subscriptionExpiresAt;
          const freshPlan = data.subscription;
          const currentPlan = (session.user as any)?.plan;

          // 4. Sync session if plan has changed (e.g. after upgrade simulation)
          if (freshPlan && freshPlan !== currentPlan) {
            console.log(`[Guard] Plan mismatch (Session: ${currentPlan}, DB: ${freshPlan}). Updating session...`);
            update({ plan: freshPlan });
          }
          
          // 5. Check if subscription is valid/paid
          const now = new Date();
          const isPaidAndActive = expiresAt && new Date(expiresAt) > now;

          // If it's a paid tier (non-TRIAL) but NOT active, redirect to checkout
          if (!isPaidAndActive) {
            console.log(`[Guard] Unpaid ${plan} plan detected. Redirecting to checkout...`);
            router.replace(`/dashboard/subscription?checkout=true&plan=${plan}`);
          }
        }
      } catch (error) {
        console.error("[Guard] Failed to verify subscription status:", error);
      } finally {
        setIsChecking(false);
      }
    }

    checkSubscription();
  }, [session, status, pathname, router]);

  return null; // This component doesn't render anything UI-wise
}
