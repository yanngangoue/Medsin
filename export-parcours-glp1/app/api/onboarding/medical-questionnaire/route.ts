import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDemoMode } from "@/lib/is-demo-mode";
import { assignIpsToQuestionnaire } from "@/lib/onboarding/assign-ips";
import { toPrismaMedicalQuestionnaire } from "@/lib/onboarding/medical-questionnaire-map";
import {
  loadQuestionnaireDraft,
  saveQuestionnaireDraft,
} from "@/lib/onboarding/questionnaire-draft";
import { prisma } from "@/lib/prisma";
import {
  medicalQuestionnaireDraftSchema,
  medicalQuestionnaireV2Schema,
} from "@/lib/schemas/medical-questionnaire-v2";
import { writeAuditLog } from "@/lib/audit";
import { sendEmail } from "@/lib/email/send-email";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Accès réservé aux patients" }, { status: 403 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ questionnaire: null, draft: null });
  }

  const [questionnaire, draft] = await Promise.all([
    prisma.medicalQuestionnaire.findFirst({
      where: { userId: session.user.id, status: { not: "DRAFT" } },
      orderBy: { updatedAt: "desc" },
    }),
    loadQuestionnaireDraft(session.user.id),
  ]);

  return NextResponse.json({ questionnaire, draft });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Accès réservé aux patients" }, { status: 403 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = medicalQuestionnaireDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ ok: true, draft: parsed.data });
  }

  await saveQuestionnaireDraft(session.user.id, parsed.data);

  return NextResponse.json({ ok: true });
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
  const parsed = medicalQuestionnaireV2Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Questionnaire incomplet", details: parsed.error.flatten() }, { status: 400 });
  }

  if (isDemoMode()) {
    return NextResponse.json({
      questionnaireId: "demo-questionnaire",
      status: "SUBMITTED",
    });
  }

  await prisma.medicalQuestionnaire.deleteMany({
    where: { userId: session.user.id, status: "DRAFT" },
  });

  const data = toPrismaMedicalQuestionnaire(session.user.id, parsed.data);
  const questionnaire = await prisma.medicalQuestionnaire.create({ data });

  const ipsId = await assignIpsToQuestionnaire(questionnaire.id);

  await writeAuditLog({
    userId: session.user.id,
    action: "medical_questionnaire_submitted",
    entity: questionnaire.id,
  });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user) {
    await sendEmail({
      to: user.email,
      subject: "Votre dossier MedSim est en cours d'examen",
      template: "questionnaire_submitted_patient",
      entityKey: `questionnaire_submitted:${questionnaire.id}`,
      userId: user.id,
      html: `<p>Bonjour ${user.prenom},</p><p>Nous avons bien reçu votre questionnaire médical. Une IPS examinera votre dossier sous 48 h.</p>`,
      text: `Bonjour ${user.prenom}, dossier reçu — réponse sous 48 h.`,
    });
  }

  if (ipsId) {
    const ips = await prisma.user.findUnique({
      where: { id: ipsId },
      select: { email: true, prenom: true },
    });
    if (ips) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
      await sendEmail({
        to: ips.email,
        subject: `Nouveau dossier patient — ${user?.prenom ?? "Patient"}`,
        template: "questionnaire_submitted_ips",
        entityKey: `questionnaire_ips:${questionnaire.id}`,
        userId: ipsId,
        html: `<p>Bonjour ${ips.prenom},</p><p>Un nouveau questionnaire médical a été soumis (IMC ${questionnaire.bmi.toFixed(1)}).</p><p><a href="${baseUrl}/dashboard/ips/questionnaires/${questionnaire.id}">Ouvrir le dossier</a></p>`,
        text: `Nouveau dossier patient — ${baseUrl}/dashboard/ips/questionnaires/${questionnaire.id}`,
      });
    }
  }

  return NextResponse.json(
    { questionnaireId: questionnaire.id, status: questionnaire.status },
    { status: 201 },
  );
}
