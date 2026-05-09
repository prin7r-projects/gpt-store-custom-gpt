/**
 * [SERIOUSSEQUEL_MIDDLEWARE] Security headers + CORS + referral tracking.
 *
 * Applies per docs/12 §7:
 * - CSP: default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.nowpayments.io;
 * - CORS: Access-Control-Allow-Origin https://gpt-store-custom-gpt.prin7r.com
 * - CSRF: SameSite=Lax on any future cookie (Next.js default)
 *
 * Referral tracking (docs/13 Phase 2 task 4):
 * - Reads ?ref=<slug> from landing page URL query params.
 * - Sets a 30-day cookie `serioussequel_ref` so the referral source survives the
 *   GPT Store → landing → checkout → IPN journey.
 * - The cookie is read by the checkout API and persisted with the order.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CSP_HEADER =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.nowpayments.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self';";

const ALLOWED_ORIGIN = "https://gpt-store-custom-gpt.prin7r.com";

const REF_COOKIE = "serioussequel_ref";
const REF_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // CSP header on all responses
  response.headers.set("Content-Security-Policy", CSP_HEADER);

  // CORS: allow only production origin
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.headers.set("Vary", "Origin");

  // Additional security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Referral tracking (Phase 2): capture ?ref= query param into 30-day cookie
  const { searchParams } = request.nextUrl;
  const ref = searchParams.get("ref");
  if (ref && ref.length > 0 && ref.length <= 100) {
    response.cookies.set(REF_COOKIE, ref, {
      maxAge: REF_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: true,
      httpOnly: false, // readable by client-side JS for checkout
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.svg (icon file)
     * - api/ (API routes — don't set cookies on API responses)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|api/).*)",
  ],
};
