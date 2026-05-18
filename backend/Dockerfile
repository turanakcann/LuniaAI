# 1. Aşama: Hafif bir Python imajı
FROM python:3.11-slim

# Terminal loglarının anında düşmesi ve Python'un pyc dosyası oluşturmasını engellemek için:
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /code

# Sistem bağımlılıkları (Bcrypt derlemeleri için)
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Önce bağımlılık listesini kopyala (Docker Caching için)
COPY requirements.txt .

# Kütüphaneleri kur
RUN pip install --no-cache-dir -r requirements.txt

# SpaCy Türkçe modelini doğrudan Hugging Face üzerinden indiriyoruz
# Senior Notu: Hız/Boyut optimizasyonu için Transformer (_trf) yerine Medium (_md) modelini çekiyoruz.
RUN pip install --no-cache-dir https://huggingface.co/turkish-nlp-suite/tr_core_news_md/resolve/main/tr_core_news_md-1.0-py3-none-any.whl

# Tüm kodları kopyala (.dockerignore dosyan olduğunu varsayıyorum)
COPY . .

# Portu dışarı aç
EXPOSE 8000

# Uygulamayı başlat
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]