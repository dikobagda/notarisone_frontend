"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/context/theme-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      <SessionProvider>
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
