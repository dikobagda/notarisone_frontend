"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  UserCircle2,
  Mail,
  Shield,
  Trash2,
  Lock,
  Users,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  Edit2,
  Unlock
} from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"
];

const PAGE_SIZE = 10;

export default function TeamPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState("PEGAWAI");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [isResending, setIsResending] = useState(false);

  // Edit & Lock Status feature states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("PEGAWAI");
  const [isEditing, setIsEditing] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const fetchTeamData = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token) return;

    try {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch active members
      const activeRes = await fetch(`/api/team?tenantId=${tenantId}`, { 
        headers,
        cache: "no-store" 
      });
      const activeData = await activeRes.json();

      // Fetch pending invites
      const inviteRes = await fetch(`/api/tenant-teams?tenantId=${tenantId}`, { 
        headers,
        cache: "no-store" 
      });
      const inviteData = await inviteRes.json();

      if (activeData.success) setMembers(activeData.data);
      if (inviteRes.ok && inviteData.success) setInvites(inviteData.data);
    } catch (err) {
      console.error("Failed to fetch team data:", err);
      toast.error("Gagal memuat data tim");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchTeamData();
  }, [session]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token || !inviteEmail) return;

    try {
      setIsSendingInvite(true);
      const res = await fetch(`/api/tenant-teams/invite?tenantId=${tenantId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail, phone: invitePhone, role: inviteRole })
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Undangan berhasil dikirim!");
        setIsInviteDialogOpen(false);
        setInviteEmail("");
        setInvitePhone("");
        fetchTeamData();
      } else {
        toast.error(result.message || "Gagal mengirim undangan");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleDeleteMember = async (id: string, isInvite: boolean) => {
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token) return;

    if (!confirm(isInvite ? "Batalkan undangan ini?" : "Hapus anggota tim ini?")) return;

    try {
      const endpoint = isInvite ? `/api/tenant-teams/${id}` : `/api/team/${id}`;
      const res = await fetch(`${endpoint}?tenantId=${tenantId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json();
      if (result.success) {
        toast.success(isInvite ? "Undangan dibatalkan" : "Anggota dihapus");
        fetchTeamData();
      } else {
        toast.error(result.message || "Gagal menghapus");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    }
  };
 
  const handleResendInvite = async () => {
    if (!selectedInvite) return;
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token) return;
 
    try {
      setIsResending(true);
      const res = await fetch(`/api/tenant-teams/resend/${selectedInvite.id}?tenantId=${tenantId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
 
      const result = await res.json();
      if (result.success) {
        toast.success("Undangan berhasil dikirim ulang");
        setIsResendDialogOpen(false);
        fetchTeamData();
      } else {
        toast.error(result.message || "Gagal mengirim ulang");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsResending(false);
      setSelectedInvite(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token) return;

    try {
      setIsEditing(true);
      const res = await fetch(`/api/team/${selectedUser.id}?tenantId=${tenantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: editPhone, role: editRole })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Data anggota berhasil diperbarui");
        setIsEditDialogOpen(false);
        fetchTeamData();
      } else {
        toast.error(result.message || "Gagal memperbarui data");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsEditing(false);
    }
  };

  const handleToggleLock = async () => {
    if (!selectedUser) return;
    const tenantId = (session?.user as any)?.tenantId;
    const token = (session as any)?.backendToken;
    if (!tenantId || !token) return;

    try {
      setIsLocking(true);
      const newLockStatus = !selectedUser.isLocked;
      const res = await fetch(`/api/team/${selectedUser.id}/lock?tenantId=${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isLocked: newLockStatus })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(newLockStatus ? "Akun berhasil dikunci" : "Akses akun berhasil dibuka");
        setIsLockDialogOpen(false);
        fetchTeamData();
      } else {
        toast.error(result.message || "Gagal mengubah status akses");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLocking(false);
    }
  };

  // Combine members and invites for display, and sort by role (NOTARIS first)
  const allEntries = [
    ...members.map(m => ({ ...m, status: "ACTIVE" })),
    ...invites.map(i => ({ ...i, name: "(Belum Bergabung)", status: "INVITED" }))
  ].sort((a, b) => {
    // NOTARIS comes first
    if (a.role === 'NOTARIS' && b.role !== 'NOTARIS') return -1;
    if (a.role !== 'NOTARIS' && b.role === 'NOTARIS') return 1;
    // For others, sort by status (ACTIVE before INVITED) then name
    if (a.status === 'ACTIVE' && b.status === 'INVITED') return -1;
    if (a.status === 'INVITED' && b.status === 'ACTIVE') return 1;
    return (a.name || a.email).localeCompare(b.name || b.email);
  });

  const filteredTeam = allEntries.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredTeam.length / PAGE_SIZE));
  const paginatedTeam = filteredTeam.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "NOTARIS":
        return (
          <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 gap-1.5 flex items-center w-fit px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider rounded-lg">
            <Shield className="h-3 w-3" /> Notaris
          </Badge>
        );
      case "PEGAWAI":
        return (
          <Badge className="bg-slate-100 text-slate-600 border-slate-200 gap-1.5 flex items-center w-fit px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider rounded-lg">
            <UserCircle2 className="h-3 w-3" /> Pegawai
          </Badge>
        );
      default:
        return <Badge variant="outline" className="font-bold text-[10px] uppercase">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="h-3 w-3" /> Aktif
          </span>
        );
      case "INVITED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="h-3 w-3" /> Menunggu
          </span>
        );
      default:
        return <Badge variant="outline" className="font-bold">{status}</Badge>;
    }
  };

  return (
    <TooltipProvider delay={200}>
      <div className="flex flex-col gap-8 pb-20">
      
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-indigo-600" strokeWidth={2.5} />
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Manajemen Tim</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Kelola anggota tim, peran, dan izin akses ke platform.
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-95">
                <UserPlus className="h-4 w-4" />
                Undang Anggota
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[480px] rounded-2xl p-0">
            <form onSubmit={handleSendInvite}>
              <DialogHeader className="px-8 pt-8 pb-6 border-b border-slate-100 bg-slate-50/50">
                <DialogTitle className="text-xl font-extrabold text-slate-900">Undang Anggota Tim</DialogTitle>
                <DialogDescription className="text-slate-500 mt-1">
                  Undangan akan dikirimkan melalui email untuk mendaftarkan akun di kantor Anda.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 p-8">
                <div className="grid gap-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Alamat Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      required
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@contoh.com" 
                      className="pl-9 h-11 rounded-lg border-slate-200 font-medium" 
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Nomor Handphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="tel"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                      placeholder="0812xxxx" 
                      className="pl-9 h-11 rounded-lg border-slate-200 font-medium" 
                    />
                  </div>
                </div>
                <CustomSelect 
                  label="Peran / Role"
                  options={[
                    { 
                      label: "Pegawai (Staf Notaris)", 
                      value: "PEGAWAI", 
                      icon: Users,
                      description: "Pelaksana teknis & operasional harian"
                    },
                    { 
                      label: "Notaris (Full Access)", 
                      value: "NOTARIS", 
                      icon: Shield,
                      description: "Pemilik agensi & penanggung jawab"
                    },
                  ]}
                  value={inviteRole}
                  onChange={(val) => setInviteRole(val)}
                />
              </div>
              <DialogFooter className="px-8 pb-8 sm:justify-center bg-transparent border-none">
                <Button 
                  disabled={isSendingInvite}
                  type="submit" 
                  className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-lg shadow-indigo-200"
                >
                  {isSendingInvite ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Kirim Undangan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl py-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Anggota</p>
              <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{members.length}</p>
            <p className="text-xs font-bold mt-1 text-indigo-600">Staf terdaftar</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl py-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Undangan Aktif</p>
              <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{invites.length}</p>
            <p className="text-xs font-bold mt-1 text-amber-600">Menunggu konfirmasi</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden rounded-2xl py-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Status Lisensi</p>
              <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold">Professional</p>
            <p className="text-xs font-bold mt-1 text-white/80 transition-all hover:underline cursor-pointer">Lihat Detail Paket →</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden py-0 gap-0 rounded-2xl">
        <div className="bg-slate-50/50 border-b border-slate-100 h-16 px-6 flex flex-row items-center justify-between shrink-0 rounded-t-2xl">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daftar Anggota Tim</span>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Cari nama atau email..." 
              className="pl-9 h-9 rounded-lg border-slate-200 bg-white text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-300" />
              <p className="text-xs font-bold uppercase tracking-widest">Memuat daftar tim...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/30 hover:bg-slate-50/30 border-none transition-none">
                  <TableHead className="px-6 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Anggota</TableHead>
                  <TableHead className="py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Peran</TableHead>
                  <TableHead className="py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Handphone</TableHead>
                  <TableHead className="py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                  <TableHead className="py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest text-right px-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTeam.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-16 text-slate-400 font-bold">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-slate-200" />
                        Tidak ada anggota yang ditemukan.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTeam.map((member, idx) => (
                    <TableRow key={member.id} className="group/row hover:bg-slate-50/60 border-slate-100 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover/row:scale-105 transition-transform`}>
                            {(member.name || member.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 leading-tight">{member.name}</span>
                              {member.isLocked && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600">
                                  Terkunci
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-medium mt-0.5">{member.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getRoleBadge(member.role)}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm font-bold text-slate-600">{member.phone || "—"}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(member.status)}
                      </TableCell>
                      <TableCell className="py-4 text-right px-6">
                        <div className="flex items-center justify-end gap-2 transition-all">
                          {member.status === "INVITED" && (
                            <Tooltip>
                              <TooltipTrigger 
                                render={
                                  <Button 
                                    onClick={() => {
                                      setSelectedInvite(member);
                                      setIsResendDialogOpen(true);
                                    }}
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                                  />
                                }
                              >
                                <Mail className="h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent>Kirim Ulang Email Undangan</TooltipContent>
                            </Tooltip>
                          )}
                          {member.role !== 'NOTARIS' && member.status === "ACTIVE" && member.id !== (session?.user as any)?.id && (
                            <>
                              <Tooltip>
                                <TooltipTrigger 
                                  render={
                                    <Button 
                                      onClick={() => {
                                        setSelectedUser(member);
                                        setEditPhone(member.phone || "");
                                        setEditRole(member.role || "PEGAWAI");
                                        setIsEditDialogOpen(true);
                                      }}
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-9 w-9 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                    />
                                  }
                                >
                                  <Edit2 className="h-4 w-4" />
                                </TooltipTrigger>
                                <TooltipContent>Edit Data</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger 
                                  render={
                                    <Button 
                                      onClick={() => {
                                        setSelectedUser(member);
                                        setIsLockDialogOpen(true);
                                      }}
                                      variant="ghost" 
                                      size="icon" 
                                      className={`h-9 w-9 rounded-lg transition-colors cursor-pointer ${
                                        member.isLocked 
                                          ? "text-red-500 hover:text-slate-600 hover:bg-slate-100" 
                                          : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                      }`}
                                    />
                                  }
                                >
                                  {member.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                </TooltipTrigger>
                                <TooltipContent>{member.isLocked ? "Buka Akses" : "Kunci Akses"}</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger 
                                  render={
                                    <Button 
                                      onClick={() => handleDeleteMember(member.id, false)}
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                    />
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-red-600 text-white border-red-500">Hapus Anggota</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */ }
        {!isLoading && filteredTeam.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <p className="text-xs text-slate-400 font-medium">
              Menampilkan <span className="font-bold text-slate-600">{((currentPage-1)*PAGE_SIZE)+1}–{Math.min(currentPage*PAGE_SIZE, filteredTeam.length)}</span> dari <span className="font-bold text-slate-600">{filteredTeam.length}</span> anggota
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {(() => {
                const pages: (number | '...')[] = [];
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage > 3) pages.push('...');
                  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                  if (currentPage < totalPages - 2) pages.push('...');
                  pages.push(totalPages);
                }
                return pages.map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="h-8 flex items-center px-1 text-slate-400 text-xs font-bold">…</span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      onClick={() => setCurrentPage(p as number)}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        p === currentPage
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                          : 'border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                      }`}
                    >
                      {p}
                    </button>
                  )
                );
              })()}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Resend Confirmation Dialog */}
      <Dialog open={isResendDialogOpen} onOpenChange={setIsResendDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl p-6">
          <DialogHeader className="items-center text-center space-y-4">
            <div className="h-16 w-16 bg-amber-50 rounded-xl flex items-center justify-center">
              <Mail className="h-8 w-8 text-amber-500" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold">Kirim Ulang Undangan?</DialogTitle>
              <DialogDescription className="text-sm">
                Kirim ulang email undangan pendaftaran ke <span className="font-bold text-slate-900">{selectedInvite?.email}</span>?
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsResendDialogOpen(false)}
              className="rounded-lg font-bold h-11"
            >
              Batal
            </Button>
            <Button 
              onClick={handleResendInvite}
              disabled={isResending}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-white h-11"
            >
              {isResending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Kirim Ulang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 bg-white">
          <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
            <DialogTitle className="text-lg font-bold text-slate-900">Edit Data Anggota</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit}>
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">NOMOR HANDPHONE</Label>
                <Input 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)} 
                  placeholder="Contoh: 081234567890" 
                  className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">PERAN / ROLE</Label>
                <CustomSelect 
                  value={editRole}
                  options={[
                    { value: "PEGAWAI", label: "Pegawai (Staf Notaris)", icon: Users },
                    { value: "NOTARIS", label: "Notaris (Office Owner)", icon: ShieldCheck }
                  ]}
                  onChange={(val) => setEditRole(val)}
                />
              </div>
            </div>
            <DialogFooter className="px-6 pb-8 bg-transparent justify-end border-none">
              <Button 
                disabled={isEditing}
                type="submit" 
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                {isEditing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lock/Unlock Confirmation Dialog */}
      <Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-6">
          <DialogHeader className="items-center text-center space-y-4">
            <div className={`h-16 w-16 rounded-xl flex items-center justify-center ${selectedUser?.isLocked ? "bg-emerald-50" : "bg-amber-50"}`}>
              {selectedUser?.isLocked ? <Unlock className="h-8 w-8 text-emerald-500" /> : <Lock className="h-8 w-8 text-amber-500" />}
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold">
                {selectedUser?.isLocked ? "Buka Akses Akun?" : "Kunci Akses Akun?"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {selectedUser?.isLocked 
                  ? "Anggota tim akan dapat login kembali ke dalam sistem menggunakan akunnya."
                  : "Anggota tim tidak akan bisa login ke dalam platform selama aksesnya masih terkunci. Anda dapat membukanya kembali nanti."}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-3 mt-6 bg-transparent border-none">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsLockDialogOpen(false)}
              className="rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 h-11"
            >
              Batal
            </Button>
            <Button 
              type="button" 
              onClick={handleToggleLock}
              disabled={isLocking}
              className={`rounded-xl font-bold shadow-lg text-white transition-all h-11 active:scale-[0.98] ${
                selectedUser?.isLocked 
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" 
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
              }`}
            >
              {isLocking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {selectedUser?.isLocked ? "Buka Akses" : "Kunci Akun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
