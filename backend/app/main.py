from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# İleride uç noktalarımızı (endpoints) oluşturduğumuzda buraya import edeceğiz
from app.api.routes import router as chat_router
# from app.api.auth_routes import router as auth_router

app = FastAPI(
    title="Lunia.ai Core API",
    description="Mental Health Companion AI - Çift LLM ve RAG Destekli Backend",
    version="1.0.0"
)

# CORS Ayarları (Next.js ile haberleşmek için hayati önem taşır)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Canlıya (Production) çıkarken domain adımızı buraya ekleyeceğiz!
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE vb. hepsine izin ver
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/v1")

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