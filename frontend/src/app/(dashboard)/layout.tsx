"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import api from "@/src/lib/api"; // Görece yol kullanıyorsan: "../../../../lib/api"
import { MessageSquare, Plus, Menu, X, LogOut, Settings, Trash2, Edit2, Download, AlertTriangle } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";

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

// role_level sayısal değerini okunabilir etikete çevirir
function getRoleLabel(roleLevel: number): string {
  switch (roleLevel) {
    case 1: return "Kullanıcı";
    case 2: return "Analist";
    case 3: return "Moderatör";
    case 4: return "Admin";
    case 5: return "SuperAdmin";
    default: return "Bilinmiyor";
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Dinamik verileri tutacağımız state'ler
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  // sessionRefreshKey artırıldığında useEffect sessions'ı yeniden çeker
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);

  // Modal için bağımsız state'ler
  const [modalUser, setModalUser] = useState<UserProfile | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Veri dışa aktarma state'leri
  const [exportFormat, setExportFormat] = useState<"json" | "txt">("json");
  const [isExporting, setIsExporting] = useState(false);

  // Hesap silme state'leri
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const router = useRouter();

  // Bileşen yüklendiğinde kullanıcının kendi verilerini çekiyoruz
  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingData(true);
      setSessionsError(null);

      // Kullanıcı bilgisini çek
      try {
        const userRes = await api.get("/auth/me");
        setCurrentUser(userRes.data);
      } catch (error) {
        console.error("Kullanıcı bilgisi alınamadı:", error);
      }

      // Sohbet oturumlarını çek (hata ayrı yönetilir)
      try {
        const sessionsRes = await api.get("/chat/sessions");
        setChatSessions(sessionsRes.data);
      } catch (error) {
        console.error("Sohbet geçmişi yükleme hatası:", error);
        setSessionsError("Sohbet geçmişi yüklenemedi");
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, [sessionRefreshKey]);

  // Yeni oturum oluşturulduğunda sidebar'ı yenilemek için window event dinle
  useEffect(() => {
    const handleSessionCreated = () => {
      setSessionRefreshKey((prev) => prev + 1);
    };
    window.addEventListener("lunia:session-created", handleSessionCreated);
    return () => {
      window.removeEventListener("lunia:session-created", handleSessionCreated);
    };
  }, []);

  // Modal açıldığında taze kullanıcı verisi çek; kapandığında state'leri sıfırla
  useEffect(() => {
    if (isSettingsOpen) {
      const fetchModalUser = async () => {
        setIsModalLoading(true);
        setModalError(null);
        setModalUser(null);
        try {
          const res = await api.get("/auth/me");
          setModalUser(res.data);
        } catch (error) {
          console.error("Modal kullanıcı bilgisi alınamadı:", error);
          setModalError("Hesap bilgileri yüklenemedi");
        } finally {
          setIsModalLoading(false);
        }
      };
      fetchModalUser();
    } else {
      // Modal kapandığında state'leri sıfırla
      setModalUser(null);
      setIsModalLoading(false);
      setModalError(null);
    }
  }, [isSettingsOpen]);

  // Oturum silme handler'ı
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Oturum seçme handler'ının tetiklenmesini engelle
    if (deletingSessionId) return; // Zaten silme işlemi varsa bekle

    setDeletingSessionId(sessionId);
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      // Listeden kaldır
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));

      // Silinen oturum aktif oturumsa boş sohbet ekranına yönlendir
      const currentUrl = window.location.search;
      const params = new URLSearchParams(currentUrl);
      if (params.get("session") === sessionId) {
        router.push("/chat");
      }
    } catch (error) {
      console.error("Oturum silme hatası:", error);
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    window.location.href = "/login";
  };

  // Veri dışa aktarma handler'ı
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.get(`/chat/export?format=${exportFormat}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportFormat === "json" ? "lunia-export.json" : "lunia-export.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Dışa aktarma hatası:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Hesap silme handler'ı
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.delete("/auth/account", { data: { password: deletePassword } });
      Cookies.remove("token");
      router.push("/login");
    } catch {
      setDeleteError("Şifre hatalı veya bir hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Sidebar'ı yenilemek için dışarıdan çağrılabilir fonksiyon (window event ile)
  const refreshSessions = () => {
    setSessionRefreshKey((prev) => prev + 1);
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
              ) : sessionsError ? (
                <div className="px-3 text-sm text-red-400 opacity-80">{sessionsError}</div>
              ) : chatSessions.length === 0 ? (
                <div className="px-3 text-sm text-lunia-muted opacity-50">Henüz bir sohbet geçmişi yok.</div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => router.push(`/chat?session=${session.id}`)}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-lunia-border/50 cursor-pointer text-sm text-lunia-muted hover:text-lunia-text transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare size={16} className="shrink-0" />
                      <span className="truncate">{session.title}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button className="p-1 hover:text-lunia-accent transition-colors"><Edit2 size={14} /></button>
                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        disabled={deletingSessionId === session.id}
                        className="p-1 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        {deletingSessionId === session.id ? (
                          <span className="block w-3.5 h-3.5 border-2 border-red-400/50 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
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
                <p className="text-sm text-lunia-muted font-semibold mb-3">Hesap Bilgileri</p>
                
                {/* Yükleme durumu */}
                {isModalLoading && (
                  <div className="flex items-center justify-center py-4">
                    <span className="block w-6 h-6 border-2 border-lunia-accent/30 border-t-lunia-accent rounded-full animate-spin" />
                  </div>
                )}

                {/* Hata durumu */}
                {!isModalLoading && modalError && (
                  <p className="text-sm text-red-400">{modalError}</p>
                )}

                {/* Başarılı yükleme */}
                {!isModalLoading && !modalError && modalUser && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-lunia-muted">İsim</p>
                      <p className="text-white font-medium">{modalUser.full_name || "İsimsiz Kullanıcı"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-lunia-muted">E-posta</p>
                      <p className="text-white font-medium">{modalUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-lunia-muted">Yetki Seviyesi</p>
                      <p className="text-white font-medium">{getRoleLabel(modalUser.role_level)}</p>
                    </div>
                  </div>
                )}
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-between px-4 py-2.5 bg-[#18181b] border border-lunia-border hover:border-lunia-accent rounded-lg text-sm transition-colors text-lunia-text disabled:opacity-50 disabled:cursor-not-allowed"
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
                          : "bg-[#18181b] border-lunia-border text-lunia-muted hover:border-lunia-accent"
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => setExportFormat("txt")}
                      className={`px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        exportFormat === "txt"
                          ? "bg-lunia-accent/20 border-lunia-accent text-lunia-accent"
                          : "bg-[#18181b] border-lunia-border text-lunia-muted hover:border-lunia-accent"
                      }`}
                    >
                      TXT
                    </button>
                  </div>
                </div>
                <button className="w-full flex items-center justify-between px-4 py-2.5 bg-red-900/10 border border-red-900/30 hover:bg-red-900/20 text-red-400 rounded-lg text-sm transition-colors" onClick={() => setIsDeleteModalOpen(true)}>
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
          <div className="bg-[#0f0f13] border border-red-900/40 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-900/20 flex items-center justify-center mb-4">
                <AlertTriangle size={28} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hesabı Kalıcı Olarak Sil</h3>
              <p className="text-sm text-red-400 font-semibold mb-1">Bu işlem geri alınamaz.</p>
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
                  className="w-full bg-[#18181b] border border-lunia-border focus:border-red-500 text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              {deleteError && (
                <p className="text-sm text-red-400">{deleteError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeletePassword("");
                    setDeleteError(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-[#18181b] border border-lunia-border hover:border-lunia-accent text-lunia-muted hover:text-lunia-text rounded-lg text-sm transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || !deletePassword}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
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

      {/* ANA İÇERİK */}
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