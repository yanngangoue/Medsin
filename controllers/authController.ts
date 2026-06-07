import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

const DEPRECATED_MSG =
  "Cette route est désactivée. Utilisez la connexion NextAuth via /connexion ou signIn('credentials').";

/** @deprecated Utiliser NextAuth (`/api/auth/[...nextauth]`) — ne crée plus de session. */
export async function registerUser() {
  return NextResponse.json({ error: DEPRECATED_MSG }, { status: 410 });
}

/** @deprecated Utiliser NextAuth (`/api/auth/[...nextauth]`) — ne crée plus de session. */
export async function loginUser() {
  return NextResponse.json({ error: DEPRECATED_MSG }, { status: 410 });
}

/** Nettoie l'ancien cookie JWT `medsim_token` (sessions legacy). */
export async function logoutUser() {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}
