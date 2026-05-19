"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "lunia";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="mb-8 flex justify-end">
        <div className="p-4 max-w-[80%] rounded-2xl rounded-tr-sm text-sm leading-relaxed bg-[#1e1e24] text-lunia-text">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 flex justify-start">
      <div className="w-8 h-8 rounded-full bg-lunia-accent/10 flex items-center justify-center mr-4 shrink-0 border border-lunia-accent/20">
        <Sparkles size={16} className="text-lunia-accent" />
      </div>
      <div className="p-4 max-w-[80%] rounded-2xl text-sm leading-relaxed bg-transparent text-lunia-text">
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
