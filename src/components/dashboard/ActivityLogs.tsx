'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  UserPlus, 
  Settings,
  History,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  payload: any;
  createdAt: string;
  user?: {
    name: string;
    role: string;
  };
}

const ACTION_CONFIG: Record<string, { icon: any, color: string, label: string }> = {
  'CREATE_CLIENT': { icon: UserPlus, color: 'text-emerald-500 bg-emerald-50', label: 'Pendaftaran Klien' },
  'UPDATE_CLIENT': { icon: Settings, color: 'text-blue-500 bg-blue-50', label: 'Pembaruan Data Klien' },
  'DELETE_CLIENT': { icon: Trash2, color: 'text-red-500 bg-red-50', label: 'Penghapusan Klien' },
  'UPDATE_DEED': { icon: Settings, color: 'text-indigo-500 bg-indigo-50', label: 'Edit Metadata Akta' },
  'CREATE_DEED': { icon: Plus, color: 'text-indigo-500 bg-indigo-50', label: 'Pembuatan Akta Baru' },
  'FINALIZE_DEED': { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', label: 'Finalisasi Akta' },
  'UPLOAD_DEED_DRAFT': { icon: ExternalLink, color: 'text-indigo-500 bg-indigo-50', label: 'Revisi Draf Akta' },
  'UPLOAD_DEED_SCAN': { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50', label: 'Scan Akta (Final)' },
  'UPLOAD_DEED_ATTACHMENT': { icon: ExternalLink, color: 'text-amber-500 bg-amber-50', label: 'Lampiran Tambahan' },
  'UPLOAD_STAKEHOLDER_KTP': { icon: FileText, color: 'text-indigo-500 bg-indigo-50', label: 'Unggah KTP Penghadap' },
  'UPLOAD_STAKEHOLDER_NPWP': { icon: FileText, color: 'text-indigo-500 bg-indigo-50', label: 'Unggah NPWP Penghadap' },
  'UPDATE_DEED_STAKEHOLDERS': { icon: UserPlus, color: 'text-indigo-500 bg-indigo-50', label: 'Penghadap Akta' },
  'CREATE_APPOINTMENT': { icon: Plus, color: 'text-indigo-500 bg-indigo-50', label: 'Agenda Baru' },
  'UPDATE_APPOINTMENT': { icon: Settings, color: 'text-blue-500 bg-blue-50', label: 'Edit Agenda' },
  'UPDATE_PROFILE': { icon: Settings, color: 'text-amber-500 bg-amber-50', label: 'Pembaruan Profil' },
  'UPDATE_PASSWORD': { icon: ShieldCheck, color: 'text-rose-500 bg-rose-50', label: 'Ganti Password' },
  'DELETE_APPOINTMENT': { icon: Trash2, color: 'text-rose-500 bg-rose-50', label: 'Hapus Agenda' },
};

export default function ActivityLogs() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) return;

    try {
      const response = await fetch(`/api/audit?tenantId=${tenantId}&limit=6`, {
        headers: {
          'Authorization': `Bearer ${(session as any)?.backendToken}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setLogs(result.data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchLogs();
  }, [session]);

  const formatDistanceToNow = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getLogDescription = (log: AuditLog) => {
    const p = log.payload || {};
    switch (log.action) {
      case 'CREATE_CLIENT': return `Mendaftarkan klien "${p.name}"`;
      case 'UPDATE_CLIENT': return `Memperbarui data klien "${p.name || 'ID: '+log.resourceId}"`;
      case 'DELETE_CLIENT': return `Menghapus klien "${p.name}"`;
      case 'UPDATE_DEED': return `Memperbarui data akta "${p.new?.title || p.title || 'ID: '+log.resourceId}"`;
      case 'CREATE_DEED': return `Membuat draf akta "${p.title}"`;
      case 'FINALIZE_DEED': return `Menyelesaikan akta nomor "${p.deedNumber}"`;
      case 'UPLOAD_DEED_DRAFT': return `Mengunggah draf akta versi terbaru: ${p.filename}`;
      case 'UPLOAD_DEED_SCAN': return `Mengunggah hasil scan akta: ${p.filename}`;
       case 'UPLOAD_DEED_ATTACHMENT': return `Menambahkan lampiran: ${p.filename}`;
      case 'UPLOAD_STAKEHOLDER_KTP': return `Mengunggah KTP penghadap untuk akta "${p.title}"`;
      case 'UPLOAD_STAKEHOLDER_NPWP': return `Mengunggah NPWP penghadap untuk akta "${p.title}"`;
      case 'UPDATE_DEED_STAKEHOLDERS': return `Memperbarui daftar penghadap pada akta "${p.title || 'ID: '+log.resourceId}"`;
      case 'CREATE_APPOINTMENT': return `Membuat agenda baru: "${p.title}"`;
      case 'UPDATE_APPOINTMENT': return `Memperbarui detail agenda: "${p.title || log.resourceId}"`;
      case 'UPDATE_PROFILE': return 'Memperbarui informasi profil akun';
      case 'UPDATE_PASSWORD': return 'Melakukan penggantian kata sandi akun';
      case 'DELETE_APPOINTMENT': return `Menghapus agenda dari jadwal: "${p.title || log.resourceId}"`;
      default: return `${log.action} pada ${log.resource}`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-50 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-500" /> Aktivitas Terbaru
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Jejak audit operasional kantor</p>
        </div>
        <Link href="/dashboard/audit">
           <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold gap-1 px-2">
             Semua Log <ChevronRight className="h-3 w-3" />
           </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-auto">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
             <History className="h-8 w-8 mb-2 opacity-20" />
             <p className="text-xs font-medium">Belum ada aktivitas tercatat</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {logs.map((log) => {
              const cfg = ACTION_CONFIG[log.action] || { icon: History, color: 'text-slate-400 bg-slate-50', label: log.action };
              return (
                <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex gap-4">
                    <div className={`h-10 w-10 rounded-xl ${cfg.color} flex items-center justify-center shrink-0 shadow-sm`}>
                      <cfg.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[10px] font-black uppercase tracking-tight text-slate-400">{cfg.label}</p>
                        <span className="text-[10px] font-bold text-slate-400">{formatDistanceToNow(log.createdAt)}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-indigo-600 transition-colors">
                        {getLogDescription(log)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                        <p className="text-[10px] font-medium text-slate-400">Oleh <span className="text-slate-600 font-bold">{log.user?.name || 'Sistem'}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-50/30 border-t border-slate-50">
        <p className="text-[10px] text-center text-slate-400 font-medium italic">
          Keamanan terjamin dengan sistem logging otomatis NotarisOne
        </p>
      </div>
    </div>
  );
}
