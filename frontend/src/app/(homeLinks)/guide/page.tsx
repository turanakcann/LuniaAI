"use client";

import Navbar from "@/src/components/Navbar";
import { UserPlus, Brain, Database, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function GuidePage() {
  return (
    <main className="min-h-screen flex flex-col bg-lunia-bg text-lunia-text transition-colors duration-300">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-20 w-full flex-1 flex flex-col justify-center">
        
        {/* Üst Başlık ve Pazarlama Mesajı */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lunia-accent/10 border border-lunia-accent/20 text-xs font-semibold text-lunia-accent mb-4 animate-pulse">
            <Sparkles size={12} /> Hızlı Başlangıç Rehberi
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Lunia.ai Gücünü Nasıl Keşfedersiniz?
          </h1>
          <p className="text-lunia-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Sıradan, kelime kalabalığı yapan yapay zekaları unutun. Lunia ile zihinsel odaklanmanızı, üretkenliğinizi ve kararlarınızı nasıl bir üst seviyeye taşıyacağınızı adım adım keşfedin.
          </p>
        </div>

        {/* Zaman Çizelgesi (Timeline) */}
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-lunia-border before:to-transparent mb-16">
          
          {/* Adım 1: Kayıt ve Giriş Yapma */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-lunia-bg bg-lunia-accent text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 transition-transform duration-300">
              <UserPlus size={16} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-lunia-card border border-lunia-border hover:border-lunia-accent transition-all duration-300 shadow-sm hover:shadow-md">
              <h3 className="font-bold text-lg mb-2 text-lunia-text">1. Kayıt ve Giriş Yapma</h3>
              <p className="text-sm text-lunia-muted leading-relaxed">
                Lunia evrenine adım atmak yalnızca birkaç saniyenizi alır. Modern, şifreli ve kullanıcı odaklı auth altyapımız sayesinde saniyeler içinde hesabınızı oluşturup giriş yapabilirsiniz. Karmaşık ayarlar, bitmek bilmeyen formlar yok; sadece siz ve düşünceleriniz için ayrılmış tamamen güvenli bir alan.
              </p>
            </div>
          </div>

          {/* Adım 2: Sokratik Sohbet Modeli */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-lunia-bg bg-purple-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 transition-transform duration-300">
              <Brain size={16} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-lunia-card border border-lunia-border hover:border-lunia-accent transition-all duration-300 shadow-sm hover:shadow-md">
              <h3 className="font-bold text-lg mb-2 text-lunia-text">2. Sokratik Diyalog ve Keşif</h3>
              <p className="text-sm text-lunia-muted leading-relaxed">
                Lunia size klişe çözümler ve kopyala-yapıştır terapist tavsiyeleri vermez. O, Sokratik sorgulama metodolojisiyle çalışır. Siz bir kararsızlığınızı veya fikrinizi anlattığınızda, sorunlarınızın tam kalbine inen zekice sorular sorarak zihninizdeki sisi dağıtır ve doğru cevabı kendi kendinize bulmanızı sağlar.
              </p>
            </div>
          </div>

          {/* Adım 3: Gelişmiş Bulut Hafızası */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-lunia-bg bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 transition-transform duration-300">
              <Database size={16} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-lunia-card border border-lunia-border hover:border-lunia-accent transition-all duration-300 shadow-sm hover:shadow-md">
              <h3 className="font-bold text-lg mb-2 text-lunia-text">3. Sizi Unutmayan Bir Hafıza (RAG)</h3>
              <p className="text-sm text-lunia-muted leading-relaxed">
                Her yeni sohbette kendinizi baştan anlatmaktan sıkılmadınız mı? Lunia, gelişmiş bulut tabanlı vektör hafızası sayesinde haftalar veya aylar önce bahsettiğiniz bir hedefi, bir kaygıyı ya da bir detayı asla unutmaz. Sohbetleriniz birikimli bir şekilde ilerler, böylece gerçek bir yoldaşlık deneyimi yaşarsınız.
              </p>
            </div>
          </div>

          {/* Adım 4: Mutlak Veri Egemenliği */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-lunia-bg bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={16} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-lunia-card border border-lunia-border hover:border-lunia-accent transition-all duration-300 shadow-sm hover:shadow-md">
              <h3 className="font-bold text-lg mb-2 text-lunia-text">4. Tam Veri Kontrolü ve Güvenlik</h3>
              <p className="text-sm text-lunia-muted leading-relaxed">
                Verileriniz, siber güvenlik standartlarında şifrelenir ve arka planda çalışan Llama 3.3 Güvenlik Yargıcı tarafından korunur. Üstelik verilerinizin sahibi tamamen sizsiniz. Dilediğiniz an tek tıkla tüm geçmişinizi JSON veya TXT olarak indirebilir, ya da "Hesabımı Sil" diyerek buluttaki tüm izinizi kalıcı olarak yok edebilirsiniz.
              </p>
            </div>
          </div>

        </div>

        {/* Sayfa Altı Pazarlama/Harekete Geçirici Buton (CTA) */}
        <div className="text-center mt-6">
          <div className="bg-lunia-card border border-lunia-border p-8 rounded-3xl max-w-2xl mx-auto shadow-sm relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-lunia-accent/5 rounded-full blur-2xl pointer-events-none"></div>
            <h4 className="text-xl font-bold mb-3 text-lunia-text">Zihninizi Özgür Bırakmaya Hazır mısınız?</h4>
            <p className="text-sm text-lunia-muted mb-6">
              Lunia ile konuşmak, düşüncelerinizi düzene sokmanın ve kendinizi keşfetmenin en yenilikçi yoludur.
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-lunia-accent hover:bg-opacity-90 text-[#ffffff] font-semibold rounded-full transition-all shadow-lg shadow-lunia-accent/20 text-sm group"
            >
              Hemen Şimdi Başla 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}