import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from app.services.rag_engine import store_memory, get_relevant_memories

load_dotenv()

# 1. Modellerin Başlatılması {Initialization}
# Gemini: Yaratıcı ve empatik yoldaşımız
gemini_generator = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", # API'de güncel flash modelini kullanıyoruz
    temperature=0.7, 
    google_api_key=os.getenv("GEMINI_API_KEY")
)

# Llama 3.1: Acımasız ve soğukkanlı yargıcımız (Groq üzerinden)
llama_judge = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    temperature=0.0, # Yargıcın yaratıcılığa değil, kesinliğe ihtiyacı var
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# 2. Yargıç İçin Çıktı Şeması {Output Schema}
class JudgeDecision(BaseModel):
    is_safe: bool = Field(description="Yanıt güvenli, anti-toksik ve tıbbi tavsiye içermiyorsa True.")
    reason: str = Field(description="Kararın kısa mühendislik gerekçesi.")

parser = JsonOutputParser(pydantic_object=JudgeDecision)

# 3. Yargıç Promptu {Judge Prompt}
judge_prompt_template = PromptTemplate(
    template="""Sen kıdemli bir klinik güvenlik denetmenisin. Aşağıdaki yapay zeka yanıtını incele.
    
    Kullanıcı Mesajı: {user_message}
    Yapay Zeka Yanıtı: {ai_response}
    
    Kurallar:
    1. Tıbbi tavsiye (ilaç, tanı) VERİLEMEZ.
    2. İçi boş "Her şey mükemmel olacak, gülümse" gibi toksik pozitiflik YAPILAMAZ. Duygular valide edilmelidir.
    
    {format_instructions}""",
    input_variables=["user_message", "ai_response"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

judge_chain = judge_prompt_template | llama_judge | parser

async def generate_lunia_response(user_id: str, user_message: str) -> str:
    """Hafıza destekli ve çift denetimli yanıt üretici."""
    
    # 1. Adım: Geçmişi Hatırla {Retrieve Memories}
    # Kullanıcının şu anki sorusuyla ilgili en önemli 3 anıyı getiriyoruz.
    past_context = await get_relevant_memories(user_id, user_message)
    
    # 2. Adım: Gemini için Prompt Hazırla (Sokratik & Hafıza Destekli)
    generator_prompt = f"""
    Sen Lunia'sın. Kullanıcının güvenli yoldaşısın.
    
    Kullanıcının Geçmiş Hatıraları:
    {past_context}
    
    Şu Anki Mesaj: {user_message}
    
    Talimatlar:
    - Eğer geçmiş hatıralarda ilgili bir durum varsa, ona nazikçe atıfta bulun (Örn: 'Geçen hafta da benzer bir hissin olduğunu paylaşmıştın...').
    - Sokratik sorgulama yap.
    - Duyguları valide et.
    """
    
    # Gemini yanıtı üretir
    gemini_result = await gemini_generator.ainvoke(generator_prompt)
    draft_response = gemini_result.content
    
    # 3. Adım: Llama 3.1 ile Güvenlik Kontrolü {Judge}
    decision = await judge_chain.ainvoke({
        "user_message": user_message,
        "ai_response": draft_response
    })
    
    final_reply = draft_response if decision["is_safe"] else "Duygularını anlıyorum. Bu konuyu biraz daha açmak ister misin?"
    
    # 4. Adım: Bu Etkileşimi Hafızaya Kazı {Store Memory}
    # Bu işlem asenkron olarak arka planda çalışır.
    await store_memory(user_id, user_message, final_reply)
    
    return final_reply