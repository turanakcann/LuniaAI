"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/src/lib/api";
import { Send } from "lucide-react";
import MessageBubble from "@/components/chat/MessageBubble";
import ThinkingIndicator from "@/components/chat/ThinkingIndicator";

type Message = {
  role: "user" | "lunia";
  content: string;
};

function ChatScreenInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // URL'deki ?session= parametresini oku ve activeSessionId'ye ata
  useEffect(() => {
    const sessionId = searchParams.get("session");
    setActiveSessionId(sessionId);
  }, [searchParams]);

  // sessionId değiştiğinde mesajları yükle
  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    } else {
      // Yeni sohbet: mesajları temizle
      setMessages([]);
      setMessagesError(null);
    }
  }, [activeSessionId]);

  const fetchMessages = async (sessionId: string) => {
    setIsLoadingMessages(true);
    setMessagesError(null);
    try {
      const response = await api.get(`/chat/sessions/${sessionId}/messages`);
      const fetchedMessages: Message[] = (response.data || []).map((msg: any) => ({
        role: msg.role as "user" | "lunia",
        content: msg.content,
      }));
      setMessages(fetchedMessages);
    } catch (error: any) {
      console.error("Mesaj yükleme hatası:", error);
      setMessagesError("Mesajlar yüklenemedi. Lütfen tekrar deneyin.");
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post("/chat/", {
        message: userMessage,
        chat_history: "",
        ...(activeSessionId ? { session_id: activeSessionId } : {}),
      });

      // Yanıttan gelen session_id'yi state'e ata ve URL'yi güncelle
      if (response.data.session_id && response.data.session_id !== activeSessionId) {
        setActiveSessionId(response.data.session_id);
        router.push(`/chat?session=${response.data.session_id}`);
        // Sidebar'ı yeni oturumu gösterecek şekilde güncelle
        window.dispatchEvent(new Event("lunia:session-created"));
      }

      setMessages((prev) => [
        ...prev,
        { role: "lunia", content: response.data.reply },
      ]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "lunia",
          content:
            "Şu an bağlantımda ufak bir pürüz yaşıyorum, lütfen birazdan tekrar dene.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isChatEmpty = messages.length === 0 && !isLoadingMessages && !messagesError;

  return (
    <div className="flex-1 flex flex-col items-center relative h-full w-full">

      {/* Arka Plan Yıldız Efekti */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #1f1f22 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Mesaj Yükleme Skeleton */}
      {isLoadingMessages && (
        <div className="flex-1 w-full max-w-3xl px-4 py-8 z-10 mt-12 mb-24 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              {i % 2 !== 0 && (
                <div className="w-8 h-8 rounded-full bg-lunia-accent/10 mr-4 shrink-0 animate-pulse" />
              )}
              <div
                className={`h-12 rounded-2xl animate-pulse bg-lunia-border/40 ${
                  i % 2 === 0 ? "w-48" : "w-64"
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Hata Mesajı */}
      {messagesError && !isLoadingMessages && (
        <div className="flex-1 w-full max-w-3xl px-4 py-8 z-10 mt-12 mb-24 flex items-start">
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {messagesError}
          </div>
        </div>
      )}

      {/* Mesajların Aktığı Alan */}
      {!isLoadingMessages && !messagesError && !isChatEmpty && (
        <div className="flex-1 w-full max-w-3xl px-4 py-8 overflow-y-auto custom-scrollbar z-10 mt-12 mb-24">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} role={msg.role} content={msg.content} />
          ))}
          {isLoading && <ThinkingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Girdi Alanı */}
      <div
        className={`w-full max-w-3xl px-4 z-10 transition-all duration-500 ease-in-out ${
          isChatEmpty
            ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            : "absolute bottom-0 left-1/2 -translate-x-1/2 bg-gradient-to-t from-lunia-bg pb-6 pt-10"
        }`}
      >
        {isChatEmpty && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-lunia-text mb-2 tracking-tight">
              Nasıl hissediyorsun?
            </h1>
            <p className="text-lunia-muted text-sm">
              Zihnini kurcalayanları benimle paylaşabilirsin.
            </p>
          </div>
        )}

        <form
          onSubmit={sendMessage}
          className="relative flex items-center group"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isLoadingMessages}
            placeholder="Mesajını buraya yaz..."
            className="w-full bg-[#111115] border border-lunia-border text-lunia-text px-6 py-4 rounded-full focus:outline-none focus:border-lunia-accent focus:ring-1 focus:ring-lunia-accent transition-all shadow-lg shadow-black/50 disabled:opacity-50 pr-14"
          />
          <button
            type="submit"
            disabled={isLoading || isLoadingMessages || !input.trim()}
            className="absolute right-2 p-2 bg-lunia-accent hover:bg-lunia-accentHover text-white rounded-full transition-colors disabled:opacity-50 disabled:bg-lunia-border"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChatScreen() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lunia-muted animate-pulse text-sm">Yükleniyor...</div>
      </div>
    }>
      <ChatScreenInner />
    </Suspense>
  );
}
