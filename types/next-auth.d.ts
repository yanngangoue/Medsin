import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    prenom: string;
    role: Role;
    mustChangePassword?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      prenom: string;
      email?: string | null;
      mustChangePassword?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    prenom?: string;
    email?: string;
    mustChangePassword?: boolean;
  }
}
