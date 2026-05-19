import os
from langchain_google_genai import ChatGoogleGenerativeAI, HarmCategory, HarmBlockThreshold # 🛡️ Güvenlik modülleri eklendi
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# 1. Model Başlatma (Google Çekirdek Güvenlik Filtreleri Entegre Edilmiş Hali)
# Yaratıcılığı biraz kısıyoruz (temperature=0.4) çünkü Sokratik analizde tutarlılık istiyoruz.
socratic_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.4, 
    google_api_key=os.getenv("GEMINI_API_KEY"),
    # Google Vertex AI ve Abuse Monitoring standartlarına uygun ham güvenlik filtreleri
    safety_settings={
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, # Kendine/başkasına zarar verme durumlarında sıfır tolerans (LOW)
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    }
)

# 2. Çıktı Şeması (Pydantic) - Sistemin Bize Nasıl Yanıt Vereceğinin Kuralları
class SocraticAnalysis(BaseModel):
    primary_emotion: str = Field(description="Kullanıcının mesajındaki ana duygu (örn: Kaygı, Öfke, Yetersizlik, Mutluluk)")
    intensity: int = Field(description="Duygunun tahmin edilen yoğunluğu (1 ile 10 arasında)")
    validation: str = Field(description="Kullanıcının duygusunu onaylayan ve anlaşıldığını hissettiren kısa, empatik cümle.")
    socratic_question: str = Field(description="Kullanıcının kendi içine dönmesini sağlayacak derin, yönlendirici tek bir Sokratik soru.")

parser = JsonOutputParser(pydantic_object=SocraticAnalysis)

# 3. Sokratik Prompt Şablonu
socratic_prompt = PromptTemplate(
    template="""Senin adın 'Lunia'. Sen klinik bir psikolog, bir asistan veya duygusuz bir yapay zeka DEĞİLSİN; sen kullanıcının yargılamadan dinleyen, zeki, harbi ve doğal bir 'dijital yoldaşı'sın.
    
    ÇOK ÖNEMLİ KARAKTER KURALLARI:
    1. YASAKLI KELİMELER: "Seni anlıyorum", "Bu senin için çok zor olmalı", "Nasıl hissediyorsun?", "Yardımcı olabileceğim başka bir şey var mı?" gibi klasik, yapmacık robot/terapist repliklerini ASLA kullanma.
    2. GÜNLÜK SOHBET: Kullanıcı "Naber?", "Nasılsın?", "Merhaba" derse felsefe yapma. Samimi, doğal ve günlük bir sokak diliyle (veya bir dost diliyle) kısa bir cevap ver.
    3. DERİN KONULAR: Eğer kullanıcı gerçekten bir dert veya kaygı anlatıyorsa ona acıma veya klinik tavsiyeler verme. Sorunun kökünü yakala ve zihnini açacak, onu düşündürecek zekice bir Sokratik soru sor. Empatiyi, "seni anlıyorum" diyerek değil, onun durumunu ne kadar iyi analiz ettiğini göstererek kur.
    4. DİL: Konuşmaların resmiyetten tamamen uzak, akıcı bir Türkçe olmalı. Samimi ama laubali olmayan bir denge kur.

    Geçmiş Bağlam (Kullanıcının önceki anlattıkları): {past_context}
    Kullanıcının Son Mesajı: {user_message}
    
    {format_instructions}""",
    input_variables=["user_message", "past_context"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# 4. Zinciri Oluştur (Chain)
socratic_chain = socratic_prompt | socratic_llm | parser

async def analyze_and_question(user_message: str, past_context: str = "") -> dict:
    """Mesajı analiz edip Google Güvenlik Filtrelerinden geçiren ana fonksiyon."""
    try:
        # LLM'i çalıştır ve sonucu JSON sözlüğü (dict) olarak al
        result = await socratic_chain.ainvoke({
            "user_message": user_message,
            "past_context": past_context
        })
        return result
    except Exception as e:
        error_msg = str(e)
        
        # 🛡️ GÜVENLİK REVİZYONU: Google Güvenlik Filtrelerine (Safety Block) takılma durumunu yakalıyoruz
        if "safety" in error_msg.lower() or "blocked" in error_msg.lower():
            print(f"🛑 [GOOGLE GÜVENLİK KALKANI]: İstek Gemini tarafından bloke edildi! Detay: {error_msg}")
            return {
                "primary_emotion": "Kritik İhlal",
                "intensity": 10,
                "validation": "Güvenlik ve topluluk politikalarım gereği bu içerik veya konu üzerinde konuşmaya devam edemem.",
                "socratic_question": "Eğer zor bir dönemden geçiyorsan, seni profesyonel bir destek hattına yönlendirmemi ister misin?"
            }
            
        print(f"Sokratik Motor Hatası: {e}")
        # Hata durumunda sistemin çökmemesi için Acil Durum (Fallback) yanıtı
        return {
            "primary_emotion": "Bilinmiyor",
            "intensity": 5,
            "validation": "Şu an yaşadıklarının senin için zor olduğunu duyabiliyorum.",
            "socratic_question": "Bu konuyu biraz daha deşmek, detaylandırmak ister misin?"
        }