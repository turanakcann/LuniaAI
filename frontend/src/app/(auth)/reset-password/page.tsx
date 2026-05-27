"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import api from "@/src/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setMessage({ type: "error", text: "Geçersiz veya eksik sıfırlama bağlantısı." });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await api.post("/auth/reset-password", { token, new_password: password });
      setMessage({ type: "success", text: res.data.message });
      // 3 saniye sonra login'e yönlendir
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.detail || "Şifre sıfırlanamadı." });
    } finally {
      setLoading(false);
    }
  };

  if (!token && !message) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-lunia-bg p-6 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lunia-accent/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-md bg-lunia-card border border-lunia-border rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-lunia-accent/10 flex items-center justify-center border border-lunia-accent/20">
            <Sparkles size={16} className="text-lunia-accent" />
          </div>
          <span className="font-bold text-xl text-lunia-text">Lunia.ai</span>
        </div>
        
        <h1 className="text-2xl font-bold text-lunia-text mb-2">Yeni Şifre Belirle</h1>
        <p className="text-sm text-lunia-muted mb-8">
          Lütfen hesabınız için yeni ve güçlü bir şifre oluşturun.
        </p>

        {message && (
          <div className={`p-4 rounded-xl text-sm mb-6 border ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-lunia-muted mb-1.5">Yeni Şifre</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-lunia-muted" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!token || message?.type === "success"}
                className="w-full bg-lunia-bg border border-lunia-border focus:border-lunia-accent text-lunia-text rounded-xl pl-10 pr-4 py-3 outline-none transition-colors text-sm disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password || !token || message?.type === "success"}
            className="w-full bg-lunia-text text-lunia-bg hover:opacity-90 font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="block w-4 h-4 border-2 border-lunia-bg/30 border-t-lunia-bg rounded-full animate-spin" />
            ) : (
              <>Şifreyi Güncelle <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}