import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessDossier } from "@/lib/medecin/dossier-access";
import { logAuditMedical, requestMeta } from "@/lib/medecin/audit";
import { requireMedecinApi } from "@/lib/medecin/require-medecin";
import { forbidden, badRequest } from "@/lib/api-errors";
import { parseGlp1HealthInfo } from "@/lib/patient/glp1-dossier";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const auth = await requireMedecinApi();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const dossier = await prisma.dossierGlp1.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          id: true,
          prenom: true,
          name: true,
          email: true,
          createdAt: true,
          profile: true,
          questionnaire: true,
        },
      },
      prescription: true,
      questionnaire: true,
    },
  });

  if (!dossier) return badRequest("Dossier introuvable");
  if (!canAccessDossier(auth.role, auth.user.id, dossier)) return forbidden();

  if (dossier.status === "EN_ATTENTE_MEDECIN") {
    await prisma.dossierGlp1.update({
      where: { id },
      data: {
        status: "EN_COURS_REVISION",
        medecinId: dossier.medecinId ?? auth.user.id,
      },
    });
    dossier.status = "EN_COURS_REVISION";
    dossier.medecinId = dossier.medecinId ?? auth.user.id;
  }

  const meta = requestMeta(req);
  await logAuditMedical({
    medecinId: auth.user.id,
    patientId: dossier.patientId,
    action: "DOSSIER_OUVERT",
    details: { dossierId: id },
    ...meta,
  });

  const [messages, prescriptionsHistory, appointments] = await Promise.all([
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: dossier.patientId },
          { receiverId: dossier.patientId },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 50,
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        createdAt: true,
        read: true,
      },
    }),
    prisma.prescription.findMany({
      where: { patientId: dossier.patientId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        medicament: true,
        status: true,
        signatureDate: true,
        createdAt: true,
      },
    }),
    prisma.appointment.findMany({
      where: { userId: dossier.patientId },
      orderBy: { scheduledAt: "desc" },
      take: 5,
      select: { id: true, scheduledAt: true, status: true },
    }),
  ]);

  const healthInfo =
    dossier.healthInfoSnapshot ?? dossier.patient.profile?.healthInfo;
  const glp1 = parseGlp1HealthInfo(healthInfo);

  const medecin = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { prenom: true, name: true, medecinLicenseNumber: true },
  });

  return NextResponse.json({
    dossier: {
      ...dossier,
      createdAt: dossier.createdAt.toISOString(),
      updatedAt: dossier.updatedAt.toISOString(),
      decisionDate: dossier.decisionDate?.toISOString() ?? null,
    },
    glp1,
    messages,
    prescriptionsHistory,
    appointments,
    medecin: {
      id: auth.user.id,
      name: medecin?.prenom || medecin?.name || "Médecin",
      license: medecin?.medecinLicenseNumber ?? null,
    },
  });
}
