import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut } = NextAuth({
  ...(isDemoMode() ? {} : { adapter: PrismaAdapter(prisma) }),
  ...authConfig,
});
