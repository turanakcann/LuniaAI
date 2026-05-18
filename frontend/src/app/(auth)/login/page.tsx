"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import api from "@/src/lib/api";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token } = response.data;
      // Güvenli çerez politikası
      Cookies.set("token", access_token, { expires: 1, secure: true, sameSite: "strict" });

      // Doğrudan ana ekrana yönlendir
      router.replace("/chat");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Bağlantı hatası. Sistem çevrimdışı olabilir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-lunia-bg p-4 relative font-sans overflow-hidden">
      
      {/* Arka Plan Hafif Işık Efekti */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lunia-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md border border-lunia-border bg-[#0f0f13]/60 backdrop-blur-md p-8 rounded-2xl shadow-2xl z-10 relative">
        
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-lunia-accent/10 flex items-center justify-center border border-lunia-accent/20 mx-auto mb-4">
            <Sparkles size={22} className="text-lunia-accent" />
          </div>
          <h1 className="text-2xl font-bold text-lunia-text tracking-tight">Tekrar Hoş Geldin</h1>
          <p className="text-lunia-muted mt-1 text-sm">Zihnine giden güvenli kanal.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-lunia-text text-xs font-semibold mb-2 uppercase tracking-wider opacity-80">
              E-Posta Adresi
            </label>
            <input
              type="email"
              required
              className="w-full bg-[#111115] border border-lunia-border text-lunia-text px-4 py-3 rounded-xl focus:outline-none focus:border-lunia-accent focus:ring-1 focus:ring-lunia-accent transition-all placeholder:text-lunia-muted/40 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-lunia-text text-xs font-semibold uppercase tracking-wider opacity-80">
                Şifre
              </label>
              <Link href="/forgot-password" className="text-xs text-lunia-accent hover:underline transition-all">
                Şifremi Unuttum
              </Link>
            </div>
            <input
              type="password"
              required
              className="w-full bg-[#111115] border border-lunia-border text-lunia-text px-4 py-3 rounded-xl focus:outline-none focus:border-lunia-accent focus:ring-1 focus:ring-lunia-accent transition-all placeholder:text-lunia-muted/40 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-900/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs leading-relaxed">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lunia-accent hover:bg-lunia-accentHover text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-lunia-accent/10 disabled:opacity-50 text-sm mt-2"
          >
            {loading ? "Doğrulanıyor..." : "Giriş Yap"}
            {!loading && <ArrowRight size={16} />}
          </button>

          <div className="text-center mt-6 pt-4 border-t border-lunia-border">
            <span className="text-lunia-muted text-xs">Bir hesabın yok mu? </span>
            <Link href="/register" className="text-lunia-accent hover:text-lunia-text text-xs transition-colors font-semibold">
              Kayıt Ol
            </Link>
          </div>
        </form>

      </div>
    </main>
  );
}