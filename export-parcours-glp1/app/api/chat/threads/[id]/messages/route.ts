import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  assertThreadAccess,
  listThreadMessages,
  markThreadRead,
  maybeSendAwayMessage,
  sendThreadMessage,
} from "@/lib/chat/service";
import { auditMedicalRecordAccess } from "@/lib/audit-medical";
import { isDemoMode } from "@/lib/is-demo-mode";

type Params = { params: Promise<{ id: string }> };

const sendSchema = z.object({
  content: z.string().max(4000).default(""),
  attachmentUrl: z.string().optional().nullable(),
  attachmentId: z.string().uuid().optional().nullable(),
});

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  if (isDemoMode()) {
    return NextResponse.json({ messages: [] });
  }

  const access = await assertThreadAccess(id, session.user.id, session.user.role);
  if (!access) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  if (session.user.role !== "PATIENT") {
    await auditMedicalRecordAccess({
      accessorId: session.user.id,
      patientId: access.patientId,
      resource: "chat_thread",
      resourceId: id,
    });
  }

  const messages = await listThreadMessages(id, session.user.id);
  await markThreadRead(id, session.user.id);

  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body: unknown = await req.json().catch(() => null);
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Message invalide" }, { status: 400 });
  }

  if (isDemoMode()) {
    return NextResponse.json({
      message: {
        id: "demo",
        senderId: session.user.id,
        role: session.user.role === "PATIENT" ? "PATIENT" : "IPS",
        content: parsed.data.content,
        isRead: false,
        readAt: null,
        attachmentUrl: null,
        createdAt: new Date().toISOString(),
        isMine: true,
      },
    });
  }

  const access = await assertThreadAccess(id, session.user.id, session.user.role);
  if (!access) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const role =
    session.user.role === "PATIENT"
      ? ("PATIENT" as const)
      : session.user.role === "IPS"
        ? ("IPS" as const)
        : ("MEDECIN" as const);

  const hasBody = parsed.data.content.trim().length > 0;
  const hasAttachment = Boolean(parsed.data.attachmentId || parsed.data.attachmentUrl);
  if (!hasBody && !hasAttachment) {
    return NextResponse.json({ error: "Message vide" }, { status: 400 });
  }

  const message = await sendThreadMessage({
    threadId: id,
    senderId: session.user.id,
    role,
    content: parsed.data.content,
    attachmentUrl: parsed.data.attachmentUrl ?? null,
    attachmentId: parsed.data.attachmentId ?? null,
  });

  if (role === "PATIENT") {
    await maybeSendAwayMessage(id, access.professionalId);
  }

  return NextResponse.json({ message }, { status: 201 });
}
