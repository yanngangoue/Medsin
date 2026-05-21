import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
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

export const { handlers, signIn, signOut } = NextAuth({
  ...(isDemoMode() ? {} : { adapter: PrismaAdapter(prisma) }),
  ...shared,
  providers: [
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

        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        await writeAuditLog({
          userId: user.id,
          action: "login",
          entity: "credentials",
          ipAddress: ip,
        });

        const displayName = user.name
          ? `${user.prenom} ${user.name}`.trim()
          : user.prenom;
        return {
          id: user.id,
          email: user.email,
          name: displayName,
          prenom: user.prenom,
          role: user.role,
        };
      },
    }),
  ],
});
