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
        const path = req.nextUrl.pathname;
        
        // Protect /backoffice: Only allow SUPERADMIN and STAFF
        if (path.startsWith("/backoffice")) {
          return !!token && (token.role === "SUPERADMIN" || token.role === "STAFF");
        }
        
        // Protect /dashboard: Allow any logged in user
        if (path.startsWith("/dashboard")) {
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
