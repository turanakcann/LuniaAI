"use client";

import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import api from "@/src/lib/api"; 
import { MessageSquare, Plus, Menu, X, LogOut, Settings, Trash2, Edit2, Download, AlertTriangle, Check } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";

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
  
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);

  // === DÜZENLEME STATE'LERİ ===
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [modalUser, setModalUser] = useState<UserProfile | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [exportFormat, setExportFormat] = useState<"json" | "txt">("json");
  const [isExporting, setIsExporting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [theme, setTheme] = useState("zen");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingData(true);
      setSessionsError(null);
      try {
        const userRes = await api.get("/auth/me");
        setCurrentUser(userRes.data);
      } catch (error) { console.error(error); }
      try {
        const sessionsRes = await api.get("/chat/sessions");
        setChatSessions(sessionsRes.data);
      } catch (error) { setSessionsError("Sohbet geçmişi yüklenemedi"); } 
      finally { setLoadingData(false); }
    };
    fetchUserData();
  }, [sessionRefreshKey]);

  useEffect(() => {
    const handleSessionCreated = () => setSessionRefreshKey((prev) => prev + 1);
    window.addEventListener("lunia:session-created", handleSessionCreated);
    return () => window.removeEventListener("lunia:session-created", handleSessionCreated);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("lunia-theme") || "zen";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    if (isSettingsOpen) {
      const fetchModalUser = async () => {
        setIsModalLoading(true);
        try {
          const res = await api.get("/auth/me");
          setModalUser(res.data);
        } catch (error) { setModalError("Hesap bilgileri yüklenemedi"); } 
        finally { setIsModalLoading(false); }
      };
      fetchModalUser();
    } else {
      setModalUser(null);
      setIsModalLoading(false);
      setModalError(null);
    }
  }, [isSettingsOpen]);

  useEffect(() => {
    if (editingSessionId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingSessionId]);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    localStorage.setItem("lunia-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (deletingSessionId) return;
    setDeletingSessionId(sessionId);
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
      const currentUrl = window.location.search;
      if (new URLSearchParams(currentUrl).get("session") === sessionId) {
        router.push("/chat");
      }
    } catch (error) { console.error(error); } 
    finally { setDeletingSessionId(null); }
  };

  const handleLogout = () => { Cookies.remove("token"); window.location.href = "/login"; };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await api.get(`/chat/export?format=${exportFormat}`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url; a.download = `lunia-export.${exportFormat}`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (error) { console.error(error); } 
    finally { setIsExporting(false); }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete("/auth/account", { data: { password: deletePassword } });
      Cookies.remove("token"); router.push("/login");
    } catch { setDeleteError("Şifre hatalı."); } 
    finally { setIsDeleting(false); }
  };

  const startEditing = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleValue(session.title);
  };

  const saveRename = async (sessionId: string) => {
    if (!editTitleValue.trim()) {
      setEditingSessionId(null);
      return;
    }
    
    try {
      await api.put(`/chat/sessions/${sessionId}`, { title: editTitleValue });
      setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: editTitleValue } : s));
    } catch (error) {
      console.error("Yeniden adlandırma hatası", error);
    }
    setEditingSessionId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, sessionId: string) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setEditingSessionId(null);
    }
  };

  return (
    <div className="flex h-screen bg-lunia-bg text-lunia-text font-sans overflow-hidden">
      
      <aside className={`${isSidebarOpen ? "w-72" : "w-0 -translate-x-full"} transition-all duration-300 ease-in-out shrink-0 bg-lunia-sidebar border-r border-lunia-border flex flex-col justify-between absolute md:relative z-20 h-full`}>
        <div className="p-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <button onClick={() => window.location.href = "/chat"} className="text-xl font-bold tracking-wider text-lunia-text hover:text-lunia-accent transition-colors">
              Lunia.ai
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-lunia-muted hover:text-white"><X size={20} /></button>
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
              ) : sessionsError ? (
                <div className="px-3 text-sm text-red-400 opacity-80">{sessionsError}</div>
              ) : chatSessions.length === 0 ? (
                <div className="px-3 text-sm text-lunia-muted opacity-50">Henüz bir sohbet geçmişi yok.</div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      if (editingSessionId !== session.id) {
                        router.push(`/chat?session=${session.id}`);
                      }
                    }}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all ${
                      editingSessionId === session.id 
                        ? "bg-lunia-border/50 text-lunia-text" 
                        : "text-lunia-muted hover:text-lunia-text hover:bg-lunia-border/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <MessageSquare size={16} className="shrink-0" />
                      
                      {editingSessionId === session.id ? (
                        <input
                          ref={inputRef}
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          onBlur={() => saveRename(session.id)}
                          onKeyDown={(e) => handleKeyDown(e, session.id)}
                          className="flex-1 bg-transparent border-b border-lunia-accent outline-none text-lunia-text w-full mr-2 font-medium"
                        />
                      ) : (
                        <span className="truncate">{session.title}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {editingSessionId === session.id ? (
                        <button onClick={(e) => { e.stopPropagation(); saveRename(session.id); }} className="p-1 text-emerald-500 hover:text-emerald-400">
                          <Check size={14} />
                        </button>
                      ) : (
                        <button onClick={(e) => startEditing(e, session)} className="p-1 hover:text-lunia-accent transition-colors">
                          <Edit2 size={14} />
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        disabled={deletingSessionId === session.id}
                        className="p-1 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        {deletingSessionId === session.id ? <span className="block w-3.5 h-3.5 border-2 border-red-400/50 border-t-red-400 rounded-full animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* ALT MENÜ */}
        <div className="p-4 border-t border-lunia-border space-y-3 bg-lunia-sidebar shrink-0">
          {!loadingData && currentUser && (
            <div className="px-3 py-2 bg-lunia-card rounded-xl border border-lunia-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-lunia-accent/20 flex items-center justify-center text-lunia-accent font-bold shrink-0">
                {currentUser.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-lunia-text truncate">{currentUser.full_name}</p>
                <p className="text-xs text-lunia-muted truncate">{currentUser.email}</p>
              </div>
            </div>
          )}

          {/* BUTONLAR YAN YANA GETİRİLDİ */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              className="flex-1 flex items-center justify-center gap-2 px-2 py-2.5 rounded-xl hover:bg-lunia-border/50 text-xs text-lunia-muted hover:text-lunia-text transition-all font-medium"
            >
              <Settings size={16} />
              <span>Ayarlar</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="flex-1 flex items-center justify-center gap-2 px-2 py-2.5 rounded-xl hover:bg-red-900/10 hover:text-red-400 text-xs text-lunia-muted transition-all font-medium"
            >
              <LogOut size={16} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>

      {/* AYARLAR MODALI */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lunia-card border border-lunia-border w-full max-w-md rounded-2xl p-6 shadow-2xl transition-colors duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-lunia-border pb-4">
              <h3 className="text-xl font-bold text-lunia-text">Sistem Ayarları</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-lunia-muted hover:text-lunia-text transition-colors"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-lunia-bg p-4 rounded-xl border border-lunia-border transition-colors duration-300">
                <p className="text-sm text-lunia-muted font-semibold mb-3">Hesap Bilgileri</p>
                {isModalLoading && (
                  <div className="flex items-center justify-center py-4">
                    <span className="block w-6 h-6 border-2 border-lunia-accent/30 border-t-lunia-accent rounded-full animate-spin" />
                  </div>
                )}
                {!isModalLoading && modalError && (
                  <p className="text-sm text-red-500">{modalError}</p>
                )}
                {!isModalLoading && !modalError && modalUser && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-lunia-muted">İsim</p>
                      <p className="text-lunia-text font-medium">{modalUser.full_name || "İsimsiz Kullanıcı"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-lunia-muted">E-posta</p>
                      <p className="text-lunia-text font-medium">{modalUser.email}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-lunia-muted font-semibold block mb-2">Tema Seçimi</label>
                <select 
                  value={theme}
                  onChange={handleThemeChange}
                  className="w-full bg-lunia-bg border border-lunia-border text-lunia-text rounded-lg px-3 py-2 outline-none focus:border-lunia-accent transition-colors duration-300"
                >
                  <option value="dark">🌙 Dark (Karanlık)</option>
                  <option value="light">☀️ Light (Aydınlık)</option>
                  <option value="natural">🌿 Natural (Doğal)</option>
                  <option value="soft">☕ Soft (Yumuşak Krem)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-lunia-border space-y-3">
                <p className="text-sm text-lunia-muted font-semibold mb-2">Veri Yönetimi</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-between px-4 py-2.5 bg-lunia-bg border border-lunia-border hover:border-lunia-accent rounded-lg text-sm transition-colors text-lunia-text disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2">
                      {isExporting ? (
                        <span className="block w-4 h-4 border-2 border-lunia-accent/30 border-t-lunia-accent rounded-full animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                      {isExporting ? "İndiriliyor..." : "Verilerimi İndir"}
                    </span>
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setExportFormat("json")}
                      className={`px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        exportFormat === "json"
                          ? "bg-lunia-accent/20 border-lunia-accent text-lunia-accent"
                          : "bg-lunia-bg border-lunia-border text-lunia-muted hover:border-lunia-accent"
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => setExportFormat("txt")}
                      className={`px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        exportFormat === "txt"
                          ? "bg-lunia-accent/20 border-lunia-accent text-lunia-accent"
                          : "bg-lunia-bg border-lunia-border text-lunia-muted hover:border-lunia-accent"
                      }`}
                    >
                      TXT
                    </button>
                  </div>
                </div>
                <button className="w-full flex items-center justify-between px-4 py-2.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 rounded-lg text-sm transition-colors" onClick={() => setIsDeleteModalOpen(true)}>
                  <span className="flex items-center gap-2"><AlertTriangle size={16} /> Tüm Verilerimi Sil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HESAP SİLME ONAY MODALI */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lunia-card border border-red-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl transition-colors duration-300">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-lunia-text mb-2">Hesabı Kalıcı Olarak Sil</h3>
              <p className="text-sm text-red-500 font-semibold mb-1">Bu işlem geri alınamaz.</p>
              <p className="text-sm text-lunia-muted">
                Tüm sohbet geçmişiniz ve hesap bilgileriniz kalıcı olarak silinecektir.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-lunia-muted block mb-1.5">Onaylamak için şifrenizi girin</label>
                <input
                  type="password"
                  placeholder="Şifrenizi girin"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full bg-lunia-bg border border-lunia-border focus:border-red-500 text-lunia-text rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              {deleteError && (
                <p className="text-sm text-red-500">{deleteError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeletePassword("");
                    setDeleteError(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-lunia-bg border border-lunia-border hover:border-lunia-accent text-lunia-muted hover:text-lunia-text rounded-lg text-sm transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || !deletePassword}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-[#ffffff] rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Siliniyor...
                    </>
                  ) : (
                    "Hesabı Sil"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col relative w-full">
        <header className="p-4 absolute top-0 left-0 z-10">
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-lunia-sidebar/80 backdrop-blur border border-lunia-border rounded-xl text-lunia-muted hover:text-lunia-text transition-colors shadow-lg">
              <Menu size={20} />
            </button>
          )}
        </header>
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

    </div>
  );
}