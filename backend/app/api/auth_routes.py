from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password, create_access_token
from app.models.database import get_db
from app.models.user import User
from app.models.schemas import UserCreate, UserLogin
from app.utils.mailer import LuniaMailer

router = APIRouter()
mailer = LuniaMailer()

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
async def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Hatalı giriş bilgileri.")
    
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/forget-password")
async def forget_password(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if user:
        # Mailer özelliğimizi burada CC/BCC desteğiyle tetikliyoruz
        await mailer.send_auth_mail(
            to_email=email,
            subject="Şifre Sıfırlama Talebi - Lunia.ai",
            body="Şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanın: [LINK]",
            cc=["admin@lunia.ai"],
            bcc=["security-logs@lunia.ai"]
        )
    return {"message": "Eğer hesap mevcutsa, sıfırlama talimatları gönderilecektir."}