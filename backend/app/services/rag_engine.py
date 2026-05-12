import os
import uuid
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

# 1. Model Yükleme (Local CPU/GPU kullanılır)
# Bu model 384 boyutunda vektör üretir, tam senin index'e göre.
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# 2. Pinecone Bağlantısı
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = "lunia-memory"
index = pc.index(index_name)

async def store_memory(user_id: str, message: str, response: str):
    """Kullanıcı ve AI arasındaki etkileşimi vektörize edip kaydeder."""
    text_to_embed = f"Kullanıcı: {message} | Lunia: {response}"
    
    # Metni vektöre çevir {Encoding}
    # Senior Notu: Büyük yüklerde bunu thread'e almak gerekir ama şimdilik akışta kalsın.
    vector = model.encode(text_to_embed).tolist()
    
    # Pinecone'a yükle
    index.upsert(
        vectors=[{
            "id": str(uuid.uuid4()), # Her anı için benzersiz bir ID
            "values": vector,
            "metadata": {
                "user_id": user_id, 
                "text": text_to_embed,
                "type": "chat_history"
            }
        }]
    )

async def get_relevant_memories(user_id: str, current_query: str, top_k: int = 3):
    """Mevcut soruyla en alakalı geçmiş 3 anıyı getirir."""
    query_vector = model.encode(current_query).tolist()
    
    # Pinecone üzerinde anlamsal arama yap {Semantic Search}
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        filter={"user_id": {"$eq": user_id}}, # Sadece bu kullanıcının anıları
        include_metadata=True
    )
    
    # Gelen eşleşmeleri metne dök
    memories = [res['metadata']['text'] for res in results['matches']]
    
    if not memories:
        return "Henüz bu konuyla ilgili geçmiş bir anı yok."
        
    return "\n---\n".join(memories)