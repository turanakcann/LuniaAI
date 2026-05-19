"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/api";
import { Ban, CheckCircle } from "lucide-react";

type UserData = {
  id: number;
  full_name: string | null;
  email: string;
  role_level: number;
  is_active: boolean;
  created_at: string;
};

export default function UserDataGrid() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Kullanıcılar çekilemedi", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Yetki Değiştirme Fonksiyonu
  const handleRoleUpdate = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      await api.post("/admin/update-role", {
        user_id: userId,
        new_role_level: parseInt(newRole, 10),
      });
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role_level: parseInt(newRole, 10) } : user))
      );
    } catch (error) {
      console.error("Yetki güncellenemedi:", error);
      alert("Yetki güncellenirken bir hata oluştu.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Kullanıcıyı Askıya Alma / Aktif Etme Fonksiyonu
  const handleToggleBan = async (userId: number, isActive: boolean) => {
    setUpdatingId(userId);
    try {
      const endpoint = isActive ? "/admin/ban-user" : "/admin/unban-user";
      await api.post(endpoint, { user_id: userId });
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, is_active: !isActive } : user))
      );
    } catch (error) {
      console.error("Durum güncellenemedi:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-lunia-muted">Kullanıcı verileri yükleniyor...</div>;
  }

  return (
    <div className="bg-lunia-card border border-lunia-border rounded-2xl overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-lunia-bg/50 border-b border-lunia-border transition-colors duration-300">
              <th className="p-4 text-xs font-semibold text-lunia-muted uppercase tracking-wider">Kullanıcı</th>
              <th className="p-4 text-xs font-semibold text-lunia-muted uppercase tracking-wider">Yetki Değiştir</th>
              <th className="p-4 text-xs font-semibold text-lunia-muted uppercase tracking-wider">Durum</th>
              <th className="p-4 text-xs font-semibold text-lunia-muted uppercase tracking-wider">Kayıt Tarihi</th>
              <th className="p-4 text-xs font-semibold text-lunia-muted uppercase tracking-wider text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lunia-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-lunia-bg/30 transition-colors duration-300">
                <td className="p-4">
                  <p className="text-sm font-medium text-lunia-text">{user.full_name || "İsimsiz Kullanıcı"}</p>
                  <p className="text-xs text-lunia-muted">{user.email}</p>
                </td>
                <td className="p-4">
                  <select
                    value={user.role_level}
                    disabled={updatingId === user.id}
                    onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                    className="bg-lunia-bg border border-lunia-border text-lunia-text text-xs rounded-lg px-2 py-1.5 outline-none focus:border-lunia-accent disabled:opacity-50 cursor-pointer transition-colors duration-300"
                  >
                    <option value="1">1 - Kullanıcı</option>
                    <option value="2">2 - Analist</option>
                    <option value="3">3 - Moderatör</option>
                    <option value="4">4 - Admin</option>
                    <option value="5">5 - SuperAdmin</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                    user.is_active 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}>
                    {user.is_active ? "Aktif" : "Askıda"}
                  </span>
                </td>
                <td className="p-4 text-sm text-lunia-muted">
                  {new Date(user.created_at).toLocaleDateString("tr-TR")}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleToggleBan(user.id, user.is_active)}
                    disabled={updatingId === user.id || user.role_level === 5} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ml-auto transition-colors disabled:opacity-50 ${
                      user.is_active 
                        ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" 
                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                    }`}
                  >
                    {user.is_active ? <Ban size={14} /> : <CheckCircle size={14} />}
                    {user.is_active ? "Askıya Al" : "Aktif Et"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}