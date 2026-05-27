"use client";

import Navbar from "@/src/components/Navbar";
import { BookOpen, GitCommit, Terminal, Server, GitBranch } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-lunia-bg text-lunia-text transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-20 w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center tracking-tight">Dökümantasyon</h1>
        <p className="text-lunia-muted text-center mb-16 text-lg max-w-2xl mx-auto">
          Lunia.ai mimarisini kendi sistemlerinize entegre etmek veya kaynak kodlarını incelemek için gerekli tüm bağlantılar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          <Link href="#" className="group bg-lunia-card border border-lunia-border p-6 rounded-2xl hover:border-lunia-accent transition-all flex items-start gap-4">
            <div className="p-3 bg-lunia-bg rounded-xl border border-lunia-border group-hover:bg-lunia-accent/10 group-hover:text-lunia-accent transition-colors">
              <Terminal size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-lunia-accent transition-colors">REST API Referansı</h3>
              <p className="text-sm text-lunia-muted">FastAPI üzerinden sunulan uç noktalar, request/response şemaları ve JWT kimlik doğrulama rehberi.</p>
            </div>
          </Link>

          <Link href="#" className="group bg-lunia-card border border-lunia-border p-6 rounded-2xl hover:border-lunia-accent transition-all flex items-start gap-4">
            <div className="p-3 bg-lunia-bg rounded-xl border border-lunia-border group-hover:bg-lunia-accent/10 group-hover:text-lunia-accent transition-colors">
              <Server size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-lunia-accent transition-colors">Sistem Mimarisi</h3>
              <p className="text-sm text-lunia-muted">Çift LLM motorunun çalışma mantığı, Supabase şemaları ve Pinecone Vektör veritabanı entegrasyonu.</p>
            </div>
          </Link>

          <Link href="https://github.com/turanakcann/luniaai" className="group bg-lunia-card border border-lunia-border p-6 rounded-2xl hover:border-lunia-accent transition-all flex items-start gap-4 md:col-span-2">
            <div className="p-3 bg-lunia-bg rounded-xl border border-lunia-border group-hover:bg-lunia-accent/10 group-hover:text-lunia-accent transition-colors">
              <GitCommit size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-lunia-accent transition-colors">GitHub Repository</h3>
              <p className="text-sm text-lunia-muted">Açık kaynak bileşenleri inceleyin, pull request gönderin veya projeyi yerel ortamınızda ayağa kaldırmak için Docker-Compose talimatlarını okuyun.</p>
            </div>
          </Link>

        </div>
      </div>
    </main>
  );
}