from fastapi import APIRouter, HTTPException, status
from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_router import generate_lunia_response

# Router objesi, API'leri gruplamamızı sağlar
router = APIRouter()

@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_with_lunia(request: ChatRequest):
    """
    Lunia.ai Ana Sohbet Uç Noktası.
    Kullanıcı mesajını alır, RAG hafızasıyla (yakında) birleştirir ve Çift LLM filtresinden geçirerek yanıt döner.
    """
    try:
        # Gelecekteki RAG Entegrasyonu Yeri:
        # user_memories = await get_user_memories_from_pinecone(user_id)
        
        # Çift LLM Yönlendiricisini çalıştır
        ai_reply = await generate_lunia_response(
            user_message=request.message,
            chat_history=request.chat_history
        )
        
        return ChatResponse(reply=ai_reply)

    except Exception as e:
        # Sunucu tarafında beklenmedik bir hata olursa {Internal Server Error}
        print(f"Sistem Çökmesi (routes.py): {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lunia şu an bağlantı kuramıyor, lütfen birazdan tekrar dene."
        )