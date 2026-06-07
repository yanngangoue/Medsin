import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { coachRepondreStream, coachRepondreStreamSansProgramme } from "@/lib/coach-ia";
import { isDemoMode } from "@/lib/is-demo-mode";
import {
  buildCoachNoProgramMessage,
  buildCoachWelcomeMessage,
  ensureCoachWelcome,
  listCoachMessages,
  toAiCoachMessagePublic,
} from "@/lib/patient/ai-coach";
import {
  getWeightProgramForUser,
  listCheckIns,
  toWeightProgramPublic,
} from "@/lib/patient/weight-program";
import { prisma } from "@/lib/prisma";
import { coachMessageSchema } from "@/lib/schemas/weight-program";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function patientPrenom(session: { user: { prenom?: string | null; name?: string | null } }): string {
  return session.user.prenom ?? session.user.name ?? "";
}

function sseLine(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Accès réservé aux patients" }, { status: 403 });
  }

  const prenom = patientPrenom(session);

  if (isDemoMode()) {
    return NextResponse.json({
      program: null,
      checkIns: [],
      messages: [
        {
          id: "demo-welcome",
          role: "assistant",
          content: buildCoachWelcomeMessage(prenom),
          createdAt: new Date().toISOString(),
          isProactive: true,
        },
      ],
    });
  }

  const program = await getWeightProgramForUser(session.user.id);
  const checkIns = await listCheckIns(session.user.id, 10);

  if (!program) {
    return NextResponse.json({
      program: null,
      checkIns: [],
      messages: [
        {
          id: "welcome-no-program",
          role: "assistant",
          content: buildCoachNoProgramMessage(prenom),
          createdAt: new Date().toISOString(),
          isProactive: true,
        },
      ],
    });
  }

  await ensureCoachWelcome({
    userId: session.user.id,
    prenom,
    program,
  });

  const messages = await listCoachMessages(session.user.id, 30);
  return NextResponse.json({ program, checkIns, messages });
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

  const messageText = parsed.data.message.trim();
  const prenom = patientPrenom(session);
  const encoder = new TextEncoder();

  if (isDemoMode()) {
    const demoReply =
      "Merci pour ce partage. En mode démo, configurez ANTHROPIC_API_KEY pour des réponses personnalisées. Je suis Anne, votre coach IA — continuez vos check-ins réguliers, c'est la clé avec le GLP-1.";

    const stream = new ReadableStream({
      async start(controller) {
        const userMessage = {
          id: `demo-user-${Date.now()}`,
          role: "user" as const,
          content: messageText,
          createdAt: new Date().toISOString(),
        };
        controller.enqueue(encoder.encode(sseLine({ type: "user", message: userMessage })));

        for (const word of demoReply.split(" ")) {
          const chunk = `${word} `;
          controller.enqueue(encoder.encode(sseLine({ type: "token", text: chunk })));
          await new Promise((r) => setTimeout(r, 35));
        }

        controller.enqueue(
          encoder.encode(
            sseLine({
              type: "done",
              assistantMessage: {
                id: `demo-assistant-${Date.now()}`,
                role: "assistant",
                content: demoReply,
                createdAt: new Date().toISOString(),
                isProactive: false,
              },
            }),
          ),
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const programRow = await prisma.weightProgram.findFirst({
    where: { userId: session.user.id, isActive: true },
    include: {
      checkIns: { orderBy: { recordedAt: "desc" }, take: 10 },
    },
  });

  if (!programRow) {
    const stream = new ReadableStream({
      async start(controller) {
        const userEphemeral = {
          id: `user-${Date.now()}`,
          role: "user" as const,
          content: messageText,
          createdAt: new Date().toISOString(),
          isProactive: false,
        };
        controller.enqueue(encoder.encode(sseLine({ type: "user", message: userEphemeral })));

        try {
          const fullReply = await coachRepondreStreamSansProgramme(
            prenom,
            [],
            messageText,
            (chunk) => {
              controller.enqueue(encoder.encode(sseLine({ type: "token", text: chunk })));
            },
          );

          controller.enqueue(
            encoder.encode(
              sseLine({
                type: "done",
                assistantMessage: {
                  id: `assistant-${Date.now()}`,
                  role: "assistant",
                  content: fullReply,
                  createdAt: new Date().toISOString(),
                  isProactive: false,
                },
              }),
            ),
          );
          controller.close();
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : "Erreur coach IA";
          const status = errMsg.includes("ANTHROPIC_API_KEY") ? 503 : 502;
          controller.enqueue(
            encoder.encode(sseLine({ type: "error", error: errMsg, status })),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const checkInsRecents = await listCheckIns(session.user.id, 10);
  const program = toWeightProgramPublic(programRow, programRow.checkIns);

  const priorRows = await prisma.aiCoachMessage.findMany({
    where: { programId: programRow.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const userRow = await prisma.aiCoachMessage.create({
    data: {
      programId: programRow.id,
      userId: session.user.id,
      role: "user",
      content: messageText,
    },
  });

  const historique = priorRows.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          sseLine({ type: "user", message: toAiCoachMessagePublic(userRow) }),
        ),
      );

      try {
        const fullReply = await coachRepondreStream(
          {
            prenom,
            programme: program,
            checkInsRecents,
            medication: programRow.medication,
            dose: programRow.currentDose,
          },
          historique,
          messageText,
          (chunk) => {
            controller.enqueue(encoder.encode(sseLine({ type: "token", text: chunk })));
          },
        );

        const assistantRow = await prisma.aiCoachMessage.create({
          data: {
            programId: programRow.id,
            userId: session.user.id,
            role: "assistant",
            content: fullReply,
          },
        });

        controller.enqueue(
          encoder.encode(
            sseLine({
              type: "done",
              assistantMessage: toAiCoachMessagePublic(assistantRow),
            }),
          ),
        );
        controller.close();
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : "Erreur coach IA";
        const status = errMsg.includes("ANTHROPIC_API_KEY") ? 503 : 502;
        controller.enqueue(
          encoder.encode(sseLine({ type: "error", error: errMsg, status })),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
