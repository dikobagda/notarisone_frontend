"use client";

import React from "react";
import { Scale, ShieldCheck, Search, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LegalisasiPage() {
  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Scale className="h-7 w-7 text-indigo-600" strokeWidth={2.5} />
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Legalisasi</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Pengesahan tanda tangan dan penetapan kepastian tanggal surat di bawah tangan.
          </p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
          <Plus className="h-4 w-4" />
          Registrasi Legalisasi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Legalisasi", value: "0", sub: "Dokumen disahkan", icon: ShieldCheck, accent: "bg-indigo-50", iconColor: "text-indigo-600" },
          { label: "Bulan Ini", value: "0", sub: "Pengesahan baru", icon: ShieldCheck, accent: "bg-emerald-50", iconColor: "text-emerald-600" },
          { label: "Belum Selesai", value: "0", sub: "Dalam proses", icon: ShieldCheck, accent: "bg-amber-50", iconColor: "text-amber-600" },
        ].map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                <div className={`h-9 w-9 rounded-xl ${stat.accent} flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
              <p className="text-xs font-bold mt-1 text-slate-400">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
        <div className="bg-slate-50/50 border-b border-slate-100 h-16 px-6 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daftar Legalisasi</span>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari nomor atau pihak..." className="pl-10 h-10 rounded-xl" />
          </div>
        </div>
        <div className="p-12 text-center">
          <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-slate-200" />
          </div>
          <p className="text-slate-900 font-bold">Belum ada data legalisasi</p>
          <p className="text-xs text-slate-500 mt-1">Silakan klik tombol di atas untuk mendaftarkan dokumen baru.</p>
        </div>
      </Card>
    </div>
  );
}
