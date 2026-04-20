import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.file",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Kredensial tidak lengkap");
        }

        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
          if (!backendUrl) {
            throw new Error("NEXT_PUBLIC_BACKEND_API_URL is not defined");
          }
          const res = await fetch(`${backendUrl}/api/backauth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data.success && data.data) {
            return {
              id: data.data.user.id,
              name: data.data.user.name,
              email: data.data.user.email,
              role: data.data.user.role,
              tenantId: data.data.user.tenantId,
              tenantName: data.data.tenant.name,
              plan: data.data.user.plan,
              token: data.data.token, 
            };
          }
          throw new Error(data?.message || "Login gagal");
        } catch (error: any) {
          throw new Error(error.message || "Gagal terhubung ke server autentikasi");
        }
      },
    }),
  ],
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session?.plan) {
        token.plan = session.plan;
      }

      if (user) {
        if ((user as any).token || (user as any).role) {
          token.id = user.id;
          token.role = (user as any).role;
          token.tenantId = (user as any).tenantId;
          token.tenantName = (user as any).tenantName;
          token.plan = (user as any).plan;
          token.backendToken = (user as any).token; 
        } else if (account && account.provider === 'google') {
          try {
            const cookieStore = await cookies();
            const bridgeUserId = cookieStore.get("notarisone-link-userid")?.value;
            const sessionToken = 
              cookieStore.get("next-auth.session-token")?.value || 
              cookieStore.get("__Secure-next-auth.session-token")?.value ||
              cookieStore.get("next-auth.session-token.0")?.value;
            
            let oldToken = null;
            if (sessionToken) {
              try {
                oldToken = await decode({
                  token: sessionToken,
                  secret: process.env.NEXTAUTH_SECRET || "notarisone_local_secret_key"
                });
              } catch (e) {}
            }

            // Priority: Linking cookie > existing session ID > token.sub
            const finalUserId = bridgeUserId || (oldToken?.id as string) || (token?.id as string);

            if (finalUserId) {
              // Merge old session profile data if linking
              if (oldToken) {
                token.id = finalUserId;
                token.role = oldToken.role || token.role;
                token.tenantId = oldToken.tenantId || token.tenantId;
                token.tenantName = oldToken.tenantName || token.tenantName;
                token.plan = oldToken.plan || token.plan;
                token.backendToken = oldToken.backendToken || token.backendToken;
                token.email = oldToken.email || token.email;
                token.name = oldToken.name || token.name;
              } else if (!token.id) {
                token.id = finalUserId;
              }

              if (account.access_token) {
                 const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
                 if (!backendUrl) {
                   console.error("NEXT_PUBLIC_BACKEND_API_URL is not defined for Google token save");
                   return token;
                 }
                 fetch(`${backendUrl}/api/google/save-tokens`, {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify({
                     userId: finalUserId,
                     email: user.email,
                     accessToken: account.access_token,
                     refreshToken: account.refresh_token,
                     expiresAt: account.expires_at ? new Date(account.expires_at * 1000).toISOString() : null,
                   }),
                 }).catch(() => {});
              }
            }
          } catch (e) {}
        }
      }

      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).tenantName = token.tenantName;
        (session.user as any).plan = token.plan;
        (session as any).backendToken = token.backendToken;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "notarisone_local_secret_key",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
