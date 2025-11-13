// middleware.ts  (colocar na raiz do projeto)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // caminhos públicos — ajuste se precisar adicionar/remover rotas públicas
  const PUBLIC_PATHS = [
    "/",
    "/login",
    "/cadastro",
    "/favicon.ico",
  ];

  // permitir tudo do _next, assets e api sem checar auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // permitir caminhos explicitamente públicos
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Nomes de cookie comuns do Supabase / helpers — ajuste se você usa outros
  const cookieNamesToCheck = [
    "sb-access-token",
    "sb-refresh-token",
    "sb:token",
    "supabase-auth-token",
  ];

  let hasSession = false;
  for (const name of cookieNamesToCheck) {
    const c = req.cookies.get(name);
    if (c && c.value && c.value.length > 0) {
      hasSession = true;
      break;
    }
  }

  if (!hasSession) {
    // não autenticado -> redireciona para / (página pública)
    const url = req.nextUrl.clone();
    url.pathname = "/";
    // opcional: informa de onde veio para o login redirecionar de volta
    url.search = `redirectedFrom=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configura quais rotas o middleware aplica — protege as rotas da APP que você listou
export const config = {
  // protege as rotas do painel (ajuste se tiver mais caminhos a proteger)
  matcher: [
    "/inicio",
    "/inicio/:path*",
    "/comprar",
    "/comprar/:path*",
    "/vender",
    "/vender/:path*",
    "/imoveis",
    "/imoveis/:path*",
    "/extrato",
    "/extrato/:path*",
    "/perfil",
    "/perfil/:path*",
  ],
};