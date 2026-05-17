import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Syarat & Ketentuan</h1>
          <p className="text-muted-foreground text-sm mb-8 italic">Terakhir diperbarui: 7 Mei 2026</p>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-foreground/80 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">1. Penerimaan Ketentuan</h2>
              <p>
                Dengan mengakses dan menggunakan platform penagraha, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju, harap jangan menggunakan layanan kami.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">2. Masa Uji Coba (Free Trial)</h2>
              <p>
                penagraha menyediakan masa uji coba gratis selama <strong>21 (dua puluh satu) hari</strong> untuk pengguna baru. Selama masa ini, Anda memiliki akses ke fitur-fitur tertentu untuk mengevaluasi layanan kami.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-700 dark:text-amber-400 font-medium text-sm">
                PENTING: Setelah masa uji coba 21 hari berakhir, jika Anda tidak melakukan upgrade ke paket berbayar, sistem penagraha akan secara otomatis menghapus seluruh data yang telah Anda masukkan tanpa terkecuali untuk menjaga efisiensi sistem dan keamanan data.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">3. Kewajiban Pengguna</h2>
              <p>
                Pengguna bertanggung jawab untuk menjaga kerahasiaan informasi akun dan password mereka. Anda setuju untuk segera memberitahu kami tentang penggunaan akun Anda yang tidak sah.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">4. Batasan Tanggung Jawab</h2>
              <p>
                penagraha tidak bertanggung jawab atas kerugian data yang terjadi karena kelalaian pengguna atau kegagalan untuk melakukan upgrade akun setelah masa uji coba berakhir.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">5. Perubahan Ketentuan</h2>
              <p>
                Kami berhak mengubah Syarat dan Ketentuan ini kapan saja. Perubahan akan berlaku segera setelah diposting di halaman ini.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
