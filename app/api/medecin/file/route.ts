import { NextResponse } from "next/server";
import { dossierFileWhere } from "@/lib/medecin/dossier-access";
import {
  EMPTY_MEDECIN_FILE_RESPONSE,
  type MedecinFileDossierRow,
  type MedecinFileResponse,
} from "@/lib/medecin/file-response";
import { dossierGlp1Client } from "@/lib/medecin/prisma-dossier";
import { requireMedecinApi } from "@/lib/medecin/require-medecin";

const URGENT_MS = 48 * 60 * 60 * 1000;

type DossierWithPatient = {
  id: string;
  patientId: string;
  status: string;
  suggestionImc: number | null;
  suggestionEligibilite: string | null;
  createdAt: Date;
  patient?: {
    prenom: string;
    name: string | null;
    email: string;
    profile: { bmi: number | null; age: number | null } | null;
  } | null;
};

export async function GET() {
  const auth = await requireMedecinApi();
  if ("error" in auth) return auth.error;

  const dossierDb = dossierGlp1Client();
  if (!dossierDb) {
    console.error(
      "[api/medecin/file] Modèle DossierGlp1 absent du client Prisma. Exécutez: npx prisma generate",
    );
    return NextResponse.json({
      ...EMPTY_MEDECIN_FILE_RESPONSE,
      error: "Modèle DossierGlp1 non disponible — exécutez npx prisma generate",
    });
  }

  try {
    const where = dossierFileWhere(auth.user.id, auth.role);

    const dossiers = (await dossierDb.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        patient: {
          select: {
            id: true,
            prenom: true,
            name: true,
            email: true,
            profile: { select: { bmi: true, age: true } },
          },
        },
      },
    })) as DossierWithPatient[];

    const now = Date.now();
    const urgent: DossierWithPatient[] = [];
    const nouveau: DossierWithPatient[] = [];
    const enCours: DossierWithPatient[] = [];

    for (const d of dossiers) {
      if (d.status === "EN_COURS_REVISION") {
        enCours.push(d);
        continue;
      }
      const age = now - d.createdAt.getTime();
      if (age >= URGENT_MS) urgent.push(d);
      else nouveau.push(d);
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [traitesAujourdhui, allDecided] = await Promise.all([
      dossierDb.count({
        where: {
          medecinId: auth.user.id,
          decisionDate: { gte: startOfDay },
          status: { in: ["APPROUVE", "REFUSE", "INFO_REQUISE"] },
        },
      }),
      dossierDb.findMany({
        where: {
          medecinId: auth.user.id,
          decisionDate: { not: null },
        },
        select: { createdAt: true, decisionDate: true },
        take: 100,
        orderBy: { decisionDate: "desc" },
      }) as Promise<{ createdAt: Date; decisionDate: Date | null }[]>,
    ]);

    let delaiMoyenHeures: number | null = null;
    if (allDecided.length > 0) {
      const sum = allDecided.reduce((acc, d) => {
        if (!d.decisionDate) return acc;
        return acc + (d.decisionDate.getTime() - d.createdAt.getTime());
      }, 0);
      delaiMoyenHeures = Math.round(sum / allDecided.length / 3600_000);
    }

    const mapRow = (d: DossierWithPatient): MedecinFileDossierRow => ({
      id: d.id,
      patientId: d.patientId,
      patientName: d.patient?.prenom || d.patient?.name || "Patient",
      email: d.patient?.email ?? "",
      imc: d.suggestionImc ?? d.patient?.profile?.bmi ?? null,
      age: d.patient?.profile?.age ?? null,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
      suggestionEligibilite: d.suggestionEligibilite,
    });

    const body: MedecinFileResponse = {
      stats: {
        enAttente: urgent.length + nouveau.length,
        traitesAujourdhui,
        delaiMoyenHeures,
      },
      urgent: urgent.map(mapRow),
      nouveau: nouveau.map(mapRow),
      enCours: enCours.map(mapRow),
    };

    return NextResponse.json(body);
  } catch (e) {
    console.error("[api/medecin/file]", e);
    return NextResponse.json({
      ...EMPTY_MEDECIN_FILE_RESPONSE,
      error: "Erreur lors du chargement de la file",
    });
  }
}
