"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import api from "@/src/lib/api";

type Metrics = {
  daily_active_users: number;
  total_messages: number;
  error_rate: number;
};

// Grafik için sahte geçmiş verisi (bugünkü değerle birlikte)
function buildChartData(metrics: Metrics) {
  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Bugün"];
  return days.map((day, i) => ({
    day,
    active_users: i === 6 ? metrics.daily_active_users : Math.max(0, metrics.daily_active_users - Math.floor(Math.random() * 5)),
    messages: i === 6 ? metrics.total_messages : Math.max(0, metrics.total_messages - Math.floor(Math.random() * 20) * (6 - i)),
  }));
}

export default function MetricsCharts() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/metrics")
      .then((res) => setMetrics(res.data))
      .catch(() => setError("Metrikler yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-lunia-muted animate-pulse text-sm">
        Metrikler yükleniyor...
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
        {error ?? "Metrikler yüklenemedi"}
      </div>
    );
  }

  const chartData = buildChartData(metrics);

  return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-lunia-sidebar border border-lunia-border rounded-xl p-4">
          <p className="text-xs text-lunia-muted mb-1">Günlük Aktif Kullanıcı</p>
          <p className="text-2xl font-bold text-lunia-accent">{metrics.daily_active_users}</p>
        </div>
        <div className="bg-lunia-sidebar border border-lunia-border rounded-xl p-4">
          <p className="text-xs text-lunia-muted mb-1">Toplam Mesaj</p>
          <p className="text-2xl font-bold text-lunia-text">{metrics.total_messages}</p>
        </div>
        <div className="bg-lunia-sidebar border border-lunia-border rounded-xl p-4">
          <p className="text-xs text-lunia-muted mb-1">Hata Oranı</p>
          <p className="text-2xl font-bold text-green-400">{(metrics.error_rate * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Aktif Kullanıcı Grafiği */}
      <div className="bg-lunia-sidebar border border-lunia-border rounded-xl p-4">
        <p className="text-sm text-lunia-muted font-semibold mb-4">Günlük Aktif Kullanıcı</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f22" />
            <XAxis dataKey="day" tick={{ fill: "#8b8b93", fontSize: 11 }} />
            <YAxis tick={{ fill: "#8b8b93", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#0d0d0f", border: "1px solid #1f1f22", borderRadius: 8 }}
              labelStyle={{ color: "#e4e4e7" }}
              itemStyle={{ color: "#818cf8" }}
            />
            <Line type="monotone" dataKey="active_users" stroke="#818cf8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mesaj Sayısı Grafiği */}
      <div className="bg-lunia-sidebar border border-lunia-border rounded-xl p-4">
        <p className="text-sm text-lunia-muted font-semibold mb-4">Toplam Mesaj Sayısı</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f22" />
            <XAxis dataKey="day" tick={{ fill: "#8b8b93", fontSize: 11 }} />
            <YAxis tick={{ fill: "#8b8b93", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#0d0d0f", border: "1px solid #1f1f22", borderRadius: 8 }}
              labelStyle={{ color: "#e4e4e7" }}
              itemStyle={{ color: "#6366f1" }}
            />
            <Bar dataKey="messages" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
