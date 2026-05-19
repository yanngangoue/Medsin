/**
 * Store démo en mémoire — aligné sur les modèles Prisma métaboliques (même forme logique).
 */
export type MetabolicIntakeCategory =
  | "MEAL"
  | "SUPPLEMENT"
  | "SLEEP"
  | "ACTIVITY"
  | "MEDICATION_STATEMENT"
  | "ADVERSE_EFFECT";

export type DemoMetabolicIntake = {
  id: string;
  patientUserId: string;
  category: MetabolicIntakeCategory;
  fhirResource: unknown;
  aiAnalysis: unknown | null;
  createdAt: Date;
};

export type DemoConsent = {
  dietaryBehaviorOptIn: boolean;
  dietaryBehaviorVersion: string;
  consentedAt: Date | null;
};

export type DemoProfileSnapshot = {
  id: string;
  patientUserId: string;
  nutritionalScore: number;
  metabolicStabilityScore: number;
  adherenceScore: number;
  lifestyleScore: number;
  riskFlags: string[];
  fhirPanelObservation: unknown | null;
  computedAt: Date;
};

const intakes: DemoMetabolicIntake[] = [];
const consentByUser = new Map<string, DemoConsent>();
const profiles: DemoProfileSnapshot[] = [];

export function demoGetConsent(userId: string): DemoConsent | undefined {
  return consentByUser.get(userId);
}

export function demoSetConsent(
  userId: string,
  input: Omit<DemoConsent, "consentedAt"> & { consentedAt?: DemoConsent["consentedAt"] },
): DemoConsent {
  const row: DemoConsent = {
    dietaryBehaviorOptIn: input.dietaryBehaviorOptIn,
    dietaryBehaviorVersion: input.dietaryBehaviorVersion,
    consentedAt: input.consentedAt ?? (input.dietaryBehaviorOptIn ? new Date() : null),
  };
  consentByUser.set(userId, row);
  return row;
}

export function demoInsertIntake(row: Omit<DemoMetabolicIntake, "id" | "createdAt"> & { id?: string }): DemoMetabolicIntake {
  const full: DemoMetabolicIntake = {
    id: row.id ?? `demo_mi_${crypto.randomUUID().replace(/-/g, "")}`,
    patientUserId: row.patientUserId,
    category: row.category,
    fhirResource: row.fhirResource,
    aiAnalysis: row.aiAnalysis ?? null,
    createdAt: new Date(),
  };
  intakes.push(full);
  return full;
}

export function demoListIntakes(patientUserId: string, category?: MetabolicIntakeCategory): DemoMetabolicIntake[] {
  return intakes
    .filter((i) => i.patientUserId === patientUserId && (!category || i.category === category))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function demoSaveProfile(s: Omit<DemoProfileSnapshot, "id" | "computedAt"> & { id?: string }): DemoProfileSnapshot {
  const full: DemoProfileSnapshot = {
    id: s.id ?? `demo_mp_${crypto.randomUUID().replace(/-/g, "")}`,
    patientUserId: s.patientUserId,
    nutritionalScore: s.nutritionalScore,
    metabolicStabilityScore: s.metabolicStabilityScore,
    adherenceScore: s.adherenceScore,
    lifestyleScore: s.lifestyleScore,
    riskFlags: s.riskFlags,
    fhirPanelObservation: s.fhirPanelObservation ?? null,
    computedAt: new Date(),
  };
  profiles.push(full);
  return full;
}

export function demoLatestProfile(patientUserId: string): DemoProfileSnapshot | undefined {
  const list = profiles.filter((p) => p.patientUserId === patientUserId).sort((a, b) => b.computedAt.getTime() - a.computedAt.getTime());
  return list[0];
}
