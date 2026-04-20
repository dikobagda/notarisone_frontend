"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function useApiAuth() {
  const { data: session } = useSession();

  const headers = useMemo(() => {
    const h: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (session?.backendToken) {
      h["Authorization"] = `Bearer ${session.backendToken}`;
    }

    return h;
  }, [session?.backendToken]);

  return {
    token: session?.backendToken,
    headers,
    isAuthenticated: !!session?.backendToken,
  };
}
