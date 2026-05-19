"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/src/lib/api";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Backend tarafındaki SMTP şifre sıfırlama uç noktasına istek atıyoruz
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Sıfırlama bağlantısı gönderilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-lunia-bg p-4 relative font-sans overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lunia-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md border border-lunia-border bg-lunia-card/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl z-10 relative">
        
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-lunia-accent/10 flex items-center justify-center border border-lunia-accent/20 mx-auto mb-4">
            <Mail size={22} className="text-lunia-accent" />
          </div>
          <h1 className="text-2xl font-bold text-lunia-text tracking-tight">Şifremi Unuttum</h1>
          <p className="text-lunia-muted mt-1 text-sm">Hesabına bağlı e-posta adresini gir, sana bir kurtarma bağlantısı gönderelim.</p>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-4">
             <div className="p-4 bg-lunia-accent/10 border border-lunia-accent/20 rounded-xl">
               <p className="text-lunia-text text-sm leading-relaxed">
                 Sıfırlama bağlantısı <strong className="text-lunia-accent">{email}</strong> adresine gönderildi. Lütfen gelen kutunu ve spam klasörünü kontrol et.
               </p>
             </div>
             <div className="mt-6">
                <Link href="/login" className="text-lunia-accent hover:text-lunia-text text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                  <ArrowLeft size={16} /> Giriş Ekranına Dön
                </Link>
             </div>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-5">
            <div>
              <label className="block text-lunia-text text-xs font-semibold mb-2 uppercase tracking-wider opacity-80">
                E-Posta Adresi
              </label>
              <input
                type="email"
                required
                className="w-full bg-lunia-bg border border-lunia-border text-lunia-text px-4 py-3 rounded-xl focus:outline-none focus:border-lunia-accent focus:ring-1 focus:ring-lunia-accent transition-all placeholder:text-lunia-muted/40 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="isim@domain.com"
              />
            </div>

            {error && (
              <div className="bg-red-900/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-lunia-accent hover:bg-lunia-accentHover text-black font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-lunia-accent/10 disabled:opacity-50 text-sm mt-2"
            >
              {loading ? "Gönderiliyor..." : "Bağlantı Gönder"}
              {!loading && <Send size={16} />}
            </button>

            <div className="text-center mt-6 pt-4 border-t border-lunia-border">
              <Link href="/login" className="text-lunia-muted hover:text-lunia-text text-xs transition-colors font-semibold flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Geri Dön
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}