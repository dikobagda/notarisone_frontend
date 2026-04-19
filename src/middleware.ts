import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuthPath = req.nextUrl.pathname.startsWith("/auth");
    const isTokenValid = !!req.nextauth.token;

    // If logged in and trying to access login/register, redirect to dashboard
    if (isAuthPath && isTokenValid) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Protect /dashboard and /backoffice
        const path = req.nextUrl.pathname;
        if (path.startsWith("/dashboard") || path.startsWith("/backoffice")) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
