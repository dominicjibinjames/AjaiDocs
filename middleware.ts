import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "./lib/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/docs") && !hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/docs", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/docs/:path*", "/login"],
};
