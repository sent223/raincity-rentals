import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// Logged-out visitors are sent to the login page and brought back afterwards.
export const proxy = auth((req) => {
  if (req.auth?.user) return;

  const { pathname, search } = req.nextUrl;
  const loginUrl = new URL("/login", req.nextUrl.origin);
  loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/vehicles/:id/book", "/bookings/:path*", "/company/:path*"],
};