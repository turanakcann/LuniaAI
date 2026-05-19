# Implementation Plan: LuniaAI Platform Enhancement

## Overview

Bu plan, LuniaAI platformunun 4 fazlı geliştirme yol haritasını kapsar. Her görev mevcut FastAPI + Supabase backend'i ve Next.js + TypeScript frontend'i üzerine inşa edilir. Görevler birbirinin üzerine katman katman eklenir; hiçbir kod parçası entegre edilmeden bırakılmaz.

## Tasks

## Faz 1: Çekirdek Sistemin Sağlamlaştırılması

- [x] 1. `/api/v1/auth/me` uç noktasını ekle
  - [x] 1.1 `UserOut` Pydantic şemasını ve `/me` endpoint'ini implement et
    - `backend/app/models/schemas.py` dosyasına `UserOut` şemasını ekle (`id`, `email`, `full_name`, `role_level`, `is_active`)
    - `backend/app/api/auth_routes.py` dosyasına `GET /me` endpoint'ini ekle, `get_current_user` bağımlılığını kullan
    - `deps.py`'den `get_current_user` import'unu `auth_routes.py`'e ekle
    - _Requirements: 1.1, 1.2, 1.5_
  - [ ]* 1.2 Property testi yaz: Kimlik doğrulama zorunluluğu
    - **Property 1: Kimlik Doğrulama Zorunluluğu** — geçersiz/eksik token ile `/me` isteği `401` döndürmeli
    - **Validates: Requirements 1.3, 1.4**

- [x] 2. Frontend-Backend oturum senkronizasyonunu kur
  - [x] 2.1 URL parametresi ile oturum senkronizasyonunu implement et
    - Chat sayfasında `useSearchParams()` ile `?session=` parametresini oku
    - `useEffect` ile `sessionId` değiştiğinde `fetchMessages()` tetikle
    - Sidebar'da oturum seçildiğinde `router.push('/chat?session=...')` ile URL güncelle
    - Mesaj yüklenirken skeleton/spinner göster, hata durumunda inline hata mesajı göster
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  - [ ]* 2.2 Property testi yaz: Yetki izolasyonu
    - **Property 2: Yetki İzolasyonu** — başka kullanıcının `session_id`'si ile istek `404` döndürmeli
    - **Validates: Requirements 2.4**

- [x] 3. Chat arayüzü bileşenlerini oluştur ve optimize et
  - [x] 3.1 `MessageBubble` ve `ThinkingIndicator` bileşenlerini implement et
    - `react-markdown` ve `remark-gfm` paketlerini kur: `npm install react-markdown remark-gfm` (`frontend/` dizininde)
    - `frontend/components/chat/MessageBubble.tsx` bileşenini oluştur: kullanıcı mesajları sağa/indigo, Lunia mesajları sola/koyu gri, Lunia içeriği `react-markdown` ile render
    - `frontend/components/chat/ThinkingIndicator.tsx` bileşenini oluştur: "Lunia düşünüyor..." + `animate-bounce` animasyonu
    - Chat sayfasında `isLoading` state'i ekle; mesaj gönderildiğinde `true`, yanıt alındığında `false` yap
    - Mesaj listesinin sonuna `useRef` + `scrollIntoView` ile otomatik kaydırma ekle
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 4. Sidebar dinamikliğini ve geçmiş sohbet yüklemeyi implement et
  - [x] 4.1 Sidebar oturum listesi ve dinamik güncellemeyi implement et
    - Chat sayfası mount'ta `GET /api/v1/chat/sessions` çağır, oturumları Sidebar'a yükle
    - Yeni oturum oluşturulduğunda Sidebar listesini optimistic update ile güncelle
    - Oturum silindiğinde listeden kaldır ve boş sohbet ekranı göster
    - API hatası durumunda "Sohbet geçmişi yüklenemedi" hata mesajı göster
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 5. Checkpoint — Faz 1 tamamlandı
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

## Faz 2: Kullanıcı Deneyimi ve Veri Yönetimi

- [x] 6. Gelişmiş Ayarlar Modalını implement et
  - [x] 6.1 Ayarlar Modalı'nda `/me` entegrasyonunu implement et
    - Ayarlar modalı açıldığında `GET /api/v1/auth/me` çağır
    - `full_name`, `email`, `role_level` değerlerini göster; `role_level` sayısal değerini okunabilir etikete çevir (1→"Kullanıcı", 2→"Analist", 3→"Moderatör", 4→"Admin", 5→"SuperAdmin")
    - Yükleme sırasında spinner, hata durumunda "Hesap bilgileri yüklenemedi" mesajı göster
    - `full_name` null ise "İsimsiz Kullanıcı" fallback'i göster
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Veri dışa aktarma (Data Export) API'sini ve frontend entegrasyonunu yaz
  - [x] 7.1 Export endpoint'ini implement et
    - `backend/app/api/routes.py` dosyasına `GET /export` endpoint'i ekle
    - `format=json` parametresi için `JSONResponse` + `Content-Disposition: attachment; filename="lunia-export.json"` döndür
    - `format=txt` parametresi için `PlainTextResponse` + `Content-Disposition: attachment; filename="lunia-export.txt"` döndür
    - Geçersiz format parametresi için `400 Bad Request` döndür
    - Boş geçmiş durumunda boş veri yapısı içeren geçerli dosya döndür
    - Frontend Ayarlar Modalı'na "Verilerimi İndir" butonu ve format seçimi ekle
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - [ ]* 7.2 Property testi yaz: Kimlik doğrulama zorunluluğu (export)
    - **Property 1: Kimlik Doğrulama Zorunluluğu** — geçersiz/eksik token ile `/export` isteği `401` döndürmeli
    - **Validates: Requirements 6.5**
  - [ ]* 7.3 Property testi yaz: Yetki izolasyonu (export)
    - **Property 2: Yetki İzolasyonu** — export yanıtı yalnızca isteği yapan kullanıcıya ait verileri içermeli
    - **Validates: Requirements 6.5**

- [x] 8. Hesap silme onay modalı ve cascade silme implement et
  - [x] 8.1 `DELETE /account` backend endpoint'ini implement et
    - `backend/app/api/auth_routes.py` dosyasına `DELETE /account` endpoint'i ekle
    - `DeleteAccountRequest` Pydantic şemasını `schemas.py`'e ekle (`password: str`)
    - Backend'de şifre doğrula (`verify_password`), başarısızsa `401` döndür
    - Başarılıysa transaction içinde ChatMessage → ChatSession → User sırasıyla sil; hata olursa `db.rollback()`
    - _Requirements: 7.4, 7.5, 7.6, 7.7, 7.8_
  - [x] 8.2 Hesap silme onay modalını frontend'de implement et
    - Frontend'de "Hesabı Sil" butonuna tıklandığında şifre girişi gerektiren onay modalı aç
    - Modalda "Bu işlem geri alınamaz" uyarısını belirgin göster
    - Onay verildiğinde `DELETE /api/v1/auth/account` endpoint'ine `{password}` ile istek gönder
    - Silme tamamlandığında frontend'de token temizle ve `/login`'e yönlendir
    - _Requirements: 7.1, 7.2, 7.3, 7.9_
  - [ ]* 8.3 Property testi yaz: Kimlik doğrulama zorunluluğu (account delete)
    - **Property 1: Kimlik Doğrulama Zorunluluğu** — geçersiz/eksik token ile `/account` DELETE isteği `401` döndürmeli
    - **Validates: Requirements 7.6**
  - [ ]* 8.4 Property testi yaz: Cascade bütünlüğü
    - **Property 3: Cascade Bütünlüğü** — kullanıcı silindiğinde `chat_sessions` ve `chat_messages` tablolarında yetim kayıt kalmamalı
    - **Validates: Requirements 7.8**

- [~] 9. Tema motorunu (koyu/aydınlık mod) kur
  - [x] 9.1 `ThemeContext` ve `ThemeProvider`'ı implement et
    - `frontend/next.config.ts` veya `tailwind.config.ts` dosyasında `darkMode: 'class'` aktif et
    - `frontend/src/context/ThemeContext.tsx` dosyasını oluştur: `ThemeContext`, `ThemeProvider`, `useTheme` hook
    - `ThemeProvider`'ı `frontend/src/app/layout.tsx` dosyasında uygulamaya sar
    - Sayfa yüklendiğinde `localStorage['lunia-theme']` oku ve `<html>` elementine `dark`/`light` class uygula
    - Tema geçiş butonunu chat ve admin sayfalarına ekle
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  - [ ]* 9.2 Property testi yaz: Tema kalıcılığı
    - **Property 6: Tema Kalıcılığı** — `localStorage` erişimi başarısız olsa bile uygulama varsayılan temada (koyu) çalışmaya devam etmeli
    - **Validates: Requirements 8.2, 8.3, 8.4**

- [x] 10. Checkpoint — Faz 2 tamamlandı
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

## Faz 3: Kurumsal Admin Paneli

- [x] 11. Admin güvenlik duvarını (middleware) kur
  - [x] 11.1 Next.js `middleware.ts` ve backend admin yetki kontrolünü implement et
    - `frontend/src/middleware.ts` dosyasını oluştur
    - `/admin` rotasını `matcher` ile hedefle
    - Cookie'den JWT token oku, `jwt-decode` ile decode et (edge runtime uyumlu)
    - `role_level < 5` → `/chat`'e redirect; token yok → `/login`'e redirect
    - `backend/app/api/admin_routes.py` dosyasındaki tüm endpoint'lere `role_level >= 5` kontrolü ekle; yetersiz yetki için `403 Forbidden` döndür
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  - [ ]* 11.2 Property testi yaz: Admin çift kontrol
    - **Property 4: Admin Çift Kontrol** — `role_level < 5` olan kullanıcı admin endpoint'ine istek gönderdiğinde `403` döndürmeli
    - **Validates: Requirements 9.5, 9.6**

- [x] 12. Admin metrik endpoint'lerini ve grafik bileşenlerini implement et
  - [x] 12.1 `GET /admin/metrics` endpoint'ini implement et
    - `backend/app/api/admin_routes.py` dosyasına `GET /admin/metrics` endpoint'i ekle: günlük aktif kullanıcı, toplam mesaj sayısı, hata oranı
    - `MetricsOut` Pydantic şemasını `schemas.py`'e ekle
    - _Requirements: 10.1, 10.2, 10.7_
  - [x] 12.2 Metrik grafik bileşenlerini ve admin sayfasını implement et
    - Frontend'e `recharts` paketini kur: `npm install recharts` (`frontend/` dizininde)
    - `frontend/components/admin/MetricsCharts.tsx` bileşenini oluştur: aktif kullanıcı için `LineChart`, mesaj sayısı için `BarChart`
    - `frontend/src/app/admin/page.tsx` dosyasını oluştur ve MetricsCharts bileşenini entegre et
    - API hatası durumunda "Metrikler yüklenemedi" hata mesajı göster
    - _Requirements: 10.3, 10.4, 10.5, 10.6_
  - [ ]* 12.3 Property testi yaz: Admin çift kontrol (metrics)
    - **Property 4: Admin Çift Kontrol** — `role_level < 5` olan kullanıcı `/admin/metrics` isteği gönderdiğinde `403` döndürmeli
    - **Validates: Requirements 10.7**

- [x] 13. Kullanıcı yönetim tablosunu (DataGrid) implement et
  - [x] 13.1 `GET /admin/users` ve `POST /admin/ban-user` endpoint'lerini implement et
    - `backend/app/api/admin_routes.py` dosyasına `GET /admin/users` endpoint'i ekle: tüm kullanıcıları `id`, `email`, `full_name`, `role_level`, `is_active`, `created_at` alanlarıyla döndür
    - `AdminUserOut` Pydantic şemasını `schemas.py`'e ekle
    - `POST /admin/ban-user` endpoint'ini gerçek implementasyonla doldur: `user_id` al, `is_active=False` yap; `role_level >= 3` kontrolü ekle
    - _Requirements: 11.1, 11.2, 11.6, 11.8_
  - [x] 13.2 `UserDataGrid` bileşenini implement et
    - `frontend/components/admin/UserDataGrid.tsx` bileşenini oluştur: kullanıcı tablosu, her satırda "Askıya Al" / "Aktif Et" butonları
    - Ban/unban işlemi tamamlandığında ilgili satırı güncelle
    - Admin dashboard'a UserDataGrid bileşenini entegre et
    - _Requirements: 11.3, 11.4, 11.5, 11.7_
  - [ ]* 13.3 Property testi yaz: Admin çift kontrol (users)
    - **Property 4: Admin Çift Kontrol** — `role_level < 5` olan kullanıcı `/admin/users` isteği gönderdiğinde `403` döndürmeli
    - **Validates: Requirements 11.8**

- [x] 14. Sistem logları ve aktivite akışını implement et
  - [x] 14.1 Log altyapısını ve `GET /admin/activity-feed` endpoint'ini implement et
    - `backend/app/api/auth_routes.py` login endpoint'ine başarılı giriş logu ekle (`logger.info`)
    - `backend/app/services/llm_router.py` dosyasına LLM hata logu ekle (`logger.error`)
    - `backend/app/api/admin_routes.py` dosyasına `GET /admin/activity-feed` endpoint'i ekle: log dosyasından son 100 olayı parse edip döndür
    - `ActivityEventOut` Pydantic şemasını `schemas.py`'e ekle
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.7_
  - [x] 14.2 `ActivityFeed` bileşenini implement et ve admin dashboard'a entegre et
    - `frontend/components/admin/ActivityFeed.tsx` bileşenini oluştur: 30 saniyede bir `setInterval` ile yenile, her olayı zaman damgası + tür + kullanıcı ile listele
    - Admin dashboard'a ActivityFeed bileşenini entegre et
    - _Requirements: 12.5, 12.6_
  - [ ]* 14.3 Property testi yaz: Admin çift kontrol (activity-feed)
    - **Property 4: Admin Çift Kontrol** — `role_level < 5` olan kullanıcı `/admin/activity-feed` isteği gönderdiğinde `403` döndürmeli
    - **Validates: Requirements 12.7**

- [x] 15. Checkpoint — Faz 3 tamamlandı
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

## Faz 4: Güvenlik, Performans ve Optimizasyon

- [x] 16. CORS politikalarını sıkılaştır
  - [x] 16.1 CORS yapılandırmasını env-tabanlı hale getir
    - `backend/.env` dosyasına `ALLOWED_ORIGINS=http://localhost:3000` satırını ekle
    - `backend/app/main.py` dosyasında `allow_origins` değerini `os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")` ile değiştir
    - `allow_methods` değerini `["*"]`'dan `["GET", "POST", "PUT", "DELETE", "OPTIONS"]`'a daralt
    - _Requirements: 13.1, 13.2, 13.4, 13.5_
  - [ ]* 16.2 Property testi yaz: CORS sızdırmazlığı
    - **Property 5: CORS Sızdırmazlığı** — `ALLOWED_ORIGINS` listesi dışındaki origin'lerden gelen istekler reddedilmeli; wildcard `*` kullanılmamalı
    - **Validates: Requirements 13.1, 13.2, 13.3**

- [x] 17. Veritabanı performans indekslerini ekle
  - [x] 17.1 Alembic migration ile performans indekslerini ekle
    - `backend/alembic/versions/` klasöründe yeni migration dosyası oluştur: `xxxx_add_performance_indexes.py`
    - `upgrade()`: `chat_messages.session_id` sütununa `idx_chat_messages_session_id` indeksi ekle; `chat_sessions.user_id` sütununa `idx_chat_sessions_user_id` indeksi ekle
    - `downgrade()` fonksiyonuna indeks silme işlemlerini ekle
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 18. React Error Boundary bileşenini oluştur ve uygula
  - [x] 18.1 `ErrorBoundary` bileşenini implement et ve rotalara uygula
    - `frontend/components/ErrorBoundary.tsx` dosyasını oluştur: React class component, `getDerivedStateFromError` ve `componentDidCatch` metodları
    - Hata arayüzünde "Bir şeyler ters gitti" mesajı, "Sayfayı Yenile" ve "Ana Sayfaya Dön" butonları göster
    - `componentDidCatch` içinde `console.error` ile hatayı kaydet
    - `frontend/src/app/(dashboard)/layout.tsx` ve `frontend/src/app/admin/layout.tsx` dosyalarında sayfaları `ErrorBoundary` ile sar
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  - [ ]* 18.2 Property testi yaz: Error Boundary kapsamı
    - **Property 7: Error Boundary Kapsamı** — `/chat` ve `/admin` rotalarındaki render hataları hiçbir zaman beyaz ekrana yol açmamalı
    - **Validates: Requirements 15.1, 15.2, 15.5**

- [x] 19. Final Checkpoint — Tüm fazlar tamamlandı
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

## Notes

- Görevler `*` ile işaretlenmiş sub-task'lar opsiyoneldir ve daha hızlı MVP için atlanabilir.
- Her görev belirli gereksinimlere referans verir (traceability için).
- Checkpoint görevleri artımlı doğrulama sağlar.
- Property testleri evrensel doğruluk özelliklerini, unit testler ise belirli örnekleri ve edge case'leri doğrular.
- Görev 3.1'de `react-markdown` kurulumu `npm install react-markdown remark-gfm` komutuyla yapılır; `frontend/` dizininde çalıştırılmalıdır.
- Görev 12.2'de `recharts` kurulumu `npm install recharts` komutuyla yapılır.
- Görev 11.1'de Next.js Edge Runtime için `jwt-decode` kütüphanesi kullanılır (zaten yüklü); güvenlik için backend double-check zorunludur.
- Görev 17.1'deki Alembic migration'ı `alembic upgrade head` komutuyla uygulanır; `backend/` dizininde çalıştırılmalıdır.
- Görev 14.1'deki aktivite akışı log dosyasını (`lunia_backend.log`) parse eder; production'da yapılandırılmış log formatı (JSON) tercih edilmelidir.
- Tüm backend değişikliklerinde `backend/venv` aktif olmalıdır.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "9.1", "16.1", "17.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "6.1", "8.1", "9.2", "16.2"] },
    { "id": 2, "tasks": ["3.1", "7.1", "8.2", "11.1"] },
    { "id": 3, "tasks": ["2.2", "4.1", "7.2", "7.3", "8.3", "8.4", "11.2", "12.1"] },
    { "id": 4, "tasks": ["12.2", "13.1", "14.1", "18.1"] },
    { "id": 5, "tasks": ["12.3", "13.2", "14.2", "18.2"] },
    { "id": 6, "tasks": ["13.3", "14.3"] }
  ]
}
```
