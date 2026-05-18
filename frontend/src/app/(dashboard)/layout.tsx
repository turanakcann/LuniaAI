"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import api from "@/src/lib/api"; // Görece yol kullanıyorsan: "../../../../lib/api"
import { MessageSquare, Plus, Menu, X, LogOut, Settings, Trash2, Edit2, Download, AlertTriangle, User } from "lucide-react";

// Gelecek backend verileri için tip tanımlamaları
type ChatSession = {
  id: string;
  title: string;
  updated_at: string;
};

type UserProfile = {
  full_name: string;
  email: string;
  role_level: number;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Dinamik verileri tutacağımız state'ler
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const router = useRouter();

  // Bileşen yüklendiğinde kullanıcının kendi verilerini çekiyoruz
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Not: Backend'de bu rotaları birazdan yazacağız/düzenleyeceğiz
        // Promise.all ile iki isteği aynı anda paralel atıyoruz
        const [userRes, sessionsRes] = await Promise.all([
          api.get("/users/me"), // Kimlik kartına (Token) göre kullanıcı bilgilerini getir
          api.get("/chat/sessions") // Sadece bu kullanıcıya ait geçmiş sohbetleri getir
        ]);

        setCurrentUser(userRes.data);
        setChatSessions(sessionsRes.data);
      } catch (error) {
        console.error("Veri senkronizasyon hatası:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-lunia-bg text-lunia-text font-sans overflow-hidden">
      
      {/* SOL PANEL (SIDEBAR) */}
      <aside className={`${isSidebarOpen ? "w-72" : "w-0 -translate-x-full"} transition-all duration-300 ease-in-out shrink-0 bg-lunia-sidebar border-r border-lunia-border flex flex-col justify-between absolute md:relative z-20 h-full`}>
        <div className="p-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-xl font-bold tracking-wider text-lunia-text">Lunia.ai</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-lunia-muted hover:text-white">
              <X size={20} />
            </button>
          </div>

          <button onClick={() => router.push("/chat")} className="w-full flex items-center justify-center gap-2 bg-lunia-accent/10 border border-lunia-accent/30 hover:border-lunia-accent hover:bg-lunia-accent/20 text-lunia-accent py-2.5 rounded-xl transition-all mb-6 group font-medium shrink-0">
            <Plus size={18} className="group-hover:scale-110 transition-transform" />
            <span>Yeni Sohbet</span>
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <p className="text-xs text-lunia-muted font-semibold mb-3 px-2 uppercase tracking-wider">Geçmiş Sohbetler</p>
            
            <div className="space-y-1">
              {loadingData ? (
                <div className="px-3 text-sm text-lunia-muted animate-pulse">Kayıtlar aranıyor...</div>
              ) : chatSessions.length === 0 ? (
                <div className="px-3 text-sm text-lunia-muted opacity-50">Henüz bir sohbet geçmişi yok.</div>
              ) : (
                chatSessions.map((session) => (
                  <div key={session.id} className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-lunia-border/50 cursor-pointer text-sm text-lunia-muted hover:text-lunia-text transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare size={16} className="shrink-0" />
                      <span className="truncate">{session.title}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button className="p-1 hover:text-lunia-accent transition-colors"><Edit2 size={14} /></button>
                      <button className="p-1 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ALT MENÜ */}
        <div className="p-4 border-t border-lunia-border space-y-1 bg-lunia-sidebar shrink-0">
          
          {/* Dinamik Kullanıcı Bilgisi */}
          {!loadingData && currentUser && (
            <div className="mb-3 px-3 py-2 bg-[#111115] rounded-xl border border-lunia-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-lunia-accent/20 flex items-center justify-center text-lunia-accent font-bold">
                {currentUser.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-lunia-text truncate">{currentUser.full_name}</p>
                <p className="text-xs text-lunia-muted truncate">Seviye {currentUser.role_level} Yetki</p>
              </div>
            </div>
          )}

          <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl hover:bg-lunia-border/50 text-sm text-lunia-muted hover:text-lunia-text transition-all font-medium">
            <Settings size={18} />
            <span>Sistem Ayarları</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl hover:bg-red-900/10 hover:text-red-400 text-sm text-lunia-muted transition-all font-medium">
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* AYARLAR MODALI */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f13] border border-lunia-border w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-lunia-border pb-4">
              <h3 className="text-xl font-bold text-white">Sistem Ayarları</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-lunia-muted hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              
              {/* Hesap Bilgileri */}
              <div className="bg-[#18181b] p-4 rounded-xl border border-lunia-border">
                <p className="text-sm text-lunia-muted font-semibold mb-1">Hesap Sahibi</p>
                <p className="text-white font-medium">{currentUser?.full_name || "Yükleniyor..."}</p>
                <p className="text-xs text-lunia-muted">{currentUser?.email || "Yükleniyor..."}</p>
              </div>

              <div>
                <label className="text-sm text-lunia-muted font-semibold block mb-2">Tema Seçimi (Yakında)</label>
                <select disabled className="w-full bg-[#18181b] border border-lunia-border text-lunia-text rounded-lg px-3 py-2 opacity-50">
                  <option>Derin İndigo (Aktif)</option>
                  <option>Aydınlık Mod</option>
                </select>
              </div>

              <div className="pt-4 border-t border-lunia-border space-y-3">
                <p className="text-sm text-lunia-muted font-semibold mb-2">Veri Yönetimi</p>
                <button className="w-full flex items-center justify-between px-4 py-2.5 bg-[#18181b] border border-lunia-border hover:border-lunia-accent rounded-lg text-sm transition-colors text-lunia-text">
                  <span className="flex items-center gap-2"><Download size={16} /> Verilerimi Talep Et</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-2.5 bg-red-900/10 border border-red-900/30 hover:bg-red-900/20 text-red-400 rounded-lg text-sm transition-colors">
                  <span className="flex items-center gap-2"><AlertTriangle size={16} /> Tüm Verilerimi Sil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANA İÇERİK */}
      <main className="flex-1 flex flex-col relative w-full">
        <header className="p-4 absolute top-0 left-0 z-10">
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-lunia-sidebar/80 backdrop-blur border border-lunia-border rounded-xl text-lunia-muted hover:text-lunia-text transition-colors shadow-lg">
              <Menu size={20} />
            </button>
          )}
        </header>
        {children}
      </main>

    </div>
  );
}