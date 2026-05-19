import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  role_level?: number;
  exp?: number;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. GÜVENLİK DUVARI: Token yoksa ve kullanıcı korumalı alanlara girmeye çalışıyorsa LOGIN'e fırlat
  if (!token && (pathname.startsWith("/chat") || pathname.startsWith("/admin"))) {
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return response;
  }

  // 2. ADMIN KONTROL: Token varsa /admin rotaları için role_level >= 5 kontrolü
  if (token && pathname.startsWith("/admin")) {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      const roleLevel = payload.role_level ?? 1;
      if (roleLevel < 5) {
        // Yetersiz yetki: chat'e yönlendir
        return NextResponse.redirect(new URL("/chat", request.url));
      }
    } catch {
      // Token decode edilemezse login'e gönder
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 3. ERİŞEBİLİRLİK: Token VARSA ve kullanıcı giriş sayfalarına gitmeye çalışıyorsa CHAT'e fırlat
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

// Middleware'in hangi rotalarda tetikleneceğini belirliyoruz
export const config = {
  matcher: ["/chat/:path*", "/admin/:path*", "/login", "/register"],
};
