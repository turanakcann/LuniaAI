# Lunia.ai - Mental Health Companion AI

## Türkçe

### Proje Açıklaması
Lunia.ai, kullanıcıların mental sağlık yolculuklarında onlara eşlik eden, çift LLM (Large Language Model) ve RAG (Retrieval-Augmented Generation) teknolojilerini kullanan yapay zeka destekli bir mental sağlık arkadaşıdır. Bu proje, modern web teknolojileri ile geliştirilmiş tam yığın (full-stack) bir uygulamadır.

### Özellikler
- **Çift LLM Desteği**: Google Gemini ve Groq modelleri ile gelişmiş yanıtlar
- **RAG Teknolojisi**: Pinecone vektör veritabanı ile bağlam odaklı yanıtlar
- **Sokratik Yöntem**: Kullanıcıların derinlemesine düşünmelerine yardımcı olan sorgulama sistemi
- **Modern Web Arayüzü**: Next.js ve React ile geliştirilmiş responsive tasarım
- **Mikroservis Mimarisi**: Backend ve frontend'in ayrı konteynerlerde çalışması
- **Güvenlik**: JWT tabanlı kimlik doğrulama ve yetkilendirme

### Teknoloji Yığını
- **Backend**: Python, FastAPI, LangChain, Pinecone
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Veritabanı**: Pinecone (vektör), PostgreSQL (gelecekte)
- **Dağıtım**: Docker, Docker Compose

### Kurulum ve Çalıştırma

#### Ön Gereksinimler
- Docker ve Docker Compose
- Git

#### Adımlar
1. **Projeyi Klonlayın**:
   ```bash
   git clone <repository-url>
   cd LuniaAI
   ```

2. **Ortam Değişkenlerini Ayarlayın**:
   `.env` dosyasını oluşturun ve gerekli API anahtarlarını ekleyin:
   ```
   GOOGLE_API_KEY=your_google_api_key
   GROQ_API_KEY=your_groq_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=your_index_name
   ```

3. **Uygulamayı Başlatın**:
   ```bash
   docker-compose up --build
   ```

4. **Uygulamaya Erişin**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Dokümantasyonu: http://localhost:8000/docs

### Kullanım
1. Ana sayfada oturum açın veya kayıt olun
2. Dashboard'dan sohbet başlatın
3. AI ile mental sağlık konularında konuşun
4. Admin panelinden sistemi yönetin

### Geliştirme
- Backend geliştirme için: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt`
- Frontend geliştirme için: `cd frontend && npm install && npm run dev`

### Katkıda Bulunma
1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Lisans
Bu proje MIT lisansı altında lisanslanmıştır.

---

## English

### Project Description
Lunia.ai is an AI-powered mental health companion that accompanies users on their mental health journey, utilizing dual LLM (Large Language Model) and RAG (Retrieval-Augmented Generation) technologies. This project is a full-stack application developed with modern web technologies.

### Features
- **Dual LLM Support**: Advanced responses with Google Gemini and Groq models
- **RAG Technology**: Context-aware responses with Pinecone vector database
- **Socratic Method**: Questioning system to help users think deeply
- **Modern Web Interface**: Responsive design built with Next.js and React
- **Microservices Architecture**: Backend and frontend running in separate containers
- **Security**: JWT-based authentication and authorization

### Technology Stack
- **Backend**: Python, FastAPI, LangChain, Pinecone
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Database**: Pinecone (vector), PostgreSQL (future)
- **Deployment**: Docker, Docker Compose

### Installation and Running

#### Prerequisites
- Docker and Docker Compose
- Git

#### Steps
1. **Clone the Project**:
   ```bash
   git clone <repository-url>
   cd LuniaAI
   ```

2. **Set Environment Variables**:
   Create a `.env` file and add the necessary API keys:
   ```
   GOOGLE_API_KEY=your_google_api_key
   GROQ_API_KEY=your_groq_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=your_index_name
   ```

3. **Start the Application**:
   ```bash
   docker-compose up --build
   ```

4. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Usage
1. Log in or register on the main page
2. Start a chat from the dashboard
3. Discuss mental health topics with AI
4. Manage the system from the admin panel

### Development
- For backend development: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt`
- For frontend development: `cd frontend && npm install && npm run dev`

### Contributing
1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License
This project is licensed under the MIT License.