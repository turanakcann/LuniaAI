"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/src/lib/api"; // Eğer import hatası verirse görece yolu kullan: "../../../../lib/api"
import { Send, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "lunia";
  content: string;
};

export default function ChatScreen() {
  // Başlangıçta mesaj yok.
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        chat_history: "" 
      });

      setMessages((prev) => [
        ...prev,
        { role: "lunia", content: response.data.reply }
      ]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "lunia", content: "Şu an bağlantımda ufak bir pürüz yaşıyorum, lütfen birazdan tekrar dene." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Eğer hiç mesaj yoksa (Yeni Sohbet durumu) ekranın ortasında Input gösterilir
  const isChatEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col items-center relative h-full w-full">
      
      {/* Arka Plan Yıldız Efekti (İsteğe bağlı CSS ile güçlendirilebilir) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at center, #1f1f22 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Mesajların Aktığı Alan */}
      {!isChatEmpty && (
        <div className="flex-1 w-full max-w-3xl px-4 py-8 overflow-y-auto custom-scrollbar z-10 mt-12 mb-24">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-8 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "lunia" && (
                <div className="w-8 h-8 rounded-full bg-lunia-accent/10 flex items-center justify-center mr-4 shrink-0 border border-lunia-accent/20">
                  <Sparkles size={16} className="text-lunia-accent" />
                </div>
              )}
              
              <div className={`p-4 max-w-[80%] rounded-2xl text-sm leading-relaxed ${
                msg.role === "user" 
                  ? "bg-[#1e1e24] text-lunia-text rounded-tr-sm" 
                  : "bg-transparent text-lunia-text"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-8">
               <div className="w-8 h-8 rounded-full bg-lunia-accent/10 flex items-center justify-center mr-4 shrink-0 border border-lunia-accent/20">
                  <Sparkles size={16} className="text-lunia-accent animate-pulse" />
                </div>
              <div className="p-4 text-lunia-muted animate-pulse text-sm">
                Lunia düşünüyor...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Girdi Alanı (Input) - Duruma göre ortada veya altta konumlanır */}
      <div className={`w-full max-w-3xl px-4 z-10 transition-all duration-500 ease-in-out ${
        isChatEmpty ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : "absolute bottom-0 left-1/2 -translate-x-1/2 bg-gradient-to-t from-lunia-bg pb-6 pt-10"
      }`}>
        
        {isChatEmpty && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-lunia-text mb-2 tracking-tight">Nasıl hissediyorsun?</h1>
            <p className="text-lunia-muted text-sm">Zihnini kurcalayanları benimle paylaşabilirsin.</p>
          </div>
        )}

        <form onSubmit={sendMessage} className="relative flex items-center group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Mesajını buraya yaz..."
            className="w-full bg-[#111115] border border-lunia-border text-lunia-text px-6 py-4 rounded-full focus:outline-none focus:border-lunia-accent focus:ring-1 focus:ring-lunia-accent transition-all shadow-lg shadow-black/50 disabled:opacity-50 pr-14"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-lunia-accent hover:bg-lunia-accentHover text-white rounded-full transition-colors disabled:opacity-50 disabled:bg-lunia-border"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
      
    </div>
  );
}