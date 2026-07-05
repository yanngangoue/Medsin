import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { isDemoMode } from "@/lib/is-demo-mode";
import { checkLoginRateLimit } from "@/lib/login-rate-limit";
import { writeAuditLog } from "@/lib/audit";
import shared from "./auth.shared";

function clientIpFromRequest(request: Request | undefined): string | null {
  if (!request) return null;
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip");
}

const OAUTH_PROVIDERS = ["google", "microsoft-entra-id"] as const;
type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];
function isOAuthProvider(provider: string | undefined): provider is OAuthProvider {
  return OAUTH_PROVIDERS.includes(provider as OAuthProvider);
}

async function findOrCreateOAuthUser(
  email: string,
  name: string | undefined | null,
  provider: string,
): Promise<{ id: string; email: string; prenom: string; role: Role }> {
  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true, prenom: true, role: true, isActive: true },
  });

  if (existing) {
    if (existing.isActive === false) {
      throw new Error("Compte désactivé");
    }
    await writeAuditLog({ userId: existing.id, action: "login", entity: provider });
    return existing;
  }

  const prenom = (name ?? email.split("@")[0] ?? "Utilisateur")
    .split(" ")[0] ?? "Utilisateur";

  const created = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      prenom,
      name: name ?? prenom,
      role: "PATIENT",
      emailVerified: new Date(),
      isActive: true,
    },
    select: { id: true, email: true, prenom: true, role: true },
  });

  await writeAuditLog({ userId: created.id, action: "register", entity: provider });
  return created;
}

export const { handlers, signIn, signOut } = NextAuth({
  ...shared,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: { params: { prompt: "select_account" } },
          }),
        ]
      : []),
    ...(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
      ? [
          MicrosoftEntraID({
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID ?? "common"}/v2.0`,
          }),
        ]
      : []),
    Credentials({
      async authorize(credentials, request) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(8),
          })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const password = parsed.data.password;

        const ip = clientIpFromRequest(request);
        const rateKey = `${ip ?? "unknown"}:${email}`;
        if (!checkLoginRateLimit(rateKey)) {
          await writeAuditLog({
            userId: null,
            action: "login_rate_limited",
            entity: email,
            ipAddress: ip,
          });
          return null;
        }

        const bcrypt = await import("bcryptjs");

        if (isDemoMode()) {
          const { demoFindUserByEmail } = await import("@/lib/demo-store");
          const user = demoFindUserByEmail(email);
          if (!user?.passwordHash) return null;
          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;
          await writeAuditLog({
            userId: user.id,
            action: "login",
            entity: "credentials",
            ipAddress: ip,
          });
          return {
            id: user.id,
            email: user.email,
            name: user.prenom,
            prenom: user.prenom,
            role: user.role,
          };
        }

        let user;
        try {
          user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
          });
        } catch (e) {
          console.error("[authorize] DB error during findFirst:", e);
          return null;
        }

        if (!user) {
          console.warn("[authorize] user not found");
          return null;
        }
        if (!user.passwordHash) {
          console.warn("[authorize] user has no password hash");
          return null;
        }

        if (user.isActive === false) {
          console.warn("[authorize] account disabled");
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          console.warn("[authorize] invalid password");
          return null;
        }

        await writeAuditLog({
          userId: user.id,
          action: "login",
          entity: "credentials",
          ipAddress: ip,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.prenom,
          prenom: user.prenom,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Not a sign-in event — just return the existing token
      if (!user) return token;

      // Credentials provider
      if (account?.provider === "credentials") {
        token.id = user.id;
        token.role = user.role;
        token.prenom = user.prenom;
        token.email = user.email ?? undefined;
        token.mustChangePassword = (user.mustChangePassword as boolean | undefined) ?? false;
        return token;
      }

      // OAuth providers (Google, Microsoft) — find or create user in our DB
      if (account && isOAuthProvider(account.provider) && user.email) {
        try {
          const dbUser = await findOrCreateOAuthUser(user.email, user.name, account.provider);
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.prenom = dbUser.prenom;
          token.email = dbUser.email;
          token.mustChangePassword = false;
        } catch (e) {
          console.error("[OAuth jwt]", account.provider, e);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.prenom = token.prenom as string;
        if (token.email) session.user.email = token.email;
        session.user.mustChangePassword = token.mustChangePassword === true;
      }
      return session;
    },
  },
});
