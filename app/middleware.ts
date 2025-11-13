import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("sb-access-token");

  const protectedPaths = [
    "/inicio",
    "/comprar",
    "/vender",
    "/imoveis",
    "/extrato",
  ];

  const { pathname } = req.nextUrl;

  // verifica se rota é protegida
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtected && !session) {
    // redireciona para home pública
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/inicio/:path*",
    "/comprar/:path*",
    "/vender/:path*",
    "/imoveis/:path*",
    "/extrato/:path*",
  ],
};