"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/src/lib/api";
import { Sparkles, ArrowRight, UserPlus } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        email: email,
        password: password,
        full_name: fullName,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.detail || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-lunia-bg p-4 relative font-sans overflow-hidden">
      
      {/* Arka Plan Hafif Işık Efekti */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lunia-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md border border-lunia-border bg-lunia-card/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl z-10 relative">
        
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-lunia-accent/10 flex items-center justify-center border border-lunia-accent/20 mx-auto mb-4">
            <UserPlus size={22} className="text-lunia-accent" />
          </div>
          <h1 className="text-2xl font-bold text-lunia-text tracking-tight">Yeni Bir Başlangıç</h1>
          <p className="text-lunia-muted mt-1 text-sm">Lunia'ya katıl ve iç dünyanı keşfet.</p>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-green-400" size={24} />
            </div>
            <h3 className="text-lunia-text font-bold text-lg">Aramıza Hoş Geldin!</h3>
            <p className="text-lunia-muted text-sm">Hesabın başarıyla oluşturuldu. Giriş ekranına yönlendiriliyorsun...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-lunia-text text-xs font-semibold mb-2 uppercase tracking-wider opacity-80">
                Ad Soyad
              </label>
              <input
                type="text"
                required
                className="w-full bg-lunia-bg border border-lunia-border text-lunia-text px-4 py-3 rounded-xl focus:outline-none focus:border-lunia-accent focus:ring-1 focus:ring-lunia-accent transition-all placeholder:text-lunia-muted/40 text-sm"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn: Ahmet Yılmazcan"
              />
            </div>

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

            <div>
              <label className="block text-lunia-text text-xs font-semibold mb-2 uppercase tracking-wider opacity-80">
                Şifre (En az 8 Karakter)
              </label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full bg-lunia-bg border border-lunia-border text-lunia-text px-4 py-3 rounded-xl focus:outline-none focus:border-lunia-accent focus:ring-1 focus:ring-lunia-accent transition-all placeholder:text-lunia-muted/40 text-sm"
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
              className="w-full bg-lunia-accent hover:bg-lunia-accentHover text-black font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-lunia-accent/10 disabled:opacity-50 text-sm mt-2"
            >
              {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
              {!loading && <ArrowRight size={16} />}
            </button>

            <div className="text-center mt-6 pt-4 border-t border-lunia-border">
              <span className="text-lunia-muted text-xs">Zaten bir yoldaş mısın? </span>
              <Link href="/login" className="text-lunia-accent hover:text-lunia-text text-xs transition-colors font-semibold">
                Giriş Yap
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}