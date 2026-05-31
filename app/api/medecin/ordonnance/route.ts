import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessDossier } from "@/lib/medecin/dossier-access";
import { logAuditMedical, requestMeta } from "@/lib/medecin/audit";
import { requireMedecinApi } from "@/lib/medecin/require-medecin";
import { createOrdonnanceSchema } from "@/lib/schemas/medecin";
import { forbidden, badRequest } from "@/lib/api-errors";

export async function POST(req: Request) {
  const auth = await requireMedecinApi();
  if ("error" in auth) return auth.error;
  if (auth.role !== "MEDECIN") return badRequest("Seul un médecin peut créer une ordonnance");

  const body = await req.json().catch(() => null);
  const parsed = createOrdonnanceSchema.safeParse(body);
  if (!parsed.success) return badRequest();

  const dossier = await prisma.dossierGlp1.findUnique({
    where: { id: parsed.data.dossierId },
    include: { prescription: true },
  });

  if (!dossier) return badRequest("Dossier introuvable");
  if (!canAccessDossier(auth.role, auth.user.id, dossier)) return forbidden();
  if (!["APPROUVE", "EN_ATTENTE_CONSULTATION"].includes(dossier.status)) {
    return badRequest("Le dossier doit être approuvé par un médecin avant l'ordonnance");
  }
  if (dossier.prescription) return badRequest("Ordonnance déjà créée pour ce dossier");

  const prescription = await prisma.prescription.create({
    data: {
      patientId: dossier.patientId,
      medecinId: auth.user.id,
      dossierGlp1Id: dossier.id,
      medicament: parsed.data.medicament,
      dosage: parsed.data.dosage,
      frequence: parsed.data.frequence,
      duree: parsed.data.duree,
      instructions: parsed.data.instructions,
      modeAdministration: parsed.data.modeAdministration ?? null,
      renouvellementAutorise: parsed.data.renouvellementAutorise ?? false,
      nombreRenouvellements: parsed.data.nombreRenouvellements ?? 0,
      notesMedicales: dossier.notesMedecin ?? "",
      status: "BROUILLON",
    },
  });

  const meta = requestMeta(req);
  await logAuditMedical({
    medecinId: auth.user.id,
    patientId: dossier.patientId,
    action: "ORDONNANCE_CREEE",
    details: { prescriptionId: prescription.id, dossierId: dossier.id },
    ...meta,
  });

  return NextResponse.json({ prescription }, { status: 201 });
}
