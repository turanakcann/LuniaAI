import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/src/context/ThemeContext";

// 90'lar Terminal Hissi
const spaceMono = Space_Mono({ 
  weight: ["400", "700"], 
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Lunia.ai // Terminal",
  description: "Enterprise-grade digital companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${spaceMono.variable} font-mono bg-cyber-black text-cyber-green antialiased selection:bg-cyber-amber selection:text-cyber-black`}>
        <ThemeProvider>
          {/* Tüm sayfalar bu kapsayıcının içinde renderlanacak */}
          <div className="relative min-h-screen overflow-hidden">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}