"use client";

import { Sparkles } from "lucide-react";

export default function ThinkingIndicator() {
  return (
    <div className="mb-8 flex justify-start">
      <div className="w-8 h-8 rounded-full bg-lunia-accent/10 flex items-center justify-center mr-4 shrink-0 border border-lunia-accent/20">
        <Sparkles size={16} className="text-lunia-accent animate-pulse" />
      </div>
      <div className="p-4 flex items-center gap-1 text-lunia-muted text-sm">
        <span>Lunia düşünüyor</span>
        <span className="inline-flex items-end gap-[3px] ml-1">
          <span
            className="w-1 h-1 rounded-full bg-lunia-muted animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1 h-1 rounded-full bg-lunia-muted animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1 h-1 rounded-full bg-lunia-muted animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </span>
      </div>
    </div>
  );
}
