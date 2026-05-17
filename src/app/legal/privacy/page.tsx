import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/auth/register" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Pendaftaran
        </Link>
        
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-sm">
          <h1 className="text-4xl font-bold text-foreground mb-4">Kebijakan Privasi</h1>
          <p className="text-muted-foreground text-sm mb-8 italic">Terakhir diperbarui: 7 Mei 2026</p>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-foreground/80 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">1. Informasi yang Kami Kumpulkan</h2>
              <p>
                Kami mengumpulkan informasi yang Anda berikan saat mendaftar, termasuk nama lengkap (sesuai KTP), alamat email, dan informasi kantor notaris Anda.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">2. Penggunaan Informasi</h2>
              <p>
                Informasi yang kami kumpulkan digunakan untuk menyediakan layanan, memproses pendaftaran, dan meningkatkan pengalaman pengguna di platform penagraha.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">3. Penghapusan Data Otomatis</h2>
              <p>
                Kami sangat menghargai privasi dan efisiensi penyimpanan data Anda. Sehubungan dengan program uji coba kami:
              </p>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-foreground/80 text-sm">
                <strong>Kebijakan Trial:</strong> Seluruh data pengguna yang terdaftar dalam paket "Free Trial" akan dihapus secara permanen dari server kami dalam waktu 24 jam setelah masa uji coba 21 hari berakhir, kecuali pengguna melakukan transisi ke paket berlangganan berbayar.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">4. Keamanan Data</h2>
              <p>
                Kami menggunakan langkah-langka teknis dan organisasi yang sesuai untuk melindungi data pribadi Anda dari akses yang tidak sah, kehilangan, atau pencurian.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">5. Kontak Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi tim dukungan kami melalui pusat bantuan di dalam aplikasi.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
