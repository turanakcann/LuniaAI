# Requirements Document

## Introduction

Bu belge, LuniaAI yapay zeka sohbet platformunun dört fazlı kapsamlı geliştirme planını kapsamaktadır. Proje; FastAPI + Supabase + Alembic tabanlı bir backend, Next.js + TypeScript + Tailwind CSS tabanlı bir frontend ve Docker Compose ile containerize edilmiş bir altyapı üzerine inşa edilmiştir.

Geliştirme planı şu dört fazı kapsar:
- **Faz 1:** Çekirdek sistemin sağlamlaştırılması (hata giderme ve UI iyileştirmeleri)
- **Faz 2:** Kullanıcı deneyimi ve veri yönetimi (KVKK/GDPR standartları)
- **Faz 3:** Kurumsal admin paneli
- **Faz 4:** Güvenlik, performans ve optimizasyon

## Requirements

### Requirement 1: `/api/v1/auth/me` Uç Noktasının Eklenmesi

**User Story:** Bir geliştirici olarak, frontend'in oturum açmış kullanıcının bilgilerini backend'den çekebilmesi için kalıcı ve test edilmiş bir `/me` uç noktasına ihtiyaç duyuyorum; böylece kullanıcı profili ve yetki seviyesi her zaman güncel kalır.

#### Acceptance Criteria

1. THE Auth_Router SHALL `/api/v1/auth/me` adresinde bir `GET` uç noktası sunmak.
2. WHEN geçerli bir JWT_Token ile `/api/v1/auth/me` isteği yapıldığında, THE Auth_Router SHALL kullanıcının `id`, `email`, `full_name`, `role_level` ve `is_active` alanlarını içeren bir JSON yanıtı döndürmek.
3. WHEN geçersiz veya süresi dolmuş bir JWT_Token ile `/api/v1/auth/me` isteği yapıldığında, THE Auth_Router SHALL `401 Unauthorized` HTTP durum kodu ile yanıt vermek.
4. WHEN token içinde `sub` alanı eksik olduğunda, THE Auth_Router SHALL `401 Unauthorized` HTTP durum kodu ile yanıt vermek.
5. THE Auth_Router SHALL `/me` uç noktasını `get_current_user` bağımlılığını kullanarak korumak.

### Requirement 2: Frontend-Backend Oturum Senkronizasyonu

**User Story:** Bir kullanıcı olarak, URL'deki `?session=...` parametresi ile Chat_Sayfası'nın React state'inin her zaman senkronize çalışmasını istiyorum; böylece sayfa yenilendiğinde veya doğrudan bir oturum URL'sine gidildiğinde doğru sohbet yüklenir.

#### Acceptance Criteria

1. WHEN Chat_Sayfası `?session={session_id}` parametresi içeren bir URL ile yüklendiğinde, THE Frontend SHALL ilgili `session_id` değerini aktif oturum olarak state'e atamak.
2. WHEN kullanıcı Sidebar'dan bir sohbete tıkladığında, THE Frontend SHALL aktif oturum state'ini seçilen `session_id` ile eş zamanlı olarak güncellemek ve URL'yi `?session={session_id}` parametresiyle değiştirmek.
3. WHEN `session_id` URL parametresi değiştiğinde, THE Frontend SHALL `GET /api/v1/chat/sessions/{session_id}/messages` uç noktasını çağırarak mesaj listesini yenilemek.
4. IF URL'deki `session_id` mevcut kullanıcıya ait değilse, THEN THE Backend SHALL `404 Not Found` durum kodu ile yanıt vermek.
5. WHILE mesaj geçmişi yükleniyorken, THE Frontend SHALL bir yükleme göstergesi (skeleton veya spinner) göstermek.

### Requirement 3: Chat Arayüzü Optimizasyonu

**User Story:** Bir kullanıcı olarak, mesajların görsel olarak net biçimde ayrışmasını, Lunia'nın yanıtlarındaki markdown içeriğinin düzgün render edilmesini ve yanıt beklerken pürüzsüz bir yükleme animasyonu görmek istiyorum; böylece sohbet deneyimi akıcı ve okunabilir olur.

#### Acceptance Criteria

1. THE Frontend SHALL kullanıcı mesajlarını sağa hizalanmış, Lunia mesajlarını sola hizalanmış baloncuk (bubble) tasarımıyla göstermek.
2. THE Frontend SHALL kullanıcı ve Lunia mesaj balonlarını birbirinden ayırt edilebilir arka plan renkleriyle stilize etmek.
3. WHEN Lunia'nın yanıtı kalın metin, italik metin, başlık veya kod bloğu içerdiğinde, THE Markdown_Parser SHALL bu içeriği HTML olarak doğru biçimde render etmek.
4. THE Frontend SHALL `react-markdown` kütüphanesini Markdown_Parser olarak kullanmak.
5. WHEN bir mesaj gönderildiğinde ve yanıt bekleniyor olduğunda, THE Frontend SHALL "Lunia düşünüyor..." metnini içeren bir animasyonlu yükleme göstergesi görüntülemek.
6. WHEN Lunia'nın yanıtı alındığında, THE Frontend SHALL yükleme göstergesini kaldırarak yanıtı mesaj listesine eklemek.
7. THE Frontend SHALL yükleme animasyonunu mesaj listesinin en altına sabitleyerek, kullanıcının yukarı kaydırmasını engellemeden akıcı biçimde göstermek.

### Requirement 4: Sidebar Dinamikliği ve Geçmiş Sohbet Yükleme

**User Story:** Bir kullanıcı olarak, sol panelde geçmiş sohbetlerimin anlık olarak listelenmesini ve seçtiğim sohbete tıkladığımda eski mesajların hatasız yüklenmesini istiyorum; böylece önceki konuşmalarıma kolayca erişebilirim.

#### Acceptance Criteria

1. WHEN Chat_Sayfası yüklendiğinde, THE Frontend SHALL `GET /api/v1/chat/sessions` uç noktasını çağırarak kullanıcının tüm sohbet oturumlarını Sidebar'a yüklemek.
2. WHEN yeni bir sohbet oturumu oluşturulduğunda, THE Frontend SHALL Sidebar listesini yeni oturumu içerecek şekilde güncellemek.
3. WHEN kullanıcı Sidebar'da bir oturuma tıkladığında, THE Frontend SHALL `GET /api/v1/chat/sessions/{session_id}/messages` uç noktasını çağırarak mesajları kronolojik sırada görüntülemek.
4. IF `GET /api/v1/chat/sessions` isteği başarısız olursa, THEN THE Frontend SHALL kullanıcıya "Sohbet geçmişi yüklenemedi" hata mesajını göstermek.
5. THE Chat_Router SHALL oturumları `updated_at` alanına göre azalan sırada (en yeni en üstte) döndürmek.
6. WHEN bir sohbet oturumu silindiğinde, THE Frontend SHALL Sidebar listesinden ilgili oturumu kaldırmak ve boş bir sohbet ekranı göstermek.

### Requirement 5: Gelişmiş Ayarlar Modalı

**User Story:** Bir kullanıcı olarak, Ayarlar_Modalı'nı açtığımda hesap bilgilerimin (isim, e-posta, yetki seviyesi) backend'den gelen güncel verilerle gösterilmesini istiyorum; böylece her zaman doğru bilgilere erişebilirim.

#### Acceptance Criteria

1. WHEN Ayarlar_Modalı açıldığında, THE Frontend SHALL `GET /api/v1/auth/me` uç noktasını çağırarak kullanıcının güncel bilgilerini almak.
2. THE Frontend SHALL Ayarlar_Modalı içinde kullanıcının `full_name`, `email` ve `role_level` değerlerini göstermek.
3. WHILE Ayarlar_Modalı verileri yükleniyorken, THE Frontend SHALL bir yükleme göstergesi görüntülemek.
4. IF `GET /api/v1/auth/me` isteği başarısız olursa, THEN THE Frontend SHALL "Hesap bilgileri yüklenemedi" hata mesajını modal içinde göstermek.
5. THE Frontend SHALL `role_level` değerini sayısal değer yerine okunabilir bir etiketle (örn. "Kullanıcı", "SuperAdmin") göstermek.

### Requirement 6: Veri Dışa Aktarma (Data Export)

**User Story:** Bir kullanıcı olarak, tüm sohbet geçmişimi tek tıkla JSON veya TXT formatında bilgisayarıma indirebilmek istiyorum; böylece verilerimin kontrolü bende olur ve KVKK/GDPR haklarımı kullanabilirim.

#### Acceptance Criteria

1. THE Backend SHALL `/api/v1/chat/export` adresinde bir `GET` uç noktası sunmak.
2. WHEN `GET /api/v1/chat/export?format=json` isteği yapıldığında, THE Backend SHALL kullanıcının tüm sohbet oturumlarını ve mesajlarını JSON formatında bir dosya olarak döndürmek.
3. WHEN `GET /api/v1/chat/export?format=txt` isteği yapıldığında, THE Backend SHALL kullanıcının tüm sohbet oturumlarını ve mesajlarını düz metin formatında bir `.txt` dosyası olarak döndürmek.
4. THE Backend SHALL dışa aktarma yanıtında `Content-Disposition: attachment` başlığını içermek.
5. WHEN dışa aktarma isteği yapıldığında, THE Backend SHALL yalnızca isteği yapan kullanıcıya ait verileri dahil etmek; yetkisiz veri tespit edildiğinde dışa aktarma isteğinin tamamını başarısız saymak.
6. IF kullanıcının hiç sohbet geçmişi yoksa, THEN THE Backend SHALL boş bir veri yapısı içeren geçerli bir dosya döndürmek.
7. THE Frontend SHALL Ayarlar_Modalı içinde "Verilerimi İndir" butonu sunmak ve bu buton tıklandığında dışa aktarma isteğini tetiklemek.

### Requirement 7: Hesap Silme — Onay Modalı ve Cascade Silme

**User Story:** Bir kullanıcı olarak, hesabımı silmek istediğimde yanlışlıkla silmeyi önleyen bir onay adımı görmek istiyorum; bir SuperAdmin olarak ise hesap silindiğinde veritabanında yetim kayıt kalmadığından emin olmak istiyorum.

#### Acceptance Criteria

1. WHEN kullanıcı "Hesabı Sil" butonuna tıkladığında, THE Frontend SHALL şifre girişi gerektiren bir onay modalı açmak.
2. THE Frontend SHALL onay modalında "Bu işlem geri alınamaz" uyarısını belirgin biçimde göstermek.
3. WHEN kullanıcı onay modalında şifresini girip silme işlemini onayladığında, THE Frontend SHALL `DELETE /api/v1/auth/account` uç noktasına şifreyi içeren bir istek göndermek.
4. THE Backend SHALL `/api/v1/auth/account` adresinde bir `DELETE` uç noktası sunmak.
5. WHEN `DELETE /api/v1/auth/account` isteği alındığında, THE Backend SHALL gönderilen şifreyi mevcut kullanıcının hash'lenmiş şifresiyle doğrulamak.
6. IF şifre doğrulaması başarısız olursa, THEN THE Backend SHALL `401 Unauthorized` durum kodu ile yanıt vermek.
7. WHEN şifre doğrulaması başarılı olduğunda, THE Backend SHALL kullanıcı kaydını veritabanından silmek.
8. WHEN bir kullanıcı kaydı silindiğinde, THE Backend SHALL veritabanı transaction'ı kullanarak Cascade_Silme mekanizması aracılığıyla kullanıcıya ait tüm ChatSession ve ChatMessage kayıtlarını atomik biçimde silmek; herhangi bir kayıt silinemezse tüm işlemi geri almak.
9. WHEN hesap silme işlemi tamamlandığında, THE Frontend SHALL kullanıcıyı `/login` sayfasına yönlendirmek ve JWT_Token'ı temizlemek.

### Requirement 8: Tema Motoru (Koyu / Aydınlık Mod)

**User Story:** Bir kullanıcı olarak, "Derin İndigo" koyu tema ile aydınlık mod arasında geçiş yapabilmek ve tercihimin tarayıcı oturumları arasında korunmasını istiyorum; böylece görsel konforumu kişiselleştirebilirim.

#### Acceptance Criteria

1. THE Tema_Motoru SHALL `tailwind.config.ts` içinde koyu ve aydınlık mod için renk değişkenlerini tanımlamak.
2. THE Frontend SHALL tema tercihini `localStorage` anahtarı olarak saklamak.
3. WHEN sayfa yüklendiğinde, THE Frontend SHALL `localStorage`'dan tema tercihini okuyarak uygulamak.
4. WHEN kullanıcı tema geçiş butonuna tıkladığında veya tema herhangi bir yolla değiştiğinde, THE Tema_Motoru SHALL aktif temayı değiştirmek ve yeni tercihi `localStorage`'a kaydetmek; tema geçişi başarısız olsa dahi tercih `localStorage`'a kaydedilmek.
5. THE Frontend SHALL tema durumunu React Context API aracılığıyla tüm bileşenlere iletmek.
6. THE Frontend SHALL tema geçişini CSS sınıfı değişikliğiyle (`dark` veya `light` class) uygulamak.

### Requirement 9: Admin Güvenlik Duvarı

**User Story:** Bir sistem yöneticisi olarak, `/admin` sayfasına yalnızca `role_level == 5` olan kullanıcıların erişebildiğinden emin olmak istiyorum; böylece yetkisiz erişim engellenir.

#### Acceptance Criteria

1. THE Frontend SHALL Next.js `middleware.ts` dosyasında `/admin` rotasını korumak.
2. WHEN `/admin` rotasına erişim denendiğinde, THE Frontend SHALL önce JWT_Token'ı doğrulamak; JWT_Token geçerliyse kullanıcının `role_level` değerini kontrol etmek.
3. IF kullanıcının `role_level` değeri 5'ten küçükse, THEN THE Frontend SHALL kullanıcıyı `/chat` sayfasına yönlendirmek.
4. IF geçerli bir JWT_Token mevcut değilse, THEN THE Frontend SHALL kullanıcıyı `/login` sayfasına yönlendirmek.
5. THE Backend SHALL `/api/v1/admin` prefix'i altındaki tüm uç noktalarda `role_level >= 5` kontrolü yapmak.
6. IF `role_level` değeri 5'ten küçük bir kullanıcı admin uç noktasına istek gönderirse, THEN THE Admin_Router SHALL `403 Forbidden` durum kodu ile yanıt vermek.

### Requirement 10: Görsel Metrikler ve Grafikler

**User Story:** Bir SuperAdmin olarak, admin panelinde günlük aktif kullanıcı sayısı, toplam mesaj sayısı ve sistem hata oranı gibi metrikleri görsel grafiklerle görmek istiyorum; böylece sistemin sağlığını anlık olarak izleyebilirim.

#### Acceptance Criteria

1. THE Backend SHALL `/api/v1/admin/metrics` adresinde bir `GET` uç noktası sunmak.
2. WHEN `GET /api/v1/admin/metrics` isteği yapıldığında, THE Admin_Router SHALL günlük aktif kullanıcı sayısını, toplam mesaj sayısını ve hata oranını içeren bir JSON yanıtı döndürmek.
3. THE Frontend SHALL admin panelinde metrikleri görselleştirmek için `recharts` kütüphanesini kullanmak.
4. THE Frontend SHALL günlük aktif kullanıcı verisini çizgi grafik (LineChart) olarak göstermek.
5. THE Frontend SHALL toplam mesaj sayısını çubuk grafik (BarChart) olarak göstermek.
6. IF `GET /api/v1/admin/metrics` isteği başarısız olursa, THEN THE Frontend SHALL "Metrikler yüklenemedi" hata mesajını göstermek.
7. THE Admin_Router SHALL metrik uç noktasını yalnızca `role_level >= 5` olan kullanıcılara açmak.

### Requirement 11: Kullanıcı Yönetim Tablosu (DataGrid)

**User Story:** Bir SuperAdmin olarak, sisteme kayıtlı tüm kullanıcıları bir tabloda görmek ve gerektiğinde hesapları askıya almak (ban) istiyorum; böylece platform güvenliğini ve düzenini koruyabilirim.

#### Acceptance Criteria

1. THE Backend SHALL `/api/v1/admin/users` adresinde bir `GET` uç noktası sunmak.
2. WHEN `GET /api/v1/admin/users` isteği yapıldığında, THE Admin_Router SHALL tüm kullanıcıların `id`, `email`, `full_name`, `role_level`, `is_active` ve `created_at` alanlarını içeren bir liste döndürmek.
3. THE Frontend SHALL admin panelinde kullanıcıları DataGrid bileşeninde listelemek.
4. THE Frontend SHALL DataGrid'de her kullanıcı satırı için "Askıya Al" ve "Aktif Et" butonları sunmak.
5. WHEN "Askıya Al" butonuna tıklandığında, THE Frontend SHALL `POST /api/v1/admin/ban-user` uç noktasını çağırarak kullanıcının `is_active` değerini `False` olarak güncellemek.
6. THE Backend SHALL `/api/v1/admin/ban-user` uç noktasını `role_level >= 3` olan kullanıcılara açmak.
7. WHEN ban işlemi tamamlandığında, THE Frontend SHALL DataGrid'deki ilgili kullanıcı satırını güncel durumla yenilemek.
8. THE Admin_Router SHALL `/api/v1/admin/users` uç noktasını yalnızca `role_level >= 5` olan kullanıcılara açmak.

### Requirement 12: Sistem Logları ve Aktivite Akışı

**User Story:** Bir SuperAdmin olarak, admin panelinde kimin ne zaman sisteme giriş yaptığını ve LLM tarafında hangi isteklerin hata verdiğini gerçek zamanlı olarak görmek istiyorum; böylece sistem güvenliğini ve kararlılığını izleyebilirim.

#### Acceptance Criteria

1. THE Backend SHALL `/api/v1/admin/activity-feed` adresinde bir `GET` uç noktası sunmak.
2. WHEN `GET /api/v1/admin/activity-feed` isteği yapıldığında, THE Admin_Router SHALL son 100 sistem olayını (giriş, hata, LLM isteği) zaman damgasıyla birlikte döndürmek.
3. THE Backend SHALL her başarılı kullanıcı girişini `logger` modülü aracılığıyla kaydetmek.
4. THE Backend SHALL her LLM isteği hatasını `logger` modülü aracılığıyla kaydetmek.
5. THE Frontend SHALL admin panelinde Aktivite_Akışı bileşenini 30 saniyede bir otomatik olarak yenilemek.
6. THE Frontend SHALL Aktivite_Akışı'nda her olayı zaman damgası, olay türü ve kullanıcı bilgisiyle birlikte listelemek.
7. THE Admin_Router SHALL aktivite akışı uç noktasına `role_level < 5` olan kullanıcıların erişimini, erişim reddinin nedenini açıklamadan sessizce engellemek.

### Requirement 13: CORS Politikalarının Sıkılaştırılması

**User Story:** Bir sistem yöneticisi olarak, Backend'in yalnızca yetkili frontend adreslerinden gelen istekleri kabul etmesini istiyorum; böylece yetkisiz kaynaklardan gelen siber saldırılar engellenir.

#### Acceptance Criteria

1. THE Backend SHALL CORS politikasında yalnızca `http://localhost:3000` ve ortam değişkeniyle tanımlanan production domain adresine izin vermek.
2. THE Backend SHALL izin verilen origin listesini `ALLOWED_ORIGINS` ortam değişkeninden okumak.
3. IF bir istek izin verilmeyen bir origin'den geliyorsa, THEN THE Backend SHALL yalnızca CORS ihlali nedeniyle isteği `403 Forbidden` durum kodu ile reddetmek; kimlik doğrulama veya yetkilendirme hataları için sırasıyla `401` veya `403` durum kodlarını kullanmak.
4. THE Backend SHALL CORS yapılandırmasında `allow_credentials=True` ayarını korumak.
5. THE Backend SHALL izin verilen HTTP metodlarını yalnızca `GET`, `POST`, `PUT`, `DELETE` ve `OPTIONS` ile sınırlandırmak.

### Requirement 14: Veritabanı İndeksleme

**User Story:** Bir kullanıcı olarak, sohbet geçmişimin hızlı yüklenmesini istiyorum; bir sistem yöneticisi olarak ise veritabanı sorgularının performanslı çalışmasını istiyorum.

#### Acceptance Criteria

1. THE Backend SHALL `chat_messages` tablosundaki `session_id` sütununa bir veritabanı indeksi tanımlamak.
2. THE Backend SHALL `chat_sessions` tablosundaki `user_id` sütununa bir veritabanı indeksi tanımlamak.
3. THE Backend SHALL bu indeksleri Alembic migration dosyası aracılığıyla uygulamak.
4. WHEN `GET /api/v1/chat/sessions/{session_id}/messages` isteği yapıldığında, THE Backend SHALL mesajları `session_id` indeksini kullanarak sorgulamak.

### Requirement 15: React Error Boundary

**User Story:** Bir kullanıcı olarak, frontend'de beklenmedik bir hata oluştuğunda sayfanın tamamen beyaz ekrana düşmesi yerine anlaşılır bir hata mesajı görmek istiyorum; böylece uygulamayı kullanmaya devam edebilirim.

#### Acceptance Criteria

1. THE Frontend SHALL tüm sayfa bileşenlerini saran bir Error_Boundary bileşeni içermek.
2. WHEN bir React bileşeninde yakalanmamış bir hata oluştuğunda, THE Error_Boundary SHALL beyaz ekran yerine "Bir şeyler ters gitti" mesajını içeren bir hata arayüzü göstermek; hata arayüzünün kendisi render edilemezse beyaz ekrana düşmek kabul edilebilir.
3. THE Frontend SHALL hata arayüzünde kullanıcının sayfayı yenileyebileceği veya ana sayfaya dönebileceği bir buton sunmak.
4. THE Error_Boundary SHALL yakalanan hataları `console.error` aracılığıyla kaydetmek.
5. THE Frontend SHALL Error_Boundary bileşenini hem `/chat` hem de `/admin` rotalarında uygulamak.

## Glossary

- **Backend:** FastAPI tabanlı Python sunucu uygulaması
- **Frontend:** Next.js + TypeScript tabanlı istemci uygulaması
- **Auth_Router:** `/api/v1/auth` prefix'i altında çalışan kimlik doğrulama yönlendirici modülü (`auth_routes.py`)
- **Chat_Router:** `/api/v1/chat` prefix'i altında çalışan sohbet yönlendirici modülü (`routes.py`)
- **Admin_Router:** `/api/v1/admin` prefix'i altında çalışan yönetici yönlendirici modülü (`admin_routes.py`)
- **Chat_Sayfası:** Frontend'deki `/chat` rotasında yer alan ana sohbet arayüzü
- **Sidebar:** Chat sayfasının sol paneli; geçmiş sohbet oturumlarını listeler
- **Markdown_Parser:** `react-markdown` kütüphanesi ile Lunia yanıtlarını zengin metin olarak render eden bileşen
- **Ayarlar_Modalı:** Kullanıcı hesap bilgilerini ve tercihlerini yönetmek için açılan modal pencere
- **Tema_Motoru:** Koyu (Derin İndigo) ve aydınlık mod arasında geçişi yöneten Context API ve localStorage mekanizması
- **Admin_Paneli:** Yalnızca `role_level == 5` olan kullanıcıların erişebildiği `/admin` rotası
- **Kullanıcı:** Sisteme kayıtlı, `role_level` değeri 1 olan standart hesap sahibi
- **SuperAdmin:** `role_level` değeri 5 olan, tüm yönetim yetkilerine sahip hesap sahibi
- **JWT_Token:** Kullanıcı kimliğini taşıyan, `js-cookie` ile çerezde saklanan JSON Web Token
- **ChatSession:** `chat_sessions` tablosunda tutulan, bir kullanıcıya ait sohbet oturumu kaydı
- **ChatMessage:** `chat_messages` tablosunda tutulan, bir oturuma ait bireysel mesaj kaydı
- **Cascade_Silme:** Bir üst kayıt silindiğinde ona bağlı tüm alt kayıtların da otomatik olarak silinmesi davranışı
- **Error_Boundary:** React bileşen ağacındaki hataları yakalayan ve beyaz ekran yerine hata arayüzü gösteren bileşen
- **CORS:** Cross-Origin Resource Sharing; farklı origin'lerden gelen HTTP isteklerini kontrol eden güvenlik politikası
- **Rate_Limiter:** Belirli bir zaman diliminde bir uç noktaya yapılabilecek istek sayısını sınırlayan `slowapi` tabanlı mekanizma
- **Veri_Dışa_Aktarma_API:** Kullanıcının tüm sohbet geçmişini JSON veya TXT formatında indirmesini sağlayan uç nokta
- **Aktivite_Akışı:** Admin panelinde gerçek zamanlı sistem olaylarını listeleyen bileşen
- **DataGrid:** Admin panelinde kullanıcı listesini tablo formatında gösteren bileşen
