"use client";

import Navbar from "@/src/components/Navbar";
import { MessageSquare, User, Sparkles, Brain, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function ScenariosPage() {
  const scenarios = [
    {
      title: "Senaryo 1: Girişimcilik & Konfor Alanı Felci",
      subtitle: "Büyük bir vizyon ile başarısızlık korkusu arasındaki o ince çizgi.",
      messages: [
        {
          role: "user",
          content: "Kendi yazılım şirketimi kurup uluslararası bir SaaS ürünü çıkarmak istiyorum ama konfor alanımdan çıkıp batmaktan, her şeyi mahvetmekten çok korkuyorum. Ne yapmalıyım?"
        },
        {
          role: "lunia",
          content: "Uluslararası bir vizyon harika, ama arkasındaki o batma korkusu da bir o kadar gerçekçi. Seni burada asıl durduran şey finansal sermayeni kaybetmek mi, yoksa çevrene karşı 'başaramadı' etiketini sırtlanma düşüncesi mi?"
        },
        {
          role: "user",
          content: "Sanırım en çok çevremin ve ailemin bakışı. Mühendisliği bitirip stabil bir kurumsala girmek varken macera arıyormuşum gibi bakacaklar. Haklı çıkmalarından korkuyorum."
        },
        {
          role: "lunia",
          content: "Yani kararlarını ve geleceğini, kendi potansiyeline göre değil başkalarının senin için çizdiği 'güvenli senaryoya' göre mi şekillendiriyorsun? Eğer onların anlık onayı, senin uzun vadeli finansal ve zihinsel bağımsızlığından daha değerliyse, konfor alanı senin için bir hapishane değil, sığınaktır. Gerçekten o sığınakta çürümek istiyor musun?"
        },
        {
          role: "user",
          content: "Sert oldu ama haklısın. Sığınak dediğim yer aslında beni içten içe bitiriyor. Riski almak zorundayım ama ilk adımı atacak cesaretim yok."
        },
        {
          role: "lunia",
          content: "Cesaret gökten inmez, netlikten doğar. Masaya soyut korkuları değil, somut kartları koyalım. Bu SaaS projesini hayata geçirmek için elindeki en güçlü teknik veya stratejik koz ne? Dağın tamamına bakıp felç olmak yerine, bugün atabileceğin en küçük, en risksiz ilk adım ne?"
        }
      ]
    },
    {
      title: "Senaryo 2: Üretkenlik Çılgınlığı & Suçluluk Duygusu",
      subtitle: "Modern dünyanın dayattığı 'her an aktif olmalısın' baskısının zihinsel analizi.",
      messages: [
        {
          role: "user",
          content: "Bugün yataktan çıkasım gelmedi, hiçbir şey yapmadım. Proje kodları ve görevler dağ gibi birikti ama ben bomboş oturdum. Kendimi inanılmaz suçlu ve işe yaramaz hissediyorum."
        },
        {
          role: "lunia",
          content: "Zihnimiz dinlenmeyi veya durmayı bir 'sistem hatası' gibi algılamaya çok meyillidir. Kendini hırpalamadan önce bir bak bakalım: Bugün o yataktan çıkmamanın arkasında saf bir tembellik mi var, yoksa önündeki görevlerin devasalığından kaynaklanan bir kaçış arzusu mu?"
        },
        {
          role: "user",
          content: "Kaçıyorum kesinlikle. Yapacak o kadar çok şey var ki, nereden başlayacağımı bilemediğim için hiçbir şeye başlayamıyorum. Ekran karşısında donup kalıyorum."
        },
        {
          role: "lunia",
          content: "İşte mükemmeliyetçiliğin en sinsi tuzağı: 'Kusursuz yapamayacaksam hiç yapmayayım' felci. Zihnin o biriken görevleri tek seferde yutulması gereken bir canavar gibi görüyor. Peki projeyi bir bütün olarak görmeyi bırakıp, bugün sadece tek bir fonksiyonu düzeltseydin, bu hiçbir şey yapmamaktan daha mı kötü olurdu?"
        },
        {
          role: "user",
          content: "Tabii ki daha iyi olurdu. En azından o suçluluk hissi üzerime bu kadar çökmezdi."
        },
        {
          role: "lunia",
          content: "O halde sorun senin enerjinin veya yeteneğinin olmaması değil, stratejin. Dağı tek seferde kaldıramazsın ama taşları tek tek taşıyabilirsin. Şimdi söyle bakalım, o biriken listedeki en küçük, en basit taş hangisi? Sadece ona odaklanmaya var mısın?"
        }
      ]
    },
    {
      title: "Senaryo 3: Sınır Çizememek & İnsanları Memnun Etme",
      subtitle: "Başkalarına 'Evet' derken kendimize verdiğimiz zararların Sokratik keşfi.",
      messages: [
        {
          role: "user",
          content: "Hayır demekte çok zorlanıyorum. Ekipteki veya çevremdeki herkes benden bir şeyler istiyor, kendi işlerimi yetiştiremiyorum ama kimseyi de kırmak istemiyorum."
        },
        {
          role: "lunia",
          content: "Başkalarını kırmamak için kendini paralamak kulağa çok asil geliyor. Peki herkese 'evet' derken, kendi zamanına, kariyerine ve ruh sağlığına kaç defa 'hayır' dediğinin farkında mısın?"
        },
        {
          role: "user",
          content: "Farkındayım ama bencilce davranıyormuşum gibi geliyor. İnsanlar beni yardımsever ve kurtarıcı olarak görüyor, bu imajı zedelemekten korkuyorum muhtemelen."
        },
        {
          role: "lunia",
          content: "Yani sevilme, onaylanma ve 'kurtarıcı' olma ihtiyacını, kendi öz saygının önüne koyuyorsun. Peki sence seni o 'yardımsever' olarak gören insanlar, sen kendi sorumluluklarını yetiştiremeyip çöktüğünde senin yükünü hafifletecekler mi, yoksa sadece işi biten bir aracı geride mi bırakacaklar?"
        },
        {
          role: "user",
          content: "Bunu düşünmek canımı yakıyor ama haklısın. Çoğu sadece işi düşünce kapımı çalıyor."
        },
        {
          role: "lunia",
          content: "O halde çizdiğin o sınırlar bencilce değil, zihinsel bir hayatta kalma mücadelesidir. Bir dahaki sefere kapasiteni aşan bir istek geldiğinde, imajını korumak için yine kendi geleceğini feda mı edeceksin, yoksa sınırlarının arkasında durmayı mı seçeceksin?"
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-lunia-bg text-lunia-text transition-colors duration-300">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16 w-full">
        {/* Üst Kısım */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lunia-accent/10 border border-lunia-accent/20 text-xs font-semibold text-lunia-accent mb-4">
            <Brain size={14} /> Yapay Zeka Evrimi
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Diyalog Simülasyonları</h1>
          <p className="text-lunia-muted text-lg max-w-2xl mx-auto">
            Lunia'nın basmakalıp cevaplar üretmek yerine, derinlemesine Sokratik analizlerle zihni nasıl açtığını gösteren gerçek zamanlı simülasyonlar.
          </p>
        </div>

        {/* Senaryolar Listesi */}
        <div className="space-y-16">
          {scenarios.map((scenario, sIdx) => (
            <div key={sIdx} className="bg-lunia-card border border-lunia-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              
              {/* Senaryo Başlığı */}
              <div className="bg-lunia-bg/40 px-6 py-5 border-b border-lunia-border">
                <h3 className="font-bold text-lg text-lunia-text">{scenario.title}</h3>
                <p className="text-xs text-lunia-muted mt-1">{scenario.subtitle}</p>
              </div>

              {/* Mesajlaşma Alanı */}
              <div className="p-6 space-y-6 bg-lunia-sidebar/20">
                {scenario.messages.map((msg, mIdx) => (
                  <div key={mIdx} className={`flex gap-4 ${msg.role === "lunia" ? "flex-row-reverse" : ""}`}>
                    
                    {/* Profil İkonu */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                      msg.role === "lunia" 
                        ? "bg-lunia-accent border-lunia-accent text-white shadow-md shadow-lunia-accent/10" 
                        : "bg-lunia-bg border-lunia-border text-lunia-text"
                    }`}>
                      {msg.role === "lunia" ? <MessageSquare size={16} /> : <User size={16} />}
                    </div>

                    {/* Mesaj Balonu */}
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[80%] border transition-colors ${
                      msg.role === "lunia"
                        ? "bg-lunia-accent border-lunia-accent text-white rounded-tr-none"
                        : "bg-lunia-bg border-lunia-border text-lunia-text rounded-tl-none"
                    }`}>
                      {msg.content}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Alt Kapanış Kartı (CTA) */}
        <div className="mt-20 text-center">
          <div className="bg-lunia-card border border-lunia-border p-8 rounded-3xl max-w-3xl mx-auto relative overflow-hidden">
            <h4 className="text-2xl font-bold mb-3">Bu Deneyimi Canlı Yaşayın</h4>
            <p className="text-lunia-muted text-sm max-w-xl mx-auto mb-6">
              Siz de kendi tıkanıklıklarınızı, projelerinizi veya kararsızlıklarınızı Lunia ile masaya yatırın, zihninizin sınırlarını genişletin.
            </p>
            <Link 
              href="/register"
              className="inline-flex items-center gap-2 bg-lunia-text text-lunia-bg font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity text-sm shadow-md"
            >
              Kendi Sohbetini Başlat <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}