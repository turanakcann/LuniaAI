# Lunia.ai — Mental Health Companion AI

> Çift LLM güvenlik mimarisi ve RAG hafıza sistemiyle donatılmış, Sokratik yöntemi kullanan yapay zeka destekli mental sağlık arkadaşı.
>
> An AI-powered mental health companion built with dual-LLM safety architecture, RAG memory, and the Socratic method.

---

## Türkçe

### Proje Hakkında

Lunia.ai, kullanıcıların duygusal ve mental sağlık yolculuklarında onlara eşlik eden tam yığın (full-stack) bir yapay zeka uygulamasıdır. Sistem, kullanıcı mesajlarını iki bağımsız dil modelinden geçirerek hem empatik hem de güvenli yanıtlar üretir.

**Nasıl çalışır?**

1. Kullanıcı mesaj gönderir.
2. **RAG Motoru** — Pinecone vektör veritabanından kullanıcının geçmiş etkileşimleri aranır.
3. **Sokratik Motor (Google Gemini)** — Duygu analizi yapılır, empati odaklı bir yanıt ve derinleştirici bir soru üretilir.
4. **Güvenlik Yargıcı (Llama 3.3 70B / Groq)** — Yanıt, güvenlik kurallarına göre denetlenir. Risk tespit edilirse acil durum mesajı devreye girer.
5. Yanıt kullanıcıya iletilir ve etkileşim Pinecone'a kaydedilir.

---

### Özellikler

| Özellik | Açıklama |
|---|---|
| Çift LLM Güvenlik | Gemini yanıt üretir, Llama 3.3 güvenlik denetimi yapar |
| RAG Hafıza | Pinecone ile kullanıcıya özel bağlamsal bellek |
| Sokratik Yöntem | Derin sorularla kullanıcının içgörü geliştirmesine destek |
| Oturum Yönetimi | Sohbet geçmişi PostgreSQL'de saklanır, URL ile senkronize edilir |
| Veri Dışa Aktarma | Sohbet geçmişini JSON veya TXT olarak indirme |
| Admin Paneli | Metrik grafikleri, kullanıcı yönetimi, canlı aktivite akışı |
| Rol Sistemi | 5 kademeli yetki (Kullanıcı → SuperAdmin) |
| Hesap Yönetimi | Şifre sıfırlama, hesap silme (cascade) |
| Güvenli Kimlik Doğrulama | JWT tabanlı, HTTP-only cookie, rol korumalı rotalar |
| Error Boundary | Tüm sayfalarda React hata yakalama |

---

### Teknoloji Yığını

**Backend**
- Python 3.11+
- FastAPI — REST API çerçevesi
- SQLAlchemy + Alembic — ORM ve veritabanı migrasyonları
- PostgreSQL (Supabase) — İlişkisel veritabanı
- Pinecone — Vektör veritabanı (RAG hafızası)
- LangChain — LLM orkestrasyon
- Google Gemini 2.5 Flash — Sokratik yanıt motoru
- Llama 3.3 70B (Groq) — Güvenlik yargıcı
- SlowAPI — Hız sınırlama (rate limiting)
- python-jose — JWT işlemleri

**Frontend**
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4 — Özel Lunia renk teması
- Recharts — Admin metrik grafikleri
- React Markdown + remark-gfm — Markdown render
- Axios — HTTP istemcisi
- js-cookie + jwt-decode — Token yönetimi
- Framer Motion — Animasyonlar
- Lucide React — İkonlar

---

### Proje Yapısı

```
LuniaAI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin_routes.py     # Admin panel endpoint'leri
│   │   │   ├── auth_routes.py      # Kimlik doğrulama endpoint'leri
│   │   │   ├── deps.py             # JWT bağımlılıkları
│   │   │   └── routes.py           # Chat ve oturum endpoint'leri
│   │   ├── core/
│   │   │   ├── limiter.py          # Rate limiting
│   │   │   └── security.py         # Şifreleme ve JWT
│   │   ├── models/
│   │   │   ├── chat.py             # ChatSession ve ChatMessage modelleri
│   │   │   ├── database.py         # Veritabanı bağlantısı
│   │   │   ├── schemas.py          # Pydantic şemaları
│   │   │   └── user.py             # User modeli
│   │   ├── services/
│   │   │   ├── llm_router.py       # Çift LLM orchestration
│   │   │   ├── rag_engine.py       # Pinecone hafıza sistemi
│   │   │   └── socratic_engine.py  # Gemini Sokratik motoru
│   │   └── main.py                 # FastAPI uygulaması
│   ├── alembic/                    # Veritabanı migrasyonları
│   ├── .env                        # Ortam değişkenleri (git'e ekleme!)
│   └── requirements.txt
├── frontend/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ActivityFeed.tsx    # Canlı aktivite akışı
│   │   │   ├── MetricsCharts.tsx   # Recharts grafikleri
│   │   │   └── UserDataGrid.tsx    # Kullanıcı yönetim tablosu
│   │   ├── chat/
│   │   │   ├── MessageBubble.tsx   # Mesaj balonu bileşeni
│   │   │   └── ThinkingIndicator.tsx
│   │   └── ErrorBoundary.tsx       # React hata sınırı
│   └── src/
│       ├── app/
│       │   ├── (dashboard)/
│       │   │   ├── chat/page.tsx   # Ana sohbet sayfası
│       │   │   └── layout.tsx      # Sidebar + modallar
│       │   ├── admin/
│       │   │   ├── layout.tsx      # Admin layout (ErrorBoundary)
│       │   │   └── page.tsx        # Admin dashboard
│       │   ├── login/              # Giriş sayfası
│       │   ├── register/           # Kayıt sayfası
│       │   └── layout.tsx          # Root layout (ThemeProvider)
│       ├── context/
│       │   └── ThemeContext.tsx    # Koyu/aydınlık tema
│       ├── lib/
│       │   └── api.ts              # Axios istemcisi
│       └── middleware.ts           # Rota koruma + admin yetki kontrolü
└── README.md
```

---

### Rol Sistemi

| Seviye | Etiket | Yetkiler |
|---|---|---|
| 1 | Kullanıcı | Chat, veri dışa aktarma, hesap yönetimi |
| 2 | Analist | + Sistem istatistikleri |
| 3 | Moderatör | + Kullanıcı askıya alma/aktif etme |
| 4 | Admin | — |
| 5 | SuperAdmin | + Admin paneli, metrikler, kullanıcı listesi, aktivite akışı |

---

### Kurulum

#### 1. Depoyu Klonlayın

```bash
git clone <repository-url>
cd LuniaAI
```

#### 2. Backend Kurulumu

```bash
cd backend

# Sanal ortam oluşturun ve aktif edin
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Bağımlılıkları kurun
pip install -r requirements.txt
```

#### 3. Backend Ortam Değişkenlerini Ayarlayın

`backend/.env` dosyası oluşturun:

```env
# Veritabanı
DATABASE_URL=postgresql://user:password@host:port/dbname

# Güvenlik
SECRET_KEY=cok-gizli-bir-anahtar-buraya-yazin

# AI Servisleri
GOOGLE_API_KEY=your_google_api_key
GROQ_API_KEY=your_groq_api_key

# Vektör Veritabanı
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name

# E-posta (şifre sıfırlama için)
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

#### 4. Veritabanı Migrasyonlarını Uygulayın

```bash
# backend/ dizininde, venv aktifken
alembic upgrade head
```

#### 5. Backend'i Başlatın

```bash
# backend/ dizininde, venv aktifken
uvicorn app.main:app --reload --port 8000
```

#### 6. Frontend Kurulumu

Yeni bir terminal açın:

```bash
cd frontend

# Bağımlılıkları kurun
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

#### 7. Uygulamaya Erişin

| Servis | Adres |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Dokümantasyonu | http://localhost:8000/docs |

---

### API Uç Noktaları

**Kimlik Doğrulama** — `/api/v1/auth`

| Metot | Yol | Açıklama |
|---|---|---|
| `GET` | `/me` | Oturum açmış kullanıcı bilgisi |
| `POST` | `/register` | Yeni hesap oluşturma |
| `POST` | `/login` | Giriş (JWT token döner) |
| `POST` | `/forgot-password` | Şifre sıfırlama e-postası |
| `POST` | `/reset-password` | Yeni şifre belirleme |
| `DELETE` | `/account` | Hesabı ve tüm verileri kalıcı sil |

**Chat** — `/api/v1/chat`

| Metot | Yol | Açıklama |
|---|---|---|
| `POST` | `/` | Mesaj gönder, AI yanıtı al (12/dk limit) |
| `GET` | `/sessions` | Oturum listesi |
| `GET` | `/sessions/{id}/messages` | Oturuma ait mesajlar |
| `DELETE` | `/sessions/{id}` | Oturumu sil |
| `GET` | `/export` | Geçmişi JSON veya TXT olarak indir |

**Admin** — `/api/v1/admin` (SuperAdmin gerektirir)

| Metot | Yol | Açıklama |
|---|---|---|
| `GET` | `/admin/metrics` | Günlük aktif kullanıcı, mesaj sayısı |
| `GET` | `/admin/users` | Tüm kullanıcılar |
| `POST` | `/admin/ban-user` | Kullanıcıyı askıya al |
| `POST` | `/admin/unban-user` | Kullanıcıyı aktif et |
| `DELETE` | `/admin/delete-user/{id}` | Kullanıcıyı kalıcı sil |
| `GET` | `/admin/activity-feed` | Son 100 sistem olayı |

---

### Katkıda Bulunma

1. Depoyu fork edin
2. Feature branch oluşturun: `git checkout -b feature/yeni-ozellik`
3. Değişikliklerinizi commit edin: `git commit -m 'feat: yeni özellik eklendi'`
4. Branch'e push edin: `git push origin feature/yeni-ozellik`
5. Pull Request açın

---

### Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

---

## English

### About the Project

Lunia.ai is a full-stack AI application that accompanies users on their emotional and mental health journey. The system passes every user message through two independent language models, producing responses that are both empathetic and safe.

**How it works:**

1. The user sends a message.
2. **RAG Engine** — Relevant past interactions are retrieved from the Pinecone vector database.
3. **Socratic Engine (Google Gemini)** — Emotion analysis is performed; an empathy-focused response and a deepening question are generated.
4. **Safety Judge (Llama 3.3 70B / Groq)** — The response is reviewed against safety rules. If a risk is detected, an emergency message is triggered.
5. The response is sent to the user and the interaction is stored in Pinecone.

---

### Features

| Feature | Description |
|---|---|
| Dual-LLM Safety | Gemini generates responses, Llama 3.3 performs safety review |
| RAG Memory | User-specific contextual memory via Pinecone |
| Socratic Method | Supports insight development through deep questioning |
| Session Management | Chat history stored in PostgreSQL, synced via URL |
| Data Export | Download chat history as JSON or TXT |
| Admin Panel | Metric charts, user management, live activity feed |
| Role System | 5-tier permissions (User → SuperAdmin) |
| Account Management | Password reset, account deletion (cascade) |
| Secure Authentication | JWT-based, HTTP-only cookie, role-protected routes |
| Error Boundary | React error catching across all pages |

---

### Technology Stack

**Backend**
- Python 3.11+
- FastAPI — REST API framework
- SQLAlchemy + Alembic — ORM and database migrations
- PostgreSQL (Supabase) — Relational database
- Pinecone — Vector database (RAG memory)
- LangChain — LLM orchestration
- Google Gemini 2.5 Flash — Socratic response engine
- Llama 3.3 70B (Groq) — Safety judge
- SlowAPI — Rate limiting
- python-jose — JWT operations

**Frontend**
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4 — Custom Lunia color theme
- Recharts — Admin metric charts
- React Markdown + remark-gfm — Markdown rendering
- Axios — HTTP client
- js-cookie + jwt-decode — Token management
- Framer Motion — Animations
- Lucide React — Icons

---

### Project Structure

```
LuniaAI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin_routes.py     # Admin panel endpoints
│   │   │   ├── auth_routes.py      # Authentication endpoints
│   │   │   ├── deps.py             # JWT dependencies
│   │   │   └── routes.py           # Chat and session endpoints
│   │   ├── core/
│   │   │   ├── limiter.py          # Rate limiting
│   │   │   └── security.py         # Hashing and JWT
│   │   ├── models/
│   │   │   ├── chat.py             # ChatSession and ChatMessage models
│   │   │   ├── database.py         # Database connection
│   │   │   ├── schemas.py          # Pydantic schemas
│   │   │   └── user.py             # User model
│   │   ├── services/
│   │   │   ├── llm_router.py       # Dual-LLM orchestration
│   │   │   ├── rag_engine.py       # Pinecone memory system
│   │   │   └── socratic_engine.py  # Gemini Socratic engine
│   │   └── main.py                 # FastAPI application
│   ├── alembic/                    # Database migrations
│   ├── .env                        # Environment variables (do not commit!)
│   └── requirements.txt
├── frontend/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ActivityFeed.tsx    # Live activity feed
│   │   │   ├── MetricsCharts.tsx   # Recharts graphs
│   │   │   └── UserDataGrid.tsx    # User management table
│   │   ├── chat/
│   │   │   ├── MessageBubble.tsx   # Message bubble component
│   │   │   └── ThinkingIndicator.tsx
│   │   └── ErrorBoundary.tsx       # React error boundary
│   └── src/
│       ├── app/
│       │   ├── (dashboard)/
│       │   │   ├── chat/page.tsx   # Main chat page
│       │   │   └── layout.tsx      # Sidebar + modals
│       │   ├── admin/
│       │   │   ├── layout.tsx      # Admin layout (ErrorBoundary)
│       │   │   └── page.tsx        # Admin dashboard
│       │   ├── login/              # Login page
│       │   ├── register/           # Registration page
│       │   └── layout.tsx          # Root layout (ThemeProvider)
│       ├── context/
│       │   └── ThemeContext.tsx    # Dark/light theme
│       ├── lib/
│       │   └── api.ts              # Axios client
│       └── middleware.ts           # Route protection + admin authorization
└── README.md
```

---

### Role System

| Level | Label | Permissions |
|---|---|---|
| 1 | User | Chat, data export, account management |
| 2 | Analyst | + System statistics |
| 3 | Moderator | + Suspend / reactivate users |
| 4 | Admin | — |
| 5 | SuperAdmin | + Admin panel, metrics, user list, activity feed |

---

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd LuniaAI
```

#### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Configure Backend Environment Variables

Create a `backend/.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Security
SECRET_KEY=put-a-very-secret-key-here

# AI Services
GOOGLE_API_KEY=your_google_api_key
GROQ_API_KEY=your_groq_api_key

# Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name

# Email (for password reset)
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

#### 4. Apply Database Migrations

```bash
# Inside backend/ with venv active
alembic upgrade head
```

#### 5. Start the Backend

```bash
# Inside backend/ with venv active
uvicorn app.main:app --reload --port 8000
```

#### 6. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

#### 7. Access the Application

| Service | Address |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Documentation | http://localhost:8000/docs |

---

### API Endpoints

**Authentication** — `/api/v1/auth`

| Method | Path | Description |
|---|---|---|
| `GET` | `/me` | Get current user info |
| `POST` | `/register` | Create a new account |
| `POST` | `/login` | Login (returns JWT token) |
| `POST` | `/forgot-password` | Send password reset email |
| `POST` | `/reset-password` | Set new password |
| `DELETE` | `/account` | Permanently delete account and all data |

**Chat** — `/api/v1/chat`

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Send message, receive AI response (12/min limit) |
| `GET` | `/sessions` | List sessions |
| `GET` | `/sessions/{id}/messages` | Messages for a session |
| `DELETE` | `/sessions/{id}` | Delete a session |
| `GET` | `/export` | Download history as JSON or TXT |

**Admin** — `/api/v1/admin` (SuperAdmin required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/metrics` | Daily active users, message count |
| `GET` | `/admin/users` | All users |
| `POST` | `/admin/ban-user` | Suspend a user |
| `POST` | `/admin/unban-user` | Reactivate a user |
| `DELETE` | `/admin/delete-user/{id}` | Permanently delete a user |
| `GET` | `/admin/activity-feed` | Last 100 system events |

---

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'feat: add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Open a Pull Request

---

### License

This project is licensed under the MIT License.
