import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Providers } from "@/components/providers";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "NotarisOne - Platform Manajemen Notaris Modern",
  description: "Solusi SaaS terpadu untuk manajemen akta, klien, dan protokol notaris di Indonesia.",
  icons: {
    icon: "/favicon.svg",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${montserrat.variable} ${montserrat.className} font-sans`}>
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster position="top-center" expand={true} richColors closeButton />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
