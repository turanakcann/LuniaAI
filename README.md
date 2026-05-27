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
| Rol Sistemi | 5 kademeli yetki (Kullanıcı → SuperAdmin), `/admin/update-role` ile değiştirilebilir |
| Hesap Yönetimi | Şifre sıfırlama (e-posta doğrulamalı), hesap silme (cascade) |
| Güvenli Kimlik Doğrulama | JWT tabanlı, HTTP-only cookie, rol korumalı rotalar |
| Tanıtım Sayfaları | Anasayfa, geliştiriciler, dokümanlar, rehber, senaryolar |
| Error Boundary | Tüm sayfalarda React hata yakalama |
| Docker Desteği | `docker-compose` ile tek komutla ayağa kalkar |

---

### Teknoloji Yığını

**Backend**
- Python 3.11+
- FastAPI — REST API çerçevesi
- SQLAlchemy + Alembic — ORM ve veritabanı migrasyonları
- PostgreSQL (Supabase) — İlişkisel veritabanı
- Pinecone — Vektör veritabanı (RAG hafızası)
- LangChain / LangGraph — LLM orkestrasyon
- Google Gemini 2.5 Flash — Sokratik yanıt motoru
- Llama 3.3 70B (Groq) — Güvenlik yargıcı
- sentence-transformers — Yerel embedding üretimi
- SlowAPI — Hız sınırlama (rate limiting)
- python-jose + passlib/bcrypt — JWT ve şifre hashleme
- SMTP mailer — Şifre sıfırlama e-postaları (`app/utils/mailer.py`)

**Frontend**
- Next.js 16 (App Router, route groups)
- React 19 + TypeScript
- Tailwind CSS v4 — Özel Lunia renk teması
- shadcn/ui + Radix UI — Yeniden kullanılabilir bileşen kütüphanesi
- Recharts — Admin metrik grafikleri
- React Markdown + remark-gfm — Markdown render
- Axios — HTTP istemcisi
- js-cookie + jwt-decode — Token yönetimi
- Framer Motion + tw-animate-css — Animasyonlar
- Lucide React — İkonlar

**Altyapı**
- Docker + docker-compose — Konteynerleştirilmiş geliştirme/dağıtım
- Bridge network ile backend↔frontend izolasyonu

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
│   │   │   ├── chat.py             # ChatSession, ChatMessage, SystemLog
│   │   │   ├── database.py         # Veritabanı bağlantısı
│   │   │   ├── schemas.py          # Pydantic şemaları
│   │   │   └── user.py             # User modeli
│   │   ├── services/
│   │   │   ├── llm_router.py       # Çift LLM orchestration
│   │   │   ├── rag_engine.py       # Pinecone hafıza sistemi
│   │   │   └── socratic_engine.py  # Gemini Sokratik motoru
│   │   ├── utils/
│   │   │   └── mailer.py           # SMTP e-posta gönderimi
│   │   └── main.py                 # FastAPI uygulaması
│   ├── alembic/                    # Veritabanı migrasyonları
│   ├── Dockerfile
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
│   │   ├── ui/                     # shadcn/ui (avatar, button, input, scroll-area)
│   │   └── ErrorBoundary.tsx       # React hata sınırı
│   ├── lib/
│   │   └── utils.ts                # shadcn yardımcıları (cn vb.)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/          # Giriş sayfası
│   │   │   │   ├── register/       # Kayıt sayfası
│   │   │   │   ├── forgot-password/# Şifre sıfırlama isteği
│   │   │   │   └── reset-password/ # Yeni şifre belirleme
│   │   │   ├── (dashboard)/
│   │   │   │   ├── chat/page.tsx   # Ana sohbet sayfası
│   │   │   │   └── layout.tsx      # Sidebar + modallar
│   │   │   ├── (homeLinks)/
│   │   │   │   ├── developers/     # Geliştiriciler için tanıtım
│   │   │   │   ├── docs/           # Dokümantasyon
│   │   │   │   ├── guide/          # Kullanım rehberi
│   │   │   │   └── scenarios/      # Örnek senaryolar
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx      # Admin layout (ErrorBoundary)
│   │   │   │   ├── page.tsx        # Admin dashboard
│   │   │   │   └── UserDataGrid.tsx
│   │   │   ├── api/auth/           # Next.js route handler'ları
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx          # Root layout (ThemeProvider)
│   │   │   └── page.tsx            # Anasayfa
│   │   ├── components/
│   │   │   └── Navbar.tsx          # Üst gezinme çubuğu
│   │   ├── context/
│   │   │   └── ThemeContext.tsx    # Koyu/aydınlık tema
│   │   ├── lib/
│   │   │   └── api.ts              # Axios istemcisi
│   │   ├── store/                  # İstemci durum yönetimi
│   │   └── middleware.ts           # Rota koruma + admin yetki kontrolü
│   ├── Dockerfile
│   ├── components.json             # shadcn yapılandırması
│   ├── tailwind.config.ts
│   └── package.json
├── docker-compose.yml
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
| 5 | SuperAdmin | + Admin paneli, metrikler, kullanıcı listesi, rol güncelleme, aktivite akışı |

---

### Kurulum

İki yol mevcut: **(A)** Docker ile tek komutla veya **(B)** manuel kurulum.

#### A. Docker ile Kurulum (Önerilen)

`backend/.env` ve `frontend/.env` dosyalarını aşağıdaki örneklere göre oluşturduktan sonra:

```bash
docker compose up --build
```

Servisler:
- Frontend → http://localhost:3000
- Backend → http://localhost:8000

#### B. Manuel Kurulum

##### 1. Depoyu Klonlayın

```bash
git clone <repository-url>
cd LuniaAI
```

##### 2. Backend Kurulumu

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

##### 3. Backend Ortam Değişkenlerini Ayarlayın

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
MAIL_FROM=your_email@example.com
MAIL_SERVER=smtp.example.com
MAIL_PORT=587

# Frontend URL (şifre sıfırlama linkleri için)
FRONTEND_URL=http://localhost:3000

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

##### 4. Veritabanı Migrasyonlarını Uygulayın

```bash
# backend/ dizininde, venv aktifken
alembic upgrade head
```

##### 5. Backend'i Başlatın

```bash
# backend/ dizininde, venv aktifken
uvicorn app.main:app --reload --port 8000
```

##### 6. Frontend Kurulumu

Yeni bir terminal açın:

```bash
cd frontend

# Bağımlılıkları kurun
npm install
```

`frontend/.env` dosyası oluşturun:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

```bash
# Geliştirme sunucusunu başlatın
npm run dev
```

##### 7. Uygulamaya Erişin

| Servis | Adres |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Dokümantasyonu | http://localhost:8000/docs |
| Sağlık Kontrolü | http://localhost:8000/health |

---

### API Uç Noktaları

**Kimlik Doğrulama** — `/api/v1/auth`

| Metot | Yol | Açıklama |
|---|---|---|
| `GET` | `/me` | Oturum açmış kullanıcı bilgisi |
| `POST` | `/register` | Yeni hesap oluşturma |
| `POST` | `/login` | Giriş (JWT token döner) |
| `POST` | `/forgot-password` | Şifre sıfırlama e-postası gönder |
| `POST` | `/reset-password` | Token ile yeni şifre belirle |
| `DELETE` | `/account` | Hesabı ve tüm verileri kalıcı sil |

**Chat** — `/api/v1/chat`

| Metot | Yol | Açıklama |
|---|---|---|
| `POST` | `/` | Mesaj gönder, AI yanıtı al (12/dk limit) |
| `GET` | `/sessions` | Oturum listesi |
| `GET` | `/sessions/{id}/messages` | Oturuma ait mesajlar |
| `DELETE` | `/sessions/{id}` | Oturumu sil |
| `GET` | `/export` | Geçmişi JSON veya TXT olarak indir |

**Admin** — `/api/v1/admin`

| Metot | Yol | Yetki | Açıklama |
|---|---|---|---|
| `GET` | `/admin/metrics` | SuperAdmin | Günlük aktif kullanıcı, mesaj sayısı |
| `GET` | `/admin/view-stats` | Analist+ | Sistem istatistikleri |
| `GET` | `/admin/users` | SuperAdmin | Tüm kullanıcılar |
| `POST` | `/admin/update-role` | SuperAdmin | Kullanıcı rol seviyesini değiştir |
| `POST` | `/admin/ban-user` | Moderatör+ | Kullanıcıyı askıya al |
| `POST` | `/admin/unban-user` | Moderatör+ | Kullanıcıyı aktif et |
| `DELETE` | `/admin/delete-user/{id}` | SuperAdmin | Kullanıcıyı kalıcı sil |
| `GET` | `/admin/activity-feed` | SuperAdmin | Son 100 sistem olayı (SystemLog) |

**Sistem**

| Metot | Yol | Açıklama |
|---|---|---|
| `GET` | `/health` | Sağlık kontrolü |

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
| Role System | 5-tier permissions (User → SuperAdmin), updatable via `/admin/update-role` |
| Account Management | Password reset (email-verified), account deletion (cascade) |
| Secure Authentication | JWT-based, HTTP-only cookie, role-protected routes |
| Marketing Pages | Landing page, developers, docs, guide, scenarios |
| Error Boundary | React error catching across all pages |
| Docker Support | One-command spin-up via `docker-compose` |

---

### Technology Stack

**Backend**
- Python 3.11+
- FastAPI — REST API framework
- SQLAlchemy + Alembic — ORM and database migrations
- PostgreSQL (Supabase) — Relational database
- Pinecone — Vector database (RAG memory)
- LangChain / LangGraph — LLM orchestration
- Google Gemini 2.5 Flash — Socratic response engine
- Llama 3.3 70B (Groq) — Safety judge
- sentence-transformers — Local embedding generation
- SlowAPI — Rate limiting
- python-jose + passlib/bcrypt — JWT and password hashing
- SMTP mailer — Password reset emails (`app/utils/mailer.py`)

**Frontend**
- Next.js 16 (App Router, route groups)
- React 19 + TypeScript
- Tailwind CSS v4 — Custom Lunia color theme
- shadcn/ui + Radix UI — Reusable component library
- Recharts — Admin metric charts
- React Markdown + remark-gfm — Markdown rendering
- Axios — HTTP client
- js-cookie + jwt-decode — Token management
- Framer Motion + tw-animate-css — Animations
- Lucide React — Icons

**Infrastructure**
- Docker + docker-compose — Containerized dev/deployment
- Bridge network isolating backend ↔ frontend

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
│   │   │   ├── chat.py             # ChatSession, ChatMessage, SystemLog
│   │   │   ├── database.py         # Database connection
│   │   │   ├── schemas.py          # Pydantic schemas
│   │   │   └── user.py             # User model
│   │   ├── services/
│   │   │   ├── llm_router.py       # Dual-LLM orchestration
│   │   │   ├── rag_engine.py       # Pinecone memory system
│   │   │   └── socratic_engine.py  # Gemini Socratic engine
│   │   ├── utils/
│   │   │   └── mailer.py           # SMTP email delivery
│   │   └── main.py                 # FastAPI application
│   ├── alembic/                    # Database migrations
│   ├── Dockerfile
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
│   │   ├── ui/                     # shadcn/ui (avatar, button, input, scroll-area)
│   │   └── ErrorBoundary.tsx       # React error boundary
│   ├── lib/
│   │   └── utils.ts                # shadcn helpers (cn, etc.)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/          # Login page
│   │   │   │   ├── register/       # Registration page
│   │   │   │   ├── forgot-password/# Request password reset
│   │   │   │   └── reset-password/ # Set new password
│   │   │   ├── (dashboard)/
│   │   │   │   ├── chat/page.tsx   # Main chat page
│   │   │   │   └── layout.tsx      # Sidebar + modals
│   │   │   ├── (homeLinks)/
│   │   │   │   ├── developers/     # Developers landing
│   │   │   │   ├── docs/           # Documentation
│   │   │   │   ├── guide/          # Usage guide
│   │   │   │   └── scenarios/      # Example scenarios
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx      # Admin layout (ErrorBoundary)
│   │   │   │   ├── page.tsx        # Admin dashboard
│   │   │   │   └── UserDataGrid.tsx
│   │   │   ├── api/auth/           # Next.js route handlers
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx          # Root layout (ThemeProvider)
│   │   │   └── page.tsx            # Landing page
│   │   ├── components/
│   │   │   └── Navbar.tsx          # Top navigation
│   │   ├── context/
│   │   │   └── ThemeContext.tsx    # Dark/light theme
│   │   ├── lib/
│   │   │   └── api.ts              # Axios client
│   │   ├── store/                  # Client state
│   │   └── middleware.ts           # Route protection + admin authorization
│   ├── Dockerfile
│   ├── components.json             # shadcn configuration
│   ├── tailwind.config.ts
│   └── package.json
├── docker-compose.yml
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
| 5 | SuperAdmin | + Admin panel, metrics, user list, role updates, activity feed |

---

### Installation

Two paths: **(A)** Docker one-liner or **(B)** manual setup.

#### A. Docker Setup (Recommended)

After creating `backend/.env` and `frontend/.env` from the examples below:

```bash
docker compose up --build
```

Services:
- Frontend → http://localhost:3000
- Backend → http://localhost:8000

#### B. Manual Setup

##### 1. Clone the Repository

```bash
git clone <repository-url>
cd LuniaAI
```

##### 2. Backend Setup

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

##### 3. Configure Backend Environment Variables

Create `backend/.env`:

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
MAIL_FROM=your_email@example.com
MAIL_SERVER=smtp.example.com
MAIL_PORT=587

# Frontend URL (used in password reset links)
FRONTEND_URL=http://localhost:3000

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

##### 4. Apply Database Migrations

```bash
# Inside backend/ with venv active
alembic upgrade head
```

##### 5. Start the Backend

```bash
# Inside backend/ with venv active
uvicorn app.main:app --reload --port 8000
```

##### 6. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install
```

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

```bash
# Start the development server
npm run dev
```

##### 7. Access the Application

| Service | Address |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Documentation | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

---

### API Endpoints

**Authentication** — `/api/v1/auth`

| Method | Path | Description |
|---|---|---|
| `GET` | `/me` | Get current user info |
| `POST` | `/register` | Create a new account |
| `POST` | `/login` | Login (returns JWT token) |
| `POST` | `/forgot-password` | Send password reset email |
| `POST` | `/reset-password` | Set new password via token |
| `DELETE` | `/account` | Permanently delete account and all data |

**Chat** — `/api/v1/chat`

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Send message, receive AI response (12/min limit) |
| `GET` | `/sessions` | List sessions |
| `GET` | `/sessions/{id}/messages` | Messages for a session |
| `DELETE` | `/sessions/{id}` | Delete a session |
| `GET` | `/export` | Download history as JSON or TXT |

**Admin** — `/api/v1/admin`

| Method | Path | Required Role | Description |
|---|---|---|---|
| `GET` | `/admin/metrics` | SuperAdmin | Daily active users, message count |
| `GET` | `/admin/view-stats` | Analyst+ | System statistics |
| `GET` | `/admin/users` | SuperAdmin | All users |
| `POST` | `/admin/update-role` | SuperAdmin | Change a user's role level |
| `POST` | `/admin/ban-user` | Moderator+ | Suspend a user |
| `POST` | `/admin/unban-user` | Moderator+ | Reactivate a user |
| `DELETE` | `/admin/delete-user/{id}` | SuperAdmin | Permanently delete a user |
| `GET` | `/admin/activity-feed` | SuperAdmin | Last 100 system events (SystemLog) |

**System**

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |

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
