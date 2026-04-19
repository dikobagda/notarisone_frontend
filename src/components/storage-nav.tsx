"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { HardDrive, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function StorageNav() {
  const { data: session } = useSession();
  const [storageUsage, setStorageUsage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = (session as any)?.backendToken;
  const tenantId = (session?.user as any)?.tenantId;

  const fetchStorageUsage = async () => {
    if (!tenantId || !token) return;
    try {
      const res = await fetch(`/api/tenant/storage-usage?tenantId=${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setStorageUsage(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch storage usage in nav:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchStorageUsage();
      // Periodically refresh every 5 minutes
      const interval = setInterval(fetchStorageUsage, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  if (!session) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const usedBytes = storageUsage?.usedBytes || 0;
  const limitBytes = storageUsage?.limitBytes || 2 * 1024 * 1024 * 1024; // Default 2GB for mock state
  const usedPercent = Math.min(100, Math.round((usedBytes / limitBytes) * 100));
  const isNearLimit = usedPercent >= 85;

  if (isLoading && !storageUsage) {
    return (
      <div className="hidden lg:flex flex-col w-48 gap-1.5 animate-pulse">
        <div className="h-3 bg-slate-100 rounded w-3/4" />
        <div className="h-1.5 bg-slate-100 rounded-full w-full" />
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col w-48 group cursor-default">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <HardDrive className={cn(
            "h-3.5 w-3.5",
            isNearLimit ? "text-red-500" : "text-slate-400 group-hover:text-indigo-500 transition-colors"
          )} />
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            Penyimpanan
          </span>
        </div>
        <span className={cn(
          "text-[10px] font-black tracking-tight transition-colors",
          isNearLimit ? "text-red-500" : "text-slate-400 group-hover:text-slate-600"
        )}>
          {formatBytes(usedBytes)} / {formatBytes(limitBytes)}
        </span>
      </div>
      
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            isNearLimit ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : 
            usedPercent >= 70 ? "bg-amber-500" : 
            "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
          )}
          style={{ width: `${usedPercent}%` }}
        />
      </div>
      
      {isNearLimit && (
        <div className="absolute top-12 right-0 bg-red-50 border border-red-100 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <AlertCircle className="h-3 w-3 text-red-500" />
          <span className="text-[9px] font-bold text-red-600">Penyimpanan Penuh</span>
        </div>
      )}
    </div>
  );
}
