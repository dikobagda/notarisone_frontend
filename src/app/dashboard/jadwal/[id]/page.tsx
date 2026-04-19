"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, Calendar as CalendarIcon, Clock, MapPin, 
  User as UserIcon, Briefcase, FileText, CalendarCheck, 
  Edit3, Trash2, AlertTriangle 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as localesId } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { CustomSelect } from "@/components/ui/custom-select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [type, setType] = useState("SIGNING");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDeedId, setSelectedDeedId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Helper States (for dropdowns)
  const [deeds, setDeeds] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const fetchAppointment = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token || !params.id) return;

    try {
      const res = await fetch(`/api/appointments/${params.id}?tenantId=${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      
      if (result.success) {
        setAppointment(result.data);
      } else {
        router.push("/dashboard/jadwal");
      }
    } catch (err) {
      console.error("Gagal memuat jadwal", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHelpers = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token) return;

    try {
      const h = { Authorization: `Bearer ${token}` };
      const [deedRes, clientRes, teamRes] = await Promise.all([
        fetch(`/api/deeds?tenantId=${tenantId}`, { headers: h }),
        fetch(`/api/clients?tenantId=${tenantId}`, { headers: h }),
        fetch(`/api/team?tenantId=${tenantId}`, { headers: h })
      ]);
      const [deedData, clientData, teamData] = await Promise.all([deedRes.json(), clientRes.json(), teamRes.json()]);
      if (deedData.success) setDeeds(deedData.data);
      if (clientData.success) setClients(clientData.data);
      if (teamData.success) setTeamMembers(teamData.data);
    } catch (err) {
      console.error("Gagal memuat helpers", err);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchAppointment();
      fetchHelpers();
    }
  }, [params.id, status]);

  const handleOpenEdit = () => {
    setTitle(appointment.title || "");
    setType(appointment.type || "SIGNING");
    setStartTime(appointment.startTime ? format(parseISO(appointment.startTime), "yyyy-MM-dd'T'HH:mm") : "");
    setEndTime(appointment.endTime ? format(parseISO(appointment.endTime), "yyyy-MM-dd'T'HH:mm") : "");
    setLocation(appointment.location || "");
    setDescription(appointment.description || "");
    setSelectedDeedId(appointment.deedId || "");
    setSelectedClientId(appointment.clientId || "");
    setSelectedUserId(appointment.userId || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token || !appointment) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/appointments/${appointment.id}?tenantId=${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title, type, startTime, endTime, location, description,
          deedId: selectedDeedId || undefined,
          clientId: selectedClientId || undefined,
          userId: selectedUserId || undefined
        })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Jadwal berhasil diperbarui", { description: "Sedang di-sinkronisasi dengan Google Calendar" });
        setIsEditDialogOpen(false);
        fetchAppointment();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAppointment = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token || !appointment) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/appointments/${appointment.id}?tenantId=${tenantId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Jadwal telah dihapus", { description: "Juga akan dihapus dari Google Calendar." });
        router.push("/dashboard/jadwal");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Kesalahan sistem");
      setIsSubmitting(false);
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm font-bold uppercase tracking-widest">Memuat Detail Jadwal...</p>
      </div>
    );
  }

  if (!appointment) return null;

  const TYPE_LABELS: Record<string, string> = {
    SIGNING: "Penandatanganan",
    CONSULTATION: "Konsultasi Klien",
    FIELD_SURVEY: "Survei Lapangan",
    BPN_COORDINATION: "Koordinasi BPN",
    OTHER: "Lainnya"
  };

  const getAppointmentTypeStyles = (aptType: string) => {
    switch (aptType) {
      case 'SIGNING': return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", accent: "bg-emerald-500" };
      case 'CONSULTATION': return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", accent: "bg-indigo-500" };
      case 'FIELD_SURVEY': return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", accent: "bg-amber-500" };
      case 'BPN_COORDINATION': return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", accent: "bg-rose-500" };
      default: return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-100", accent: "bg-slate-500" };
    }
  };

  const styles = getAppointmentTypeStyles(appointment.type);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 shrink-0 rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 mt-1"
            onClick={() => router.push("/dashboard/jadwal")}
          >
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className={`${styles.bg} ${styles.text} ${styles.border} font-black text-[10px] uppercase tracking-wider rounded-lg px-2.5 py-1`}>
                {TYPE_LABELS[appointment.type] || appointment.type}
              </Badge>
              {appointment.googleEventId && (
                <Badge className="bg-blue-50 text-blue-600 border border-blue-100 font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-default">
                  <CalendarCheck className="h-3 w-3" /> Tersinkron Google
                </Badge>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              {appointment.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleOpenEdit}
            className="h-10 rounded-xl border-slate-200 bg-white font-bold text-sm text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Edit3 className="h-4 w-4 mr-2 text-indigo-500" />
            Edit Agenda
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-10 rounded-xl border-rose-100 bg-rose-50 font-bold text-sm text-rose-600 hover:bg-rose-100 transition-colors shadow-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 pb-5">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-slate-400" /> Detail Waktu & Lokasi
              </h3>
            </CardHeader>
            <CardContent className="p-8 grid sm:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tanggal Pelaksanaan</p>
                  <p className="font-bold text-slate-800">{format(parseISO(appointment.startTime), "EEEE, d MMMM yyyy", { locale: localesId })}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Jam</p>
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    {format(parseISO(appointment.startTime), "HH:mm")} - {format(parseISO(appointment.endTime), "HH:mm")}
                  </div>
                </div>
              </div>
              <div className="space-y-6 sm:border-l sm:border-slate-100 sm:pl-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lokasi</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                    <span className="font-bold text-slate-800 leading-snug">{appointment.location || "Belum ditentukan"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {appointment.description && (
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 pb-5">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" /> Catatan Tambahan
                </h3>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line">
                  {appointment.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 pb-5">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-slate-400" /> Partisipan
              </h3>
            </CardHeader>
            <CardContent className="p-6 grid gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">PIC (Pegawai)</p>
                {appointment.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs">
                      {appointment.assignedTo.name.substring(0,2).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-800 text-sm">{appointment.assignedTo.name}</span>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-400 italic">Belum ada PIC yang ditugaskan</span>
                )}
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Klien Terkait</p>
                {appointment.client ? (
                  <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push(`/dashboard/klien/${appointment.clientId}`)}>
                    <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{appointment.client.name}</span>
                      <span className="text-xs font-medium text-slate-500">{appointment.client.email}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-400 italic">Tidak ada klien spesifik</span>
                )}
              </div>
            </CardContent>
          </Card>

          {appointment.deed && (
            <Card className="border border-indigo-100 bg-indigo-50/30 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/deeds/${appointment.deedId}`)}>
              <CardContent className="p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Briefcase className="h-3 w-3" /> Berkas Akta Terkait
                </p>
                <h4 className="font-black text-indigo-900 text-base leading-tight mb-2">{appointment.deed.title}</h4>
                <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold text-[9px] uppercase hover:bg-indigo-200">
                  {appointment.deed.type}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 border-none shadow-none ring-0 overflow-visible bg-transparent">
          <form onSubmit={handleUpdateAppointment} className="bg-white rounded-3xl shadow-2xl flex flex-col relative">
            <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
              <DialogTitle className="text-lg font-black text-slate-900 italic">Edit Agenda</DialogTitle>
              <DialogDescription className="text-[11px] font-medium text-slate-500">Perbarui detail jadwal pertemuan atau penandatanganan akta.</DialogDescription>
            </DialogHeader>
            <div className="p-6 grid gap-5">
              <div className="grid gap-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Judul Agenda</Label>
                <Input
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: TTD Covernote CV. Abadi"
                  className="h-11 rounded-xl border-slate-200 font-bold text-slate-800 placeholder:font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CustomSelect
                  label="Tipe Agenda"
                  options={[
                    { label: "Penandatanganan", value: "SIGNING" },
                    { label: "Konsultasi Klien", value: "CONSULTATION" },
                    { label: "Survei Lapangan", value: "FIELD_SURVEY" },
                    { label: "Koordinasi BPN", value: "BPN_COORDINATION" },
                    { label: "Lainnya", value: "OTHER" }
                  ]}
                  value={type}
                  onChange={setType}
                />
                <div className="grid gap-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Lokasi</Label>
                  <Input
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Contoh: Kantor Notaris / BPN"
                    className="h-11 rounded-xl border-slate-200 font-bold text-slate-800 placeholder:font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="grid gap-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Waktu Mulai</Label>
                  <Input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 text-sm font-bold"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Waktu Selesai</Label>
                  <Input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                <CustomSelect
                  label="Relasi Akta"
                  placeholder="Pilih Akta..."
                  options={deeds.map(d => ({ label: d.title, value: d.id, description: d.type }))}
                  value={selectedDeedId}
                  onChange={setSelectedDeedId}
                />
                <CustomSelect
                  label="Klien Terkait"
                  placeholder="Pilih Klien..."
                  options={clients.map(c => ({ label: c.name, value: c.id }))}
                  value={selectedClientId}
                  onChange={setSelectedClientId}
                />
                <div className="col-span-2">
                  <CustomSelect
                    label="Penanggung Jawab (PIC)"
                    placeholder="Pilih PIC..."
                    options={teamMembers.map(t => ({ label: t.name, value: t.id, description: t.role }))}
                    value={selectedUserId}
                    onChange={setSelectedUserId}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="px-6 pb-6 pt-0 m-0 bg-transparent border-none rounded-b-3xl block">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-sm text-white shadow-xl shadow-indigo-100"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 border-none rounded-3xl overflow-hidden bg-white shadow-2xl">
          <div className="pt-8 px-8 pb-4 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-800 mb-2">Hapus Jadwal?</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Apakah Anda yakin ingin menghapus jadwal ini? Jadwal juga akan dihapus dari Google Calendar jika Anda telah mengaktifkan sinkronisasi.
            </DialogDescription>
          </div>
          <DialogFooter className="p-6 bg-slate-50/50 flex gap-3 sm:justify-center">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isSubmitting}
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-white"
            >
              Batal
            </Button>
            <Button 
              type="button" 
              disabled={isSubmitting}
              onClick={handleDeleteAppointment}
              className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-100"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
