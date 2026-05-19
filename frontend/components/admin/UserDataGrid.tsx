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

function getRoleLabel(level: number): string {
  switch (level) {
    case 1: return "Kullanıcı";
    case 2: return "Analist";
    case 3: return "Moderatör";
    case 4: return "Admin";
    case 5: return "SuperAdmin";
    default: return "Bilinmiyor";
  }
}

export default function UserDataGrid() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    api.get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch(() => setError("Kullanıcı listesi yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="bg-lunia-sidebar border border-lunia-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-lunia-border text-lunia-muted text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">Kullanıcı</th>
              <th className="text-left px-4 py-3">Yetki</th>
              <th className="text-left px-4 py-3">Durum</th>
              <th className="text-left px-4 py-3">Kayıt Tarihi</th>
              <th className="text-right px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-lunia-border/50 hover:bg-lunia-border/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-lunia-text">{user.full_name ?? "İsimsiz"}</p>
                  <p className="text-lunia-muted text-xs">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-lunia-accent/10 text-lunia-accent border border-lunia-accent/20">
                    {getRoleLabel(user.role_level)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active
                        ? "bg-green-900/20 text-green-400 border border-green-900/30"
                        : "bg-red-900/20 text-red-400 border border-red-900/30"
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
                    disabled={processingId === user.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                      user.is_active
                        ? "bg-red-900/10 border border-red-900/30 text-red-400 hover:bg-red-900/20"
                        : "bg-green-900/10 border border-green-900/30 text-green-400 hover:bg-green-900/20"
                    }`}
                  >
                    {processingId === user.id ? (
                      <span className="block w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : user.is_active ? (
                      <><ShieldOff size={13} /> Askıya Al</>
                    ) : (
                      <><ShieldCheck size={13} /> Aktif Et</>
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
