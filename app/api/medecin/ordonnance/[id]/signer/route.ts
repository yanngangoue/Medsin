import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAuditMedical, requestMeta } from "@/lib/medecin/audit";
import { requireMedecinApi } from "@/lib/medecin/require-medecin";
import { signOrdonnanceSchema } from "@/lib/schemas/medecin";
import { forbidden, badRequest } from "@/lib/api-errors";
import { renderPrescriptionHtml } from "@/lib/medecin/prescription-document";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  return catchRouteError("medecin/ordonnance/[id]/signer/POST", async () => {
    const auth = await requireMedecinApi();
      if ("error" in auth) return auth.error;
      if (auth.role !== "MEDECIN") return badRequest("Seul un médecin peut signer une ordonnance");
    
      const { id } = await params;
      const body = await req.json().catch(() => null);
      const parsed = signOrdonnanceSchema.safeParse(body);
      if (!parsed.success) return badRequest();
    
      const prescription = await prisma.prescription.findUnique({
        where: { id },
        include: {
          patient: { select: { id: true, prenom: true, name: true, email: true } },
          medecin: { select: { id: true, prenom: true, name: true, passwordHash: true, medecinLicenseNumber: true } },
          dossierGlp1: true,
        },
      });
    
      if (!prescription) return badRequest("Ordonnance introuvable");
      if (prescription.medecinId !== auth.user.id) return forbidden();
      if (prescription.status !== "BROUILLON") {
        return badRequest("Ordonnance déjà signée — modification impossible");
      }
    
      const hash = prescription.medecin.passwordHash;
      if (!hash) return badRequest("Compte médecin invalide");
      const valid = await bcrypt.compare(parsed.data.password, hash);
      if (!valid) return badRequest("Mot de passe incorrect");
    
      const medecinName = prescription.medecin.prenom || prescription.medecin.name || "Médecin";
      const signedAt = new Date();
      const html = renderPrescriptionHtml({
        numeroOrdonnance: prescription.numeroOrdonnance,
        signedAt,
        medecinName,
        license: prescription.medecin.medecinLicenseNumber,
        patientName: prescription.patient.prenom || prescription.patient.name || "Patient",
        medicament: prescription.medicament,
        dosage: prescription.dosage,
        frequence: prescription.frequence,
        duree: prescription.duree,
        instructions: prescription.instructions,
        notesMedicales: prescription.notesMedicales,
      });
    
      const updated = await prisma.prescription.update({
        where: { id },
        data: {
          status: "ENVOYEE_PATIENT",
          signatureDate: signedAt,
          signatureMedecin: medecinName,
          pdfUrl: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
        },
      });
    
      const meta = requestMeta(req);
      await logAuditMedical({
        medecinId: auth.user.id,
        patientId: prescription.patientId,
        action: "ORDONNANCE_SIGNEE",
        details: {
          prescriptionId: id,
          numeroOrdonnance: prescription.numeroOrdonnance,
        },
        ...meta,
      });
    
      return NextResponse.json({
        prescription: updated,
        documentHtml: html,
      });
  });
}
