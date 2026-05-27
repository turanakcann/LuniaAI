"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/src/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-lunia-bg text-lunia-text transition-colors duration-300">
      
      {/* BAŞKA DOSYADAN ÇAĞRILAN NAVBAR */}
      <Navbar />

      {/* HERO BÖLÜMÜ */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lunia-accent/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lunia-card border border-lunia-border text-xs font-semibold text-lunia-muted mb-6">
          <span className="w-2 h-2 rounded-full bg-lunia-accent animate-pulse"></span>
          Sistem Çevrimiçi: v2.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-lunia-text">
          Sadece Bir Yapay Zeka Değil, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lunia-accent to-purple-500">
            Zihnini Anlayan Bir Yoldaş.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-lunia-muted max-w-2xl mb-10 leading-relaxed">
          Klişe tavsiyeleri ve robotik yanıtları unutun. Lunia, Sokratik sorgulama yöntemi ve çift LLM güvenlik mimarisi ile düşüncelerinizi derinleştirmek için tasarlandı.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-lunia-accent hover:bg-opacity-90 text-[#ffffff] font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-lunia-accent/20"
          >
            Hemen Başla <ArrowRight size={18} />
          </Link>
          <Link 
            href="/docs" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-lunia-card hover:bg-lunia-border/50 border border-lunia-border text-lunia-text font-semibold flex items-center justify-center transition-all"
          >
            Mimarimizi İncele
          </Link>
        </div>
      </section>
    </main>
  );
}