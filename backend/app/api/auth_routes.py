from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel # 👈 BÜYÜK YILDIZ 1: Bunu import etmeliyiz

from app.core.security import hash_password, verify_password, create_access_token
from app.models.database import get_db
from app.models.user import User
from app.models.schemas import UserCreate
from app.utils.mailer import LuniaMailer

from jose import jwt, JWTError # Token doğrulama için
import os

router = APIRouter()
mailer = LuniaMailer()

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
    
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return {"message": "Eğer bu e-posta adresi kayıtlıysa, bir sıfırlama linki gönderilecektir."}
    
    # 15 dakikalık geçici bir token üretiyoruz
    reset_token = create_access_token(data={"sub": user.email}, expires_delta=15)
    
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
        payload = jwt.decode(data.token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
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