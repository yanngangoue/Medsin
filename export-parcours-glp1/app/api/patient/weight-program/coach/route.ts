import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDemoMode } from "@/lib/is-demo-mode";
import {
  ensureCoachWelcome,
  listCoachMessages,
  sendCoachMessage,
} from "@/lib/patient/ai-coach";
import { getWeightProgramForUser } from "@/lib/patient/weight-program";
import { coachMessageSchema } from "@/lib/schemas/weight-program";

function patientPrenom(session: { user: { prenom?: string | null; name?: string | null } }): string {
  return session.user.prenom ?? session.user.name ?? "";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Accès réservé aux patients" }, { status: 403 });
  }

  if (isDemoMode()) {
    return NextResponse.json({
      messages: [
        {
          id: "demo-welcome",
          role: "assistant",
          content:
            "Bonjour — je suis Anne, votre coach santé MedSim. Comment vous sentez-vous dans votre parcours cette semaine ?",
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }

  const program = await getWeightProgramForUser(session.user.id);
  if (!program) {
    return NextResponse.json({ messages: [] });
  }

  await ensureCoachWelcome({
    userId: session.user.id,
    prenom: patientPrenom(session),
    program,
  });

  const messages = await listCoachMessages(session.user.id);
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Accès réservé aux patients" }, { status: 403 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = coachMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Message invalide" }, { status: 400 });
  }

  if (isDemoMode()) {
    return NextResponse.json({
      userMessage: {
        id: "demo-user",
        role: "user",
        content: parsed.data.message,
        createdAt: new Date().toISOString(),
      },
      assistantMessage: {
        id: "demo-assistant",
        role: "assistant",
        content:
          "Merci pour ce partage. En mode démo, configurez ANTHROPIC_API_KEY pour des réponses personnalisées. Continuez vos check-ins réguliers — c'est la clé avec le GLP-1.",
        createdAt: new Date().toISOString(),
      },
    });
  }

  const program = await getWeightProgramForUser(session.user.id);
  if (!program) {
    return NextResponse.json({ error: "Programme introuvable" }, { status: 404 });
  }

  try {
    const result = await sendCoachMessage({
      userId: session.user.id,
      prenom: patientPrenom(session),
      message: parsed.data.message,
      program,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur coach IA";
    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "Coach IA non configuré (clé API manquante)." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
