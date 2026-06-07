/**
 * Données de démonstration MedSim — staff, patients GLP-1, messages.
 * Usage : npx prisma db push && npx tsx prisma/seed.ts
 */
import { PrismaClient, type DossierStatus, type EligibilityStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  GLP1_HEALTH_INFO_VERSION,
  resolveGlp1Eligibility,
  type Glp1HealthInfoPayload,
} from "../lib/patient/glp1-dossier";
import { GLP1_WEIGHT_GOAL_OPTIONS } from "../lib/patient/glp1-weight-goal";
import type { Glp1EligibilityAnswers } from "../lib/patient/glp1-eligibility-questions";
import { GLP1_HEALTH_NONE_IDS } from "../lib/patient/glp1-eligibility-questions";

const prisma = new PrismaClient();

const STAFF = [
  { prenom: "Admin MedSim", email: "admin@medsim.ca", password: "Admin2026!", role: "ADMIN" as const },
  {
    prenom: "Dr Médecin",
    email: "medecin@medsim.ca",
    password: "Medecin2026!",
    role: "MEDECIN" as const,
    license: "12345",
  },
  {
    prenom: "IPS Test",
    email: "ips-test@medsim.ca",
    password: "Test1234!",
    role: "IPS" as const,
    license: "IPS-9001",
  },
];

function baseWizard(overrides: Partial<Glp1EligibilityAnswers> = {}): Glp1EligibilityAnswers {
  return {
    weightGoal: "9_5_22_5",
    heightCm: "170",
    weightKg: "92",
    idealWeightKg: "72",
    gender: "female",
    birthMonth: "mars",
    birthDay: "12",
    birthYear: "1988",
    health1: [GLP1_HEALTH_NONE_IDS.health1],
    health2: [GLP1_HEALTH_NONE_IDS.health2],
    health3: [GLP1_HEALTH_NONE_IDS.health3],
    opioids3Months: "non",
    bariatricSurgery: "non",
    prescriptionMeds: "non",
    bloodPressure: "normal",
    restingHeartRate: "normal",
    ...overrides,
  };
}

function buildHealthPayload(
  wizard: Glp1EligibilityAnswers,
  submittedAt: Date,
): Glp1HealthInfoPayload {
  const { status, labelFr, bmi, age, medicalHistory } = resolveGlp1Eligibility(wizard);
  return {
    version: GLP1_HEALTH_INFO_VERSION,
    wizard,
    submittedAt: submittedAt.toISOString(),
    weightGoalLabel:
      GLP1_WEIGHT_GOAL_OPTIONS.find((o) => o.id === wizard.weightGoal)?.label ??
      wizard.weightGoal ??
      "—",
    eligibilityLabel: labelFr,
    imc: bmi,
  };
}

const PATIENTS: {
  prenom: string;
  email: string;
  password: string;
  eligibility: EligibilityStatus;
  dossierStatus: DossierStatus;
  submittedDaysAgo: number;
  wizard: Glp1EligibilityAnswers;
}[] = [
  {
    prenom: "Sophie",
    email: "sophie.eligible@medsim.ca",
    password: "Patient2026!",
    eligibility: "MEDICAL_REVIEW_REQUIRED",
    dossierStatus: "EN_ATTENTE_MEDECIN",
    submittedDaysAgo: 3,
    wizard: baseWizard({ weightKg: "88", heightCm: "165" }),
  },
  {
    prenom: "Marc",
    email: "marc.eligible@medsim.ca",
    password: "Patient2026!",
    eligibility: "MEDICAL_REVIEW_REQUIRED",
    dossierStatus: "EN_ATTENTE_MEDECIN",
    submittedDaysAgo: 0.5,
    wizard: baseWizard({ weightKg: "102", heightCm: "178", gender: "male" }),
  },
  {
    prenom: "Julie",
    email: "julie.refusee@medsim.ca",
    password: "Patient2026!",
    eligibility: "NOT_ELIGIBLE",
    dossierStatus: "REFUSE",
    submittedDaysAgo: 5,
    wizard: baseWizard({ weightKg: "70", heightCm: "168", birthYear: "2005" }),
  },
  {
    prenom: "Thomas",
    email: "thomas.revue@medsim.ca",
    password: "Patient2026!",
    eligibility: "MEDICAL_REVIEW_REQUIRED",
    dossierStatus: "EN_COURS_REVISION",
    submittedDaysAgo: 1,
    wizard: baseWizard({
      health1: ["renal_esrd"],
      health2: [GLP1_HEALTH_NONE_IDS.health2],
      health3: [GLP1_HEALTH_NONE_IDS.health3],
    }),
  },
  {
    prenom: "Nadia",
    email: "nadia.attente@medsim.ca",
    password: "Patient2026!",
    eligibility: "MEDICAL_REVIEW_REQUIRED",
    dossierStatus: "EN_ATTENTE_MEDECIN",
    submittedDaysAgo: 0.2,
    wizard: baseWizard({ weightKg: "95", heightCm: "162" }),
  },
];

async function upsertStaff() {
  for (const s of STAFF) {
    const email = s.email.toLowerCase();
    const hash = await bcrypt.hash(s.password, 12);
    await prisma.user.upsert({
      where: { email },
      create: {
        prenom: s.prenom,
        name: s.prenom,
        email,
        passwordHash: hash,
        role: s.role,
        emailVerified: new Date(),
        medecinLicenseNumber: "license" in s ? s.license : null,
      },
      update: {
        prenom: s.prenom,
        name: s.prenom,
        passwordHash: hash,
        role: s.role,
        medecinLicenseNumber: "license" in s ? s.license : undefined,
      },
    });
    console.log(`✓ ${s.role} : ${email} / ${s.password}`);
  }
}

async function upsertPatients(medecinId: string) {
  const created: { id: string; prenom: string }[] = [];

  for (const p of PATIENTS) {
    const email = p.email.toLowerCase();
    const hash = await bcrypt.hash(p.password, 12);
    const submittedAt = new Date(
      Date.now() - p.submittedDaysAgo * 24 * 60 * 60 * 1000,
    );
    const { status, labelFr, bmi, age, medicalHistory } = resolveGlp1Eligibility(p.wizard);
    const healthPayload = buildHealthPayload(p.wizard, submittedAt);
    const suggestionText =
      `Suggestion système (non médicale) : ${labelFr}. IMC ${bmi.toFixed(1)}. Simulation : ${status}.`;

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        prenom: p.prenom,
        name: p.prenom,
        email,
        passwordHash: hash,
        role: "PATIENT",
        emailVerified: new Date(),
      },
      update: { prenom: p.prenom, name: p.prenom, passwordHash: hash },
    });

    await prisma.patientProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: p.prenom,
        eligibility: p.eligibility === "ELIGIBLE" ? "MEDICAL_REVIEW_REQUIRED" : p.eligibility,
        bmi,
        weightKg: Number.parseFloat(p.wizard.weightKg ?? "0"),
        heightCm: Number.parseFloat(p.wizard.heightCm ?? "0"),
        age,
        medicalHistory,
        healthInfo: healthPayload as object,
        onboardingDone: true,
      },
      update: {
        fullName: p.prenom,
        eligibility: p.eligibility === "ELIGIBLE" ? "MEDICAL_REVIEW_REQUIRED" : p.eligibility,
        bmi,
        weightKg: Number.parseFloat(p.wizard.weightKg ?? "0"),
        heightCm: Number.parseFloat(p.wizard.heightCm ?? "0"),
        age,
        medicalHistory,
        healthInfo: healthPayload as object,
        onboardingDone: true,
      },
    });

    const historyCount = await prisma.eligibilityHistory.count({
      where: { patientId: user.id },
    });
    if (historyCount === 0) {
      await prisma.eligibilityHistory.create({
        data: {
          patientId: user.id,
          changedById: medecinId,
          oldStatus: "PENDING",
          newStatus: p.eligibility === "ELIGIBLE" ? "MEDICAL_REVIEW_REQUIRED" : p.eligibility,
          note: "Statut initial — seed MedSim",
        },
      });
    }

    const existingDossier = await prisma.dossierGlp1.findFirst({
      where: { patientId: user.id, status: { not: "ANNULE" } },
      orderBy: { createdAt: "desc" },
    });
    if (!existingDossier) {
      await prisma.dossierGlp1.create({
        data: {
          patientId: user.id,
          status: p.dossierStatus,
          suggestionImc: bmi,
          suggestionEligibilite: suggestionText,
          healthInfoSnapshot: healthPayload as object,
          medecinId:
            p.dossierStatus === "EN_COURS_REVISION" || p.dossierStatus === "REFUSE"
              ? medecinId
              : null,
          decisionDate: ["REFUSE", "APPROUVE"].includes(p.dossierStatus)
            ? submittedAt
            : null,
          notesMedecin:
            p.dossierStatus === "REFUSE"
              ? "Dossier seed — refus démo avec motif clinique documenté pour tests interface médecin."
              : null,
          motifRefus: p.dossierStatus === "REFUSE" ? "IMC et profil non adaptés au GLP-1 (démo)." : null,
          createdAt: submittedAt,
        },
      });
    }

    created.push({ id: user.id, prenom: p.prenom });
    console.log(`✓ Patient ${p.prenom} (${p.eligibility}) : ${email}`);
  }

  return created;
}

async function seedMessages(medecinId: string, patients: { id: string; prenom: string }[]) {
  const samples = [
    "Bonjour, j'ai complété mon questionnaire GLP-1.",
    "Merci docteur, j'ai une question sur mon traitement.",
    "Puis-je avoir des précisions sur la prochaine étape ?",
  ];

  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i]!;
    const t0 = new Date(Date.now() - (i + 2) * 3600_000);
    await prisma.message.create({
      data: {
        senderId: patient.id,
        receiverId: medecinId,
        content: samples[i % samples.length]!,
        read: i > 1,
        createdAt: t0,
      },
    });
    await prisma.message.create({
      data: {
        senderId: medecinId,
        receiverId: patient.id,
        content: `Bonjour ${patient.prenom}, nous avons bien reçu votre dossier. Un médecin MedSim vous répondra sous 48 h.`,
        read: true,
        createdAt: new Date(t0.getTime() + 600_000),
      },
    });
  }
  console.log("✓ Messages médecin ↔ patients");
}

async function main() {
  console.log("Seed MedSim…\n");
  await upsertStaff();

  const medecin = await prisma.user.findUnique({ where: { email: "medecin@medsim.ca" } });
  if (!medecin) throw new Error("Médecin seed introuvable");

  const patients = await upsertPatients(medecin.id);
  await seedMessages(medecin.id, patients);

  console.log("\nComptes de test :");
  console.log("  admin@medsim.ca / Admin2026!");
  console.log("  medecin@medsim.ca / Medecin2026!");
  console.log("  ips-test@medsim.ca / Test1234!");
  console.log("  Patients : *@medsim.ca / Patient2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
