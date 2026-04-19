"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token tidak valid atau tidak ditemukan.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/backauth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage(data.message);
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        setError(data.message || "Gagal mengubah password.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Ganti Password Baru</h3>
          <p className="text-sm text-gray-500">Buat perlindungan sandi baru untuk akun Anda.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 px-4 py-8 sm:px-16">
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          {message && <p className="text-center text-sm text-green-600 bg-green-50 p-2 rounded">{message}</p>}
          
          <div>
            <Label htmlFor="password" className="block text-xs text-gray-600 uppercase">Password Baru</Label>
            <Input
              id="password"
              type="password"
              required
              disabled={!token || message !== ""}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            />
          </div>
          
          <Button disabled={loading || !token || message !== ""} className="w-full bg-black text-white hover:bg-gray-800">
            {loading ? "Menyimpan..." : "Simpan Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Memuat form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
