import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string;
      tenantName: string;
      plan: string;
    } & DefaultSession["user"];
    backendToken?: string;
    accessToken?: string;
  }

  interface User {
    id: string;
    role: string;
    tenantId: string;
    tenantName: string;
    plan: string;
    token?: string; // This is the backendToken from authorize
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string;
    role: string;
    tenantId: string;
    tenantName: string;
    plan: string;
    backendToken?: string;
    accessToken?: string;
  }
}
