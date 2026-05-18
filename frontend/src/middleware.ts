import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Çerezlerden token'ı kontrol ediyoruz
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. GÜVENLİK DUVARI: Token yoksa ve kullanıcı korumalı alanlara gitmeye çalışıyorsa LOGIN'e fırlat
  if (!token && (pathname.startsWith("/chat") || pathname.startsWith("/admin"))) {
    const loginUrl = new URL("/login", request.url);
    // Tarayıcı önbelleğini temizlemek için cache önleyici başlıklar ekliyoruz
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return response;
  }

  // 2. ERİŞEBİLİRLİK: Token VARSA ve kullanıcı zaten giriş yapmışken tekrar /login veya /register'a gitmeye çalışıyorsa CHAT'e fırlat
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

// Middleware'in hangi rotalarda tetikleneceğini belirliyoruz
export const config = {
  matcher: ["/chat/:path*", "/admin/:path*", "/login", "/register"],
};