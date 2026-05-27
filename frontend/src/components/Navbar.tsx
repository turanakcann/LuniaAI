"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sun, Moon, ArrowRight, Sparkles } from "lucide-react";

export default function Navbar() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("lunia-theme") as "dark" | "light";
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("lunia-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-lunia-border bg-lunia-bg/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Sol: Logo (TIKLANABİLİR VE ANASAYFAYA GİDER) */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-lunia-accent/10 flex items-center justify-center border border-lunia-accent/20">
            <Sparkles size={16} className="text-lunia-accent" />
          </div>
          <span className="font-bold text-xl tracking-tight text-lunia-text">Lunia.ai</span>
        </Link>

        {/* Orta: Yönlendirme Linkleri */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-lunia-muted">
          <Link href="/developers" className="hover:text-lunia-text transition-colors">Geliştiriciler</Link>
          <Link href="/guide" className="hover:text-lunia-text transition-colors">Kullanım Kılavuzu</Link>
          <Link href="/scenarios" className="hover:text-lunia-text transition-colors">Örnek Senaryolar</Link>
          <Link href="/docs" className="hover:text-lunia-text transition-colors">Dökümantasyon ve Linkler</Link>
        </nav>

        {/* Sağ: Tema Seçici ve YUMUŞATILMIŞ Auth Butonları */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-lunia-border/50 text-lunia-muted hover:text-lunia-text transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="flex items-center gap-2">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-lunia-text hover:bg-lunia-border/50 px-5 py-2.5 rounded-full transition-colors"
            >
              Giriş Yap
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-semibold bg-lunia-text text-lunia-bg hover:opacity-90 px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-md"
            >
              Kayıt Ol <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        
      </div>
    </header>
  );
}