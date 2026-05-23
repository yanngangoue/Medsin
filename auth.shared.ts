import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

const secure = process.env.NODE_ENV === "production";

export default {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  /** Remplacé dans `auth.node` (Node) ; tableau vide pour Edge / typage NextAuthConfig. */
  providers: [],
  pages: {
    signIn: "/connexion",
    error: "/connexion",
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "strict",
        secure,
        path: "/",
      },
    },
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
} satisfies NextAuthConfig;
