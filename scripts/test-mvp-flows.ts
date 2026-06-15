/**
 * Tests d'intégration — Anne, check-in, pharmacie, suivi livraison.
 * Prérequis : MEDSIM_DEMO_MODE=false, `npm run dev` sur :3001, DB Neon accessible.
 *
 * Usage : npx tsx scripts/test-mvp-flows.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generatePrescriptionPdf } from "../lib/pdf-generator";
import { fulfillmentAfterPayment } from "../lib/stripe/fulfillment-after-payment";

const BASE = process.env.MEDSIM_SMOKE_BASE ?? "http://localhost:3001";
const prisma = new PrismaClient();

const TEST_EMAIL = "mvp.flow.test@medsim.ca";
const TEST_PASSWORD = "MvpFlow2026!";
const IPS_EMAIL = "ips-test@medsim.ca";
const IPS_PASSWORD = "Test1234!";
const ADMIN_EMAIL = "admin@medsim.ca";
const ADMIN_PASSWORD = "Admin2026!";

type Result = { name: string; ok: boolean; detail: string };

const results: Result[] = [];

function pass(name: string, detail: string) {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}\n  ${detail}\n`);
}

function fail(name: string, detail: string) {
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name}\n  ${detail}\n`);
}

function parseSetCookie(res: Response): string[] {
  const h = res.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof h.getSetCookie === "function") return h.getSetCookie();
  const raw = res.headers.get("set-cookie");
  return raw ? [raw] : [];
}

function mergeCookies(jar: Map<string, string>, res: Response) {
  for (const line of parseSetCookie(res)) {
    const part = line.split(";")[0]?.trim();
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq < 1) continue;
    jar.set(part.slice(0, eq), part.slice(eq + 1));
  }
}

function cookieHeader(jar: Map<string, string>) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function fetchAuth(
  jar: Map<string, string>,
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const c = cookieHeader(jar);
  if (c) headers.set("Cookie", c);
  const res = await fetch(url, { ...init, headers, redirect: "manual" });
  mergeCookies(jar, res);
  return res;
}

async function login(email: string, password: string): Promise<Map<string, string>> {
  const jar = new Map<string, string>();
  const csrfRes = await fetchAuth(jar, `${BASE}/api/auth/csrf`);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  await fetchAuth(jar, `${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      callbackUrl: `${BASE}/`,
      json: "true",
    }),
  });

  const hasSession = [...jar.keys()].some((k) => k.includes("session-token"));
  if (!hasSession) {
    throw new Error(`Connexion échouée pour ${email}`);
  }
  return jar;
}

async function ensureTestFixtures(): Promise<{
  userId: string;
  programId: string;
  fulfillmentId: string;
  ipsId: string;
}> {
  const ips = await prisma.user.findUnique({ where: { email: IPS_EMAIL.toLowerCase() } });
  if (!ips) throw new Error("IPS seed introuvable — lancez npx tsx prisma/seed.ts");

  const hash = await bcrypt.hash(TEST_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: TEST_EMAIL.toLowerCase() },
    create: {
      prenom: "MvpFlow",
      name: "Test",
      email: TEST_EMAIL.toLowerCase(),
      passwordHash: hash,
      role: "PATIENT",
      emailVerified: new Date(),
    },
    update: { passwordHash: hash },
  });

  let questionnaire = await prisma.medicalQuestionnaire.findFirst({
    where: { userId: user.id },
  });

  if (!questionnaire) {
    questionnaire = await prisma.medicalQuestionnaire.create({
      data: {
        userId: user.id,
        height: 170,
        weight: 88,
        bmi: 30.4,
        targetWeight: 72,
        medicalHistory: {},
        currentMedications: {},
        allergies: {},
        familyHistory: {},
        hasTried: false,
        motivations: "Test MVP flows",
        consentMedical: true,
        consentDataSharing: true,
        consentAiCoach: true,
        status: "PRESCRIPTION_ISSUED",
        ipsId: ips.id,
        draftJson: {
          deliveryAddress: "123 rue Test",
          city: "Montréal",
          province: "QC",
          postalCode: "H2X 1Y4",
          phone: "514-555-0199",
        },
      },
    });
  } else if (!questionnaire.ipsId) {
    await prisma.medicalQuestionnaire.update({
      where: { id: questionnaire.id },
      data: { ipsId: ips.id, status: "PRESCRIPTION_ISSUED" },
    });
  }

  let program = await prisma.weightProgram.findUnique({ where: { userId: user.id } });
  if (!program) {
    program = await prisma.weightProgram.create({
      data: {
        userId: user.id,
        startWeight: 88,
        targetWeight: 72,
        currentWeight: 86.5,
        status: "ACTIVE",
        isActive: true,
        medication: "Ozempic",
        currentDose: "0,25 mg",
      },
    });
  }

  let pharmacy = await prisma.pharmacyPartner.findFirst({ where: { isActive: true } });
  if (!pharmacy) {
    pharmacy = await prisma.pharmacyPartner.create({
      data: {
        name: "Pharmacie Test MedSim",
        address: "1000 rue Sainte-Catherine",
        city: "Montréal",
        province: "QC",
        phone: "514-555-0100",
        email: "pharmacy@medsim.ca",
      },
    });
  }

  let fulfillment = await prisma.medicationFulfillment.findUnique({
    where: { questionnaireId: questionnaire.id },
  });

  if (!fulfillment) {
    const pdfBuffer = generatePrescriptionPdf({
      patientName: user.prenom,
      medication: "Ozempic",
      dosage: "0,25 mg/semaine",
      durationMonths: 3,
      refills: 2,
      instructions: "Injection SC hebdomadaire",
      ipsName: ips.prenom,
      ipsLicense: ips.medecinLicenseNumber ?? undefined,
      issuedAt: new Date(),
    });
    fulfillment = await prisma.medicationFulfillment.create({
      data: {
        questionnaireId: questionnaire.id,
        userId: user.id,
        ipsId: ips.id,
        medication: "Ozempic",
        dosage: "0,25 mg/semaine",
        duration: 3,
        refills: 2,
        instructions: "Injection SC hebdomadaire",
        pharmacyId: pharmacy.id,
        status: "ISSUED",
        paymentStatus: "PENDING",
        amountCents: 29900,
        pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString("base64")}`,
        pdfGeneratedAt: new Date(),
      },
    });
    await prisma.fulfillmentStatusHistory.create({
      data: { fulfillmentId: fulfillment.id, status: "ISSUED" },
    });
  }

  return {
    userId: user.id,
    programId: program.id,
    fulfillmentId: fulfillment.id,
    ipsId: ips.id,
  };
}

async function testAnneReports(userId: string, ipsId: string, patientJar: Map<string, string>) {
  const beforeReports = await prisma.anneIpsReport.count({ where: { userId } });

  const checkInRes = await fetchAuth(patientJar, `${BASE}/api/patient/weight-program/check-ins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      weight: 86.2,
      energie: 4,
      sommeil: 7,
      nausee: 1,
      notes: "Test MVP — rapport Anne",
    }),
  });

  const checkInBody = (await checkInRes.json()) as {
    error?: string;
    coachMessage?: { content?: string; role?: string } | null;
  };

  if (checkInRes.status !== 201) {
    fail("PROMPT 1+2 — Check-in POST", `HTTP ${checkInRes.status}: ${checkInBody.error ?? JSON.stringify(checkInBody)}`);
    return;
  }

  const coachContent = checkInBody.coachMessage?.content ?? "";
  if (checkInBody.coachMessage?.role === "assistant" && coachContent.length > 20) {
    pass("PROMPT 2 — Anne répond au check-in", coachContent.slice(0, 120) + "…");
  } else {
    fail("PROMPT 2 — Anne répond au check-in", "Pas de message coach dans la réponse");
  }

  const latestCheckIn = await prisma.weightCheckIn.findFirst({
    where: { userId },
    orderBy: { recordedAt: "desc" },
  });

  const afterReports = await prisma.anneIpsReport.count({ where: { userId } });
  const hasAiReport = Boolean(latestCheckIn?.aiReport && latestCheckIn.aiReport.length > 50);

  if (afterReports > beforeReports || hasAiReport) {
    pass(
      "PROMPT 1 — Rapport IPS généré",
      `AnneIpsReport: ${beforeReports}→${afterReports}, aiReport: ${hasAiReport ? "oui" : "non"} (${latestCheckIn?.aiReport?.slice(0, 80) ?? "—"}…)`,
    );
  } else {
    fail(
      "PROMPT 1 — Rapport IPS généré",
      "Aucun AnneIpsReport ni aiReport après check-in (vérifiez ANTHROPIC_API_KEY / crédits)",
    );
  }

  const ipsJar = await login(IPS_EMAIL, IPS_PASSWORD);
  const ipsRes = await fetchAuth(ipsJar, `${BASE}/api/ips/anne-reports`);
  const ipsData = (await ipsRes.json()) as { reports?: { id: string; patientName: string }[] };

  if (ipsRes.ok && (ipsData.reports?.length ?? 0) > 0) {
    pass(
      "PROMPT 1 — API rapports IPS",
      `${ipsData.reports!.length} rapport(s) — dernier: ${ipsData.reports![0]!.patientName}`,
    );
  } else {
    fail("PROMPT 1 — API rapports IPS", `HTTP ${ipsRes.status}, rapports: ${ipsData.reports?.length ?? 0}`);
  }
}

async function testPharmacyPayment(fulfillmentId: string, userId: string) {
  await prisma.medicationFulfillment.update({
    where: { id: fulfillmentId },
    data: {
      paymentStatus: "PENDING",
      status: "ISSUED",
      paidAt: null,
      stripeSessionId: null,
    },
  });

  const emailLogsBefore = await prisma.emailLog.count({
    where: { template: "pharmacy_fulfillment_order" },
  });

  await fulfillmentAfterPayment({
    id: `cs_test_${Date.now()}`,
    object: "checkout.session",
    payment_status: "paid",
    metadata: { prescriptionId: fulfillmentId, fulfillmentId },
    payment_intent: `pi_test_${Date.now()}`,
    subscription: null,
  } as never);

  const fulfillment = await prisma.medicationFulfillment.findUnique({
    where: { id: fulfillmentId },
  });

  const emailLogsAfter = await prisma.emailLog.count({
    where: { template: "pharmacy_fulfillment_order" },
  });

  const pharmacyEmailLogged = emailLogsAfter > emailLogsBefore;

  if (fulfillment?.paymentStatus === "PAID" && fulfillment.status === "IN_PREPARATION") {
    pass(
      "PROMPT 3 — Paiement → pharmacie",
      `Statut ${fulfillment.status}, PDF: ${fulfillment.pdfUrl ? "oui" : "non"}, email pharmacie: ${pharmacyEmailLogged ? "logué (Resend ou console)" : "voir console serveur"}`,
    );
  } else {
    fail(
      "PROMPT 3 — Paiement → pharmacie",
      `paymentStatus=${fulfillment?.paymentStatus}, status=${fulfillment?.status}`,
    );
  }

  const notif = await prisma.appNotification.findFirst({
    where: { userId, type: "fulfillment_sent_to_pharmacy" },
    orderBy: { createdAt: "desc" },
  });

  if (notif) {
    pass("PROMPT 3 — Notification patient pharmacie", notif.title);
  } else {
    fail("PROMPT 3 — Notification patient pharmacie", "AppNotification introuvable");
  }
}

async function testTrackingTimeline(fulfillmentId: string, patientJar: Map<string, string>) {
  const get1 = await fetchAuth(patientJar, `${BASE}/api/pharmacy/tracking/${fulfillmentId}`);
  const data1 = (await get1.json()) as {
    status?: string;
    stepDates?: Record<string, string | null>;
    pharmacyName?: string;
    estimatedDelivery?: string | null;
  };

  if (!get1.ok || !data1.stepDates) {
    fail("PROMPT 4 — GET tracking", `HTTP ${get1.status}`);
    return;
  }

  const stepsOk =
    data1.stepDates.issued &&
    data1.stepDates.paid &&
    (data1.stepDates.sentToPharmacy || data1.stepDates.preparation);

  if (stepsOk && data1.status === "IN_PREPARATION") {
    pass(
      "PROMPT 4 — Timeline (étapes complétées)",
      `Statut ${data1.status}, pharmacie: ${data1.pharmacyName ?? "—"}, ETA: ${data1.estimatedDelivery ? new Date(data1.estimatedDelivery).toLocaleDateString("fr-CA") : "—"}`,
    );
  } else {
    fail("PROMPT 4 — Timeline", JSON.stringify(data1.stepDates));
  }

  const adminJar = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  const patchRes = await fetchAuth(adminJar, `${BASE}/api/pharmacy/tracking/${fulfillmentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "SHIPPED",
      trackingNumber: "123456789012",
    }),
  });

  const patchData = (await patchRes.json()) as { status?: string; trackingNumber?: string };

  if (patchRes.ok && patchData.status === "SHIPPED" && patchData.trackingNumber) {
    pass(
      "PROMPT 4 — Mise à jour expédition (animation polling)",
      `SHIPPED, tracking ${patchData.trackingNumber} — la page /ordonnance poll toutes les 30 s`,
    );
  } else {
    fail("PROMPT 4 — PATCH expédition", `HTTP ${patchRes.status}: ${JSON.stringify(patchData)}`);
  }

  const get2 = await fetchAuth(patientJar, `${BASE}/api/pharmacy/tracking/${fulfillmentId}`);
  const data2 = (await get2.json()) as {
    status?: string;
    trackingUrl?: string | null;
    carrierLabel?: string;
  };

  if (data2.status === "SHIPPED" && data2.trackingUrl) {
    pass("PROMPT 4 — Suivi transporteur", `${data2.carrierLabel}: ${data2.trackingUrl.slice(0, 60)}…`);
  } else {
    fail("PROMPT 4 — Suivi transporteur", JSON.stringify(data2));
  }
}

async function testWeeklyStatus(patientJar: Map<string, string>) {
  const res = await fetchAuth(patientJar, `${BASE}/api/patient/coach-ia/weekly-status`);
  const data = (await res.json()) as { mondayCheckInSent?: boolean; reportCount?: number };

  if (res.ok && data.mondayCheckInSent) {
    pass("PROMPT 2 — Statut hebdo Anne", `Check-in semaine: oui, rapports: ${data.reportCount ?? 0}`);
  } else if (res.ok) {
    pass("PROMPT 2 — Statut hebdo Anne", `API OK — check-in semaine: ${data.mondayCheckInSent}`);
  } else {
    fail("PROMPT 2 — Statut hebdo Anne", `HTTP ${res.status}`);
  }
}

async function main() {
  console.log(`\n═══ Tests MVP MedSim — ${BASE} ═══\n`);

  const health = await fetch(BASE);
  if (!health.ok) {
    console.error("Serveur inaccessible sur", BASE, "— lancez npm run dev");
    process.exit(1);
  }

  if (process.env.MEDSIM_DEMO_MODE === "true") {
    console.warn("⚠ MEDSIM_DEMO_MODE=true — les tests DB/API réels seront incomplets\n");
  }

  const fixtures = await ensureTestFixtures();
  console.log(`Fixtures: patient ${TEST_EMAIL}, fulfillment ${fixtures.fulfillmentId.slice(0, 8)}…\n`);

  const patientJar = await login(TEST_EMAIL, TEST_PASSWORD);
  console.log("Session patient OK\n");

  await testAnneReports(fixtures.userId, fixtures.ipsId, patientJar);
  await testWeeklyStatus(patientJar);
  await testPharmacyPayment(fixtures.fulfillmentId, fixtures.userId);
  await testTrackingTimeline(fixtures.fulfillmentId, patientJar);

  const ok = results.filter((r) => r.ok).length;
  const total = results.length;

  console.log(`\n═══ Résultat : ${ok}/${total} tests OK ═══\n`);

  if (ok < total) {
    results.filter((r) => !r.ok).forEach((r) => console.log(`  ✗ ${r.name}: ${r.detail}`));
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("\nErreur fatale:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
