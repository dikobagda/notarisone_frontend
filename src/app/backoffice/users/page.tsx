"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Search, 
  UserPlus, 
  ShieldCheck, 
  Shield, 
  Trash2, 
  Mail,
  MoreHorizontal,
  Lock,
  Unlock
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Dummy data for Admin Users
const initialAdmins = [
  { id: "1", name: "Super Admin", email: "admin@notarisone.id", role: "SUPERADMIN", status: "ACTIVE" },
  { id: "2", name: "Budi Support", email: "budi@notarisone.id", role: "STAFF", status: "ACTIVE" },
  { id: "3", name: "Siti Finance", email: "siti@notarisone.id", role: "STAFF", status: "DISABLED" },
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200/30">Aktif</Badge>;
      case "DISABLED":
        return <Badge className="bg-slate-200 text-slate-600 border-none">Non-aktif</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-orange-500" />
            Manajemen User Internal
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Kelola tim internal NotarisOne yang memiliki akses ke backoffice.</p>
        </div>
        <Dialog>
          <DialogTrigger render={
            <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 font-bold px-6 rounded-xl shadow-lg shadow-orange-500/20">
              <UserPlus className="h-4 w-4" />
              Tambah Admin
            </Button>
          } />
          <DialogContent className="sm:max-w-[450px] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Tambah Admin Baru</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                Akun ini akan memiliki akses untuk mengelola platform.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
                <Input placeholder="Masukkan nama" className="rounded-xl border-slate-200" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-bold text-slate-700">Email Kerja</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="email@notarisone.id" className="pl-9 rounded-xl border-slate-200" />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-bold text-slate-700">Tingkat Akses (Role)</label>
                <select className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium ring-offset-background focus:ring-2 focus:ring-orange-500 outline-none">
                  <option value="STAFF">Platform Staff</option>
                  <option value="SUPERADMIN">Super Admin (Full Access)</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full h-11 bg-orange-500 hover:bg-orange-600 font-bold rounded-xl">Buat Akun Admin</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="pb-3 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Daftar Staf Internal</CardTitle>
              <CardDescription className="font-medium">Total 3 staf aktif mengelola platform.</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Cari staf..." 
                className="pl-9 bg-slate-50 border-slate-200 rounded-xl h-11 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 border-t border-slate-50">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                <TableHead className="px-6 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Nama Staf</TableHead>
                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Level Akses</TableHead>
                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                <TableHead className="text-right px-6 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialAdmins.map((admin) => (
                <TableRow key={admin.id} className="group hover:bg-slate-50/70 border-b border-slate-50 last:border-0 transition-colors">
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">
                        {admin.name.substring(0, 1)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{admin.name}</span>
                        <span className="text-xs text-slate-500 font-medium">{admin.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(admin.role)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(admin.status)}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 shadow-none">
                        {admin.status === "ACTIVE" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 shadow-none">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 shadow-none">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
