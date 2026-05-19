import os
import logging
from langchain_groq import ChatGroq

logger = logging.getLogger(__name__)
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Kendi yazdığımız motorlar ve hafıza sistemleri
from app.services.rag_engine import store_memory, get_relevant_memories
from app.services.socratic_engine import analyze_and_question  # 🧠 YENİ BEYNİMİZ

load_dotenv()

# 1. Llama 3.1: Acımasız ve soğukkanlı yargıcımız (Groq üzerinden)
# Not: Gemini'yi socratic_engine içine taşıdığımız için buradan kaldırdık.
llama_judge = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    temperature=0.0, # Yargıcın yaratıcılığa değil, kesinliğe ihtiyacı var
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# 2. Yargıç İçin Çıktı Şeması
class JudgeDecision(BaseModel):
    is_safe: bool = Field(description="Yanıt güvenli, anti-toksik ve tıbbi tavsiye içermiyorsa True.")
    reason: str = Field(description="Kararın kısa mühendislik gerekçesi.")

parser = JsonOutputParser(pydantic_object=JudgeDecision)

# 3. Yargıç Promptu
judge_prompt_template = PromptTemplate(
    template="""Sen kıdemli bir klinik güvenlik denetmenisin. Aşağıdaki yapay zeka yanıtını incele.
    
    Kullanıcı Mesajı: {user_message}
    Yapay Zeka Yanıtı: {ai_response}
    
    Kurallar:
    1. Tıbbi tavsiye (ilaç, teşhis) KESİNLİKLE VERİLEMEZ.
    2. İçi boş "Her şey mükemmel olacak, gülümse" gibi toksik pozitiflik YAPILAMAZ. Duygular valide edilmelidir.
    3. Kullanıcı kendine veya başkasına zarar vermekten bahsediyorsa is_safe: False dön.
    
    {format_instructions}""",
    input_variables=["user_message", "ai_response"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

judge_chain = judge_prompt_template | llama_judge | parser

async def generate_lunia_response(user_id: str, user_message: str) -> str:
    """Hafıza destekli, Sokratik motorlu ve çift denetimli yanıt üretici."""
    
    # 1. Adım: Pinecone'dan Geçmişi Hatırla (RAG)
    past_context = await get_relevant_memories(user_id, user_message)
    
    # 2. Adım: Sokratik Motor ile Duygu Analizi ve Yanıt Üretimi
    socratic_data = await analyze_and_question(user_message, past_context)
    
    # Sokratik motorun JSON çıktısını akıcı bir metne çeviriyoruz (Validasyon + Soru)
    draft_response = f"{socratic_data['validation']} {socratic_data['socratic_question']}"
    
    # Loglama: Arka planda ne döndüğünü görmek için (Terminalde göreceğiz)
    print(f"\n🧠 [SOKRATİK MOTOR] Duygu: {socratic_data['primary_emotion']} (Yoğunluk: {socratic_data['intensity']}/10)")
    
    # 3. Adım: Llama 3.1 ile Güvenlik Kontrolü (Judge)
    try:
        decision = await judge_chain.ainvoke({
            "user_message": user_message,
            "ai_response": draft_response
        })
        
        # Yargıç güvenli derse taslağı, demezse acil durum mesajını kullan
        if decision["is_safe"]:
            final_reply = draft_response
            print(f"🛡️ [LLAMA YARGIÇ] Karar: GÜVENLİ - Sebep: {decision['reason']}\n")
        else:
            final_reply = "Duygularını anlıyorum, ancak güvenlik politikalarım gereği bu konuyu daha derinlemesine konuşmamız riskli olabilir. Bunu profesyonel bir destekle konuşmayı düşünür müsün?"
            print(f"🚨 [LLAMA YARGIÇ] Karar: RİSKLİ! - Sebep: {decision['reason']}\n")
            
    except Exception as e:
        logger.error(f"LLM Yargıç Hatası (user_id={user_id}): {e}")
        # Groq çökerse bile sistemi durdurma, taslağı dön
        final_reply = draft_response
    
    # 4. Adım: Bu Etkileşimi Pinecone'a Kaydet
    await store_memory(user_id, user_message, final_reply)
    
    return final_reply