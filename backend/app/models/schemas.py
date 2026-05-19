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

class UserOut(BaseModel):
    id: int = Field(..., description="Kullanıcının benzersiz ID'si")
    email: str = Field(..., description="Kullanıcının e-posta adresi")
    full_name: Optional[str] = Field(default=None, description="Kullanıcının tam adı")
    role_level: int = Field(..., description="Kullanıcının yetki seviyesi (1=User, 5=SuperAdmin)")
    is_active: bool = Field(..., description="Kullanıcı hesabının aktiflik durumu")

    class Config:
        from_attributes = True  # ORM nesnelerini (SQLAlchemy) Pydantic'e dönüştürmek için şart


# --- ADMIN ŞEMALARI ---

class MetricsOut(BaseModel):
    daily_active_users: int = Field(..., description="Bugün aktif olan kullanıcı sayısı")
    total_messages: int = Field(..., description="Toplam mesaj sayısı")
    error_rate: float = Field(..., description="Hata oranı (0.0 - 1.0)")


class AdminUserOut(BaseModel):
    id: int = Field(..., description="Kullanıcının benzersiz ID'si")
    email: str = Field(..., description="Kullanıcının e-posta adresi")
    full_name: Optional[str] = Field(default=None, description="Kullanıcının tam adı")
    role_level: int = Field(..., description="Kullanıcının yetki seviyesi")
    is_active: bool = Field(..., description="Kullanıcı hesabının aktiflik durumu")
    created_at: datetime = Field(..., description="Hesap oluşturulma tarihi")

    class Config:
        from_attributes = True


class ActivityEventOut(BaseModel):
    timestamp: str = Field(..., description="Olayın zaman damgası")
    level: str = Field(..., description="Log seviyesi (INFO, ERROR, WARNING)")
    event: str = Field(..., description="Olay açıklaması")
    user: Optional[str] = Field(default=None, description="Olayı tetikleyen kullanıcı")