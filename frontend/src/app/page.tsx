"use client"; // Bu bir İstemci Bileşenidir {Client Component}

import { useState, useRef, useEffect } from "react";

// Mesaj yapımızın tip tanımı {Type Definition}
type Message = {
  id: number;
  role: "user" | "lunia";
  content: string;
};

export default function ChatDashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "lunia",
      content: "Merhaba. Ben Lunia. Bugün kendini nasıl hissediyorsun? Ne düşünmek veya ne konuşmak istersen buradayım.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Yeni mesaj geldiğinde otomatik olarak en alta kaydır {Auto-scroll}
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Kullanıcı mesajını ekrana ekle
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputValue,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Backend'e HTTP POST İsteği {HTTP POST Request}
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          chat_history: "", // Şimdilik boş, RAG gelince burası dolacak
        }),
      });

      if (!response.ok) throw new Error("Ağ hatası oluştu.");

      const data = await response.json();

      // Lunia'nın yanıtını ekrana ekle
      const luniaMessage: Message = {
        id: Date.now() + 1,
        role: "lunia",
        content: data.reply,
      };

      setMessages((prev) => [...prev, luniaMessage]);
    } catch (error) {
      console.error("İletişim koptu:", error);
      // Hata durumunda yoldaşça bir mesaj
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "lunia",
          content: "[Sistem Uyarısı] Kısa bir süreliğine bağlantım koptu. Derin bir nefes alıp tekrar dener misin?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Üst Kısım {Header} */}
      <header className="p-5 border-b border-cyan-900/30 shadow-[0_4px_20px_rgba(6,182,212,0.05)] flex items-center justify-center">
        <h1 className="text-xl font-semibold tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
          LUNIA<span className="text-purple-500">.AI</span>
        </h1>
      </header>

      {/* Mesajlaşma Alanı {Chat Area} */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl leading-relaxed ${
                msg.role === "user"
                  ? "bg-cyan-950/40 border border-cyan-800/50 text-cyan-50 rounded-br-none shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  : "bg-purple-950/20 border-l-2 border-purple-500 text-slate-300 rounded-bl-none shadow-[0_0_15px_rgba(168,85,247,0.05)] whitespace-pre-wrap"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {/* Yükleniyor Göstergesi {Loading Indicator} */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-4 rounded-2xl bg-slate-900/50 border border-slate-800 rounded-bl-none text-slate-500 animate-pulse flex space-x-2">
              <span className="block w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
              <span className="block w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></span>
              <span className="block w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Girdi Alanı {Input Area} */}
      <footer className="p-4 sm:p-6 bg-slate-950 border-t border-slate-900">
        <div className="max-w-4xl mx-auto flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Aklından geçenleri buraya dök..."
            className="flex-1 bg-slate-900/50 border border-slate-800 text-slate-200 px-6 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all placeholder-slate-600"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="bg-cyan-600/10 text-cyan-400 border border-cyan-500/30 px-8 py-4 rounded-xl hover:bg-cyan-600/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium tracking-wide"
          >
            Gönder
          </button>
        </div>
      </footer>
    </div>
  );
}