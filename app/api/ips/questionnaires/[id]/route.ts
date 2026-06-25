import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import { sendEmail } from "@/lib/email/send-email";
import { requireIpsSession } from "@/lib/ips/auth";
import { ensureIpsQuestionnaireAccess } from "@/lib/ips/questionnaire-access";
import { auditMedicalRecordAccess } from "@/lib/audit-medical";
import { generateIpsAiSummary } from "@/lib/ips/generate-ai-summary";
import { isDemoMode } from "@/lib/is-demo-mode";
import { generatePrescriptionPdf } from "@/lib/pdf-generator";
import { GLP1_MONTHLY_PRICE_CENTS } from "@/lib/membership/glp1-membership";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function formatPatientDob(draftJson: unknown): string | undefined {
  if (!draftJson || typeof draftJson !== "object") return undefined;
  const d = draftJson as Record<string, unknown>;
  const month = d.birthMonth ?? d.birth_month;
  const day = d.birthDay ?? d.birth_day;
  const year = d.birthYear ?? d.birth_year;
  if (month && day && year) return `${month} ${day}, ${year}`;
  return undefined;
}

const approveSchema = z.object({
  action: z.enum(["approve", "reject", "refer", "save_notes", "regenerate_summary"]),
  ipsNotes: z.string().optional(),
  medication: z.string().optional(),
  dosage: z.string().optional(),
  duration: z.number().int().min(1).max(12).optional(),
  refills: z.number().int().min(0).max(12).optional(),
  instructions: z.string().optional(),
  rejectReason: z.string().optional(),
});

export async function GET(_req: Request, { params }: Params) {
  return catchRouteError("ips/questionnaires/[id]/GET", async () => {
    const session = await requireIpsSession();
      if (!session) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
    
      const { id } = await params;
    
      if (isDemoMode()) {
        return NextResponse.json({ error: "Mode démo — dossier indisponible", code: "NOT_FOUND" }, { status: 404 });
      }
    
      const questionnaire = await prisma.medicalQuestionnaire.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, prenom: true, email: true } },
          medicationFulfillment: true,
        },
      });
    
      if (!questionnaire) {
        return NextResponse.json({ error: "Introuvable", code: "NOT_FOUND" }, { status: 404 });
      }
    
      const access = await ensureIpsQuestionnaireAccess(questionnaire, {
        id: session.user.id,
        role: session.user.role as "IPS" | "MEDECIN" | "ADMIN",
      });
      if (!access.allowed) {
        return NextResponse.json(
          {
            error:
              "Ce dossier est assigné à une autre IPS. Consultez votre file d'attente sur /dashboard/ips.",
            code: "FORBIDDEN",
          },
          { status: 403 },
        );
      }
    
      await auditMedicalRecordAccess({
        accessorId: session.user.id,
        patientId: questionnaire.userId,
        resource: "medical_questionnaire",
        resourceId: id,
      });
    
      const eligibility = await prisma.eligibilityCheck.findFirst({
        where: { userId: questionnaire.userId },
        orderBy: { createdAt: "desc" },
      });
    
      const aiSummary = await generateIpsAiSummary({
        ...questionnaire,
        age: eligibility?.age ?? null,
      });
    
      return NextResponse.json({
        questionnaire,
        aiSummary,
        age: eligibility?.age ?? null,
        receivedAt: questionnaire.createdAt.toISOString(),
      });
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return catchRouteError("ips/questionnaires/[id]/PATCH", async () => {
    const session = await requireIpsSession();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
    
      const { id } = await params;
      const body: unknown = await req.json().catch(() => null);
      const parsed = approveSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Données invalides", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    
      if (isDemoMode()) {
        return NextResponse.json({ ok: true, demo: true });
      }
    
      const questionnaire = await prisma.medicalQuestionnaire.findUnique({
        where: { id },
        include: { user: true, medicationFulfillment: true },
      });
    
      if (!questionnaire) {
        return NextResponse.json({ error: "Introuvable", code: "NOT_FOUND" }, { status: 404 });
      }
    
      const access = await ensureIpsQuestionnaireAccess(questionnaire, {
        id: session.user.id,
        role: session.user.role as "IPS" | "MEDECIN" | "ADMIN",
      });
      if (!access.allowed) {
        return NextResponse.json({ error: "Accès refusé", code: "FORBIDDEN" }, { status: 403 });
      }
    
      const { action, ipsNotes, medication, dosage, duration, refills, instructions, rejectReason } =
        parsed.data;
    
      if (action === "regenerate_summary") {
        const aiSummary = await generateIpsAiSummary({
          ...questionnaire,
          age:
            (
              await prisma.eligibilityCheck.findFirst({
                where: { userId: questionnaire.userId },
                orderBy: { createdAt: "desc" },
              })
            )?.age ?? null,
        });
        return NextResponse.json({ ok: true, aiSummary });
      }
    
      if (action === "save_notes") {
        await prisma.medicalQuestionnaire.update({
          where: { id },
          data: { ipsNotes: ipsNotes ?? null, status: "UNDER_REVIEW", ipsId: session.user.id },
        });
        return NextResponse.json({ ok: true });
      }
    
      if (action === "reject") {
        if (!rejectReason?.trim()) {
          return NextResponse.json(
            { error: "Le motif de refus est obligatoire", code: "VALIDATION_ERROR" },
            { status: 400 },
          );
        }
        const reason = rejectReason.trim();
        await prisma.medicalQuestionnaire.update({
          where: { id },
          data: {
            status: "REJECTED",
            rejectionReason: reason,
            ipsNotes: reason,
            ipsId: session.user.id,
            reviewedAt: new Date(),
            rejectedAt: new Date(),
          },
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
        await sendEmail({
          to: questionnaire.user.email,
          subject: "Votre demande Anne-sante",
          template: "questionnaire_rejected",
          entityKey: `questionnaire_rejected:${id}`,
          userId: questionnaire.userId,
          html: `<p>Bonjour ${questionnaire.user.prenom},</p>
<p>Après examen de votre dossier, votre IPS n'a pas pu approuver votre demande pour le moment.</p>
<p><strong>Motif :</strong> ${reason}</p>
<p>Nous vous recommandons de consulter votre médecin de famille pour un suivi adapté.</p>
<p><a href="${baseUrl}/dashboard/patient">Accéder à mon espace</a></p>`,
          text: `Bonjour ${questionnaire.user.prenom}, dossier refusé. Motif : ${reason}. Consultez votre médecin.`,
        });

        await prisma.appNotification.create({
          data: {
            userId: questionnaire.userId,
            type: "questionnaire_rejected",
            title: "Dossier refusé",
            body: reason.slice(0, 200),
          },
        });

        return NextResponse.json({ ok: true, status: "REJECTED" });
      }
    
      if (action === "refer") {
        const note = ipsNotes ?? "Référé au médecin superviseur pour avis complémentaire.";
        await prisma.medicalQuestionnaire.update({
          where: { id },
          data: {
            status: "UNDER_REVIEW",
            ipsNotes: note,
            ipsId: session.user.id,
          },
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
        await sendEmail({
          to: questionnaire.user.email,
          subject: "Votre dossier Anne-sante — consultation médicale recommandée",
          template: "questionnaire_referred",
          entityKey: `questionnaire_referred:${id}`,
          userId: questionnaire.userId,
          html: `<p>Bonjour ${questionnaire.user.prenom},</p>
<p>Votre IPS a examiné votre dossier et recommande une consultation avec un médecin avant de poursuivre.</p>
<p><strong>Note clinique :</strong> ${note}</p>
<p><a href="${baseUrl}/dashboard/patient">Accéder à mon espace</a></p>`,
          text: `Bonjour ${questionnaire.user.prenom}, consultation médicale recommandée. ${note}`,
        });

        return NextResponse.json({ ok: true, status: "UNDER_REVIEW" });
      }
    
      if (action === "approve") {
        if (!medication || !dosage || !duration) {
          return NextResponse.json({ error: "Ordonnance incomplète", code: "VALIDATION_ERROR" }, { status: 400 });
        }
    
        if (questionnaire.medicationFulfillment) {
          return NextResponse.json({
            ok: true,
            fulfillmentId: questionnaire.medicationFulfillment.id,
            status: questionnaire.status,
          });
        }
    
        const pharmacy = await prisma.pharmacyPartner.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        });
    
        const ipsUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { prenom: true, name: true, medecinLicenseNumber: true },
        });
    
        const pdfBuffer = generatePrescriptionPdf({
          patientName: questionnaire.user.prenom,
          patientDob: formatPatientDob(questionnaire.draftJson),
          medication,
          dosage,
          durationMonths: duration,
          refills: refills ?? 2,
          instructions: instructions ?? "",
          ipsName: ipsUser?.prenom ?? ipsUser?.name ?? "IPS Anne-sante",
          ipsLicense: ipsUser?.medecinLicenseNumber ?? undefined,
          issuedAt: new Date(),
        });
        const pdfUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

        const fulfillment = await prisma.medicationFulfillment.create({
          data: {
            questionnaireId: id,
            userId: questionnaire.userId,
            ipsId: session.user.id,
            medication,
            dosage,
            duration,
            refills: refills ?? 2,
            instructions: instructions ?? "",
            pharmacyId: pharmacy?.id ?? null,
            status: "ISSUED",
            paymentStatus: "PENDING",
            amountCents: GLP1_MONTHLY_PRICE_CENTS,
            pdfUrl,
            pdfGeneratedAt: new Date(),
          },
        });

        await prisma.fulfillmentStatusHistory.create({
          data: {
            fulfillmentId: fulfillment.id,
            status: "ISSUED",
            note: "Ordonnance approuvée par IPS — en attente de paiement patient",
          },
        });
    
        await prisma.medicalQuestionnaire.update({
          where: { id },
          data: {
            status: "APPROVED",
            ipsId: session.user.id,
            ipsNotes: ipsNotes ?? null,
            reviewedAt: new Date(),
            approvedAt: new Date(),
          },
        });
    
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

        await sendEmail({
          to: questionnaire.user.email,
          subject: "Bonne nouvelle ! Complétez votre abonnement Anne-sante",
          template: "prescription_ready",
          entityKey: `prescription_ready:${fulfillment.id}`,
          userId: questionnaire.userId,
          html: `<p>Bonjour ${questionnaire.user.prenom},</p>
<p><strong>Votre IPS a approuvé votre dossier.</strong> Pour lancer la préparation et la livraison de votre médicament, activez votre abonnement à <strong>149,99 $/mois</strong>.</p>
<p><a href="${baseUrl}/paiement?fulfillment=${fulfillment.id}" style="display:inline-block;background:#1D4D3A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Compléter mon abonnement</a></p>`,
          text: `Bonjour ${questionnaire.user.prenom}, dossier approuvé. Abonnement : ${baseUrl}/paiement?fulfillment=${fulfillment.id}`,
        });

        await prisma.appNotification.create({
          data: {
            userId: questionnaire.userId,
            type: "prescription_ready",
            title: "Dossier approuvé — abonnement requis",
            body: "Votre IPS a approuvé votre dossier. Activez votre abonnement pour lancer la livraison.",
          },
        });
    
        await writeAuditLog({
          userId: session.user.id,
          action: "ips_prescription_approved",
          entity: fulfillment.id,
        });
    
        return NextResponse.json({
          ok: true,
          fulfillmentId: fulfillment.id,
          status: "APPROVED",
        });
      }
    
      return NextResponse.json({ error: "Action inconnue", code: "VALIDATION_ERROR" }, { status: 400 });
  });
}
