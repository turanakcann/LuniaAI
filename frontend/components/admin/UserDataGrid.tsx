"use client";

import { useEffect, useState } from "react";
import { ShieldOff, ShieldCheck } from "lucide-react";
import api from "@/src/lib/api";

type AdminUser = {
  id: number;
  email: string;
  full_name: string | null;
  role_level: number;
  is_active: boolean;
  created_at: string;
};

export default function UserDataGrid() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ban/Unban işlemi için state
  const [processingId, setProcessingId] = useState<number | null>(null);
  // Yetki değiştirme işlemi için ayrı bir state (İki işlem çakışmasın diye)
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

  useEffect(() => {
    api.get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch(() => setError("Kullanıcı listesi yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  // --- YETKİ GÜNCELLEME FONKSİYONU (YENİ EKLENDİ) ---
  const handleRoleChange = async (user: AdminUser, newRoleStr: string) => {
    const newRole = parseInt(newRoleStr, 10);
    // Aynı yetki seçildiyse boşuna istek atma
    if (user.role_level === newRole) return;

    setUpdatingRoleId(user.id);
    try {
      await api.post("/admin/update-role", {
        user_id: user.id,
        new_role_level: newRole,
      });
      
      // İşlem başarılıysa ekrandaki veriyi anında güncelle
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role_level: newRole } : u))
      );
    } catch (e) {
      console.error("Yetki güncelleme hatası:", e);
      alert("Yetki güncellenirken bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // --- BAN / UNBAN FONKSİYONU ---
  const handleToggleBan = async (user: AdminUser) => {
    if (processingId !== null) return;
    setProcessingId(user.id);
    try {
      const endpoint = user.is_active ? "/admin/ban-user" : "/admin/unban-user";
      await api.post(endpoint, { user_id: user.id });
      setUsers((prev) =>
        prev.map((u) => u.id === user.id ? { ...u, is_active: !u.is_active } : u)
      );
    } catch (e) {
      console.error("Ban/unban hatası:", e);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-lunia-muted animate-pulse text-sm">
        Kullanıcılar yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-lunia-sidebar border border-lunia-border rounded-xl overflow-hidden shadow-lg transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-lunia-bg/50 border-b border-lunia-border text-lunia-muted text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-4 font-semibold">Kullanıcı</th>
              <th className="text-left px-4 py-4 font-semibold">Yetki Düzenle</th>
              <th className="text-left px-4 py-4 font-semibold">Durum</th>
              <th className="text-left px-4 py-4 font-semibold">Kayıt Tarihi</th>
              <th className="text-right px-4 py-4 font-semibold">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-lunia-border/50 hover:bg-lunia-bg/30 transition-colors duration-300"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-lunia-text">{user.full_name ?? "İsimsiz Kullanıcı"}</p>
                  <p className="text-lunia-muted text-xs">{user.email}</p>
                </td>
                
                {/* YENİ: DİNAMİK SELECT HTML NESNESİ */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role_level}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      disabled={updatingRoleId === user.id}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border outline-none cursor-pointer disabled:opacity-50 transition-colors duration-300 ${
                        user.role_level === 5 
                          ? "bg-red-500/10 text-red-500 border-red-500/20 focus:border-red-500" 
                          : user.role_level >= 3
                          ? "bg-purple-500/10 text-purple-500 border-purple-500/20 focus:border-purple-500"
                          : "bg-lunia-accent/10 text-lunia-accent border-lunia-accent/20 focus:border-lunia-accent"
                      }`}
                    >
                      <option value="1" className="bg-lunia-bg text-lunia-text">1 - Kullanıcı</option>
                      <option value="2" className="bg-lunia-bg text-lunia-text">2 - Analist</option>
                      <option value="3" className="bg-lunia-bg text-lunia-text">3 - Moderatör</option>
                      <option value="4" className="bg-lunia-bg text-lunia-text">4 - Admin</option>
                      <option value="5" className="bg-lunia-bg text-lunia-text">5 - SuperAdmin</option>
                    </select>
                    
                    {/* Yükleme animasyonu */}
                    {updatingRoleId === user.id && (
                      <span className="block w-4 h-4 border-2 border-lunia-accent/30 border-t-lunia-accent rounded-full animate-spin" />
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      user.is_active
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}
                  >
                    {user.is_active ? "Aktif" : "Askıda"}
                  </span>
                </td>
                
                <td className="px-4 py-3 text-lunia-muted text-xs">
                  {new Date(user.created_at).toLocaleDateString("tr-TR")}
                </td>
                
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleToggleBan(user)}
                    disabled={processingId === user.id || user.role_level === 5} // SuperAdmin askıya alınamaz
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                      user.is_active
                        ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                    }`}
                  >
                    {processingId === user.id ? (
                      <span className="block w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : user.is_active ? (
                      <><ShieldOff size={14} /> Askıya Al</>
                    ) : (
                      <><ShieldCheck size={14} /> Aktif Et</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-8 text-lunia-muted text-sm">
            Kayıtlı kullanıcı bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}