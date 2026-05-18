from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# .env içindeki DATABASE_URL: postgresql://user:pass@localhost:5432/lunia_db
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,      # 👈 BÜYÜK YILDIZ: İstek atmadan önce veritabanı yaşıyor mu diye ping atar!
    pool_recycle=300,        # 👈 5 dakikada bir bağlantıları yeniler, Supabase'in bağlantıyı koparmasını engeller
    pool_size=5,             # Ayn anda 5 bağlantıya izin ver
    max_overflow=10          # Yedek 10 bağlantı
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()