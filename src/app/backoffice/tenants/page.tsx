"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Search, 
  MoreHorizontal, 
  ExternalLink,
  Ban,
  CheckCircle2,
  Calendar,
  Users as UsersIcon,
  FileText
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
import { Badge } from "@/components/ui/badge";

// Dummy data for Tenants
const initialTenants = [
  { 
    id: "1", 
    name: "Kantor Notaris Ahmad Muzaki", 
    subdomain: "ahmad", 
    status: "ACTIVE", 
    subscription: "ENTERPRISE",
    users: 5,
    deeds: 124,
    createdAt: "2024-01-15T10:00:00Z"
  },
  { 
    id: "2", 
    name: "Kantor Notaris Siti Aminah", 
    subdomain: "siti-aminah", 
    status: "SUSPENDED", 
    subscription: "STARTER",
    users: 2,
    deeds: 12,
    createdAt: "2024-02-10T14:30:00Z"
  },
  { 
    id: "3", 
    name: "Kantor Notaris Budi Santoso", 
    subdomain: "budi-legal", 
    status: "ACTIVE", 
    subscription: "PROFESSIONAL",
    users: 3,
    deeds: 45,
    createdAt: "2024-03-05T09:12:00Z"
  },
];

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200/50 gap-1 flex items-center w-fit"><CheckCircle2 className="h-3 w-3" /> Aktif</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-red-500/10 text-red-600 border-red-200/50 gap-1 flex items-center w-fit"><Ban className="h-3 w-3" /> Ditangguhkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubscriptionBadge = (sub: string) => {
    switch (sub) {
      case "ENTERPRISE":
        return <Badge className="bg-purple-500 text-white font-bold">ENTERPRISE</Badge>;
      case "PROFESSIONAL":
        return <Badge className="bg-blue-500 text-white font-bold">PROFESSIONAL</Badge>;
      default:
        return <Badge variant="secondary">STARTER</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-orange-500" />
            Manajemen Tenant
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Kelola kantor notaris terdaftar dan status keaktifan mereka di platform.</p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari nama kantor atau subdomain..." 
            className="pl-9 bg-white border-slate-200 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-none">
                <TableHead className="px-6 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Kantor Notaris</TableHead>
                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Akses / Subdomain</TableHead>
                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Volume (User/Akta)</TableHead>
                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                <TableHead className="text-right px-6 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialTenants.map((tenant) => (
                <TableRow key={tenant.id} className="group hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{tenant.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getSubscriptionBadge(tenant.subscription)}
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 uppercase">
                          <Calendar className="h-3 w-3" /> 
                          Sejak {new Date(tenant.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 p-1.5 px-3 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs w-fit">
                      {tenant.subdomain}.notarisone.id
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-3 w-3 text-slate-400" /> {tenant.users} User
                      </span>
                      <span className="flex items-center gap-1 border-l pl-3">
                        <FileText className="h-3 w-3 text-slate-400" /> {tenant.deeds} Akta
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(tenant.status)}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-2">
                       <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "h-8 rounded-lg font-bold gap-2 border-slate-200",
                          tenant.status === "ACTIVE" ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200" : "hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                        )}
                      >
                        {tenant.status === "ACTIVE" ? (
                          <>
                            <Ban className="h-3.5 w-3.5" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="font-bold text-sm">Ingin menambahkan tenant manual?</p>
            <p className="text-xs text-slate-400">Gunakan onboarding wizard untuk memasukkan kantor notaris baru.</p>
          </div>
        </div>
        <a href="/backoffice/tenants/onboard">
          <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-lg shadow-sm">
            Mulai Onboarding
          </Button>
        </a>
      </div>
    </div>
  );
}
