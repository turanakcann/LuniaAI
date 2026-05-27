"use client";

import Navbar from "@/src/components/Navbar";
import { Code2, Database, Shield, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function DevelopersPage() {
  const team = [
    {
      name: "Turan Akcan",
      role: "AI Architect & Full-Stack Developer",
      bio: "Zonguldak BEÜ Bilgisayar Mühendisliği 4. Sınıf. Davision AI bünyesinde yapay zeka ve sistem mimarileri geliştiriyor. Lunia projesinin Çift LLM orkestrasyonu, prompt mühendisliği ve Next.js/FastAPI entegrasyonuna liderlik etti.",
      linkedin: "https://linkedin.com/in/turanakcan"
    },
    {
      name: "Talha Aydın",
      role: "Backend & Database Engineer",
      bio: "Sistemin asenkron veri akışı, veritabanı güvenliği ve API mimarisinden sorumlu. Supabase ve Pinecone (Vektörel Veritabanı) entegrasyonları ile uygulamanın kesintisiz veri alışverişi yapmasını sağladı.",
      linkedin: "https://www.linkedin.com/in/talhaaydinx/"
    },
    {
      name: "Burak Bayık",
      role: "Cloud & DevOps Engineer",
      bio: "Projenin bulut altyapısı ve dağıtım süreçlerinin mimarı. Dockerizasyon, AWS EC2 konfigürasyonları ve CI/CD pipeline süreçlerini yöneterek Lunia.ai'ın Cloud-Native standartlarında canlıya alınmasını üstlendi.",
      linkedin: "https://www.linkedin.com/in/burakbayik/"
    },
    {
      name: "Mert Kelkit",
      role: "Frontend Developer & UI/UX Designer",
      bio: "Modern arayüzlerin ve kullanıcı odaklı tasarımın arkasındaki isim. Tailwind CSS v4 ve React 19 kullanarak sistemin dinamik tema motorunu ve akıcı kullanıcı deneyimini (UX) hayata geçirdi.",
      linkedin: "https://www.linkedin.com/in/mert-kelkit-022b15249/"
    }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-lunia-bg text-lunia-text transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-16 w-full">
        {/* Üst Kısım: Proje Mimarisi */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Ekibimiz</h1>
          <p className="text-lunia-muted max-w-2xl mx-auto text-lg leading-relaxed">
            Modern bulut standartlarında inşa edilmiş, açık kaynak dostu ve ölçeklenebilir yapay zeka altyapımızın detayları ve bu vizyonu hayata geçiren çekirdek ekip.
          </p>
        </div>

        {/* Ekip Kartları */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 border-b border-lunia-border pb-4">
            <Code2 className="text-lunia-accent" /> Çekirdek Geliştirici Ekip
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {team.map((member, index) => (
              <div key={index} className="bg-lunia-card border border-lunia-border p-6 rounded-2xl hover:border-lunia-accent transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-lunia-text">{member.name}</h3>
                    <p className="text-sm text-lunia-accent font-medium mt-1">{member.role}</p>
                  </div>
                  <Link 
                    href={member.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors flex shrink-0"
                  >
                    <ExternalLink size={20} />
                  </Link>
                </div>
                <p className="text-sm text-lunia-muted leading-relaxed flex-1">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}