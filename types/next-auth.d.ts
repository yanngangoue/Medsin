import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    prenom: string;
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      prenom: string;
      email?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    prenom?: string;
    email?: string;
  }
}
