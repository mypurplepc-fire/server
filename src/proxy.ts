import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Auth gate for page routes. Next.js 16 renamed `middleware` to `proxy` and
 * this file runs on the Node.js runtime.
 *
 * This is a fast, cookie-based check only. It is NOT an authorization
 * boundary: every server component and route handler must still call
 * `requireUser()` / `requireApiRole()` from `@/lib/auth-helpers`.
 */

const PUBLIC_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"];

const AUTH_PREFIXES = ["/dashboard", "/projects", "/admin", "/settings"];

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isProtectedPage(pathname: string): boolean {
  return AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (isProtectedPage(pathname) && !token) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("from", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPage(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Everything except:
     * - /api/*            (route handlers do their own auth via requireApiRole)
     * - /_next/*          (build output)
     * - static assets
     * NextAuth's own endpoints live under /api/auth and are matched by the
     * negative lookahead below, so they still reach the handler untouched.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
