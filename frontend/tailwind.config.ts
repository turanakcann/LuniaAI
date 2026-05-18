import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lunia: {
          bg: "#050505",       // Derin boşluk, neredeyse siyah
          sidebar: "#0d0d0f",  // Sol panel için çok hafif aydınlık
          border: "#1f1f22",   // Göz yormayan ince çizgiler
          text: "#e4e4e7",     // Yumuşak beyaz (zinc-200)
          muted: "#8b8b93",    // Pasif yazılar için soluk gri
          accent: "#818cf8",   // İndigo-400 (Sakinlik ve zeka rengi)
          accentHover: "#6366f1", // Tıklama efektleri için
        }
      },
      fontFamily: {
        mono: ["var(--font-space-mono)"], 
        sans: ["Inter", "sans-serif"], // Daha modern ve okunaklı bir font (Opsiyonel)
      }
    },
  },
  plugins: [],
};
export default config;