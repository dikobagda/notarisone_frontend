"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { getApiUrl } from "@/lib/api";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isPast, addMonths, subMonths, parseISO, addHours, isToday, startOfWeek, endOfWeek } from "date-fns";
import { id as localesId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User as UserIcon,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle2,
  CalendarDays,
  Edit3,
  Trash2,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  Zap,
  Video,
  ExternalLink,
  Bell,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomSelect } from "@/components/ui/custom-select";
import { toast } from "sonner";

// De-nested Form Component to prevent focus loss on re-render
const AppointmentForm = ({ 
  onSubmit, 
  submitLabel,
  state
}: { 
  onSubmit: (e: React.FormEvent) => void; 
  submitLabel: string;
  state: any;
}) => {
  const {
    title, setTitle,
    location, setLocation,
    type, setType,
    startTime, setStartTime,
    endTime, setEndTime,
    selectedDeedId, setSelectedDeedId,
    selectedClientId, setSelectedClientId,
    selectedUserId, setSelectedUserId,
    deeds, clients, teamMembers,
    isSubmitting
  } = state;

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-3xl shadow-2xl flex flex-col relative">
      <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white rounded-t-3xl">
        <DialogTitle className="text-lg font-extrabold text-slate-900">{submitLabel === "Simpan Perubahan" ? "Edit Agenda" : "Buat Agenda Baru"}</DialogTitle>
        <DialogDescription className="text-[11px] font-medium text-slate-500">Isi detail jadwal pertemuan atau penandatanganan akta.</DialogDescription>
      </DialogHeader>
      <div className="p-6 grid gap-5">
        <div className="grid gap-2">
          <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Judul Agenda</Label>
          <Input
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Misal: Penandatanganan AJB Budi"
            className="h-11 rounded-xl border-slate-200 text-sm font-bold placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomSelect
            label="Tipe Agenda"
            options={[
              { label: "Penandatanganan (Signing)", value: "SIGNING", icon: Briefcase },
              { label: "Konsultasi Klien", value: "CONSULTATION", icon: UserIcon },
              { label: "Survei Lapangan", value: "FIELD_SURVEY", icon: MapPin },
              { label: "Koordinasi BPN", value: "BPN_COORDINATION", icon: AlertCircle },
            ]}
            value={type}
            onChange={setType}
          />
          <div className="grid gap-2">
            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Lokasi</Label>
            <Input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Kantor Utama / Lapangan"
              className="h-11 rounded-xl border-slate-200 text-sm font-bold placeholder:text-slate-400 placeholder:font-normal"
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

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
          <CustomSelect
            label="Relasi Akta"
            placeholder="Pilih Akta..."
            options={deeds.map((d: any) => ({ label: d.title, value: d.id, description: d.type }))}
            value={selectedDeedId}
            onChange={setSelectedDeedId}
          />
          <CustomSelect
            label="Klien Terkait"
            placeholder="Pilih Klien..."
            options={clients.map((c: any) => ({ label: c.name, value: c.id }))}
            value={selectedClientId}
            onChange={setSelectedClientId}
          />
          <div className="col-span-2">
            <CustomSelect
              label="Penanggung Jawab (PIC)"
              placeholder="Pilih PIC..."
              options={teamMembers.map((t: any) => ({ label: t.name, value: t.id, description: t.role }))}
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
          className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-sm text-white shadow-lg shadow-indigo-200"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState("CONSULTATION");
  const [startTime, setStartTime] = useState(format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:00"));
  const [endTime, setEndTime] = useState(format(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:00"));
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDeedId, setSelectedDeedId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(true);

  // Helper data
  const [deeds, setDeeds] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const fetchAppointments = useCallback(async () => {
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token) return;

    try {
      setIsLoading(true);
      const from = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const to = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      const res = await fetch(`/api/appointments?tenantId=${tenantId}&from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setAppointments(result.data);
    } catch (err) {
      toast.error("Gagal memuat jadwal");
    } finally {
      setIsLoading(false);
    }
  }, [session, currentMonth]);

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
      console.error("Failed to fetch helpers:", err);
    }
  };

  const fetchGoogleStatus = async () => {
    const token = (session as any)?.backendToken;
    if (!token) return;

    try {
      setIsStatusLoading(true);
      const url = getApiUrl("/api/google/status");
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setIsGoogleConnected(result.data.isConnected);
        setGoogleEmail(result.data.email);
      }
    } catch (err) {
      console.error("Failed to fetch google status:", err);
    } finally {
      setIsStatusLoading(false);
    }
  };

  // Form Props for de-nested component
  const formProps = {
    title, setTitle,
    location, setLocation,
    type, setType,
    startTime, setStartTime,
    endTime, setEndTime,
    selectedDeedId, setSelectedDeedId,
    selectedClientId, setSelectedClientId,
    selectedUserId, setSelectedUserId,
    deeds, clients, teamMembers,
    isSubmitting
  };

  const handleDisconnectGoogle = async () => {
    const token = (session as any)?.backendToken;
    if (!token) return;

    try {
      setIsSubmitting(true);
      const url = getApiUrl("/api/google/disconnect");
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Integrasi diputuskan");
        fetchGoogleStatus();
      }
    } catch (err) {
      toast.error("Gagal memutuskan integrasi");
    }
  };

  const backendToken = (session as any)?.backendToken;

  useEffect(() => {
    if (status === "loading") return;

    if (backendToken) {
      fetchAppointments();
      fetchHelpers();
      fetchGoogleStatus();
    } else {
      setIsLoading(false);
      setIsStatusLoading(false);
    }
  }, [backendToken, fetchAppointments, status]);

  const openCreateDialog = () => {
    setTitle("");
    setType("SIGNING");
    setStartTime(format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:00"));
    setEndTime(format(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:00"));
    setLocation("");
    setDescription("");
    setSelectedDeedId("");
    setSelectedClientId("");
    setSelectedUserId("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (apt: any) => {
    setSelectedAppointmentId(apt.id);
    setTitle(apt.title || "");
    setType(apt.type || "SIGNING");
    setStartTime(apt.startTime ? format(parseISO(apt.startTime), "yyyy-MM-dd'T'HH:mm") : "");
    setEndTime(apt.endTime ? format(parseISO(apt.endTime), "yyyy-MM-dd'T'HH:mm") : "");
    setLocation(apt.location || "");
    setDescription(apt.description || "");
    setSelectedDeedId(apt.deedId || "");
    setSelectedClientId(apt.clientId || "");
    setSelectedUserId(apt.userId || "");
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (apt: any) => {
    setSelectedAppointmentId(apt.id);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token || !selectedAppointmentId) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/appointments/${selectedAppointmentId}?tenantId=${tenantId}`, {
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
        toast.success("Jadwal berhasil diperbarui", { description: "Sedang sinkronisasi dengan Google Calendar" });
        setIsEditDialogOpen(false);
        fetchAppointments();
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
    if (!tenantId || !token || !selectedAppointmentId) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/appointments/${selectedAppointmentId}?tenantId=${tenantId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Jadwal telah dihapus", { description: "Juga akan dihapus dari Google Calendar." });
        fetchAppointments();
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Kesalahan sistem");
      setIsSubmitting(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/appointments?tenantId=${tenantId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title, type, startTime, endTime, location, description,
          deedId: selectedDeedId || undefined,
          clientId: selectedClientId || undefined,
          userId: selectedUserId || undefined
        })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Jadwal berhasil dibuat");
        setIsDialogOpen(false);
        fetchAppointments();
        setTitle("");
        setSelectedDeedId("");
        setSelectedClientId("");
        setSelectedUserId("");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad calendar to start on Monday
  const firstDayOfWeek = monthStart.getDay(); // 0=Sunday
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const nextMonth = () => {
    const next = addMonths(currentMonth, 1);
    setCurrentMonth(next);
    setSelectedDate(startOfMonth(next));
  };
  const prevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    setCurrentMonth(prev);
    setSelectedDate(startOfMonth(prev));
  };

  const selectedDayAppointments = appointments.filter(apt =>
    isSameDay(parseISO(apt.startTime), selectedDate)
  );

  const todayAppointments = appointments.filter(apt =>
    isSameDay(parseISO(apt.startTime), new Date())
  );

  const upcomingAppointments = appointments
    .filter(apt => !isPast(parseISO(apt.endTime)))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  const TYPE_LABELS: Record<string, string> = {
    SIGNING: "Penandatanganan",
    CONSULTATION: "Konsultasi Klien",
    FIELD_SURVEY: "Survei Lapangan",
    BPN_COORDINATION: "Koordinasi BPN",
    OTHER: "Lainnya"
  };

  const TYPE_ICONS: Record<string, any> = {
    SIGNING: Briefcase,
    CONSULTATION: UserIcon,
    FIELD_SURVEY: MapPin,
    BPN_COORDINATION: AlertCircle,
    OTHER: CalendarIcon,
  };

  const getAppointmentTypeStyles = (type: string) => {
    switch (type) {
      case 'SIGNING': return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", accent: "bg-emerald-500", light: "from-emerald-500/10 to-emerald-600/5" };
      case 'CONSULTATION': return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", accent: "bg-indigo-500", light: "from-indigo-500/10 to-indigo-600/5" };
      case 'FIELD_SURVEY': return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", accent: "bg-amber-500", light: "from-amber-500/10 to-amber-600/5" };
      case 'BPN_COORDINATION': return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", accent: "bg-rose-500", light: "from-rose-500/10 to-rose-600/5" };
      default: return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", accent: "bg-slate-500", light: "from-slate-500/10 to-slate-600/5" };
    }
  };


  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* ─── Hero Banner ─── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-10 text-white shadow-2xl">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] pointer-events-none">
          <CalendarDays className="w-full h-full" strokeWidth={0.5} />
        </div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              {format(new Date(), "EEEE, dd MMMM yyyy", { locale: localesId })}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Agenda & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Penjadwalan</span>
            </h1>
            <p className="text-slate-400 text-base font-medium max-w-lg">
              Sinkronisasi jadwal Notaris dan PPAT dalam satu dasbor terpadu.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {isGoogleConnected && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-md">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-bold">Google Calendar Aktif</span>
              </div>
            )}
            <Button 
              onClick={openCreateDialog} 
              className="h-11 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold gap-2 text-sm shadow-lg shadow-indigo-500/30"
            >
              <Plus className="h-4 w-4" />
              Agenda Baru
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Quick Stats ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="flex items-start justify-between mb-4">
            <div className="h-11 w-11 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Bulan Ini
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-blue-300" /> : appointments.length}
          </div>
          <div className="text-xs text-slate-500 font-medium">Total Agenda <span className="text-slate-400">· {format(currentMonth, "MMMM", { locale: localesId })}</span></div>
        </div>

        <div className="group relative bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="flex items-start justify-between mb-4">
            <div className="h-11 w-11 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Bell className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <Zap className="h-3.5 w-3.5" />
              Hari Ini
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-emerald-300" /> : todayAppointments.length}
          </div>
          <div className="text-xs text-slate-500 font-medium">Agenda Hari Ini <span className="text-slate-400">· {format(new Date(), "dd MMM", { locale: localesId })}</span></div>
        </div>

        <div className="group relative bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default">
          <div className="flex items-start justify-between mb-4">
            <div className="h-11 w-11 bg-violet-500/10 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-violet-600">
              <Clock className="h-3.5 w-3.5" />
              Mendatang
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-violet-300" /> : upcomingAppointments.length}
          </div>
          <div className="text-xs text-slate-500 font-medium">Agenda Berikutnya <span className="text-slate-400">· Yang Akan Datang</span></div>
        </div>
      </div>

      {/* ─── Main Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ─── Calendar Sidebar ─── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Calendar Widget */}
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
            <CardHeader className="py-5 px-6 bg-gradient-to-r from-slate-50/80 to-white border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
                  {format(currentMonth, "MMMM yyyy", { locale: localesId })}
                </CardTitle>
                <div className="flex gap-1">
                  <Button onClick={prevMonth} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button onClick={nextMonth} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-300 mb-3 px-1">
                <span>SN</span><span>SL</span><span>RB</span><span>KM</span><span>JM</span><span>SB</span><span>MG</span>
              </div>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 px-1">
                {/* Padding for start of month */}
                {Array.from({ length: paddingDays }).map((_, i) => (
                  <div key={`pad-${i}`} className="h-10 w-full" />
                ))}
                {calendarDays.map((day, i) => {
                  const dayAppointments = appointments.filter(apt => isSameDay(parseISO(apt.startTime), day));
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);
                  const isSunday = day.getDay() === 0;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "h-10 w-full relative flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer",
                        isSelected
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                          : isTodayDate
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-200 font-extrabold"
                          : "hover:bg-slate-50 text-slate-600 hover:scale-105",
                        isSunday && !isSelected && !isTodayDate && "text-rose-400"
                      )}
                    >
                      {format(day, "d")}
                      {dayAppointments.length > 0 && !isSelected && (
                        <div className="absolute bottom-1 flex gap-0.5">
                          {dayAppointments.slice(0, 3).map((apt, j) => (
                            <div key={j} className={cn("h-1 w-1 rounded-full", getAppointmentTypeStyles(apt.type).accent)} />
                          ))}
                        </div>
                      )}
                      {dayAppointments.length > 0 && isSelected && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-white text-indigo-600 rounded-full flex items-center justify-center text-[8px] font-black shadow-sm border border-indigo-100">
                          {dayAppointments.length}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Today shortcut */}
              <Button
                variant="ghost"
                onClick={() => { setSelectedDate(new Date()); setCurrentMonth(new Date()); }}
                className="w-full mt-4 h-9 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 gap-2"
              >
                <RotateCcw className="h-3 w-3" />
                Kembali ke Hari Ini
              </Button>
            </CardContent>
          </Card>

          {/* Google Calendar Card */}
          <Card
            className={cn(
              "border-none shadow-sm p-7 rounded-2xl relative overflow-hidden group transition-all duration-500",
              isGoogleConnected ? "bg-emerald-950 text-emerald-50" : "bg-gradient-to-br from-slate-900 to-slate-800 text-white"
            )}
          >
            <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-150 transition-transform duration-700 pointer-events-none">
              <CalendarDays className="h-32 w-32" />
            </div>

            <div className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center mb-5 backdrop-blur-sm",
              isGoogleConnected ? "bg-emerald-500/20" : "bg-white/10"
            )}>
              <CalendarIcon className={cn("h-5 w-5", isGoogleConnected ? "text-emerald-400" : "text-white/80")} />
            </div>

            <h5 className="font-extrabold text-xl leading-tight">
              {isGoogleConnected ? "Google Calendar" : "Sync ke Google"}
            </h5>
            {isGoogleConnected && (
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                Terhubung
              </Badge>
            )}

            <p className="text-slate-400 text-xs mt-3 leading-relaxed font-medium">
              {isGoogleConnected
                ? `Tersinkronisasi dengan ${googleEmail}.`
                : "Hubungkan jadwal dengan kalender pribadi Anda."}
            </p>

            <div className="grid gap-2 mt-6">
              {isGoogleConnected ? (
                <>
                  <Button
                    onClick={() => signIn("google")}
                    className="w-full bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl h-10 shadow-lg shadow-emerald-900/20 text-xs"
                  >
                    Perbarui Koneksi
                  </Button>
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          className="w-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 font-bold rounded-xl h-9 text-xs"
                        >
                          Putuskan Integrasi
                        </Button>
                      }
                    />
                    <DialogContent className="sm:max-w-[425px] rounded-3xl border border-slate-800 shadow-2xl p-0 overflow-hidden bg-slate-950 text-white">
                      <DialogHeader className="p-6 pb-5 border-b border-slate-800 bg-slate-900/50">
                        <DialogTitle className="text-xl font-black flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-rose-500" />
                          Putuskan Sinkronisasi
                        </DialogTitle>
                      </DialogHeader>
                      <div className="p-6">
                        <DialogDescription className="text-slate-400 font-medium leading-relaxed">
                          Apakah Anda yakin ingin memutuskan sinkronisasi Google Calendar? Jadwal NotarisOne baru tidak akan lagi ditambahkan ke kalender pribadi Anda secara otomatis.
                        </DialogDescription>
                        <div className="mt-8 grid grid-cols-2 gap-3">
                          <DialogTrigger
                            render={
                              <Button variant="ghost" className="rounded-xl font-bold bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 h-11 w-full">
                                Batal
                              </Button>
                            }
                          />
                          <Button
                            onClick={handleDisconnectGoogle}
                            className="rounded-xl font-bold w-full h-11 shadow-lg shadow-rose-900/20 bg-rose-500 hover:bg-rose-600 text-white"
                          >
                            Ya, Putuskan
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <Button
                  onClick={() => {
                    const userId = (session?.user as any)?.id;
                    if (userId) {
                      document.cookie = `notarisone-link-userid=${userId}; path=/; max-age=300; SameSite=Lax`;
                    }
                    signIn("google");
                  }}
                  disabled={isStatusLoading}
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl h-10 shadow-lg text-xs"
                >
                  {isStatusLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Integrasikan Sekarang"}
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* ─── Schedule Detail ─── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Selected Day Header */}
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex flex-col items-center justify-center shadow-inner text-center border",
                  isToday(selectedDate) 
                    ? "bg-indigo-600 border-indigo-500 text-white" 
                    : "bg-indigo-50 border-indigo-100 text-indigo-600"
                )}>
                  <span className="text-2xl font-extrabold tracking-tighter leading-none">{format(selectedDate, "d")}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-70">{format(selectedDate, "EEE", { locale: localesId })}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">
                    {format(selectedDate, "EEEE", { locale: localesId })}
                  </span>
                  <span className="text-xs font-medium text-slate-400 mt-0.5">
                    {format(selectedDate, "dd MMMM yyyy", { locale: localesId })}
                  </span>
                  {isToday(selectedDate) && (
                    <Badge className="mt-1 bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0 text-[9px] font-black uppercase tracking-widest w-fit">
                      Hari Ini
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  {selectedDayAppointments.length} agenda
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-300">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest">Sinkronisasi Agenda...</p>
            </div>
          ) : selectedDayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <CalendarIcon className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-extrabold text-lg">Belum Ada Agenda</p>
              <p className="text-slate-300 text-sm mt-1 font-medium">Klik "Agenda Baru" untuk mulai menjadwalkan.</p>
              <Button
                onClick={openCreateDialog}
                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold px-6 h-11 rounded-xl shadow-lg shadow-indigo-200"
              >
                <Plus className="h-4 w-4" />
                Buat Agenda
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {selectedDayAppointments.map((apt) => {
                const styles = getAppointmentTypeStyles(apt.type);
                const past = isPast(parseISO(apt.endTime));
                const TypeIcon = TYPE_ICONS[apt.type] || CalendarIcon;
                return (
                  <Card key={apt.id} className={cn(
                    "border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 rounded-2xl",
                    past && "opacity-50"
                  )}>
                    <div className="flex h-full">
                      {/* Accent Bar */}
                      <div className={cn("w-1.5 shrink-0", styles.accent)} />
                      
                      <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 w-full">
                        {/* Left: Time + Info */}
                        <div className="flex gap-6 items-start flex-1 min-w-0">
                          {/* Time Block */}
                          <div className={cn(
                            "flex flex-col items-center justify-center min-w-[70px] py-2 px-3 rounded-xl border",
                            past ? "bg-slate-50 border-slate-100" : `${styles.bg} ${styles.border}`
                          )}>
                            <span className={cn(
                              "text-xl font-extrabold tracking-tighter leading-none",
                              past ? "line-through text-slate-400" : styles.text
                            )}>
                              {format(parseISO(apt.startTime), "HH:mm")}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              {past ? "SELESAI" : "MULAI"}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className={cn(
                                "text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight truncate",
                                past && "line-through text-slate-400"
                              )}>
                                {apt.title}
                              </h3>
                              <Badge className={cn(
                                "font-black text-[9px] uppercase tracking-wider rounded-lg px-2.5 py-0.5 flex items-center gap-1.5 shrink-0 border",
                                styles.bg, styles.text, styles.border
                              )}>
                                <TypeIcon className="h-3 w-3" />
                                {TYPE_LABELS[apt.type] || apt.type}
                              </Badge>
                            </div>
                            <div className={cn(
                              "flex flex-wrap gap-4 text-[11px] font-bold text-slate-500",
                              past && "opacity-50"
                            )}>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 text-slate-300" /> {apt.location || "Belum Diatur"}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-slate-300" /> {format(parseISO(apt.startTime), "HH:mm")} – {format(parseISO(apt.endTime), "HH:mm")}
                              </div>
                              {apt.deed && (
                                <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded-md">
                                  <Briefcase className="h-3 w-3" /> {apt.deed.title}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm h-9">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(apt)} className="h-full w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors rounded-none border-r border-slate-100">
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(apt)} className="h-full w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-none">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <Link href={`/dashboard/jadwal/${apt.id}`}>
                            <Button className="bg-slate-900 text-white hover:bg-black rounded-xl px-4 font-bold text-[10px] h-9 shadow-md gap-1.5">
                              <ExternalLink className="h-3 w-3" />
                              DETAIL
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Create Dialog ─── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 border-none shadow-none ring-0 overflow-visible bg-transparent">
          <AppointmentForm onSubmit={handleCreateAppointment} submitLabel="Simpan Agenda Baru" state={formProps} />
        </DialogContent>
      </Dialog>

      {/* ─── Edit Dialog ─── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 border-none shadow-none ring-0 overflow-visible bg-transparent">
          <AppointmentForm onSubmit={handleUpdateAppointment} submitLabel="Simpan Perubahan" state={formProps} />
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 border-none rounded-3xl overflow-hidden bg-white shadow-2xl">
          <div className="pt-8 px-8 pb-4 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-slate-800 mb-2">Hapus Jadwal?</DialogTitle>
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
