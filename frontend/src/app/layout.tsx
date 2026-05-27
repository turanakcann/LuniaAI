import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Modern SaaS fontu
import "./globals.css";
import { ThemeProvider } from "@/src/context/ThemeContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Lunia.ai // Dijital Yoldaş",
  description: "Zihnini anlayan, yargılamayan dijital yoldaşın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" data-theme="dark">
      <body className={`${inter.variable} font-sans bg-lunia-bg text-lunia-text antialiased transition-colors duration-300`}>
        <ThemeProvider>
          {/* Tüm sayfalar bu kapsayıcının içinde renderlanacak */}
          <div className="relative min-h-screen overflow-x-hidden">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}