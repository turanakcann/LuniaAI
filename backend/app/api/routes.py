# backend/app/api/routes.py
from fastapi import APIRouter, HTTPException, status, Depends, Request, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json

# Şemalarımızı schemas.py'den temiz bir şekilde içeri alıyoruz
from app.models.schemas import DynamicChatRequest, DynamicChatResponse, SessionOut, MessageOut

from app.services.llm_router import generate_lunia_response
from app.api.deps import get_current_user
from app.models.user import User
from app.models.database import get_db
from app.models.chat import ChatSession, ChatMessage
from app.core.limiter import limiter

router = APIRouter()

# --- 1. DİNAMİK SOHBET VE KAYIT UÇ NOKTASI ---
@router.post("/", response_model=DynamicChatResponse, status_code=status.HTTP_200_OK)
@limiter.limit("12/minute")
async def chat_with_lunia(
    request: Request,
    chat_data: DynamicChatRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lunia.ai Dinamik Sohbet Uç Noktası.
    Mesajları otomatik olarak kullanıcının ilgili oturumuna kaydeder.
    """
    try:
        user_id_str = str(current_user.id)
        session_id = chat_data.session_id

        # Eğer session_id gelmediyse yeni bir sohbet oturumu açıyoruz
        if not session_id:
            session_title = chat_data.message[:30] + "..." if len(chat_data.message) > 30 else chat_data.message
            new_session = ChatSession(
                user_id=user_id_str,
                title=session_title
            )
            db.add(new_session)
            db.commit()
            db.refresh(new_session)
            session_id = new_session.id
        else:
            # Gelen session_id cidden bu kullanıcıya mı ait kontrol et
            session_exists = db.query(ChatSession).filter(
                ChatSession.id == session_id, 
                ChatSession.user_id == user_id_str
            ).first()
            if not session_exists:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oturum bulunamadı.")

        # Kullanıcının mesajını kaydet
        user_msg_record = ChatMessage(
            session_id=session_id,
            role="user",
            content=chat_data.message
        )
        db.add(user_msg_record)

        # RAG ve LLM Motorunu tetikle
        ai_reply = await generate_lunia_response(
            user_id=user_id_str,
            user_message=chat_data.message
        )

        # Lunia'nın yanıtını kaydet
        lunia_msg_record = ChatMessage(
            session_id=session_id,
            role="lunia",
            content=ai_reply
        )
        db.add(lunia_msg_record)

        # Oturumun güncellenme tarihini yenile
        db.query(ChatSession).filter(ChatSession.id == session_id).update({"updated_at": datetime.utcnow()})
        db.commit()

        return DynamicChatResponse(reply=ai_reply, session_id=session_id)

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        db.rollback()
        print(f"Sistem Çökmesi (routes.py - POST): {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lunia şu an bağlantı kuramıyor, lütfen birazdan tekrar dene."
        )


# --- 2. GEÇMİŞ SOHBET BAŞLIKLARINI LİSTELEME ---
@router.get("/sessions", response_model=List[SessionOut])
async def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Giriş yapmış kullanıcının geçmiş sohbet başlıklarını getirir."""
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == str(current_user.id)
    ).order_by(ChatSession.updated_at.desc()).all()
    return sessions


# --- 3. SEÇİLEN SOHBETİN MESAJ GEÇMİŞİNİ ÇEKME ---
@router.get("/sessions/{session_id}/messages", response_model=List[MessageOut])
async def get_session_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Belirli bir sohbet oturumuna ait tüm mesajları kronolojik sırada getirir."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id, 
        ChatSession.user_id == str(current_user.id)
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Sohbet geçmişi bulunamadı veya yetkiniz yok.")
        
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()
    return messages


# --- 4. SOHBET OTURUMUNU SİLME ---
@router.delete("/sessions/{session_id}", status_code=status.HTTP_200_OK)
async def delete_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bir sohbet oturumunu ve ona bağlı tüm mesajları kalıcı olarak siler."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id, 
        ChatSession.user_id == str(current_user.id)
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Silinmek istenen oturum bulunamadı.")
        
    db.delete(session)
    db.commit()
    return {"detail": "Oturum ve bağlı tüm mesaj geçmişi başarıyla imha edildi."}


# --- 5. VERİ DIŞA AKTARMA ---
@router.get("/export")
async def export_user_data(
    format: str = Query(default="json", description="Dışa aktarma formatı: 'json' veya 'txt'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının tüm sohbet geçmişini JSON veya TXT formatında dışa aktarır."""
    if format not in ("json", "txt"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz format. 'json' veya 'txt' kullanın."
        )

    # Kullanıcıya ait tüm oturumları çek
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == str(current_user.id)
    ).order_by(ChatSession.updated_at.desc()).all()

    if format == "json":
        export_data = {
            "sessions": [
                {
                    "id": session.id,
                    "title": session.title,
                    "created_at": session.created_at.isoformat() if session.created_at else None,
                    "updated_at": session.updated_at.isoformat() if session.updated_at else None,
                    "messages": [
                        {
                            "id": msg.id,
                            "role": msg.role,
                            "content": msg.content,
                            "created_at": msg.created_at.isoformat() if msg.created_at else None,
                        }
                        for msg in db.query(ChatMessage).filter(
                            ChatMessage.session_id == session.id
                        ).order_by(ChatMessage.created_at.asc()).all()
                    ],
                }
                for session in sessions
            ]
        }
        content = json.dumps(export_data, ensure_ascii=False, indent=2)
        return Response(
            content=content,
            media_type="application/json",
            headers={"Content-Disposition": 'attachment; filename="lunia-export.json"'},
        )

    else:  # format == "txt"
        lines = []
        if not sessions:
            lines.append("Henüz sohbet geçmişi bulunmuyor.")
        else:
            for session in sessions:
                lines.append(f"=== {session.title} ===")
                lines.append(f"Oturum ID: {session.id}")
                lines.append(f"Oluşturulma: {session.created_at.isoformat() if session.created_at else '-'}")
                lines.append(f"Son güncelleme: {session.updated_at.isoformat() if session.updated_at else '-'}")
                lines.append("")
                messages = db.query(ChatMessage).filter(
                    ChatMessage.session_id == session.id
                ).order_by(ChatMessage.created_at.asc()).all()
                for msg in messages:
                    role_label = "Sen" if msg.role == "user" else "Lunia"
                    lines.append(f"[{role_label}]: {msg.content}")
                lines.append("")
                lines.append("-" * 60)
                lines.append("")
        content = "\n".join(lines)
        return Response(
            content=content,
            media_type="text/plain; charset=utf-8",
            headers={"Content-Disposition": 'attachment; filename="lunia-export.txt"'},
        )