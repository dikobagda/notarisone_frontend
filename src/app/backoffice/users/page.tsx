"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Search, 
  UserPlus, 
  ShieldCheck, 
  Shield, 
  Trash2, 
  Mail,
  Lock,
  Unlock,
  Loader2
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "STAFF";
  isLocked: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "STAFF" as "SUPERADMIN" | "STAFF",
    password: "",
  });

  const backendToken = (session as any)?.backendToken;
  const currentUserId = (session?.user as any)?.id;

  const fetchAdmins = async () => {
    if (!backendToken) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${backendToken}`,
        },
      });
      const result = await res.json();
      if (result.success) {
        setAdmins(result.data);
      } else {
        toast.error(result.message || "Gagal mengambil data user internal");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan jaringan saat mengambil data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (backendToken) {
      fetchAdmins();
    }
  }, [backendToken]);

  const handleToggleLock = async (admin: AdminUser) => {
    if (admin.id === currentUserId) {
      toast.error("Anda tidak bisa menonaktifkan akun Anda sendiri!");
      return;
    }

    const actionText = admin.isLocked ? "mengaktifkan" : "menonaktifkan";
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} akun admin "${admin.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${admin.id}/toggle-lock`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${backendToken}`,
        },
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        // Optimistic / reactive update
        setAdmins((prev) =>
          prev.map((item) =>
            item.id === admin.id ? { ...item, isLocked: !item.isLocked } : item
          )
        );
      } else {
        toast.error(result.message || "Gagal mengubah status akses");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan koneksi");
    }
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (admin.id === currentUserId) {
      toast.error("Anda tidak bisa menghapus akun Anda sendiri!");
      return;
    }

    if (!window.confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus permanen akun admin "${admin.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${admin.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${backendToken}`,
        },
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Akun admin berhasil dihapus");
        setAdmins((prev) => prev.filter((item) => item.id !== admin.id));
      } else {
        toast.error(result.message || "Gagal menghapus akun admin");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan koneksi");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Nama dan email wajib diisi!");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Akun admin baru berhasil dibuat!");
        setIsOpen(false);
        // Reset form
        setFormData({
          name: "",
          email: "",
          role: "STAFF",
          password: "",
        });
        // Refresh list
        fetchAdmins();
      } else {
        toast.error(result.message || "Gagal membuat akun admin baru");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-200/50 gap-1 flex items-center w-fit font-bold"><ShieldCheck className="h-3 w-3" /> Super Admin</Badge>;
      case "STAFF":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200/50 gap-1 flex items-center w-fit font-bold"><Shield className="h-3 w-3" /> Staff</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (isLocked: boolean) => {
    if (!isLocked) {
      return <Badge className="bg-green-500/10 text-green-600 border-green-200/30">Aktif</Badge>;
    }
    return <Badge className="bg-red-500/10 text-red-600 border-red-200/30">Non-aktif</Badge>;
  };

  const filteredAdmins = admins.filter((admin) => {
    const search = searchTerm.toLowerCase();
    return (
      admin.name.toLowerCase().includes(search) ||
      admin.email.toLowerCase().includes(search) ||
      admin.role.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
              <Users className="h-6 w-6" />
            </div>
            Manajemen User Internal
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Kelola tim internal penagraha yang memiliki akses ke backoffice.</p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 font-bold px-6 py-5 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
        >
          <UserPlus className="h-4 w-4" />
          Tambah Admin
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-xl shadow-slate-100/50 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="pb-4 px-6 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Daftar Staf Internal</CardTitle>
              <CardDescription className="font-medium">Total {admins.length} staf aktif mengelola platform.</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Cari staf..." 
                className="pl-10 bg-slate-50 border-slate-100 rounded-xl h-11 font-medium focus-visible:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 border-t border-slate-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Memuat data user internal…</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Users className="h-12 w-12 text-slate-200" />
              <p className="text-sm font-bold text-slate-500">Staf tidak ditemukan</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                  <TableHead className="px-6 py-4.5 text-slate-500 font-black uppercase text-[10px] tracking-wider">Nama Staf</TableHead>
                  <TableHead className="text-slate-500 font-black uppercase text-[10px] tracking-wider">Level Akses</TableHead>
                  <TableHead className="text-slate-500 font-black uppercase text-[10px] tracking-wider">Status</TableHead>
                  <TableHead className="text-right px-6 text-slate-500 font-black uppercase text-[10px] tracking-wider">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => {
                  const isSelf = admin.id === currentUserId;
                  return (
                    <TableRow key={admin.id} className="group hover:bg-slate-50/50 border-b border-slate-50 last:border-0 transition-colors">
                      <TableCell className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold border border-orange-100">
                            {admin.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">{admin.name}</span>
                              {isSelf && (
                                <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md tracking-wider">Anda</span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-medium">{admin.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(admin.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(admin.isLocked)}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* Toggle Lock Button */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleLock(admin)}
                            disabled={isSelf}
                            title={admin.isLocked ? "Aktifkan Akun" : "Non-aktifkan Akun"}
                            className="h-9 w-9 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 hover:shadow-sm"
                          >
                            {admin.isLocked ? <Unlock className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-amber-600" />}
                          </Button>
                          
                          {/* Delete Button */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteAdmin(admin)}
                            disabled={isSelf}
                            title="Hapus Admin"
                            className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 hover:shadow-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] border-none shadow-2xl rounded-3xl overflow-hidden p-0">
          <form onSubmit={handleCreateAdmin}>
            <div className="px-6 pt-6 pb-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">Tambah Admin Baru</DialogTitle>
                <DialogDescription className="font-medium text-slate-400 mt-1">
                  Akun ini akan memiliki akses untuk mengelola platform penagraha.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="grid gap-5 px-6 py-2">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                <Input 
                  placeholder="Masukkan nama lengkap staf" 
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-orange-500 font-medium"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Kerja</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="email"
                    placeholder="email@penagraha.com" 
                    className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-orange-500 font-medium"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password Awal</label>
                <Input 
                  type="password"
                  placeholder="admin123 (opsional)" 
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-orange-500 font-medium"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="text-[10px] text-slate-400 italic">Default password jika dikosongkan adalah "admin123".</p>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tingkat Akses (Role)</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as "SUPERADMIN" | "STAFF" })}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                >
                  <option value="STAFF">Platform Staff</option>
                  <option value="SUPERADMIN">Super Admin (Akses Penuh)</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-6 mt-4 bg-slate-50 flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="h-11 px-5 rounded-xl border-slate-200 font-bold hover:bg-slate-100"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-11 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : "Buat Akun Admin"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
