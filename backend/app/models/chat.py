from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from app.models.database import Base
import uuid
from datetime import datetime, timezone

def get_utc_now():
    return datetime.now(timezone.utc)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, default="Yeni Sohbet")
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Bir sohbet silinirse içindeki tüm mesajlar da (cascade) silinir
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False) # "user" veya "lunia"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    session = relationship("ChatSession", back_populates="messages")

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    log_type = Column(String, default="SECURITY_ALERT")
    details = Column(Text, nullable=False)
    created_at = Column(DateTime, default=get_utc_now)