from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta # 👈 BÜYÜK YILDIZ 1: Bunu import etmeliyiz
import logging

from app.core.security import hash_password, verify_password, create_access_token
from app.models.database import get_db
from app.models.user import User
from app.models.schemas import UserCreate, UserOut
from app.models.chat import ChatSession, ChatMessage
from app.utils.mailer import LuniaMailer
from app.api.deps import get_current_user

from jose import jwt, JWTError # Token doğrulama için
import os

logger = logging.getLogger(__name__)

router = APIRouter()
mailer = LuniaMailer()

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Oturum açmış kullanıcının bilgilerini döndürür."""
    return current_user

# 👈 BÜYÜK YILDIZ 2: FastAPI'nin beklediği veri kalıbı (Şema)
class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/register")
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="E-posta zaten kullanımda.")
    
    new_user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name
    )
    db.add(new_user)
    db.commit()
    return {"message": "Kayıt başarılı."}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Hatalı giriş bilgileri.")

    token = create_access_token(data={"sub": user.email, "role_level": user.role_level})
    logger.info(f"Login: {user.email} başarıyla giriş yaptı (role_level={user.role_level}).")
    return {"access_token": token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return {"message": "Eğer bu e-posta adresi kayıtlıysa, bir sıfırlama linki gönderilecektir."}
    
    # 15 dakikalık geçici bir token üretiyoruz
    reset_token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(minutes=15))
    
    print(f"\n" + "="*50)
    print(f"🚨 [TEST LİNKİ]: http://localhost:3000/reset-password?token={reset_token}")
    print("="*50 + "\n")
    
    # Mail gönder
    success = mailer.send_reset_password_email(user.email, reset_token)
    
    if success:
        return {"message": "Sıfırlama linki e-posta adresine gönderildi."}
    else:
        raise HTTPException(status_code=500, detail="E-posta gönderilirken bir hata oluştu.")
    
class UserResetPassword(BaseModel):
    token: str
    new_password: str
    
@router.post("/reset-password")
async def reset_password(data: UserResetPassword, db: Session = Depends(get_db)):
    try:
        # 1. Token'ı doğrula ve içindeki e-postayı oku
        secret_key = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
        payload = jwt.decode(data.token, secret_key, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş token.")
            
        # 2. Kullanıcıyı bul
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
            
        # 3. Yeni şifreyi hash'le ve güncelle
        user.hashed_password = hash_password(data.new_password)
        db.commit()
        
        print(f"🔐 Şifre başarıyla güncellendi: {email}")
        return {"message": "Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz."}
        
    except JWTError:
        raise HTTPException(status_code=400, detail="Token doğrulanırken bir hata oluştu.")


class DeleteAccountRequest(BaseModel):
    password: str

@router.delete("/account")
async def delete_account(
    data: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcı hesabını ve tüm ilişkili verileri siler."""
    # Şifre doğrulama
    if not verify_password(data.password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Şifre hatalı.")

    try:
        # Cascade silme: ChatMessage → ChatSession → User
        # Önce kullanıcıya ait session id'lerini al
        session_ids = [
            s.id for s in db.query(ChatSession).filter(ChatSession.user_id == current_user.id).all()
        ]

        # ChatMessage kayıtlarını sil
        if session_ids:
            db.query(ChatMessage).filter(ChatMessage.session_id.in_(session_ids)).delete(synchronize_session=False)

        # ChatSession kayıtlarını sil
        db.query(ChatSession).filter(ChatSession.user_id == current_user.id).delete(synchronize_session=False)

        # User kaydını sil
        db.delete(current_user)

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Hesap silinirken bir hata oluştu.")

    return {"message": "Hesabınız başarıyla silindi."}
