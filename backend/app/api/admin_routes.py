from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
import os
import re
import logging

from app.models.database import get_db
from app.models.user import User
# BÜYÜK YILDIZ: SystemLog tablosunu import'a ekledik
from app.models.chat import ChatSession, ChatMessage, SystemLog 
from app.api.deps import get_current_user, check_admin_level
from app.models.schemas import MetricsOut, AdminUserOut, ActivityEventOut

logger = logging.getLogger(__name__)

router = APIRouter()

class UpdateRoleRequest(BaseModel):
    user_id: int
    new_role_level: int = Field(..., ge=1, le=5)

class BanUserRequest(BaseModel):
    user_id: int

def require_superadmin(current_user: User):
    """role_level >= 5 kontrolü; yetersiz yetki için 403 fırlatır."""
    if current_user.role_level < 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için SuperAdmin (Seviye 5) yetkisi gereklidir."
        )

# YOL DÜZELTİLDİ: Frontend /admin/update-role bekliyordu
@router.post("/admin/update-role", status_code=200)
async def update_user_role(
    role_data: UpdateRoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # İstekte bulunan kişinin cidden SuperAdmin (5) olup olmadığını doğrula
    require_superadmin(current_user)
        
    target_user = db.query(User).filter(User.id == role_data.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
        
    target_user.role_level = role_data.new_role_level
    # Eğer seviye 4 veya 5 ise otomatik is_admin bayrağını kaldır/ekle
    target_user.is_admin = True if role_data.new_role_level >= 4 else False
    
    db.commit()
    logger.info(f"Role Update: Kullanıcı {target_user.email} yetkisi {current_user.email} tarafından {role_data.new_role_level} yapıldı.")
    return {"detail": f"Kullanıcı yetki seviyesi başarıyla {role_data.new_role_level} olarak güncellendi."}

# --- SİLME (SuperAdmin only) ---
@router.delete("/admin/delete-user/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_superadmin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    db.delete(user)
    db.commit()
    logger.info(f"Admin silme: kullanıcı {user_id} admin {current_user.email} tarafından silindi.")
    return {"message": f"Kullanıcı {user_id} sistemden tamamen silindi."}


# --- METRİKLER (SuperAdmin only) ---
@router.get("/admin/metrics", response_model=MetricsOut)
async def get_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_superadmin(current_user)

    # Bugün aktif kullanıcılar (bugün güncellenen session'ları olan kullanıcılar)
    today = datetime.utcnow().date()
    daily_active = db.query(func.count(func.distinct(ChatSession.user_id))).filter(
        func.date(ChatSession.updated_at) == today
    ).scalar() or 0

    # Toplam mesaj sayısı
    total_messages = db.query(func.count(ChatMessage.id)).scalar() or 0

    return MetricsOut(
        daily_active_users=daily_active,
        total_messages=total_messages,
        error_rate=0.0
    )


# --- İSTATİSTİKLER (Analyst+) ---
@router.get("/admin/view-stats")
async def view_stats(current_user: User = Depends(get_current_user)):
    check_admin_level(2, current_user.role_level)
    return {"active_users": 150, "api_health": "Good"}


# --- KULLANICI LİSTESİ (SuperAdmin only) ---
@router.get("/admin/users", response_model=List[AdminUserOut])
async def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_superadmin(current_user)
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


# --- KULLANICI ASKIYA ALMA (Moderator+) ---
@router.post("/admin/ban-user")
async def ban_user(
    request: BanUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_admin_level(3, current_user.role_level)
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    user.is_active = False
    db.commit()
    logger.info(f"Ban: kullanıcı {request.user_id} ({user.email}) {current_user.email} tarafından askıya alındı.")
    return {"message": f"Kullanıcı {request.user_id} geçici olarak askıya alındı."}


# --- KULLANICI AKTİF ETME (Moderator+) ---
@router.post("/admin/unban-user")
async def unban_user(
    request: BanUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_admin_level(3, current_user.role_level)
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    user.is_active = True
    db.commit()
    logger.info(f"Unban: kullanıcı {request.user_id} ({user.email}) {current_user.email} tarafından aktif edildi.")
    return {"message": f"Kullanıcı {request.user_id} aktif edildi."}


# --- AKTİVİTE AKIŞI VE GÜVENLİK LOGLARI (SuperAdmin only) ---
@router.get("/admin/activity-feed", response_model=List[ActivityEventOut])
async def get_activity_feed(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sistem loglarını veritabanından okur. Kullanıcı e-postalarını birleştirerek döner.
    """
    require_superadmin(current_user)
    events: List[ActivityEventOut] = []

    try:
        # SystemLog ve User tablosunu birleştiriyoruz ki ihlali yapanın mailini görebilelim
        logs = db.query(SystemLog, User.email).outerjoin(User, SystemLog.user_id == User.id)\
                 .order_by(SystemLog.created_at.desc()).limit(100).all()

        for log, user_email in logs:
            events.append(ActivityEventOut(
                timestamp=log.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                level=log.log_type,  # Örn: SECURITY_ALERT
                event=log.details,
                user=user_email or "Silinmiş Kullanıcı"
            ))

    except Exception as e:
        logger.error(f"Activity feed veritabanından çekilirken hata oluştu: {e}")

    return events