import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";

export const runtime = "nodejs";

/** Diagnostic rapide pour Vercel : DB configurée et joignable. */
export async function GET() {
  const demo = isDemoMode();
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
  const hasAuthSecret = Boolean(
    process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim(),
  );

  if (demo) {
    return NextResponse.json(
      {
        ok: false,
        inscription: "demo_mode",
        message: "Mode démo actif — l'inscription ne persiste pas. Désactivez MEDSIM_DEMO_MODE en production.",
      },
      { status: 503 },
    );
  }

  if (!hasDatabaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        inscription: "no_database_url",
        message: "DATABASE_URL manquante sur Vercel. Ajoutez la chaîne Neon dans les variables d'environnement.",
      },
      { status: 503 },
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      inscription: "ready",
      authSecret: hasAuthSecret,
      message: "Base de données joignable — l'inscription peut fonctionner.",
    });
  } catch (e) {
    console.error("[health]", e);
    return NextResponse.json(
      {
        ok: false,
        inscription: "db_unreachable",
        message: "DATABASE_URL présente mais la base ne répond pas. Vérifiez Neon (pooler + sslmode=require).",
      },
      { status: 503 },
    );
  }
}
