import type { DefaultSession } from "next-auth";
import type { UserRole } from "../lib/types";

declare module "next-auth" {
  interface User {
    role: UserRole;
    companyId: number | null;
  }
  interface Session {
    user: {
      id: string;
      role: UserRole;
      companyId: number | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    companyId: number | null;
  }
}