import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPaths = ["/home", "/explore", "/bookmarks", "/notifications", "/profile"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow Better Auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4)).*)",
    "/(api|trpc)(.*)",
  ],
};