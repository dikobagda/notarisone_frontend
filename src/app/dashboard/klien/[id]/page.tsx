"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Edit3,
  Loader2,
  FileText,
  ExternalLink,
  Download,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      const tenantId = (session?.user as any)?.tenantId;
      if (!tenantId) return;

      try {
        setIsLoading(true);
        const url = `/api/clients/${unwrappedParams.id}?tenantId=${tenantId}`;
        console.log("DEBUG Detail Fetch:", url);
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${(session as any)?.backendToken}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setClient(result.data);
        } else {
          setApiError(result.message || "Gagal memuat data klien");
        }
      } catch (error) {
        console.error("Fetch client detail error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [session, unwrappedParams.id]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat Data Klien...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6 max-w-md mx-auto text-center">
        <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
           <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
           <h3 className="text-xl font-bold text-slate-900">Klien Tidak Terakses</h3>
           <p className="text-sm font-medium text-slate-500 leading-relaxed">
             {apiError || "Maaf, sistem tidak dapat menemukan data klien dengan ID tersebut."}
           </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard/klien")}>Kembali ke Daftar</Button>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <Button variant="ghost" className="gap-2 font-bold text-slate-500 px-0 hover:bg-transparent" onClick={() => router.push("/dashboard/klien")}>
            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Klien
          </Button>
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">{client.name}</h2>
            <div className="text-slate-500 font-medium flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-bold">Klien Perorangan</Badge>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              ID: {client.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
           <a href={`/dashboard/klien/${client.id}/edit`}>
             <Button className="font-bold bg-slate-900 hover:bg-slate-800 text-white h-11 px-8 rounded-xl gap-2 shadow-lg shadow-slate-900/10 transition-all active:scale-95">
                <Edit3 className="h-4 w-4" /> Edit Data Klien
             </Button>
           </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Section: Biodata Utama */}
          <Card className="border-none shadow-sm bg-white overflow-hidden py-0 gap-0">
            <div className="bg-slate-50/50 border-b border-slate-100 h-14 px-8 flex items-center shrink-0">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Biodata & Identitas</span>
            </div>
            <CardContent className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">NIK (Nomor Induk Kependudukan)</p>
                    <p className="text-lg font-bold text-slate-900 font-mono tracking-tighter flex items-center gap-2">
                       <CreditCard className="h-4 w-4 text-slate-300" /> {client.nik}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">NPWP</p>
                    <p className="text-lg font-bold text-slate-900 font-mono tracking-tighter">
                       {client.npwp || "Belum Terdaftar"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tempat, Tanggal Lahir</p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase">
                       <Calendar className="h-4 w-4 text-slate-300" /> {client.pob || "-"}, {client.dob || "-"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ditambahkan Pada</p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                       <Clock className="h-4 w-4 text-slate-300" /> {new Date(client.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* Section: Kontak & Alamat */}
          <Card className="border-none shadow-sm bg-white overflow-hidden py-0 gap-0">
            <div className="bg-slate-50/50 border-b border-slate-100 h-14 px-8 flex items-center shrink-0">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Informasi Kontak & Domisili</span>
            </div>
            <CardContent className="p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-slate-400" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email</p>
                        <p className="text-sm font-bold text-slate-900">{client.email}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-500">
                        <Phone className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No. WhatsApp</p>
                        <p className="text-sm font-bold text-slate-900">{client.phone}</p>
                     </div>
                  </div>
               </div>
               <div className="h-px bg-slate-100 w-full" />
               <div className="flex items-start gap-4 pt-2">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                     <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Alamat Domisili Sesuai KTP</p>
                     <p className="text-sm font-medium text-slate-600 leading-relaxed uppercase">{client.address}</p>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: OCR Cloud Documents */}
        <div className="space-y-8">
           <Card className="border-none shadow-sm bg-white overflow-hidden py-0 gap-0">
              <div className="bg-slate-950 h-14 px-6 flex flex-row items-center shrink-0">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 leading-none">
                    <FileText className="h-4 w-4 text-primary" /> Dokumen OCR (GCS)
                 </span>
              </div>
              <CardContent className="p-6 space-y-4">
                  {/* KTP Thumbnail */}
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">KTP Identity Card</p>
                     <div className="relative group rounded-xl border border-slate-100 overflow-hidden aspect-[3/2] bg-slate-50 flex items-center justify-center">
                        {client.ktpUrl ? (
                           <img src={client.ktpUrl} alt="KTP Scan" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : client.ktpPath ? (
                           <div className="w-full h-full flex items-center justify-center text-red-400 italic text-[10px] flex-col gap-2 p-4 text-center">
                              <AlertCircle className="h-4 w-4" />
                              <span>Gagal Memuat Preview (Cek Log Backend)</span>
                           </div>
                        ) : (
                           <p className="text-[10px] font-bold text-slate-300 italic text-center px-4">No KTP Scan Available</p>
                        )}
                        {client.ktpUrl && (
                           <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-white font-bold text-[10px] uppercase gap-1 hover:bg-white/20"
                                onClick={() => window.open(client.ktpUrl, '_blank')}
                              >
                                 <ExternalLink className="h-3 w-3" /> View Full
                              </Button>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* NPWP Thumbnail */}
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Tax ID (NPWP)</p>
                     <div className="relative group rounded-xl border border-slate-100 overflow-hidden aspect-[3/2] bg-slate-50 flex items-center justify-center">
                        {client.npwpUrl ? (
                           <img src={client.npwpUrl} alt="NPWP Scan" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : client.npwpPath ? (
                           <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-[10px] flex-col gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Decrypting Cloud Path...</span>
                           </div>
                        ) : (
                           <p className="text-[10px] font-bold text-slate-300 italic text-center px-4">No NPWP Scan Available</p>
                        )}
                        {client.npwpUrl && (
                           <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-white font-bold text-[10px] uppercase gap-1 hover:bg-white/20"
                                onClick={() => window.open(client.npwpUrl, '_blank')}
                              >
                                 <ExternalLink className="h-3 w-3" /> View Full
                              </Button>
                           </div>
                        )}
                     </div>
                  </div>

                 <div className="pt-2">
                    {/* Button removed by user request */}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
