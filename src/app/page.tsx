"use client";

import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Users,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronRight,
  Star,
  Calendar,
  Cloud,
  Zap,
  Eye,
  Banknote,
  Bell,
  ServerCog,
  TrendingUp,
  ScanLine,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

// ─── Google Brand SVGs ───────────────────────────────────────────────────────

const GoogleDriveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53h-21c0 1.55.4 3.1 1.1 4.5z" fill="#0066da"/>
    <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44A9.06 9.06 0 0 0 0 53h21z" fill="#00ac47"/>
    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.7-1.4 1.1-2.95 1.1-4.5H66.45l4.5 8.85z" fill="#ea4335"/>
    <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="M66.45 53h-45l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h63.5c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l22.8 28h21c0-1.55-.4-3.1-1.1-4.5z" fill="#ffba00"/>
  </svg>
);

const GoogleDocsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 4H12C9.8 4 8 5.8 8 8v32c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4V16L28 4z" fill="#4285F4"/>
    <path d="M28 4v12h12L28 4z" fill="#1A73E8"/>
    <path d="M16 28h16v2H16zm0-4h16v2H16zm0-4h10v2H16z" fill="white"/>
  </svg>
);

const GoogleCalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M36 4H12C9.8 4 8 5.8 8 8v32c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4V8c0-2.2-1.8-4-4-4z" fill="white"/>
    <path d="M36 4H12C9.8 4 8 5.8 8 8v4h32V8c0-2.2-1.8-4-4-4z" fill="#EA4335"/>
    <path d="M8 12h32v6H8z" fill="#EA4335"/>
    <path d="M8 18h32v22H8z" fill="white"/>
    <rect x="14" y="24" width="6" height="6" rx="1" fill="#4285F4"/>
    <rect x="22" y="24" width="6" height="6" rx="1" fill="#34A853"/>
    <rect x="30" y="24" width="4" height="6" rx="1" fill="#FBBC05"/>
    <rect x="14" y="32" width="6" height="4" rx="1" fill="#34A853"/>
    <rect x="22" y="32" width="6" height="4" rx="1" fill="#EA4335"/>
    <path d="M14 10h4v4h-4zm16 0h4v4h-4z" fill="white"/>
  </svg>
);

const GoogleCloudIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893C.9 9.966-.36 11.6.072 13.567c.444 2.004 2.109 3.547 4.121 3.787A4.484 4.484 0 0 0 4.55 17.5h11a5.5 5.5 0 0 0 1.118-10.871 7.5 7.5 0 0 0-4.468-4.241z" fill="#4285F4"/>
    <path d="M15.55 17.5h-11a4.484 4.484 0 0 1-.357-.146C1.88 15.635.85 12.86 2.01 10.468a7.344 7.344 0 0 1 .946-1.595 9.344 9.344 0 0 0-1.695 4.4c-.44 2.004.82 3.875 2.831 4.227z" fill="#1A73E8" opacity=".4"/>
  </svg>
);

// ─── Interactive mouse-tracking animated background ──────────────────────────

function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      color: string;
    }

    const COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff", "#7c3aed"];
    const PARTICLE_COUNT = 60;
    let particles: Particle[] = [];

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };

    const spawnParticle = (): Particle => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
      alpha: Math.random() * 0.5 + 0.15,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });

    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, spawnParticle);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    canvas.addEventListener("mousemove", handleMouse);
    canvas.addEventListener("mouseleave", handleLeave);
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const REPULSE = 120;
        if (dist < REPULSE) {
          const force = (REPULSE - dist) / REPULSE;
          p.vx += (dx / dist) * force * 0.8;
          p.vy += (dy / dist) * force * 0.8;
        }

        // Friction
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "#818cf8";
            ctx.globalAlpha = (1 - dist / 100) * 0.15;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-auto"
      style={{ opacity: 0.85 }}
    />
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const integrations = [
  { icon: <GoogleDriveIcon />, label: "Google Drive", desc: "Simpan & akses dokumen" },
  { icon: <GoogleDocsIcon />, label: "Google Docs", desc: "Edit akta kolaboratif" },
  { icon: <GoogleCalendarIcon />, label: "Google Calendar", desc: "Sinkron jadwal otomatis" },
  { icon: <GoogleCloudIcon />, label: "Cloud Storage", desc: "Arsip terenkripsi aman" },
];

const features = [
  { icon: <FileText className="h-5 w-5" />, color: "text-indigo-600 bg-indigo-50", title: "Manajemen Akta & Dokumen", desc: "Kelola draf, finalisasi, dan versi akta dalam satu alur terintegrasi. Pencarian instan dalam milidetik.", badge: null },
  { icon: <ScanLine className="h-5 w-5" />, color: "text-violet-600 bg-violet-50", title: "OCR Scan Dokumen", desc: "Scan KTP, NPWP, dan sertifikat tanah langsung dari aplikasi. AI mengekstrak data otomatis.", badge: "AI-Powered" },
  { icon: <Users className="h-5 w-5" />, color: "text-emerald-600 bg-emerald-50", title: "Database Klien & Stakeholder", desc: "Simpan NIK, riwayat akta, dan relasi antar-klien. Isi formulir baru untuk klien lama dalam hitungan detik.", badge: null },
  { icon: <BookOpen className="h-5 w-5" />, color: "text-amber-600 bg-amber-50", title: "Register & Repertorium", desc: "Buku protokol digital sesuai standar UUJN. Generate laporan bulanan otomatis tanpa pencatatan manual.", badge: null },
  { icon: <Calendar className="h-5 w-5" />, color: "text-sky-600 bg-sky-50", title: "Jadwal & Kalender", desc: "Atur jadwal penandatanganan, konsultasi, dan survei lapangan. Sinkron otomatis ke Google Calendar.", badge: "Sync Google" },
  { icon: <Banknote className="h-5 w-5" />, color: "text-orange-600 bg-orange-50", title: "Manajemen Keuangan", desc: "Buat invoice, catat pembayaran, dan pantau status tagihan secara real-time dengan laporan otomatis.", badge: null },
  { icon: <Eye className="h-5 w-5" />, color: "text-red-600 bg-red-50", title: "Audit Trail", desc: "Setiap aksi tercatat permanen — siapa melakukan apa dan kapan. Kontrol penuh atas aktivitas staf.", badge: null },
  { icon: <Bell className="h-5 w-5" />, color: "text-pink-600 bg-pink-50", title: "Notifikasi Cerdas", desc: "Ingatkan deadline akta, pembayaran jatuh tempo, dan konfirmasi klien secara otomatis.", badge: null },
  { icon: <TrendingUp className="h-5 w-5" />, color: "text-teal-600 bg-teal-50", title: "Laporan & Analitik", desc: "Dashboard eksekutif dengan metrik jumlah akta, pendapatan, dan produktivitas staf dalam visualisasi jelas.", badge: null },
];

const trustPoints = [
  { icon: <Lock className="h-5 w-5" />, title: "Enkripsi End-to-End", desc: "Semua data dienkripsi AES-256 saat transit dan saat diam." },
  { icon: <ServerCog className="h-5 w-5" />, title: "Multi-tenant Isolation", desc: "Data antar kantor notaris sepenuhnya terisolasi." },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Role-based Access", desc: "Batasi akses staf hanya pada data yang relevan dengan perannya." },
  { icon: <Globe className="h-5 w-5" />, title: "99.9% Uptime SLA", desc: "Infrastruktur cloud redundan memastikan platform selalu tersedia." },
];

const testimonials = [
  { text: "Sejak pakai NotarisOne, nyari draf akta klien lama hitungan detik. Staf saya tidak perlu lagi bongkar-bongkar lemari arsip.", name: "Ahmad Setiawan, SH., M.Kn.", role: "Notaris & PPAT Kota Bandung", initials: "AS", highlight: false },
  { text: "Fitur Audit Trail sangat meyakinkan saya. Bisa pantau kinerja pegawai dari mana saja. Pelaporannya pun rapi dan akurat.", name: "Diana Rosalina, SH., M.Kn.", role: "Notaris Jakarta Selatan", initials: "DR", highlight: true },
  { text: "UI/UX-nya luar biasa bersih. Aplikasi legal biasanya kaku, tapi NotarisOne modern sekali. Pegawai saya langsung paham tanpa training lama.", name: "Budi Pratama, SH.", role: "Kepala Bagian IT, Kantor Notaris", initials: "BP", highlight: false },
];

// ─── Logo (matches dashboard sidebar) ───────────────────────────────────────

function BrandLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const boxSize = size === "lg" ? "h-11 w-11 text-2xl" : size === "sm" ? "h-7 w-7 text-base" : "h-9 w-9 text-xl";
  const textSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative ${boxSize} shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 font-bold text-white`}>
        N
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-bold ${textSize} tracking-tight text-slate-900`}>NotarisOne</span>
        <span className="text-[9px] font-semibold tracking-widest uppercase text-slate-400 mt-0.5">Legal Platform</span>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-indigo-100">

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-md shadow-slate-200/60" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <BrandLogo size="sm" />

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Fitur", href: "#fitur" },
              { label: "Keamanan", href: "#keamanan" },
              { label: "Integrasi", href: "#integrasi" },
              { label: "Testimoni", href: "#testimoni" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Masuk
            </Link>
            <Link href="/auth/login">
              <Button className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:shadow-indigo-600/40">
                Coba Gratis
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <button className="md:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-6 py-4 flex flex-col gap-4 shadow-sm">
            {[
              { label: "Fitur", href: "#fitur" },
              { label: "Keamanan", href: "#keamanan" },
              { label: "Integrasi", href: "#integrasi" },
              { label: "Testimoni", href: "#testimoni" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="text-sm font-medium text-slate-700" onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
              <Button className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25">
                Coba Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 pt-16">

        {/* ── HERO ── */}
        <section className="relative pt-28 pb-24 px-6 flex flex-col items-center text-center overflow-hidden" style={{ minHeight: "88vh" }}>
          {/* Interactive animated canvas background */}
          <HeroBackground />

          {/* Soft gradient overlay on top of canvas */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-100/30 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-0 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 bg-white/80 backdrop-blur-sm text-indigo-700 text-xs font-semibold mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              Platform Manajemen Notaris #1 Indonesia
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-[1.08] animate-in fade-in slide-in-from-bottom-6 duration-600 delay-100">
              Kelola Akta & Dokumen Notaris{" "}
              <span className="text-indigo-600">dengan Aman,</span>{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Cepat & Modern.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-600 delay-200">
              Digitalisasi kantor notaris Anda dengan platform cloud yang terintegrasi penuh dengan ekosistem Google — Drive, Docs, Calendar, dan Cloud Storage.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14 animate-in fade-in slide-in-from-bottom-10 duration-600 delay-300">
              <Link href="/auth/login">
                <Button size="lg" className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5 transition-all">
                  Coba Gratis 14 Hari
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#fitur">
                <Button variant="ghost" size="lg" className="h-12 px-8 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-base hover:bg-white/80 backdrop-blur-sm transition-all border border-slate-200/80">
                  Lihat Fitur
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 animate-in fade-in duration-700 delay-500">
              {[
                { icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />, text: "Tanpa Kartu Kredit" },
                { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, text: "Setup dalam 5 Menit" },
                { icon: <Lock className="h-4 w-4 text-emerald-500" />, text: "Data Terenkripsi AES-256" },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5 font-medium">
                  {t.icon}
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GOOGLE INTEGRATIONS ── */}
        <section id="integrasi" className="py-16 border-y border-slate-100 bg-slate-50/50">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">
              Terintegrasi Penuh dengan Ekosistem Google
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {integrations.map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
                  <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="fitur" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Fitur Unggulan</p>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-5">
                Semua yang dibutuhkan notaris,<br />dalam satu platform.
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                Dirancang khusus untuk memecahkan masalah nyata yang dihadapi Notaris & PPAT setiap hari.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <div key={i} className="group relative p-7 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/80 hover:-translate-y-1 transition-all duration-300">
                  {f.badge && (
                    <span className="absolute top-5 right-5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {f.badge}
                    </span>
                  )}
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECURITY ── */}
        <section id="keamanan" className="py-24 px-6 bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Keamanan Enterprise</p>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                  Dokumen legal Anda adalah aset. Kami jaga seperti brankas.
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-10">
                  Arsitektur keamanan berlapis memastikan data klien dan akta Anda terlindungi dari segala ancaman — dari dalam maupun luar.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trustPoints.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                        {p.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{p.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: "99.9%", label: "Server Uptime", sub: "SLA Terjamin" },
                  { val: "AES-256", label: "Enkripsi Data", sub: "Standar Bank" },
                  { val: "0", label: "Data Breach", sub: "Sejak Berdiri" },
                  { val: "100%", label: "UUJN Compliant", sub: "Terverifikasi" },
                ].map((m, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex flex-col justify-between">
                    <div className="text-3xl font-black text-white mb-1">{m.val}</div>
                    <div>
                      <div className="text-sm font-bold text-slate-300">{m.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{m.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimoni" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Testimoni</p>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-5">
                Dipercaya Notaris di seluruh Indonesia.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className={`p-8 rounded-2xl border ${
                  t.highlight
                    ? "bg-indigo-600 border-transparent shadow-2xl shadow-indigo-600/25 md:-translate-y-3"
                    : "bg-white border-slate-100 shadow-sm"
                } transition-all duration-300`}>
                  <div className={`flex gap-1 mb-5 ${t.highlight ? "text-amber-300" : "text-amber-400"}`}>
                    {[...Array(5)].map((_, j) => <Star key={j} className="fill-current w-4 h-4" />)}
                  </div>
                  <p className={`text-base leading-relaxed mb-8 ${t.highlight ? "text-indigo-50" : "text-slate-600 italic"}`}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${t.highlight ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${t.highlight ? "text-white" : "text-slate-900"}`}>{t.name}</div>
                      <div className={`text-xs mt-0.5 ${t.highlight ? "text-indigo-200" : "text-slate-500"}`}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-indigo-600 rounded-3xl p-12 lg:p-16 overflow-hidden text-center">
              <div className="absolute inset-0 -z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-800/40 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                  Mulai digitalisasi kantor Anda hari ini.
                </h2>
                <p className="text-indigo-200 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                  14 hari gratis. Tanpa kartu kredit. Setup dalam 5 menit.
                </p>
                <Link href="/auth/login" className="inline-block w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-13 px-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-base shadow-xl hover:-translate-y-0.5 transition-all">
                    Coba Gratis Sekarang
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 bg-slate-50 pt-14 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-4">
                <BrandLogo size="sm" />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Platform SaaS manajemen kantor Notaris & PPAT berbasis cloud. Aman, modern, dan patuh UUJN.
              </p>
              <div className="flex items-center gap-2 mt-5 flex-wrap">
                {[
                  { icon: <GoogleDriveIcon />, label: "Drive" },
                  { icon: <GoogleDocsIcon />, label: "Docs" },
                  { icon: <GoogleCalendarIcon />, label: "Calendar" },
                  { icon: <GoogleCloudIcon />, label: "Cloud" },
                ].map((b) => (
                  <span key={b.label} className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-500">
                    {b.icon}
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-4">Produk</h4>
              <ul className="space-y-2.5 text-sm">
                {[["Fitur Utama", "#fitur"], ["Keamanan", "#keamanan"], ["Integrasi", "#integrasi"], ["Testimoni", "#testimoni"]].map(([item, href]) => (
                  <li key={item}><Link href={href} className="text-slate-500 hover:text-indigo-600 transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-4">Perusahaan</h4>
              <ul className="space-y-2.5 text-sm">
                {["Tentang Kami", "Kontak", "Kebijakan Privasi", "Syarat & Ketentuan"].map((item) => (
                  <li key={item}><Link href="#" className="text-slate-500 hover:text-indigo-600 transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} NotarisOne. Hak Cipta Dilindungi Undang-Undang.</p>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                ISO 27001 Ready
              </span>
              <a
                href="https://uridu.id"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 transition-colors font-medium"
              >
                Powered by Uridu
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
