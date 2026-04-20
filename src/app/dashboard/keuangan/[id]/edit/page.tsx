"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  FileText,
  Percent,
  Loader2,
  Receipt,
  UserCircle2,
  ChevronDown,
  Briefcase,
  Search,
  Check,
  Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type LineItem = {
  id: string;
  description: string;
  amount: number;
  isTaxable: boolean;
};

type ClientData = { id: string; name: string; nik: string };
type DeedData = { id: string; title: string; deedNumber: string };

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();

  const [items, setItems] = useState<LineItem[]>([]);
  const [date, setDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Selection States
  const [clients, setClients] = useState<ClientData[]>([]);
  const [deeds, setDeeds] = useState<DeedData[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedDeedId, setSelectedDeedId] = useState<string>("");
  const [isDeedLinked, setIsDeedLinked] = useState<boolean>(false);

  // Custom Dropdown States
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isDeedDropdownOpen, setIsDeedDropdownOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [deedSearch, setDeedSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Lookups and Invoice Data
  useEffect(() => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!session?.backendToken || !tenantId || !params.id) return;

    const fetchData = async () => {
      try {
        const [resClient, resDeeds, resInvoice] = await Promise.all([
          fetch(`/api/clients?tenantId=${tenantId}`, { headers: { Authorization: `Bearer ${session.backendToken}` } }),
          fetch(`/api/deeds?tenantId=${tenantId}`, { headers: { Authorization: `Bearer ${session.backendToken}` } }),
          fetch(`/api/billing/invoices/${params.id}`, { 
            headers: { 
              Authorization: `Bearer ${session.backendToken}`,
              "X-Tenant-Id": tenantId
            } 
          })
        ]);

        const clientData = await resClient.json();
        const deedData = await resDeeds.json();
        const invoiceDataResult = await resInvoice.json();

        if (clientData.success) setClients(clientData.data);
        if (deedData.success) setDeeds(deedData.data);
        
        if (invoiceDataResult.success) {
          const inv = invoiceDataResult.data;
          setSelectedClientId(inv.clientId);
          setSelectedDeedId(inv.deedId || "");
          setIsDeedLinked(!!inv.deedId);
          setDate(inv.createdAt.split('T')[0]);
          setDueDate(inv.dueDate ? inv.dueDate.split('T')[0] : "");
          setItems(inv.items.map((item: any) => ({
            id: item.id,
            description: item.description,
            amount: Number(item.unitPrice),
            isTaxable: item.taxable
          })));
        } else {
          toast.error("Gagal memuat data invoice");
          router.push("/dashboard/keuangan");
        }
      } catch (err) {
        toast.error("Terjadi kesalahan teknis");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, params.id]);

  const filteredClients = useMemo(() => {
    return clientSearch
      ? clients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.nik.includes(clientSearch)
      )
      : clients.slice(0, 10);
  }, [clients, clientSearch]);

  const filteredDeeds = useMemo(() => {
    return deedSearch
      ? deeds.filter(d =>
        d.title.toLowerCase().includes(deedSearch.toLowerCase()) ||
        d.deedNumber?.toLowerCase().includes(deedSearch.toLowerCase())
      )
      : deeds.slice(0, 10);
  }, [deeds, deedSearch]);

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);
  const selectedDeed = useMemo(() => deeds.find(d => d.id === selectedDeedId), [deeds, selectedDeedId]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);
  const taxableAmount = useMemo(() => items.filter(i => i.isTaxable).reduce((sum, item) => sum + item.amount, 0), [items]);
  const ppn = useMemo(() => taxableAmount * 0.11, [taxableAmount]);
  const total = useMemo(() => subtotal + ppn, [subtotal, ppn]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: "", amount: 0, isTaxable: true }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSubmit = async () => {
    if (!selectedClientId) {
      return toast.error("Klien wajib dipilih");
    }

    const validItems = items.filter(i => i.description.trim() !== "" && i.amount > 0);
    if (validItems.length === 0) {
      return toast.error("Rincian biaya tidak boleh kosong");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        clientId: selectedClientId,
        deedId: isDeedLinked && selectedDeedId ? selectedDeedId : null,
        dueDate: dueDate || null,
        items: validItems.map(i => ({
          description: i.description,
          amount: i.amount,
          isTaxable: i.isTaxable
        }))
      };

      const tenantId = (session?.user as any)?.tenantId;
      const res = await fetch(`/api/billing/invoices/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.backendToken}`,
          "X-Tenant-Id": tenantId
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Invoice berhasil diperbarui");
        router.push(`/dashboard/keuangan/${params.id}`);
      } else {
        toast.error(result.message || "Gagal memperbarui invoice");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatIDR = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(val));
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="font-bold text-sm">Menyiapkan editor invoice...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 backdrop-blur-xl p-4 rounded-3xl border border-white/50 shadow-sm">
        <Button variant="ghost" className="gap-2 font-bold text-slate-500 rounded-2xl hover:bg-white" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Batal Perubahan
        </Button>
        <div className="flex gap-3 w-full md:w-auto">
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white font-black px-8 h-12 shadow-[0_8px_30px_rgb(234,88,12,0.3)] hover:shadow-[0_8px_30px_rgb(234,88,12,0.5)] transition-all border-0 rounded-2xl w-full md:w-auto flex items-center gap-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Simpan Perubahan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Main Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-slate-50 shadow-sm ring-1 ring-slate-100 overflow-visible">

            {/* Client Selector */}
            <div className="space-y-3">
              <div className="flex items-center h-5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <UserCircle2 className="h-4 w-4" /> Target Klien (Wajib)
                </label>
              </div>
              
              <div className="relative">
                <div
                  onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                  className={cn(
                    "flex h-12 items-center justify-between border px-4 text-sm cursor-pointer transition-all rounded-xl bg-slate-50",
                    isClientDropdownOpen
                      ? "border-orange-400 ring-2 ring-orange-100"
                      : "border-slate-200 hover:border-orange-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {selectedClient ? (
                      <span className="font-bold text-slate-900">{selectedClient.name}</span>
                    ) : (
                      <span className="text-slate-400 font-medium">Pilih klien...</span>
                    )}
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isClientDropdownOpen && "rotate-180 text-orange-500")} />
                </div>

                {isClientDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsClientDropdownOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                      <div className="p-3 border-b border-slate-50 flex items-center gap-2 px-4 bg-slate-50/60">
                        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Cari nama atau NIK..."
                          className="w-full bg-transparent border-none text-sm focus:outline-none placeholder:text-slate-300 font-medium text-slate-700 h-7"
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto p-2">
                        {filteredClients.length === 0 ? (
                          <div className="p-6 text-center text-xs font-bold text-slate-400">Klien tidak ditemukan</div>
                        ) : (
                          filteredClients.map((c) => (
                            <button
                              key={c.id}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 hover:bg-orange-50 rounded-xl transition-colors text-left cursor-pointer",
                                selectedClientId === c.id && "bg-orange-50"
                              )}
                              onClick={() => {
                                setSelectedClientId(c.id);
                                setIsClientDropdownOpen(false);
                                setClientSearch("");
                              }}
                            >
                              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-sm uppercase shrink-0">
                                {c.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm truncate">{c.name}</p>
                                <p className="text-[10px] font-mono text-slate-400">NIK: {c.nik}</p>
                              </div>
                              {selectedClientId === c.id && <Check className="h-4 w-4 text-orange-600 ml-auto shrink-0" />}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Deed Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between h-5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Tautkan ke Akta?
                </label>
                <div
                  onClick={() => {
                    setIsDeedLinked(!isDeedLinked);
                    if (!isDeedLinked === false) setSelectedDeedId("");
                  }}
                  className={cn(
                    "h-6 w-12 rounded-full cursor-pointer transition-colors border-2 p-0.5",
                    isDeedLinked ? "border-orange-500 bg-orange-500" : "border-slate-200 bg-slate-100/50"
                  )}
                >
                  <div className={cn(
                    "h-4 w-4 bg-white rounded-full shadow-sm transition-transform",
                    isDeedLinked ? "translate-x-6" : "translate-x-0"
                  )} />
                </div>
              </div>

              <div className="relative">
                {isDeedLinked ? (
                  <>
                    <div
                      onClick={() => setIsDeedDropdownOpen(!isDeedDropdownOpen)}
                      className={cn(
                        "flex h-12 items-center justify-between border px-4 text-sm cursor-pointer transition-all rounded-xl bg-orange-50/30",
                        isDeedDropdownOpen
                          ? "border-orange-400 ring-2 ring-orange-100"
                          : "border-orange-200 hover:border-orange-400"
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        {selectedDeed ? (
                          <span className="font-bold text-slate-900 truncate">{selectedDeed.title}</span>
                        ) : (
                          <span className="text-orange-400 font-medium">Pilih dokumen akta...</span>
                        )}
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-orange-400 transition-transform", isDeedDropdownOpen && "rotate-180")} />
                    </div>

                    {isDeedDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsDeedDropdownOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                          <div className="p-3 border-b border-slate-50 flex items-center gap-2 px-4 bg-slate-50/60">
                            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <input
                              autoFocus
                              type="text"
                              placeholder="Cari judul akta..."
                              className="w-full bg-transparent border-none text-sm focus:outline-none placeholder:text-slate-300 font-medium text-slate-700 h-7"
                              value={deedSearch}
                              onChange={(e) => setDeedSearch(e.target.value)}
                            />
                          </div>
                          <div className="max-h-52 overflow-y-auto p-2">
                            {filteredDeeds.length === 0 ? (
                              <div className="p-6 text-center text-xs font-bold text-slate-400">Akta tidak ditemukan</div>
                            ) : (
                              filteredDeeds.map((d) => (
                                <button
                                  key={d.id}
                                  className={cn(
                                    "w-full p-3 hover:bg-orange-50 rounded-xl transition-colors text-left cursor-pointer",
                                    selectedDeedId === d.id && "bg-orange-50"
                                  )}
                                  onClick={() => {
                                    setSelectedDeedId(d.id);
                                    setIsDeedDropdownOpen(false);
                                    setDeedSearch("");
                                  }}
                                >
                                  <p className="font-bold text-slate-900 text-sm truncate">{d.title}</p>
                                  {d.deedNumber && <p className="text-[10px] font-mono text-slate-400">No: {d.deedNumber}</p>}
                                  {selectedDeedId === d.id && <Check className="h-4 w-4 text-orange-600 absolute right-3 top-4" />}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-12 px-4 rounded-xl border-2 border-dashed border-slate-100 bg-slate-50 flex items-center text-slate-400 font-bold text-xs">
                    Tidak dihubungkan dengan akta.
                  </div>
                )}
              </div>
            </div>

          </div>

          <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-3xl ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/50 border-b border-slate-50 p-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Rincian Komponen Biaya</CardTitle>
                <CardDescription className="font-bold">Subtotal harga dihitung dalam IDR.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/10 border-none">
                    <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 bg-transparent">Deskripsi Layanan</TableHead>
                    <TableHead className="w-56 text-xs font-black uppercase tracking-widest text-slate-400 bg-transparent">Harga (Rp)</TableHead>
                    <TableHead className="w-24 text-xs font-black uppercase tracking-widest text-slate-400 bg-transparent text-center">PPN 11%</TableHead>
                    <TableHead className="w-16 px-6 bg-transparent"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-orange-50/30 transition-colors group">
                      <TableCell className="px-8 py-4">
                        <Input
                          value={item.description}
                          onChange={e => updateItem(item.id, "description", e.target.value)}
                          className="border-none bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white shadow-none px-4 rounded-xl focus-visible:ring-1 focus-visible:ring-orange-500 text-sm font-bold placeholder:text-slate-300 h-12"
                          placeholder="Beri tahu klien untuk apa ini..."
                        />
                      </TableCell>
                      <TableCell className="py-4">
                        <Input
                          type="number"
                          value={item.amount || ""}
                          onChange={e => updateItem(item.id, "amount", parseFloat(e.target.value) || 0)}
                          className="border-none bg-slate-50/50 hover:bg-slate-50 focus-visible:bg-white shadow-none px-4 rounded-xl focus-visible:ring-1 focus-visible:ring-orange-500 font-black tracking-tight text-slate-900 h-12"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center">
                          <div
                            onClick={e => updateItem(item.id, "isTaxable", !item.isTaxable)}
                            className={cn(
                              "h-6 w-12 rounded-full cursor-pointer transition-colors border-2 p-0.5",
                              item.isTaxable ? "border-orange-500 bg-orange-500" : "border-slate-200 bg-slate-100/50"
                            )}
                          >
                            <div className={cn(
                              "h-4 w-4 bg-white rounded-full shadow-sm transition-transform",
                              item.isTaxable ? "translate-x-6" : "translate-x-0"
                            )} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-none bg-transparent hover:bg-transparent">
                    <TableCell colSpan={4} className="px-8 py-6">
                      <Button variant="outline" className="w-full border-dashed border-2 border-slate-200 text-slate-400 font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 h-12 rounded-2xl gap-2" onClick={addItem}>
                        <Plus className="h-4 w-4" /> Tambah Deskripsi Baru
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white overflow-hidden sticky top-36 rounded-3xl shadow-[0_30px_60px_-15px_rgb(0,0,0,0.3)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] pointer-events-none" />
            <CardHeader className="bg-slate-800/20 p-8 border-b border-white/5">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                <Calculator className="h-4 w-4" /> Estimasi Faktur
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-8 pb-10 space-y-6 relative">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-400 font-bold">Subtotal Biaya</span>
                  <span className="font-bold">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Percent className="h-3 w-3" /> Pajak (PPN 11%)
                  </span>
                  <span className="font-bold text-orange-400">{formatIDR(ppn)}</span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-6" />

              <div className="flex flex-col group py-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total Akhir Ditagihkan</span>
                <span className="text-4xl font-black tracking-tighter text-white drop-shadow-md">{formatIDR(total)}</span>
              </div>

              <div className="pt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tanggal Terbit</label>
                  <Input type="date" value={date} readOnly className="rounded-xl bg-white/5 border-white/10 text-white/40 font-bold h-10 focus-visible:ring-0 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wide text-slate-500">Batas Jatuh Tempo (Opsional)</label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="rounded-xl bg-white/5 border-white/10 text-white font-bold h-10 focus-visible:ring-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
