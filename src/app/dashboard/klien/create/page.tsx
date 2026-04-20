"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ArrowLeft,
  CreditCard,
  Upload,
  Loader2,
  CheckCircle2,
  Calendar as CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check } from "lucide-react";

export default function CreateClientPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // KTP OCR State
  const [isExtracting, setIsExtracting] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("Menunggu File KTP...");
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // NPWP OCR State
  const [isExtractingNPWP, setIsExtractingNPWP] = useState(false);
  const [npwpProgress, setNpwpProgress] = useState(0);
  const [npwpStatus, setNpwpStatus] = useState("Menunggu File NPWP...");
  const [npwpError, setNpwpError] = useState<string | null>(null);
  const [npwpPreviewUrl, setNpwpPreviewUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    npwp: "", // New NPWP field
    pob: "", // Place of birth
    dob: "",
    address: "",
    email: "",
    phone: "",
    ktpPath: "",
    npwpPath: ""
  });

  const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

      setIsExtracting(true);
      setOcrStatus("Mengirim Gambar ke Vision AI...");
      setOcrProgress(10);
      setOcrError(null);

      const formDataObj = new FormData();
      formDataObj.append('ktp', file);

      try {
        const progressInterval = setInterval(() => {
          setOcrProgress(prev => {
            if (prev < 40) return prev + 15;
            if (prev < 70) { setOcrStatus("Mengekstrak Teks..."); return prev + 10; }
            if (prev < 90) { setOcrStatus("Memproses Identitas..."); return prev + 5; }
            return prev;
          });
        }, 400);

        const response = await fetch('/api/ocr/ktp', {
          method: 'POST',
          body: formDataObj,
        });

        const result = await response.json();
        clearInterval(progressInterval);
        setOcrProgress(100);

        if (result.success) {
          setOcrStatus("Data Berhasil Diekstrak!");
          const { nik, name, pob, dob, address, ktpPath } = result.data;
          
          const formatValue = (val: string) => val ? val.trim().toUpperCase() : "";

          setFormData(prev => ({
            ...prev,
            nik: nik || prev.nik,
            name: name ? formatValue(name) : prev.name,
            pob: pob ? formatValue(pob) : prev.pob,
            dob: dob ? dob : prev.dob,
            address: address ? formatValue(address) : prev.address,
            ktpPath: ktpPath || prev.ktpPath
          }));
        } else {
          setOcrStatus("Gagal Membaca KTP");
          setOcrError(result.message);
        }
      } catch (error: any) {
        setOcrStatus("Koneksi Error");
        setOcrError(error.message);
      } finally {
        setTimeout(() => setIsExtracting(false), 800);
      }
  };

  const handleNPWPOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setNpwpPreviewUrl(url);

    setIsExtractingNPWP(true);
    setNpwpStatus("Mengirim NPWP ke Vision AI...");
    setNpwpProgress(10);
    setNpwpError(null);

    const formDataObj = new FormData();
    formDataObj.append('npwp', file);

    try {
      const progressInterval = setInterval(() => {
        setNpwpProgress(prev => {
          if (prev < 40) return prev + 15;
          if (prev < 70) { setNpwpStatus("Mengekstrak NPWP..."); return prev + 10; }
          return prev;
        });
      }, 400);

      const response = await fetch('/api/ocr/npwp', {
        method: 'POST',
        body: formDataObj,
      });

      const result = await response.json();
      clearInterval(progressInterval);
      setNpwpProgress(100);

      if (result.success) {
        setNpwpStatus("NPWP Berhasil Diekstrak!");
        const { npwp, name, npwpPath } = result.data;
        
        setFormData(prev => ({
          ...prev,
          npwp: npwp || prev.npwp,
          name: !prev.name && name ? name.toUpperCase() : prev.name,
          npwpPath: npwpPath || prev.npwpPath
        }));
      } else {
        setNpwpStatus("Gagal Membaca NPWP");
        setNpwpError(result.message);
      }
    } catch (error: any) {
      setNpwpStatus("Koneksi Error");
      setNpwpError(error.message);
    } finally {
      setTimeout(() => setIsExtractingNPWP(false), 800);
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Nama wajib diisi";
    if (!formData.email) newErrors.email = "Email wajib diisi";
    if (!formData.phone) newErrors.phone = "No. WhatsApp wajib diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      setOcrError("Tenant ID tidak ditemukan. Mohon login ulang.");
      return;
    }

    try {
      setErrors({});
      const response = await fetch(`/api/clients?tenantId=${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any)?.backendToken}`
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setShowSuccess(true);
        // Delay redirect to show success message
        setTimeout(() => {
          router.push("/dashboard/klien");
        }, 2000);
      } else {
        setOcrError(result.message || "Gagal menyimpan data klien");
      }
    } catch (error: any) {
      setOcrError("Terjadi kesalahan sistem saat menyimpan");
      console.error("Save Client Error:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-4xl mx-auto w-full">
      {showSuccess && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 animate-in fade-in slide-in-from-top-4 duration-500">
          <Check className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="font-bold">Pendaftaran Berhasil!</AlertTitle>
          <AlertDescription className="font-medium text-emerald-600/80">
            Data klien telah disimpan secara permanen ke database. Mengalihkan halaman...
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-11 w-11 rounded-xl border-slate-200"
          onClick={() => router.push("/dashboard/klien")}
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Registrasi Klien Baru</h2>
          <p className="text-slate-500 mt-1 font-medium">Gunakan fitur OCR untuk ekstraksi data otomatis dari KTP.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Top Header Section */}
        <div className="bg-slate-950 p-6 text-white hidden">
           {/* Legacy dialog header logic - we keep this clean here */}
        </div>
        
        <div className="p-8 space-y-8">
           {/* OCR Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                 <div className={`relative border-2 border-dashed rounded-2xl p-6 h-48 flex flex-col items-center justify-center gap-3 transition-all text-center overflow-hidden ${
                    previewUrl ? 'border-primary/20 bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                 }`}>
                    {previewUrl ? (
                       <>
                          <img src={previewUrl} alt="Preview KTP" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" />
                          {isExtracting && (
                             <div className="absolute inset-x-0 h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-[scan_2s_ease-in-out_infinite] z-10" />
                          )}
                          <div className="relative z-20 flex flex-col items-center gap-2">
                             {isExtracting ? (
                                <>
                                   <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                   <div className="space-y-2">
                                      <p className="text-sm font-bold text-slate-900">{ocrStatus}</p>
                                      <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden mx-auto">
                                         <div className="h-full bg-primary transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
                                      </div>
                                   </div>
                                </>
                             ) : (
                                <>
                                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                       <CheckCircle2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-900">Upload Berhasil</p>
                                    <Button variant="outline" size="sm" onClick={() => { setPreviewUrl(null); }} className="h-7 text-[10px] uppercase font-bold px-3">Ganti Foto</Button>
                                 </>
                              )}
                           </div>
                        </>
                     ) : (
                        <>
                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleOCR} accept="image/*" />
                           <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors">
                              <Upload className="h-8 w-8 text-slate-300 group-hover:text-primary" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-600">Scan KTP (OCR Indonesia)</p>
                              <p className="text-[10px] text-slate-400 font-medium font-mono">JPG, PNG up to 5MB</p>
                           </div>
                        </>
                     )}
                  </div>
                  {ocrError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mt-2 ml-1">KTP Error: {ocrError}</p>}
               </div>
              <div className="relative group">
                 <div className={`relative border-2 border-dashed rounded-2xl p-6 h-48 flex flex-col items-center justify-center gap-3 transition-all text-center overflow-hidden ${
                    npwpPreviewUrl ? 'border-primary/20 bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                 }`}>
                    {npwpPreviewUrl ? (
                       <>
                          <img src={npwpPreviewUrl} alt="Preview NPWP" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" />
                          {isExtractingNPWP && (
                             <div className="absolute inset-x-0 h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-[scan_2s_ease-in-out_infinite] z-10" />
                          )}
                          <div className="relative z-20 flex flex-col items-center gap-2">
                             {isExtractingNPWP ? (
                                <>
                                   <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                   <div className="space-y-2">
                                      <p className="text-sm font-bold text-slate-900">{npwpStatus}</p>
                                      <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden mx-auto">
                                         <div className="h-full bg-primary transition-all duration-300" style={{ width: `${npwpProgress}%` }} />
                                      </div>
                                   </div>
                                </>
                             ) : (
                                <>
                                   <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                      <CheckCircle2 className="h-6 w-6 text-primary" />
                                   </div>
                                   <p className="text-xs font-bold text-slate-900">Upload NPWP Berhasil</p>
                                   <Button variant="outline" size="sm" onClick={() => { setNpwpPreviewUrl(null); }} className="h-7 text-[10px] uppercase font-bold px-3">Ganti Foto</Button>
                                </>
                             )}
                          </div>
                       </>
                    ) : (
                       <>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleNPWPOCR} accept="image/*" />
                          <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors">
                             <CreditCard className="h-8 w-8 text-slate-300 group-hover:text-primary" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-xs font-bold text-slate-600">Scan NPWP</p>
                             <p className="text-[10px] text-slate-400 font-medium font-mono">Ekstraksi ID & Nama</p>
                          </div>
                       </>
                    )}
                 </div>
                 {npwpError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mt-2 ml-1">NPWP Error: {npwpError}</p>}
              </div>
           </div>



           <div className="h-px bg-slate-100" />

           <div className="grid gap-6">
               <div className="grid gap-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Nama Lengkap (Sesuai KTP/NPWP) <span className="text-red-500">*</span></label>
                 <Input 
                   value={formData.name} 
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   placeholder="Masukan nama lengkap..." 
                   className={`rounded-xl border-slate-200 h-11 font-bold ${errors.name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                 />
                 {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.name}</p>}
               </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">NIK (16 Digit)</label>
                  <Input 
                    value={formData.nik}
                    onChange={e => setFormData({...formData, nik: e.target.value})}
                    placeholder="Contoh: 31710..." 
                    className="rounded-xl border-slate-200 h-11 font-bold font-mono tracking-wider"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">NPWP (15/16 Digit)</label>
                  <Input 
                    value={formData.npwp}
                    onChange={e => setFormData({...formData, npwp: e.target.value})}
                    placeholder="Contoh: 12.345.678.9-012.000" 
                    className="rounded-xl border-slate-200 h-11 font-bold font-mono tracking-wider"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Tempat Lahir</label>
                    <Input 
                      value={formData.pob}
                      onChange={e => setFormData({...formData, pob: e.target.value})}
                      placeholder="Kota..." 
                      className="rounded-xl border-slate-200 h-11 font-bold"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Tgl. Lahir</label>
                    <Input 
                      type="date"
                      value={formData.dob}
                      onChange={e => setFormData({...formData, dob: e.target.value})}
                      className="rounded-xl border-slate-200 h-11 font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Email <span className="text-red-500">*</span></label>
                    <Input 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="email@klien.com" 
                      className={`rounded-xl border-slate-200 h-11 font-bold ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.email}</p>}
                  </div>
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">No. WhatsApp <span className="text-red-500">*</span></label>
                    <Input 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="0812..." 
                      className={`rounded-xl border-slate-200 h-11 font-bold ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    />
                    {errors.phone && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.phone}</p>}
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Alamat Lengkap (Domisili / KTP)</label>
                <Input 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="Jalan, No. Rumah, RT/RW, Kel, Kec..." 
                  className="rounded-xl border-slate-200 h-11 font-bold"
                />
              </div>
           </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Pastikan data valid sebelum disimpan</span>
           <div className="flex gap-4">
             <Button variant="outline" onClick={() => router.push("/dashboard/klien")} className="font-bold px-6 h-11 rounded-xl">Batal</Button>
             <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 font-bold px-10 h-11 rounded-xl shadow-lg shadow-primary/20">Simpan & Daftarkan Klien</Button>
           </div>
        </div>
      </div>
    </div>
  );
}
