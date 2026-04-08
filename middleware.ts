import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "safarkhar_session";

/** Routes that require authentication */
const PROTECTED_PATHS = [
  "/dashboard",
  "/trips",
  "/vehicles",
  "/wallets",
  "/reports",
  "/activity",
];

/** Public paths that authenticated users should be redirected away from */
const AUTH_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAuthPath = AUTH_PATHS.some((p) => pathname === p);

  // Unauthenticated user trying to access a protected route → login
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user visiting login/register → dashboard
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
