// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/cadastro",
  "/favicon",
  "/_next",
  "/api",
  "/static",
  "/assets",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- PERMITIR CAMINHOS PÚBLICOS E PREFIXOS ---------
  for (const pub of PUBLIC_PREFIXES) {
    if (pathname === pub || pathname.startsWith(pub + "/")) {
      return NextResponse.next();
    }
  }

  // --- CHECAR COOKIES DE SESSÃO SUPABASE ------------
  const cookieNamesToCheck = [
    "sb-access-token",
    "sb-refresh-token",
    "sb:token",
    "supabase-auth-token",
  ];

  const hasSession = cookieNamesToCheck.some((name) => {
    const c = req.cookies.get(name);
    return c && c.value && c.value.length > 0;
  });

  if (!hasSession) {
    // não autenticado → manda para /
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = `redirectedFrom=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// --- ROTAS PROTEGIDAS ---------------------------------
export const config = {
  matcher: [
    "/inicio/:path*",
    "/comprar/:path*",
    "/vender/:path*",
    "/imoveis/:path*",
    "/extrato/:path*",
    "/perfil/:path*",
  ],
};