from pydantic import BaseModel, Field

# Kullanıcıdan gelecek olan istek yapısı {Request Payload}
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Kullanıcının gönderdiği mesaj")
    # Şimdilik geçmişi string olarak alıyoruz, RAG entegrasyonunda bu otomatik veritabanından çekilecek
    chat_history: str = Field(default="", description="Önceki konuşma bağlamı")

# Sistemden dönecek olan yanıt yapısı {Response Payload}
class ChatResponse(BaseModel):
    reply: str = Field(..., description="Lunia'nın Çift LLM onaylı nihai yanıtı")
    is_safe: bool = Field(default=True, description="Mesajın güvenlik durumu")