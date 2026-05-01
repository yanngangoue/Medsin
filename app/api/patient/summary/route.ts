import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionPayload } from "@/lib/auth";
import { generatePatientSummary } from "@/lib/patient-summary";

const bodySchema = z.object({
  age: z.coerce.number().int().min(18).max(120),
  weightKg: z.coerce.number().positive().max(400),
  heightCm: z.coerce.number().positive().max(280),
  bmi: z.coerce.number(),
  medicalHistory: z.string().min(1).max(8000),
});

/** Génère un résumé descriptif (Claude). Pas un avis médical. */
export async function POST(req: Request) {
  const session = await getSessionPayload();
  if (!session?.sub) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const summary = await generatePatientSummary(parsed.data);
    return NextResponse.json({
      summary,
      disclaimer:
        "Texte informatif produit par un outil automatisé. Ce n’est pas un diagnostic ni un conseil médical.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "Résumé IA non configuré (clé API manquante)." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
