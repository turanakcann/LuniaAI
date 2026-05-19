# Design Document

## Overview

LuniaAI platformunun dört fazlı geliştirme planı; mevcut FastAPI + Supabase backend'i ve Next.js + TypeScript frontend'i üzerine inşa edilmektedir. Tasarım, mevcut mimariyi bozmadan katman katman genişletme prensibine dayanır.

## Architecture

### Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ /chat    │  │ /admin   │  │ /login   │  │ /      │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ ThemeContext │ ErrorBoundary │ middleware.ts         │ │
│  └─────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────────┐
│                  FastAPI Backend                         │
│  /api/v1/auth  │  /api/v1/chat  │  /api/v1/admin        │
│  ┌───────────┐   ┌────────────┐   ┌──────────────────┐  │
│  │auth_routes│   │  routes.py │   │ admin_routes.py  │  │
│  └───────────┘   └────────────┘   └──────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ deps.py (get_current_user) │ security.py │ limiter  │ │
│  └─────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ SQLAlchemy ORM
┌────────────────────────▼────────────────────────────────┐
│                  Supabase (PostgreSQL)                   │
│  users │ chat_sessions │ chat_messages                   │
└─────────────────────────────────────────────────────────┘
```

### Veri Modeli

**users tablosu** (mevcut)
- `id` INTEGER PK
- `email` STRING UNIQUE
- `hashed_password` STRING
- `full_name` STRING
- `role_level` INTEGER (1=User, 2=Analyst, 3=Moderator, 4=Admin, 5=SuperAdmin)
- `is_active` BOOLEAN
- `is_admin` BOOLEAN
- `created_at` DATETIME

**chat_sessions tablosu** (mevcut)
- `id` STRING PK (UUID)
- `user_id` INTEGER FK → users.id CASCADE DELETE
- `title` STRING
- `created_at` DATETIME
- `updated_at` DATETIME
- INDEX: `idx_chat_sessions_user_id` ON `user_id` ← Faz 4'te eklenecek

**chat_messages tablosu** (mevcut)
- `id` STRING PK (UUID)
- `session_id` STRING FK → chat_sessions.id CASCADE DELETE
- `role` STRING ("user" | "lunia")
- `content` TEXT
- `created_at` DATETIME
- INDEX: `idx_chat_messages_session_id` ON `session_id` ← Faz 4'te eklenecek

## Components and Interfaces

### Faz 1: Backend — `/api/v1/auth/me` Uç Noktası

**Dosya:** `backend/app/api/auth_routes.py`

Mevcut `auth_routes.py` dosyasına `get_current_user` bağımlılığı kullanılarak yeni bir `GET /me` endpoint'i eklenir.

```python
# Yeni şema — schemas.py'e eklenecek
class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role_level: int
    is_active: bool
    class Config:
        from_attributes = True

# auth_routes.py'e eklenecek endpoint
@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

### Faz 1: Frontend — Oturum Senkronizasyonu

**Dosya:** `frontend/src/app/(chat)/chat/page.tsx` (veya mevcut chat sayfası)

`useSearchParams()` hook'u ile URL'deki `?session=` parametresi okunur ve `useEffect` ile state senkronize edilir. Sidebar'da oturum seçildiğinde `router.push` ile URL güncellenir.

```typescript
// Temel pattern
const searchParams = useSearchParams();
const sessionId = searchParams.get('session');

useEffect(() => {
  if (sessionId) {
    setActiveSession(sessionId);
    fetchMessages(sessionId);
  }
}, [sessionId]);
```

### Faz 1: Frontend — Chat UI Bileşenleri

**Yeni bileşen:** `frontend/components/chat/MessageBubble.tsx`

```typescript
// Kullanıcı mesajı: sağa hizalı, indigo arka plan
// Lunia mesajı: sola hizalı, koyu gri arka plan, react-markdown ile render
interface MessageBubbleProps {
  role: 'user' | 'lunia';
  content: string;
  createdAt: Date;
}
```

**Yeni bileşen:** `frontend/components/chat/ThinkingIndicator.tsx`

Üç nokta animasyonu (`animate-bounce`) ile "Lunia düşünüyor..." göstergesi. Mesaj listesinin en altına `useRef` + `scrollIntoView` ile sabitlenir.

**Paket:** `react-markdown` + `remark-gfm` kurulacak.

### Faz 1: Frontend — Sidebar

**Dosya:** `frontend/components/chat/Sidebar.tsx` (mevcut veya yeni)

- Sayfa yüklendiğinde `GET /api/v1/chat/sessions` çağrısı
- Yeni oturum oluşturulduğunda optimistic update ile listeye ekleme
- Oturum silindiğinde listeden kaldırma ve boş ekran gösterme

### Faz 2: Backend — Veri Dışa Aktarma

**Dosya:** `backend/app/api/routes.py`

```python
@router.get("/export")
async def export_chat_history(
    format: str = "json",  # "json" veya "txt"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Kullanıcının tüm session ve mesajlarını çek
    # format="json" → JSONResponse + Content-Disposition: attachment
    # format="txt"  → PlainTextResponse + Content-Disposition: attachment
```

### Faz 2: Backend — Hesap Silme

**Dosya:** `backend/app/api/auth_routes.py`

```python
class DeleteAccountRequest(BaseModel):
    password: str

@router.delete("/account")
async def delete_account(
    data: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Şifre doğrula
    # 2. Transaction içinde: ChatMessage → ChatSession → User sil
    # 3. 200 OK döndür
```

Cascade silme zaten ORM seviyesinde tanımlı (`ondelete="CASCADE"`). Ek güvence için explicit transaction kullanılır.

### Faz 2: Frontend — Tema Motoru

**Yeni dosya:** `frontend/src/context/ThemeContext.tsx`

```typescript
type Theme = 'dark' | 'light';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
```

`tailwind.config.ts`'de `darkMode: 'class'` aktif edilir. `<html>` elementine `dark` class'ı eklenir/kaldırılır. Tercih `localStorage['lunia-theme']` anahtarında saklanır.

**Renk paleti:**
- Koyu (Derin İndigo): `#1e1b4b` (indigo-950), `#312e81` (indigo-900)
- Aydınlık: `#f8fafc` (slate-50), `#ffffff`

### Faz 3: Frontend — Admin Middleware

**Dosya:** `frontend/src/middleware.ts`

```typescript
// Next.js Edge Middleware
// 1. Cookie'den JWT token oku
// 2. jose kütüphanesi ile decode et (edge runtime uyumlu)
// 3. role_level < 5 → /chat'e redirect
// 4. Token yok → /login'e redirect
export const config = {
  matcher: ['/admin/:path*']
};
```

**Not:** Edge runtime'da `jwt-decode` çalışır ancak doğrulama yapmaz. Güvenlik için backend double-check zorunludur.

### Faz 3: Backend — Admin Uç Noktaları

**Dosya:** `backend/app/api/admin_routes.py` (genişletilecek)

Mevcut stub'lar gerçek implementasyonla doldurulur:

| Endpoint | Method | Açıklama | Min. role_level |
|---|---|---|---|
| `/api/v1/admin/users` | GET | Tüm kullanıcıları listele | 5 |
| `/api/v1/admin/ban-user` | POST | Kullanıcıyı askıya al | 3 |
| `/api/v1/admin/metrics` | GET | Sistem metrikleri | 5 |
| `/api/v1/admin/activity-feed` | GET | Son 100 log olayı | 5 |

### Faz 3: Frontend — Admin Dashboard Bileşenleri

**Yeni dosyalar:**
- `frontend/src/app/admin/page.tsx` — Ana dashboard
- `frontend/components/admin/UserDataGrid.tsx` — Kullanıcı tablosu
- `frontend/components/admin/MetricsCharts.tsx` — Recharts grafikleri
- `frontend/components/admin/ActivityFeed.tsx` — 30s auto-refresh log akışı

**Paket:** `recharts` kurulacak.

### Faz 4: Backend — CORS Sıkılaştırma

**Dosya:** `backend/app/main.py`

```python
import os
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

### Faz 4: Veritabanı — Alembic Migration

**Yeni dosya:** `backend/alembic/versions/xxxx_add_performance_indexes.py`

```python
def upgrade():
    op.create_index('idx_chat_messages_session_id', 'chat_messages', ['session_id'])
    op.create_index('idx_chat_sessions_user_id', 'chat_sessions', ['user_id'])

def downgrade():
    op.drop_index('idx_chat_messages_session_id', 'chat_messages')
    op.drop_index('idx_chat_sessions_user_id', 'chat_sessions')
```

### Faz 4: Frontend — Error Boundary

**Yeni dosya:** `frontend/components/ErrorBoundary.tsx`

React class component olarak implement edilir (hooks Error Boundary desteklemez).

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State
  componentDidCatch(error: Error, info: React.ErrorInfo): void
  render(): React.ReactNode
}
```

`/chat` ve `/admin` layout dosyalarına sarılır.

## Data Flow

### Mesaj Gönderme Akışı

```
Kullanıcı mesaj yazar
    → Frontend: isLoading=true, "Lunia düşünüyor..." göster
    → POST /api/v1/chat/ {message, session_id}
    → Backend: mesajı kaydet → LLM çağır → yanıtı kaydet
    → Frontend: isLoading=false, yanıtı listeye ekle, scroll-to-bottom
```

### Oturum Senkronizasyon Akışı

```
URL: /chat?session=abc123
    → useSearchParams() → sessionId = "abc123"
    → useEffect: fetchMessages("abc123")
    → GET /api/v1/chat/sessions/abc123/messages
    → Backend: ownership kontrolü → mesajları döndür
    → Frontend: mesaj listesini güncelle
```

### Tema Geçiş Akışı

```
Kullanıcı tema butonuna tıklar
    → ThemeContext.toggleTheme()
    → localStorage['lunia-theme'] = yeni tema
    → document.documentElement.classList.toggle('dark')
    → Tüm Tailwind dark: sınıfları aktif/pasif olur
```

### Admin Erişim Akışı

```
Kullanıcı /admin'e gider
    → middleware.ts devreye girer
    → Cookie'den token oku → decode et
    → role_level < 5 → /chat'e redirect
    → role_level = 5 → sayfayı render et
    → Backend API çağrılarında da role_level >= 5 kontrolü
```

## Error Handling

- **Backend:** Tüm uç noktalarda `try/except` ile `HTTPException` fırlatılır. Beklenmedik hatalar `500` döndürür ve `logger` ile kaydedilir.
- **Frontend:** `axios` interceptor ile `401` yanıtlarında otomatik logout. `ErrorBoundary` ile render hataları yakalanır. Her API çağrısında `try/catch` ile kullanıcıya toast/inline hata mesajı gösterilir.
- **Cascade Silme:** SQLAlchemy `ondelete="CASCADE"` + explicit transaction. Herhangi bir adım başarısız olursa `db.rollback()` çağrılır.

## Security Considerations

- **JWT:** Token yalnızca `httpOnly` cookie veya `Authorization: Bearer` header ile taşınır. `localStorage`'da saklanmaz.
- **Admin Güvenlik:** Frontend middleware sadece UX katmanıdır; gerçek güvenlik backend'deki `role_level` kontrolündedir.
- **Hesap Silme:** Şifre doğrulaması backend'de `verify_password()` ile yapılır; frontend sadece şifreyi iletir.
- **CORS:** `ALLOWED_ORIGINS` env var ile yönetilir; wildcard `*` kullanılmaz.
- **Rate Limiting:** Mevcut `slowapi` limiter chat endpoint'inde aktif; export ve delete endpoint'lerine de uygulanacak.

## Data Models

### UserOut (Yeni Pydantic Şeması)
```python
class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role_level: int
    is_active: bool
    class Config:
        from_attributes = True
```

### DeleteAccountRequest (Yeni Pydantic Şeması)
```python
class DeleteAccountRequest(BaseModel):
    password: str
```

### ExportFormat (Enum)
```python
# "json" veya "txt" — query param olarak alınır
```

### AdminUserOut (Yeni Pydantic Şeması)
```python
class AdminUserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role_level: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True
```

### MetricsOut (Yeni Pydantic Şeması)
```python
class MetricsOut(BaseModel):
    daily_active_users: List[dict]  # [{"date": "2026-05-18", "count": 42}]
    total_messages: int
    error_rate: float
```

### ActivityEventOut (Yeni Pydantic Şeması)
```python
class ActivityEventOut(BaseModel):
    timestamp: str
    event_type: str   # "login" | "llm_error" | "llm_request"
    user_email: Optional[str]
    detail: Optional[str]
```

### ThemeContext (TypeScript)
```typescript
type Theme = 'dark' | 'light';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
```

### MessageBubble Props (TypeScript)
```typescript
interface MessageBubbleProps {
  role: 'user' | 'lunia';
  content: string;
  createdAt: Date;
}
```

## Correctness Properties

### Property 1: Kimlik Doğrulama Zorunluluğu
`/me`, `/export`, `/account` (DELETE) uç noktaları `get_current_user` bağımlılığı olmadan erişilemez olmalıdır. Geçersiz veya eksik token durumunda `401 Unauthorized` döndürülmelidir.

**Validates: Requirements 1.3, 1.4, 6.5, 7.6**

### Property 2: Yetki İzolasyonu
Bir kullanıcı başka bir kullanıcının sohbet geçmişini ne okuyabilmeli ne de dışa aktarabilmelidir. `user_id` filtresi her sorguda zorunludur; ihlal durumunda `404 Not Found` döndürülmelidir.

**Validates: Requirements 2.4, 6.5**

### Property 3: Cascade Bütünlüğü
Kullanıcı silindiğinde veritabanında `chat_sessions` veya `chat_messages` tablosunda yetim kayıt kalmamalıdır. Silme işlemi atomik transaction içinde gerçekleşmelidir.

**Validates: Requirements 7.8**

### Property 4: Admin Çift Kontrol
Frontend middleware yalnızca UX katmanıdır; backend her admin endpoint'inde bağımsız `role_level` kontrolü yapmalıdır. Yetersiz yetki durumunda `403 Forbidden` döndürülmelidir.

**Validates: Requirements 9.5, 9.6, 10.7, 11.8, 12.7**

### Property 5: CORS Sızdırmazlığı
`ALLOWED_ORIGINS` listesi dışındaki origin'lerden gelen istekler reddedilmelidir. Wildcard `*` kullanılmamalıdır.

**Validates: Requirements 13.1, 13.2, 13.3**

### Property 6: Tema Kalıcılığı
`localStorage` erişimi başarısız olsa bile uygulama varsayılan temada (koyu) çalışmaya devam etmelidir.

**Validates: Requirements 8.2, 8.3, 8.4**

### Property 7: Error Boundary Kapsamı
`/chat` ve `/admin` rotalarındaki render hataları hiçbir zaman beyaz ekrana yol açmamalıdır. Error Boundary her iki rotada da aktif olmalıdır.

**Validates: Requirements 15.1, 15.2, 15.5**

## Testing Strategy

### Backend (Manuel / Swagger UI)
- `GET /api/v1/auth/me`: Geçerli token → 200 + kullanıcı verisi; geçersiz token → 401
- `DELETE /api/v1/auth/account`: Doğru şifre → 200 + cascade silme; yanlış şifre → 401
- `GET /api/v1/chat/export?format=json`: Geçerli token → 200 + JSON dosyası
- `GET /api/v1/chat/export?format=txt`: Geçerli token → 200 + TXT dosyası
- `GET /api/v1/admin/users`: role_level=5 → 200; role_level=1 → 403
- `POST /api/v1/admin/ban-user`: role_level=3 → 200; role_level=1 → 403

### Frontend (Manuel Tarayıcı Testi)
- URL'ye `?session=<geçerli_id>` yazıldığında doğru sohbet yüklenmeli
- URL'ye `?session=<başka_kullanıcının_id>` yazıldığında hata mesajı gösterilmeli
- Tema geçiş butonu: koyu ↔ aydınlık geçişi; sayfa yenilendiğinde tercih korunmalı
- `/admin` rotasına role_level=1 kullanıcıyla gidildiğinde `/chat`'e yönlendirilmeli
- Kasıtlı hata fırlatıldığında Error Boundary devreye girmeli

### Veritabanı
- Alembic migration uygulandıktan sonra `\d chat_messages` ile `idx_chat_messages_session_id` indeksinin varlığı doğrulanmalı
- Kullanıcı silindiğinde ilgili `chat_sessions` ve `chat_messages` kayıtlarının silindiği kontrol edilmeli
