import NextAuth from "next-auth";
import shared from "./auth.shared";

/** Middleware Edge : pas de Prisma ni de providers Credentials ici. */
export const { auth } = NextAuth({
  ...shared,
  providers: [],
});
