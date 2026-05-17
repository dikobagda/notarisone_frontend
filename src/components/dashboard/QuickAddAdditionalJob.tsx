"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QuickAddAdditionalJobProps {
  onSuccess: (newJob: any) => void;
}

export function QuickAddAdditionalJob({ onSuccess }: QuickAddAdditionalJobProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "" });

  const handleSave = async () => {
    if (!formData.name || !formData.price) return alert("Lengkapi semua kolom");
    
    const tenantId = (session?.user as any)?.tenantId;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/additional-jobs?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${(session as any)?.backendToken}` 
        },
        body: JSON.stringify({
           name: formData.name,
           price: parseFloat(formData.price)
        })
      });
      const result = await response.json();
      if (result.success) {
         onSuccess(result.data);
         setIsOpen(false);
         setFormData({ name: "", price: "" });
      } else {
         alert(result.message || "Gagal menyimpan data");
      }
    } catch {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="sm" className="h-7 px-2 rounded-lg text-[10px] uppercase font-black tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-100/50" />
      }>
        <Plus className="h-3 w-3 mr-1" /> Tambah List
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-slate-900">
             Tambah Pekerjaan Baru
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Pekerjaan <span className="text-red-500">*</span></label>
              <Input 
                 value={formData.name}
                 onChange={e => setFormData({...formData, name: e.target.value})}
                 placeholder="Contoh: Pendaftaran NIB"
                 className="h-12 rounded-xl font-bold border-slate-200"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estimasi Biaya <span className="text-red-500">*</span></label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                 <Input 
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    placeholder="500000"
                    className="h-12 rounded-xl font-bold border-slate-200 pl-12"
                 />
              </div>
           </div>
        </div>
        <div className="mt-8 flex gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="h-11 rounded-xl font-bold flex-1 border-slate-200">
             Batal
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="h-11 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex-1 shadow-lg shadow-indigo-100 gap-2">
             {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
             Simpan Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
