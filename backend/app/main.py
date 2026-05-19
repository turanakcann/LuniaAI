import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as chat_router
from app.api.auth_routes import router as auth_router
import logging
from app.api.admin_routes import router as admin_router

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter

# Log formatını ve dosyasını ayarla
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("lunia_backend.log"), # Tüm loglar bu dosyaya yazılacak
        logging.StreamHandler() # Aynı zamanda terminalde de görünecek
    ]
)

logger = logging.getLogger(__name__)

# Örnek kullanım (Uygulama başladığında)
logger.info("Lunia AI Backend başarıyla başlatıldı.")

app = FastAPI(
    title="Lunia.ai Core API",
    description="Mental Health Companion AI - Çift LLM ve RAG Destekli Backend",
    version="1.0.0"
)

#Limiter'ı uygulamaya entegre ediyoruz
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Ayarları (Next.js ile haberleşmek için hayati önem taşır)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(admin_router, prefix="/api/v1", tags=["Admin Panel"])


@app.get("/health", tags=["System"])
async def health_check():
    """Sistemin ayakta olup olmadığını ve acil durum kalkanını kontrol eden uç nokta."""
    return {
        "status": "online",
        "message": "Lunia.ai Backend Sistemleri Aktif.",
        "emergency_protocol": "Standby",
        "dual_llm_status": "Waiting for initialization"
    }

# İleride rotaları uygulamaya böyle bağlayacağız:
# app.include_router(chat_router, prefix="/api/v1/chat")
# app.include_router(auth_router, prefix="/api/v1/auth")