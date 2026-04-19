"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3001/api/backauth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || "Tautan reset telah dikirim (jika email terdaftar).");
    } catch (err) {
      setMessage("Terjadi kesalahan sistem. Coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Lupa Password</h3>
          <p className="text-sm text-gray-500">
            Masukkan email terdaftar Anda untuk menerima tautan reset password
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 px-4 py-8 sm:px-16">
          {message && <p className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">{message}</p>}
          <div>
            <Label htmlFor="email" className="block text-xs text-gray-600 uppercase">
              Alamat Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
            />
          </div>
          <Button
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            {loading ? "Mengirim..." : "Kirim Email Reset"}
          </Button>
          <p className="text-center text-sm text-gray-500">
            Ingat password Anda?{" "}
            <a href="/auth/login" className="font-semibold text-gray-800 hover:underline">
              Kembali ke Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
