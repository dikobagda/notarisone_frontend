'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  History, 
  Search, 
  Filter, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Activity,
  UserPlus,
  Trash2,
  CheckCircle2,
  Plus,
  Settings,
  Database,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  payload: any;
  ipAddress?: string;
  createdAt: string;
  user?: { name: string; role: string; };
}

const ACTION_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  'CREATE_CLIENT':        { icon: UserPlus,     color: 'text-emerald-600 bg-emerald-50 border-emerald-100',  label: 'Daftar Klien' },
  'UPDATE_CLIENT':        { icon: Settings,     color: 'text-blue-600 bg-blue-50 border-blue-100',           label: 'Edit Klien' },
  'DELETE_CLIENT':        { icon: Trash2,       color: 'text-red-600 bg-red-50 border-red-100',              label: 'Hapus Klien' },
  'CREATE_DEED':          { icon: Plus,         color: 'text-indigo-600 bg-indigo-50 border-indigo-100',     label: 'Buat Akta' },
  'UPDATE_DEED':          { icon: Settings,     color: 'text-violet-600 bg-violet-50 border-violet-100',     label: 'Edit Akta' },
  'FINALIZE_DEED':        { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100',  label: 'Final Akta' },
  'UPLOAD_DEED_DRAFT':    { icon: Plus,         color: 'text-indigo-600 bg-indigo-50 border-indigo-100',     label: 'Revisi Draf' },
  'UPLOAD_DEED_SCAN':     { icon: CheckCircle2, color: 'text-teal-600 bg-teal-50 border-teal-100',          label: 'Scan Final' },
  'UPLOAD_DEED_ATTACHMENT':{ icon: Plus,        color: 'text-amber-600 bg-amber-50 border-amber-100',        label: 'Lampiran' },
  'UPLOAD_STAKEHOLDER_KTP':{ icon: FileText,    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',     label: 'KTP Penghadap' },
  'UPLOAD_STAKEHOLDER_NPWP':{ icon: FileText,    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',     label: 'NPWP Penghadap' },
  'UPDATE_DEED_STAKEHOLDERS':{ icon: UserPlus,    color: 'text-violet-600 bg-violet-50 border-violet-100',     label: 'Penghadap Akta' },
  'INVITE_MEMBER':        { icon: UserPlus,     color: 'text-indigo-600 bg-indigo-50 border-indigo-100',     label: 'Undang Tim' },
  'RESEND_INVITE':        { icon: Activity,     color: 'text-amber-600 bg-amber-50 border-amber-100',        label: 'Resend Email' },
  'REVOKE_INVITE':        { icon: Trash2,       color: 'text-slate-600 bg-slate-50 border-slate-100',        label: 'Batal Undang' },
  'DELETE_MEMBER':        { icon: Trash2,       color: 'text-red-600 bg-red-50 border-red-100',              label: 'Hapus Anggota' },
  'CREATE_APPOINTMENT':   { icon: Plus,         color: 'text-indigo-600 bg-indigo-50 border-indigo-100',     label: 'Agenda Baru' },
   'UPDATE_APPOINTMENT':   { icon: Settings,     color: 'text-blue-600 bg-blue-50 border-blue-100',           label: 'Edit Agenda' },
  'UPDATE_PROFILE':       { icon: User,         color: 'text-amber-600 bg-amber-50 border-amber-100',        label: 'Ubah Profil' },
  'UPDATE_PASSWORD':      { icon: ShieldCheck,  color: 'text-rose-600 bg-rose-50 border-rose-100',           label: 'Ganti Password' },
  'DELETE_APPOINTMENT':   { icon: Trash2,       color: 'text-rose-600 bg-rose-50 border-rose-100',           label: 'Hapus Agenda' },
};

const PAGE_SIZE = 10;

export default function AuditPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/audit?tenantId=${tenantId}&limit=200`, {
        headers: { 'Authorization': `Bearer ${(session as any)?.backendToken}` }
      });
      const result = await response.json();
      if (result.success) setLogs(result.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (session) fetchLogs(); }, [session]);

  const getLogDescription = (log: AuditLog) => {
    const p = log.payload || {};
    switch (log.action) {
      case 'CREATE_CLIENT':         return `Mendaftarkan klien baru: "${p.name}"`;
      case 'UPDATE_CLIENT':         return `Memperbarui data klien: "${p.name || 'ID: ' + log.resourceId}"`;
      case 'DELETE_CLIENT':         return `Menghapus klien "${p.name}" dari sistem`;
      case 'UPDATE_DEED':           return `Memperbarui data akta: "${p.new?.title || p.title || log.resourceId}"`;
      case 'CREATE_DEED':           return `Membuat draf akta baru: "${p.title}"`;
      case 'FINALIZE_DEED':         return `Finalisasi akta "${p.title}" — Nomor: ${p.deedNumber}`;
      case 'UPLOAD_DEED_DRAFT':     return `Mengunggah revisi draf: ${p.filename}`;
      case 'UPLOAD_DEED_SCAN':      return `Menyimpan scan final: ${p.filename}`;
      case 'UPLOAD_DEED_ATTACHMENT':return `Menambahkan lampiran: ${p.filename}`;
      case 'UPLOAD_STAKEHOLDER_KTP': return `Mengunggah KTP penghadap untuk akta "${p.title}"`;
      case 'UPLOAD_STAKEHOLDER_NPWP': return `Mengunggah NPWP penghadap untuk akta "${p.title}"`;
      case 'UPDATE_DEED_STAKEHOLDERS':return `Memperbarui daftar penghadap pada akta "${p.title || log.resourceId}"`;
      case 'INVITE_MEMBER':         return `Mengundang anggota baru (${p.role}): ${p.email}`;
      case 'RESEND_INVITE':         return `Mengirim ulang email undangan ke: ${p.email}`;
      case 'REVOKE_INVITE':         return `Membatalkan undangan tim untuk: ${p.email}`;
      case 'DELETE_MEMBER':         return `Menghapus anggota tim: ${p.name || p.email}`;
      case 'CREATE_APPOINTMENT':    return `Membuat agenda baru: "${p.title}"`;
      case 'UPDATE_APPOINTMENT':    return `Memperbarui detail agenda: "${p.title || log.resourceId}"`;
      case 'UPDATE_PROFILE':        return 'Memperbarui informasi profil akun';
      case 'UPDATE_PASSWORD':       return 'Melakukan penggantian kata sandi akun';
      case 'DELETE_APPOINTMENT':    return `Menghapus agenda dari jadwal: "${p.title || log.resourceId}"`;
      default:                      return `${log.action} pada ${log.resource}`;
    }
  };

  const filtered = logs.filter(l =>
    getLogDescription(l).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = [
    { label: 'Total Aktivitas',   value: logs.length,                                                          icon: Activity,    accent: 'bg-indigo-50',  iconColor: 'text-indigo-600' },
    { label: 'Pengguna Aktif',    value: new Set(logs.map(l => (l as any).userId)).size,                       icon: User,        accent: 'bg-blue-50',    iconColor: 'text-blue-600' },
    { label: 'Resource Diakses',  value: new Set(logs.map(l => l.resource)).size,                              icon: Database,    accent: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Hari Ini',          value: logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length, icon: Clock, accent: 'bg-amber-50',   iconColor: 'text-amber-600' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20">

      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <History className="h-7 w-7 text-indigo-600" strokeWidth={2.5} />
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Audit Log</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Jejak seluruh aktivitas staf dan sistem pada kantor Anda secara real-time.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="h-11 px-5 rounded-xl border-slate-200 bg-white text-slate-600 font-bold gap-2"
          onClick={fetchLogs}
        >
          <Activity className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden rounded-3xl gap-0 py-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                <div className={`h-9 w-9 rounded-xl ${stat.accent} flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{isLoading ? '—' : stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Log Table Card */}
      <Card className="border-none shadow-sm bg-white overflow-hidden py-0 gap-0 rounded-3xl">

        {/* Toolbar */}
        <div className="bg-slate-50/50 border-b border-slate-100 h-16 px-6 flex flex-row items-center justify-between shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Riwayat Aktivitas</span>
            {!isLoading && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                {filtered.length}
              </span>
            )}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
            <Input
              placeholder="Cari aktivitas atau pengguna..."
              className="pl-10 h-10 rounded-2xl border-slate-200 bg-white shadow-sm shadow-indigo-100/50 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Waktu</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Aksi</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Deskripsi</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Oleh</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-full w-28" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <History className="h-8 w-8 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">Tidak ada log aktivitas</p>
                        <p className="text-xs font-medium mt-1">Aktivitas sistem akan muncul di sini.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((log) => {
                  const cfg = ACTION_CONFIG[log.action] || { icon: Activity, color: 'text-slate-500 bg-slate-50 border-slate-100', label: log.action };
                  const Icon = cfg.icon;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">
                            {new Date(log.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800 leading-snug max-w-md">{getLogDescription(log)}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 font-mono">
                          ID: {log.resourceId?.substring(0, 12)}…
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-black shrink-0">
                            {(log.user?.name || 'S').charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{log.user?.name || 'Sistem'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                          {log.ipAddress || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">
              Menampilkan <span className="font-bold text-slate-600">{((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)}</span> dari <span className="font-bold text-slate-600">{filtered.length}</span> aktivitas
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Dynamic page buttons — show max 7, with ellipsis */}
              {(() => {
                const pages: (number | '...')[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (page > 4) pages.push('...');
                  for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.push(i);
                  if (page < totalPages - 3) pages.push('...');
                  pages.push(totalPages);
                }
                return pages.map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="h-8 flex items-center px-1 text-slate-400 text-xs font-bold">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`h-8 w-8 flex items-center justify-center rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        p === page
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
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
