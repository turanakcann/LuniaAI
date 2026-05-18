# backend/app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.database import get_db
from app.models.user import User
from fastapi import HTTPException, status

# Frontend'in token alacağı uç noktanın adresi (Swagger UI testleri için de gereklidir)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """JWT Token'ı çözer, veritabanından kullanıcıyı bulur ve sisteme dahil eder."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulanamadı veya oturum süresi doldu.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Token'ı çöz ve içindeki emaili (sub) al
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # E-postaya göre kullanıcıyı veritabanından bul
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user

def check_admin_level(required_level: int, user_level: int):
    if user_level < required_level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Bu işlem için Seviye {required_level} yetkisi gerekiyor. Mevcut seviyen: {user_level}"
        )