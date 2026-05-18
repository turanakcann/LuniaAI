from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.user import User
from app.api.deps import get_current_user, check_admin_level

# Router'ı başlatıyoruz
router = APIRouter()

@router.delete("/admin/delete-user/{user_id}")
async def delete_user(user_id: int, current_user: User = Depends(get_current_user)):
    # Bu işlemi sadece SuperAdmin (Lvl 5) yapabilir
    check_admin_level(5, current_user.role_level)
    # TODO: Gerçek silme işlemi buraya eklenecek
    return {"message": f"Kullanıcı {user_id} sistemden tamamen silindi."}

@router.get("/admin/view-stats")
async def view_stats(current_user: User = Depends(get_current_user)):
    # İstatistikleri Analyst (Lvl 2) ve üstü görebilir
    check_admin_level(2, current_user.role_level)
    # TODO: Gerçek veritabanı istatistikleri buraya çekilecek
    return {"active_users": 150, "api_health": "Good"}

@router.post("/admin/ban-user")
async def ban_user(user_id: int, current_user: User = Depends(get_current_user)):
    # Banlama işlemini Moderator (Lvl 3) ve üstü yapabilir
    check_admin_level(3, current_user.role_level)
    # TODO: Kullanıcı durumu güncelleme işlemi buraya eklenecek
    return {"message": f"Kullanıcı {user_id} geçici olarak askıya alındı."}