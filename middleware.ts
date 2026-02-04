import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Protect admin routes with role check
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const role = req.auth?.user?.role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
