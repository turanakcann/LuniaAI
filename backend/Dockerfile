# 1. Aşama: Hafif bir Python imajı ile başlıyoruz
FROM python:3.11-slim

# Çalışma dizinini belirliyoruz
WORKDIR /code

# Sistem bağımlılıklarını kuruyoruz (Bcrypt ve Spacy derlemeleri için gerekli)
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Bağımlılıkları kopyalıyoruz (Docker önbelleğini kullanmak için önce sadece bu)
COPY requirements.txt .

# Kütüphaneleri kuruyoruz
RUN pip install --no-cache-dir -r requirements.txt

# SpaCy Türkçe modelini indiriyoruz (Risk tespiti için şart)
RUN python -m spacy download tr_core_news_trf

# Tüm uygulama kodunu kopyalıyoruz
COPY . .

# FastAPI'yi 8000 portundan dışarı açıyoruz
EXPOSE 8000

# Uygulamayı başlatıyoruz
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]