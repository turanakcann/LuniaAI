"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import MetricsCharts from "@/components/admin/MetricsCharts";
import UserDataGrid from "@/components/admin/UserDataGrid";
import ActivityFeed from "@/components/admin/ActivityFeed";

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-lunia-bg text-lunia-text transition-colors duration-300">
      {/* Üst Bar */}
      <header className="border-b border-lunia-border bg-lunia-sidebar px-6 py-4 flex items-center gap-4 transition-colors duration-300">
        <button
          onClick={() => router.push("/chat")}
          className="p-2 rounded-xl text-lunia-muted hover:text-lunia-text hover:bg-lunia-border transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-lunia-accent" />
          <h1 className="text-lg font-bold tracking-wide">Admin Paneli</h1>
        </div>
      </header>

      {/* İçerik */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* Metrikler */}
        <section>
          <h2 className="text-sm font-semibold text-lunia-muted uppercase tracking-wider mb-4">
            Sistem Metrikleri
          </h2>
          <MetricsCharts />
        </section>

        {/* Kullanıcı Yönetimi */}
        <section>
          <h2 className="text-sm font-semibold text-lunia-muted uppercase tracking-wider mb-4">
            Erişim ve Yetki Yönetimi
          </h2>
          <UserDataGrid />
        </section>

        {/* Aktivite Akışı */}
        <section>
          <h2 className="text-sm font-semibold text-lunia-muted uppercase tracking-wider mb-4">
            Güvenlik Logları ve Aktivite Akışı
          </h2>
          <ActivityFeed />
        </section>

      </div>
    </div>
  );
}