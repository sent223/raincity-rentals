import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "./lib/types";

export const authConfig = {
  providers: [],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role;
        token.companyId = user.companyId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.companyId = token.companyId as number | null;
      return session;
    },
  },
} satisfies NextAuthConfig;