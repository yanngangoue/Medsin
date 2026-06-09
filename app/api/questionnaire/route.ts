import { NextResponse } from "next/server";
import { catchRouteError } from "@/lib/api/catch-route-error";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isDemoMode } from "@/lib/is-demo-mode";
import { demoGetQuestionnaire, demoUpsertQuestionnaire } from "@/lib/demo-store";

export async function GET(req: Request) {
  return catchRouteError("questionnaire/GET", async () => {
    void req.url;
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({}, { status: 401 });
      }
      if (isDemoMode()) {
        const q = demoGetQuestionnaire(session.user.id);
        return NextResponse.json(q ?? {});
      }
      const q = await prisma.questionnaire.findUnique({
        where: { userId: session.user.id },
      });
      return NextResponse.json(q ?? {});
  });
}

const schema = z.object({
  objectif: z.string(),
  poids: z.number(),
  taille: z.number(),
  glpAntecedent: z.boolean(),
  glpLequel: z.string().optional(),
  antecedents: z.array(z.string()),
  medicaments: z.boolean(),
  medicamentsDesc: z.string().optional(),
});

export async function POST(req: Request) {
  return catchRouteError("questionnaire/POST", async () => {
    const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }

      const body = await req.json();
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Données invalides", code: "VALIDATION_ERROR" }, { status: 400 });
      }

      const imc = parsed.data.poids / Math.pow(parsed.data.taille / 100, 2);
      const imcRounded = Math.round(imc * 10) / 10;
      const now = new Date();
      if (isDemoMode()) {
        const q = demoUpsertQuestionnaire(session.user.id, {
          ...parsed.data,
          imc: imcRounded,
          submittedAt: now,
        });
        return NextResponse.json(q, { status: 201 });
      }
      const q = await prisma.questionnaire.upsert({
        where: { userId: session.user.id },
        update: { ...parsed.data, imc: imcRounded, submittedAt: now },
        create: { userId: session.user.id, ...parsed.data, imc: imcRounded, submittedAt: now },
      });
      return NextResponse.json(q, { status: 201 });
  });
}
