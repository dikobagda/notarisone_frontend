"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle2,
  Download,
  ClipboardList,
  Save,
  AlertCircle,
  User,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { QuickAddAdditionalJob } from "@/components/dashboard/QuickAddAdditionalJob";

export default function EditConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [additionalJobsMaster, setAdditionalJobsMaster] = useState<any[]>([]);
  const [profilingData, setProfilingData] = useState({
    clientName: '',
    clientPhone: '',
    serviceCategory: 'NON_AKTA',
    description: '',
    documents: {
      KK: { checked: false, url: null },
      KTP: { checked: false, url: null },
      NPWP: { checked: false, url: null },
      Sertifikat: { checked: false, url: null },
      PBB: { checked: false, url: null },
    },
    additionalJobs: {} as Record<string, boolean>,
    estimatedCost: 0
  });

  const fetchData = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001";
      
      // 1. Fetch Jobs Master first to map IDs later
      const jobsRes = await fetch(`${backendUrl}/api/additional-jobs?tenantId=${tenantId}`, {
         headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const jobsData = await jobsRes.json();
      const masterJobs = Array.isArray(jobsData.data) ? jobsData.data : (jobsData.data?.data || []);
      setAdditionalJobsMaster(masterJobs);

      // 2. Fetch Consultation Detail
      const res = await fetch(`${backendUrl}/api/service-requests/${id}`, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await res.json();
      
      if (result.success) {
        const item = result.data;
        
        // Parse additionalJobs string back to IDs
        const selectedJobsMap: Record<string, boolean> = {};
        if (item.additionalJobs) {
          masterJobs.forEach((job: any) => {
            // Check if job name exists in the comma-separated string
            if (item.additionalJobs.includes(job.name)) {
              selectedJobsMap[job.id] = true;
            }
          });
        }

        setProfilingData({
          clientName: item.clientName || item.client?.name || '',
          clientPhone: item.clientPhone || item.client?.phone || '',
          serviceCategory: item.serviceCategory || 'NON_AKTA',
          description: item.description || '',
          documents: item.documents || profilingData.documents,
          additionalJobs: selectedJobsMap,
          estimatedCost: Number(item.estimatedCost) || 0
        });
      }
    } catch (error) {
      console.error("Error fetching edit data:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session, id]);

  // Calculate total estimated cost
  useEffect(() => {
    if (fetching) return;
    let total = 0;
    if (profilingData.serviceCategory === 'AKTA') total += 5000000;
    else if (profilingData.serviceCategory === 'PPAT') total += 7500000;
    else total += 1000000;

    additionalJobsMaster.forEach(job => {
      if (profilingData.additionalJobs[job.id]) total += Number(job.price);
    });

    setProfilingData(prev => ({ ...prev, estimatedCost: total }));
  }, [profilingData.additionalJobs, profilingData.serviceCategory, fetching]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const selectedJobs = additionalJobsMaster
        .filter(j => profilingData.additionalJobs[j.id])
        .map(j => `${j.name} (Rp ${Number(j.price).toLocaleString('id-ID')})`);

      const payload = {
        clientName: profilingData.clientName,
        clientPhone: profilingData.clientPhone,
        serviceCategory: profilingData.serviceCategory,
        documents: profilingData.documents,
        additionalJobs: selectedJobs.join(", "),
        estimatedCost: profilingData.estimatedCost,
        description: profilingData.description
      };

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001";
      const response = await fetch(`${backendUrl}/api/service-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any)?.backendToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        router.push(`/dashboard/penerimaan/${id}`);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(key);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001";
      const response = await fetch(`${backendUrl}/api/service-requests/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${(session as any)?.backendToken}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setProfilingData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [key]: { checked: true, url: result.data.url }
          }
        }));
      } else {
        alert(result.message || "Gagal mengunggah file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Terjadi kesalahan sistem saat mengunggah");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handlePreview = async (gsPath: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001";
      const response = await fetch(`${backendUrl}/api/deeds/files/preview?gsPath=${gsPath}`, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success) {
        window.open(result.data.url, '_blank');
      }
    } catch (error) {
      console.error("Preview error:", error);
    }
  };

  if (fetching) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="font-medium tracking-tight">Menyiapkan data edit...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-xl gap-2 text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Batal & Kembali
        </Button>
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-100">
          Mode Edit Konsultansi
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Edit Konsultansi</h1>
        <p className="text-slate-500 text-lg font-medium">Perbarui rincian identitas atau jenis pekerjaan klien.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Client Info */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-500" /> Identitas Klien
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nama Lengkap Klien</label>
                <Input 
                   className="h-12 rounded-xl border-slate-200"
                   value={profilingData.clientName}
                   onChange={(e) => setProfilingData(prev => ({ ...prev, clientName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">No. Telepon / WhatsApp</label>
                <Input 
                   className="h-12 rounded-xl border-slate-200"
                   value={profilingData.clientPhone}
                   onChange={(e) => setProfilingData(prev => ({ ...prev, clientPhone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="text-sm font-bold text-slate-700">Kategori Layanan</label>
              <div className="grid grid-cols-3 gap-3">
                {['AKTA', 'PPAT', 'NON_AKTA'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setProfilingData(prev => ({ ...prev, serviceCategory: cat }))}
                    className={`py-4 px-2 rounded-2xl border-2 font-bold text-sm transition-all cursor-pointer ${
                      profilingData.serviceCategory === cat 
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <div className="space-y-2 mt-4">
                <label className="text-sm font-bold text-slate-700">Deskripsi Singkat Permohonan</label>
                <Input 
                   className="h-12 rounded-xl border-slate-200"
                   value={profilingData.description}
                   onChange={(e) => setProfilingData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Documents */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-emerald-500" /> Kelengkapan Dokumen
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(profilingData.documents)
                .filter(([key]) => {
                  if (key === 'Sertifikat' || key === 'PBB') {
                    return profilingData.serviceCategory === 'PPAT';
                  }
                  return true;
                })
                .map(([key, val]: any) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id={key} 
                      checked={val.checked} 
                      onChange={(e) => setProfilingData(prev => ({
                        ...prev,
                        documents: { ...prev.documents, [key]: { ...val, checked: e.target.checked } }
                      }))}
                      className="h-5 w-5 rounded-md border-slate-300"
                    />
                    <label htmlFor={key} className="text-sm font-bold text-slate-700 cursor-pointer">{key}</label>
                  </div>
                  <div className="flex items-center gap-2">
                    {val.url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handlePreview(val.url)}
                        className="h-8 rounded-lg text-[10px] uppercase font-black tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                      >
                        Lihat
                      </Button>
                    )}
                    <div className="relative">
                      <input 
                        type="file" 
                        id={`file-${key}`}
                        className="hidden" 
                        onChange={(e) => handleFileUpload(key, e)}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={uploadingDoc === key}
                        className="h-8 rounded-lg text-[10px] uppercase font-black tracking-widest text-slate-400"
                        onClick={() => document.getElementById(`file-${key}`)?.click()}
                      >
                        {uploadingDoc === key ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Upload className="h-3 w-3 mr-1" />
                        )}
                        {val.url ? "Ganti" : "Unggah"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Additional Jobs */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <AlertCircle className="h-5 w-5 text-amber-500" /> Biaya Tambahan
              </h2>
              <QuickAddAdditionalJob onSuccess={(newJob) => setAdditionalJobsMaster(prev => [...prev, newJob])} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {additionalJobsMaster.map(job => (
                <div 
                  key={job.id}
                  onClick={() => setProfilingData(prev => ({
                    ...prev,
                    additionalJobs: {
                      ...prev.additionalJobs,
                      [job.id]: !prev.additionalJobs[job.id]
                    }
                  }))}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    profilingData.additionalJobs[job.id]
                      ? "border-amber-400 bg-amber-50"
                      : "border-slate-100 bg-slate-50/30 hover:border-slate-200"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{job.name}</span>
                    <span className="text-xs text-slate-500 font-medium">Rp {Number(job.price).toLocaleString('id-ID')}</span>
                  </div>
                  {profilingData.additionalJobs[job.id] && <CheckCircle2 className="h-5 w-5 text-amber-500" />}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-900/20 sticky top-10">
            <h3 className="text-lg font-bold mb-6">Pratinjau Biaya Baru</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Biaya Jasa Dasar</span>
                <span className="font-bold">Rp {(profilingData.serviceCategory === 'AKTA' ? 5000000 : profilingData.serviceCategory === 'PPAT' ? 7500000 : 1000000).toLocaleString('id-ID')}</span>
              </div>
              
              {additionalJobsMaster.filter(j => profilingData.additionalJobs[j.id]).map(j => (
                <div key={j.id} className="flex justify-between text-sm animate-in slide-in-from-right-2 duration-300">
                  <span className="text-slate-400">{j.name}</span>
                  <span className="font-bold text-amber-400">+ Rp {Number(j.price).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 mb-8">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-black mb-1">Total Estimasi Baru</p>
              <p className="text-3xl font-black text-white">Rp {profilingData.estimatedCost.toLocaleString('id-ID')}</p>
            </div>

            <Button 
              onClick={handleUpdate} 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all gap-2"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="h-5 w-5" /> Perbarui Data</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
