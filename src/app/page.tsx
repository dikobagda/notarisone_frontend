"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  FileText, 
  Users, 
  ArrowRight,
  Gavel,
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronRight,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans selection:bg-primary/20">
      
      {/* 
        =========================================
        NAVIGATION BAR 
        =========================================
      */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "h-16 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm" 
            : "h-24 bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-2xl tracking-tighter text-foreground">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Gavel className="h-5 w-5" />
            </div>
            NotarisOne
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors" href="#fitur">
              Fitur
            </Link>
            <Link className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors" href="#keunggulan">
              Keunggulan
            </Link>
            <Link className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors" href="#testimoni">
              Testimoni
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hidden sm:block text-sm font-bold text-foreground hover:text-primary transition-colors">
              Masuk
            </Link>
            <Link href="/auth/login">
              <Button className="rounded-full px-6 shadow-md shadow-primary/20 font-bold hover:shadow-lg transition-all">
                Coba Gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24">
        
        {/* 
          =========================================
          HERO SECTION 
          =========================================
        */}
        <section className="relative pt-20 pb-32 px-6 lg:px-12 overflow-hidden flex flex-col items-center text-center">
          {/* Decorative Gradients */}
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[600px] bg-primary/10 rounded-[100%] blur-[120px] -z-10 pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs sm:text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            SaaS Manajemen Notaris #1 di Indonesia
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight mb-8 text-foreground leading-[1.05] max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Kelola Kantor Notaris dengan <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400 italic font-serif pr-2">Cepat, Tepat, & Aman.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Tinggalkan cara lama. NotarisOne memberikan Anda kendali penuh atas akta, klien, dan staf dalam satu platform <i>super-app</i> yang sepenuhnya patuh UUJN.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 w-full sm:w-auto">
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold gap-2 rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                Mulai Digitalisasi Sekarang
              </Button>
            </Link>
            <Link href="#fitur" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold border-2 rounded-full gap-2 hover:bg-slate-50 transition-all">
                Pelajari Fitur <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          </div>

          {/* Dashboard Mockup Image */}
          <div className="w-full max-w-6xl mx-auto relative perspective-1000 animate-in fade-in zoom-in-95 duration-1000 delay-500">
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
             <div className="relative rounded-2xl md:rounded-[2rem] border border-border/50 bg-background/50 backdrop-blur-sm p-2 md:p-4 shadow-2xl shadow-primary/10 overflow-hidden transform-gpu rotate-x-12 scale-100 origin-top hover:rotate-x-0 hover:scale-[1.02] transition-all duration-700 ease-out">
                <Image 
                  src="/dashboard-hero.png" 
                  alt="NotarisOne Dashboard Mockup" 
                  width={1400} 
                  height={900} 
                  className="rounded-xl md:rounded-[1.5rem] w-full object-cover border border-border/50 shadow-inner"
                  priority
                />
             </div>
          </div>
        </section>

        {/* 
          =========================================
          LOGOS / SOCIAL PROOF 
          =========================================
        */}
        <section className="py-12 border-y border-border/40 bg-muted/20">
          <div className="container mx-auto px-6">
            <p className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8">
              Dipercaya oleh Notaris & PPAT Terkemuka di Seluruh Indonesia
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Dummy Logos built with text/icons for demo */}
               <div className="flex items-center gap-2 font-serif font-bold text-xl"><BookOpen className="h-6 w-6"/> Firma Hukum JKT</div>
               <div className="flex items-center gap-2 font-sans font-extrabold text-2xl tracking-tighter">B&P <span className="font-light">Partners</span></div>
               <div className="flex items-center gap-2 font-serif italic text-xl">Notaris<span className="text-primary not-italic font-bold">Plus</span></div>
               <div className="flex items-center gap-2 font-black text-xl uppercase tracking-widest"><ShieldCheck className="h-6 w-6"/> Legalita</div>
            </div>
          </div>
        </section>

        {/* 
          =========================================
          FEATURES SECTION (BENTO GRID)
          =========================================
        */}
        <section id="fitur" className="py-24 lg:py-32 px-6 container mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Semua yang Anda butuhkan, dalam <span className="text-primary">satu layar.</span></h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Kami mendesain fitur-fitur NotarisOne secara spesifik untuk memecahkan masalah nyata yang dihadapi Notaris & PPAT setiap hari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Feature 1: Large */}
            <div className="md:col-span-2 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-10 lg:p-12 hover:shadow-xl transition-shadow group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20 transition-all group-hover:bg-primary/10" />
              <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-8">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Manajemen Akta Cerdas</h3>
              <p className="text-slate-600 leading-relaxed max-w-md">
                Pencatatan akta dari fase Draf hingga Finalisasi dengan alur yang sangat mudah. 
                Upload dokumen fisik dan lampiran secara terpusat tanpa takut kehilangan arsip.
              </p>
            </div>

            {/* Feature 2: Small */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 text-white p-10 hover:shadow-xl transition-shadow group">
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary/30 rounded-full blur-[50px] -mr-10 -mb-10" />
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 border border-white/10">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Audit Trail Transparan</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pantau siapa melakukan apa. Setiap perubahan data, penghapusan, dan aksi staf dicatat permanen dalam sistem.
              </p>
            </div>

            {/* Feature 3: Small */}
            <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 shadow-sm p-10 hover:shadow-xl transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-8">
                <Users className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900">Database Klien</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Menyimpan identitas, NIK, dan riwayat akta klien. Mempercepat pembuatan akta baru untuk klien lama.
              </p>
            </div>

            {/* Feature 4: Large */}
            <div className="md:col-span-2 relative overflow-hidden rounded-[2rem] bg-indigo-50 border border-indigo-100 p-10 lg:p-12 hover:shadow-xl transition-shadow group">
               <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-8 transform group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-indigo-950">Buku Register & Repertorium</h3>
              <p className="text-indigo-800/80 leading-relaxed max-w-md">
                Generate daftar akta bulanan untuk pelaporan standar UUJN secara otomatis. Tinggalkan pencatatan manual di buku besar yang rentan rusak atau hilang.
              </p>
            </div>

          </div>
        </section>

        {/* 
          =========================================
          KEUNGGULAN / METRICS
          =========================================
        */}
        <section id="keunggulan" className="py-24 bg-foreground text-background">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">Keamanan data Anda adalah prioritas absolut kami.</h2>
                <p className="text-muted leading-relaxed mb-8 text-lg">
                  Dokumen legal bersifat sangat rahasia. Kami membangun arsitektur keamanan dengan standar enterprise untuk memastikan data klien dan akta Anda terlindungi dari segala bentuk ancaman.
                </p>
                <ul className="space-y-4">
                  {[
                    "Enkripsi Data end-to-end",
                    "Isolasi Data Antar Kantor (Multi-tenant)",
                    "Akses Berbasis Peran (Role-based Access)",
                    "Penyimpanan Cloud Tersertifikasi"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-white">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative border border-white/10 rounded-[2rem] p-8 aspect-square flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                 <div className="relative text-center space-y-6 z-10">
                    <div className="mx-auto w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
                      <Lock className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <div className="text-6xl font-black text-white mb-2">99.9%</div>
                      <div className="text-muted font-bold tracking-widest uppercase text-sm">Server Uptime</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 
          =========================================
          TESTIMONIALS
          =========================================
        */}
        <section id="testimoni" className="py-24 lg:py-32 px-6 container mx-auto">
           <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Lebih dari Sekadar <span className="italic text-primary">Software</span>.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Dengar apa kata rekan sejawat Anda yang telah merasakan transformasi digital bersama NotarisOne.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testi 1 */}
            <div className="bg-white border text-left p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex text-amber-400 mb-6 gap-1">
                <Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" />
              </div>
              <p className="italic text-slate-600 mb-8 text-lg">"Sejak pakai NotarisOne, nyari draf akta klien lama hitungan detik. Staf saya tidak perlu lagi bongkar-bongkar lemari arsip. Sangat mengubah cara kerja kami!"</p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">AS</div>
                <div>
                  <div className="font-bold text-slate-900">Ahmad Setiawan, SH., M.Kn.</div>
                  <div className="text-sm text-slate-500">Notaris & PPAT Kota Bandung</div>
                </div>
              </div>
            </div>

            {/* Testi 2 */}
            <div className="bg-indigo-600 text-white border-transparent p-8 rounded-[2rem] shadow-xl shadow-indigo-600/20 transform md:-translate-y-4">
              <div className="flex text-amber-300 mb-6 gap-1">
                <Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" />
              </div>
              <p className="font-medium text-indigo-50 mb-8 text-lg">"Fitur Audit Trail sangat meyakinkan saya. Saya bisa pantau kinerja pegawai input akta dari mana saja. Pelaporannya pun sangat rapi dan akurat."</p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-white">DR</div>
                <div>
                  <div className="font-bold text-white">Diana Rosalina, SH., M.Kn.</div>
                  <div className="text-sm text-indigo-200">Notaris Jakarta Selatan</div>
                </div>
              </div>
            </div>

            {/* Testi 3 */}
            <div className="bg-white border text-left p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex text-amber-400 mb-6 gap-1">
                <Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" /><Star className="fill-current w-5 h-5" />
              </div>
              <p className="italic text-slate-600 mb-8 text-lg">"UI/UX-nya luar biasa bersih. Aplikasi legal biasanya kaku, tapi NotarisOne seperti pakai aplikasi tech modern. Pegawai saya langsung paham cara pakainya tanpa training lama."</p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">BP</div>
                <div>
                  <div className="font-bold text-slate-900">Budi Pratama, SH.</div>
                  <div className="text-sm text-slate-500">Kepala Bagian IT, Kantor Notaris</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 
          =========================================
          CTA BOTTOM
          =========================================
        */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-[3rem] p-12 lg:p-20 overflow-hidden relative text-center shadow-2xl flex flex-col items-center">
              <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[800px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 relative z-10 leading-tight">
                Tingkatkan Produktivitas Kantor <br className="hidden md:block" /> Notaris Anda Hari Ini.
              </h2>
              <p className="text-primary-foreground/80 mb-10 max-w-xl mx-auto text-lg leading-relaxed relative z-10">
                Pendaftaran hanya butuh 1 menit. Tanpa setup rumit, tanpa biaya tersembunyi. Khusus untuk Anda profesional hukum Indonesia.
              </p>
              <Link href="/auth/login" className="relative z-10 w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-full group bg-white text-primary hover:bg-slate-100 shadow-xl">
                  Daftar & Gunakan Gratis
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* 
        =========================================
        FOOTER
        =========================================
      */}
      <footer className="border-t border-border/40 bg-slate-50 pt-16 pb-8">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2.5 font-bold text-2xl tracking-tighter text-slate-900 mb-6">
                <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                  <Gavel className="h-5 w-5" />
                </div>
                NotarisOne
              </div>
              <p className="text-slate-500 leading-relaxed max-w-sm">
                Solusi Perangkat Lunak As-a-Service (SaaS) khusus dirancang untuk mendigitalkan dan mengorganisir operasional harian kantor Notaris & PPAT di Indonesia sesuai standar undang-undang.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Produk</h4>
              <ul className="space-y-3">
                <li><Link href="#fitur" className="text-slate-500 hover:text-primary transition-colors">Fitur Utama</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Keamanan</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Harga</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Testimonial</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Perusahaan</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Tentang Kami</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Kontak</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="#" className="text-slate-500 hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} NotarisOne SaaS. Hak Cipta Dilindungi Undang-Undang.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4"/> ISO 27001 Ready</span>
              <span>Made with ❤️ in Indonesia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
