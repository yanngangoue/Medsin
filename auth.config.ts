import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { Role } from "@prisma/client";

export default {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.prenom = user.prenom;
        token.email = user.email ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.prenom = token.prenom as string;
        if (token.email) session.user.email = token.email;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(8),
          })
          .safeParse(credentials);
        if (!parsed.success) return null;
        const bcrypt = await import("bcryptjs");
        const { isDemoMode } = await import("@/lib/is-demo-mode");
        if (isDemoMode()) {
          const { demoFindUserByEmail } = await import("@/lib/demo-store");
          const user = demoFindUserByEmail(parsed.data.email);
          if (!user) return null;
          const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!valid) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.prenom,
            prenom: user.prenom,
            role: user.role,
          };
        }
        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.prenom,
          prenom: user.prenom,
          role: user.role,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
