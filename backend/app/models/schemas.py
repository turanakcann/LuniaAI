from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime # 👈 Zaman damgaları için ekledik

# --- SOHBET ŞEMALARI ---

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Kullanıcının gönderdiği mesaj")
    chat_history: str = Field(default="", description="Önceki konuşma bağlamı")

class ChatResponse(BaseModel):
    reply: str = Field(..., description="Lunia'nın Çift LLM onaylı nihai yanıtı")
    is_safe: bool = Field(default=True, description="Mesajın güvenlik durumu")

# --- DİNAMİK SOHBET VE OTURUM ŞEMALARI (YENİ KATMAN) ---

class DynamicChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Kullanıcının gönderdiği yeni mesaj")
    session_id: Optional[str] = Field(default=None, description="Mesajın ait olduğu sohbet odası ID'si (Boşsa yeni oda açılır)")

class DynamicChatResponse(BaseModel):
    reply: str = Field(..., description="Lunia'nın Çift LLM onaylı nihai yanıtı")
    session_id: str = Field(..., description="İşlemin yapıldığı veya yeni açılan sohbet odasının ID'si")
    is_safe: bool = Field(default=True, description="Mesajın güvenlik durumu")

class SessionOut(BaseModel):
    id: str = Field(..., description="Sohbet odasının benzersiz ID'si")
    title: str = Field(..., description="Sohbet odasının başlığı")
    updated_at: datetime = Field(..., description="Son güncellenme tarihi")

    class Config:
        from_attributes = True # ORM nesnelerini (SQLAlchemy) Pydantic'e dönüştürmek için şart

class MessageOut(BaseModel):
    id: str = Field(..., description="Mesajın benzersiz ID'si")
    role: str = Field(..., description="Mesajı atan rol (user/lunia)")
    content: str = Field(..., description="Mesajın metin içeriği")
    created_at: datetime = Field(..., description="Mesajın atılma tarihi")

    class Config:
        from_attributes = True # ORM nesnelerini (SQLAlchemy) Pydantic'e dönüştürmek için şart

# --- KULLANICI (AUTH) ŞEMALARI ---

class UserCreate(BaseModel):
    email: str = Field(..., description="Kullanıcının e-posta adresi")
    password: str = Field(..., min_length=6, description="Minimum 6 karakterli şifre")
    full_name: Optional[str] = Field(default=None, description="Kullanıcının tam adı")

class UserLogin(BaseModel):
    email: str = Field(..., description="Kayıtlı e-posta adresi")
    password: str = Field(..., description="Kullanıcı şifresi")