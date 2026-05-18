import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale, pickLocaleFromAcceptLanguage } from "@/i18n/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(existing)) return NextResponse.next();

  const detected = pickLocaleFromAcceptLanguage(request.headers.get("accept-language"));
  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE, detected, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
