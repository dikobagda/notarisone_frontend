"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Library,
  Search,
  FolderOpen,
  FileText,
  Download,
  Eye,
  Upload,
  Filter,
  BookOpen,
  Scale,
  Briefcase,
  Globe,
  Lock,
  Star,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const CATEGORIES = ["Semua", "Akta Notaris", "Akta PPAT", "Non-Akta", "SOP & Regulasi"];

export default function PerpustakaanPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const PAGE_SIZE = 6;

  // Upload Form State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "Non-Akta",
    file: null as File | null,
  });

  const fetchTemplates = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    
    try {
      setIsLoading(true);
      const url = `/api/library${tenantId ? `?tenantId=${tenantId}` : ""}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setTemplates(result.data);
      } else {
        toast.error(result.message || "Gagal memuat data");
      }
    } catch (err) {
      console.error("Failed to fetch templates", err);
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTemplates();
    }
  }, [session]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.category || !uploadForm.file) {
      toast.error("Silakan lengkapi form dan pilih file");
      return;
    }

    const token = (session as any)?.backendToken;
    if (!token) return;

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("description", uploadForm.description);
      formData.append("category", uploadForm.category);
      formData.append("file", uploadForm.file);

      const res = await fetch("/api/library/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Template berhasil diunggah!");
        setIsUploadOpen(false);
        setUploadForm({ title: "", description: "", category: "Non-Akta", file: null });
        fetchTemplates(); // Refresh grid
      } else {
        toast.error(result.message || "Gagal mengunggah template");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem saat mengunggah file.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownload = async (item: any) => {
    const token = (session as any)?.backendToken;
    if (!token) return;
    
    try {
      const res = await fetch(`/api/library/${item.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result = await res.json();
      
      if (result.success && result.data?.url) {
        window.open(result.data.url, "_blank");
      } else {
        toast.error(result.message || "Gagal mendapatkan link download");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem");
    }
  };

  const filteredTemplates = templates.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const visibleTemplates = filteredTemplates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTemplates.length;
  const remaining = filteredTemplates.length - visibleCount;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Akta Notaris": return <FileText className="h-4 w-4 text-indigo-500" />;
      case "Akta PPAT": return <Scale className="h-4 w-4 text-emerald-500" />;
      case "Non-Akta": return <Briefcase className="h-4 w-4 text-amber-500" />;
      case "SOP & Regulasi": return <BookOpen className="h-4 w-4 text-rose-500" />;
      default: return <FolderOpen className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Dark Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-10 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-3xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 backdrop-blur-md shadow-inner">
              <Library className="h-10 w-10 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-[10px] font-black text-indigo-300 uppercase tracking-widest border border-indigo-500/30">
                  Pusat Pengetahuan
                </span>
              </div>
              <h1 className="text-3xl font-black text-white leading-tight mb-2 tracking-tight">Perpustakaan Digital</h1>
              <p className="text-sm text-white/50 font-bold max-w-md">
                Pusat data knowledge, template akta, dan dokumen referensi untuk mempermudah pekerjaan Anda.
              </p>
            </div>
          </div>

          <div className="flex shrink-0">
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black h-14 px-8 rounded-2xl shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.5)] transition-all border-0 flex items-center gap-2"
            >
              <Upload className="h-5 w-5" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Row ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari template atau dokumen..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(6); }}
            className="pl-11 h-12 rounded-2xl border-slate-200 text-sm font-bold bg-white focus-visible:ring-indigo-500 shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => { setSelectedCategory(category); setVisibleCount(6); }}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                selectedCategory === category
                  ? "bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      {/* ── Grid Content ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-slate-100 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-100 rounded-lg w-24" />
                  <div className="h-3 bg-slate-50 rounded-lg w-16" />
                </div>
              </div>
              <div className="h-4 bg-slate-50 rounded-lg w-full mb-2" />
              <div className="h-3 bg-slate-50 rounded-lg w-3/4" />
            </div>
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
            <FolderOpen className="h-16 w-16 opacity-20 mb-4" />
            <p className="font-bold text-lg">Tidak ada dokumen ditemukan</p>
            <p className="text-sm">Coba cari dengan kata kunci lain atau pilih kategori berbeda.</p>
          </div>
        ) : (
          visibleTemplates.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all rounded-3xl ring-1 ring-slate-100 relative">
              {item.isPremium && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-amber-500/10 text-amber-600 border-none px-2 py-0.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500" /> Premium
                  </Badge>
                </div>
              )}
              <CardContent className="p-6 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</p>
                      <Badge variant="outline" className="text-[9px] font-bold text-slate-500 mt-0.5 border-slate-200">{item.fileType}</Badge>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {item.downloads} Unduhan
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                      onClick={() => handleDownload(item)}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Load More ── */}
      {hasMore && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-slate-400 font-medium">
            Menampilkan <span className="font-bold text-slate-600">{visibleCount}</span> dari <span className="font-bold text-slate-600">{filteredTemplates.length}</span> template
          </p>
          <button
            onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
            className="group flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold text-sm px-8 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <ChevronRight className="h-4 w-4 rotate-90 group-hover:translate-y-0.5 transition-transform" />
            Tampilkan {remaining > PAGE_SIZE ? PAGE_SIZE : remaining} Template Lainnya
          </button>
        </div>
      )}

      {/* Show total count when all loaded */}
      {!hasMore && filteredTemplates.length > 0 && !isLoading && (
        <p className="text-center text-xs text-slate-400 font-medium py-2">
          Semua <span className="font-bold text-slate-500">{filteredTemplates.length}</span> template telah ditampilkan
        </p>
      )}

      {/* ── Info Box ── */}
      <Card className="border-0 shadow-sm bg-indigo-50/50 rounded-3xl p-6 ring-1 ring-indigo-100/50">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-1">Pusat Knowledge Kantor</h4>
            <p className="text-xs text-indigo-700/70 leading-relaxed font-medium">
              Perpustakaan ini bersifat dinamis. Anda dapat mengunggah template dokumen yang sering digunakan untuk disimpan dan dibagikan secara eksklusif ke seluruh staf di lingkungan kantor Anda.
            </p>
          </div>
        </div>
      </Card>

      {/* ── Upload Dialog ── */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full" />
            <div className="relative flex items-center gap-4">
              <div className="h-14 w-14 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
                <Upload className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight">Upload Template</DialogTitle>
                <DialogDescription className="text-indigo-200 text-sm mt-0.5">
                  Tambahkan template dokumen ke perpustakaan kantor Anda.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpload} className="p-6 space-y-5">
            {/* Judul */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Judul Template</Label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="Contoh: Draft Akta Pendirian PT"
                className="h-11 rounded-2xl border-slate-200 focus-visible:ring-indigo-500 font-medium"
                required
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Deskripsi <span className="normal-case font-medium text-slate-300">(Opsional)</span></Label>
              <Input
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Penjelasan singkat mengenai template ini"
                className="h-11 rounded-2xl border-slate-200 focus-visible:ring-indigo-500 font-medium"
              />
            </div>

            {/* Kategori - Custom buttons */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Kategori</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter(c => c !== "Semua").map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setUploadForm({ ...uploadForm, category: cat })}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      uploadForm.category === cat
                        ? "bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-500/30"
                        : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Zone */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">File Template</Label>
              <label
                htmlFor="file-upload"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                  uploadForm.file
                    ? "border-indigo-400 bg-indigo-50/60"
                    : "border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30"
                )}
              >
                {uploadForm.file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="text-sm font-bold text-indigo-700">{uploadForm.file.name}</p>
                    <p className="text-xs text-slate-400">{(uploadForm.file.size / 1024).toFixed(0)} KB · Klik untuk ganti</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Upload className="h-8 w-8 opacity-40" />
                    <p className="text-sm font-bold">Klik untuk pilih file</p>
                    <p className="text-xs">Mendukung .docx dan .pdf · Maks. 10MB</p>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".doc,.docx,.pdf,application/msword,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                  required
                />
              </label>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsUploadOpen(false); setUploadForm({ title: "", description: "", category: "Non-Akta", file: null }); }}
                className="flex-1 h-11 rounded-2xl border-slate-200 font-bold text-slate-600"
                disabled={uploadLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/25"
                disabled={uploadLoading || !uploadForm.title || !uploadForm.file}
              >
                {uploadLoading ? (
                  <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengunggah...</span>
                ) : (
                  <span className="flex items-center gap-2"><Upload className="h-4 w-4" /> Upload Sekarang</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
