import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";
import type { MetabolicIntakeCategory as PrismaMetabolicCategory } from "@prisma/client";
import * as demo from "@/lib/metabolic/demo-metabolic-store";

export async function getDietaryConsent(patientUserId: string): Promise<{
  dietaryBehaviorOptIn: boolean;
  dietaryBehaviorVersion: string;
  consentedAt: Date | null;
} | null> {
  if (isDemoMode()) {
    const d = demo.demoGetConsent(patientUserId);
    if (!d) return null;
    return { ...d, consentedAt: d.consentedAt };
  }
  const row = await prisma.patientPrivacyConsent.findUnique({ where: { userId: patientUserId } });
  if (!row) return null;
  return {
    dietaryBehaviorOptIn: row.dietaryBehaviorOptIn,
    dietaryBehaviorVersion: row.dietaryBehaviorVersion,
    consentedAt: row.consentedAt,
  };
}

export async function upsertDietaryConsent(
  patientUserId: string,
  input: { optIn: boolean; version?: string },
): Promise<void> {
  const version = input.version ?? "1.0";
  if (isDemoMode()) {
    demo.demoSetConsent(patientUserId, {
      dietaryBehaviorOptIn: input.optIn,
      dietaryBehaviorVersion: version,
      consentedAt: input.optIn ? new Date() : null,
    });
    return;
  }
  await prisma.patientPrivacyConsent.upsert({
    where: { userId: patientUserId },
    create: {
      userId: patientUserId,
      dietaryBehaviorOptIn: input.optIn,
      dietaryBehaviorVersion: version,
      consentedAt: input.optIn ? new Date() : null,
    },
    update: {
      dietaryBehaviorOptIn: input.optIn,
      dietaryBehaviorVersion: version,
      consentedAt: input.optIn ? new Date() : null,
    },
  });
}

export type StoredIntake = {
  id: string;
  patientUserId: string;
  category: PrismaMetabolicCategory;
  fhirResource: unknown;
  aiAnalysis: unknown | null;
  createdAt: Date;
};

export async function insertMetabolicIntake(row: {
  patientUserId: string;
  category: PrismaMetabolicCategory;
  fhirResource: unknown;
  aiAnalysis?: unknown;
}): Promise<StoredIntake> {
  if (isDemoMode()) {
    const d = demo.demoInsertIntake({
      patientUserId: row.patientUserId,
      category: row.category as demo.MetabolicIntakeCategory,
      fhirResource: row.fhirResource,
      aiAnalysis: row.aiAnalysis ?? null,
    });
    return {
      id: d.id,
      patientUserId: d.patientUserId,
      category: row.category,
      fhirResource: d.fhirResource,
      aiAnalysis: d.aiAnalysis,
      createdAt: d.createdAt,
    };
  }
  const created = await prisma.metabolicIntake.create({
    data: {
      patientUserId: row.patientUserId,
      category: row.category,
      fhirResource: row.fhirResource as object,
      aiAnalysis: row.aiAnalysis === undefined ? undefined : (row.aiAnalysis as object),
    },
  });
  return {
    id: created.id,
    patientUserId: created.patientUserId,
    category: created.category,
    fhirResource: created.fhirResource,
    aiAnalysis: created.aiAnalysis,
    createdAt: created.createdAt,
  };
}

export async function listMetabolicIntakes(
  patientUserId: string,
  opts?: { since?: Date; categories?: PrismaMetabolicCategory[] },
): Promise<StoredIntake[]> {
  if (isDemoMode()) {
    const all = demo.demoListIntakes(patientUserId);
    const filtered = all.filter((i) => {
      if (opts?.since && i.createdAt < opts.since) return false;
      if (opts?.categories?.length && !opts.categories.includes(i.category as PrismaMetabolicCategory)) return false;
      return true;
    });
    return filtered.map((i) => ({
      id: i.id,
      patientUserId: i.patientUserId,
      category: i.category as PrismaMetabolicCategory,
      fhirResource: i.fhirResource,
      aiAnalysis: i.aiAnalysis,
      createdAt: i.createdAt,
    }));
  }
  const rows = await prisma.metabolicIntake.findMany({
    where: {
      patientUserId,
      ...(opts?.since ? { createdAt: { gte: opts.since } } : {}),
      ...(opts?.categories?.length ? { category: { in: opts.categories } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    patientUserId: r.patientUserId,
    category: r.category,
    fhirResource: r.fhirResource,
    aiAnalysis: r.aiAnalysis,
    createdAt: r.createdAt,
  }));
}

export async function latestMetabolicProfile(patientUserId: string): Promise<{
  nutritionalScore: number;
  metabolicStabilityScore: number;
  adherenceScore: number;
  lifestyleScore: number;
  riskFlags: string[];
  fhirPanelObservation: unknown | null;
  computedAt: Date;
} | null> {
  if (isDemoMode()) {
    const p = demo.demoLatestProfile(patientUserId);
    if (!p) return null;
    return {
      nutritionalScore: p.nutritionalScore,
      metabolicStabilityScore: p.metabolicStabilityScore,
      adherenceScore: p.adherenceScore,
      lifestyleScore: p.lifestyleScore,
      riskFlags: p.riskFlags,
      fhirPanelObservation: p.fhirPanelObservation,
      computedAt: p.computedAt,
    };
  }
  const row = await prisma.metabolicProfileSnapshot.findFirst({
    where: { patientUserId },
    orderBy: { computedAt: "desc" },
  });
  if (!row) return null;
  return {
    nutritionalScore: row.nutritionalScore,
    metabolicStabilityScore: row.metabolicStabilityScore,
    adherenceScore: row.adherenceScore,
    lifestyleScore: row.lifestyleScore,
    riskFlags: row.riskFlags,
    fhirPanelObservation: row.fhirPanelObservation,
    computedAt: row.computedAt,
  };
}

export async function saveMetabolicProfileSnapshot(input: {
  patientUserId: string;
  nutritionalScore: number;
  metabolicStabilityScore: number;
  adherenceScore: number;
  lifestyleScore: number;
  riskFlags: string[];
  fhirPanelObservation: unknown;
}): Promise<void> {
  if (isDemoMode()) {
    demo.demoSaveProfile({
      patientUserId: input.patientUserId,
      nutritionalScore: input.nutritionalScore,
      metabolicStabilityScore: input.metabolicStabilityScore,
      adherenceScore: input.adherenceScore,
      lifestyleScore: input.lifestyleScore,
      riskFlags: input.riskFlags,
      fhirPanelObservation: input.fhirPanelObservation,
    });
    return;
  }
  await prisma.metabolicProfileSnapshot.create({
    data: {
      patientUserId: input.patientUserId,
      nutritionalScore: input.nutritionalScore,
      metabolicStabilityScore: input.metabolicStabilityScore,
      adherenceScore: input.adherenceScore,
      lifestyleScore: input.lifestyleScore,
      riskFlags: input.riskFlags,
      fhirPanelObservation: input.fhirPanelObservation as object,
    },
  });
}

export async function listPatientUserIdsForRecompute(limit: number): Promise<string[]> {
  if (isDemoMode()) return [];
  const users = await prisma.user.findMany({
    where: { role: "PATIENT" },
    select: { id: true },
    take: limit,
  });
  return users.map((u) => u.id);
}
