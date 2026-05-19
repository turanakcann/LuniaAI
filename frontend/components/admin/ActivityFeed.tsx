"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/src/lib/api";

type ActivityEvent = {
  timestamp: string;
  level: string;
  event: string;
  user: string | null;
};

function getLevelColor(level: string): string {
  switch (level.toUpperCase()) {
    case "ERROR": return "text-red-400";
    case "WARNING": return "text-yellow-400";
    case "INFO": return "text-green-400";
    default: return "text-lunia-muted";
  }
}

function getLevelBg(level: string): string {
  switch (level.toUpperCase()) {
    case "ERROR": return "bg-red-900/10 border-red-900/30";
    case "WARNING": return "bg-yellow-900/10 border-yellow-900/30";
    case "INFO": return "bg-green-900/10 border-green-900/30";
    default: return "bg-lunia-border/20 border-lunia-border";
  }
}

export default function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFeed = async () => {
    try {
      const res = await api.get("/admin/activity-feed");
      setEvents(res.data);
      setError(null);
    } catch {
      setError("Aktivite akışı yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    // 30 saniyede bir otomatik yenile
    intervalRef.current = setInterval(fetchFeed, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-lunia-muted animate-pulse text-sm">
        Aktivite akışı yükleniyor...
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-lunia-border">
        <p className="text-sm text-lunia-muted font-semibold">Son 100 Sistem Olayı</p>
        <span className="flex items-center gap-1.5 text-xs text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Canlı (30s)
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-lunia-border/30">
        {events.length === 0 ? (
          <div className="text-center py-8 text-lunia-muted text-sm">
            Henüz kayıtlı olay yok.
          </div>
        ) : (
          events.map((event, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 px-4 py-3 border-l-2 ${getLevelBg(event.level)}`}
            >
              <span className={`text-xs font-mono font-bold shrink-0 ${getLevelColor(event.level)}`}>
                {event.level.toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-lunia-text truncate">{event.event}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-lunia-muted font-mono">{event.timestamp}</span>
                  {event.user && (
                    <span className="text-xs text-lunia-accent truncate">{event.user}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
