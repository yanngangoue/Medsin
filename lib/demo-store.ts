import type { Role } from "@prisma/client";

export type DemoUser = {
  id: string;
  prenom: string;
  email: string;
  passwordHash: string;
  role: Role;
};

type DemoQuestionnaireRow = {
  id: string;
  userId: string;
  objectif: string;
  poids: number;
  taille: number;
  imc: number;
  glpAntecedent: boolean;
  glpLequel: string | null;
  antecedents: string[];
  medicaments: boolean;
  medicamentsDesc: string | null;
  submittedAt: Date;
};

const usersByEmail = new Map<string, DemoUser>();
const questionnaireByUserId = new Map<string, DemoQuestionnaireRow>();

function normEmail(email: string) {
  return email.trim().toLowerCase();
}

export function demoUserExists(email: string): boolean {
  return usersByEmail.has(normEmail(email));
}

export function demoFindUserByEmail(email: string): DemoUser | undefined {
  return usersByEmail.get(normEmail(email));
}

export function demoFindUserById(id: string): DemoUser | undefined {
  for (const u of usersByEmail.values()) {
    if (u.id === id) return u;
  }
  return undefined;
}

export function demoUpdateUserPasswordHash(userId: string, passwordHash: string): boolean {
  for (const [key, u] of usersByEmail) {
    if (u.id === userId) {
      usersByEmail.set(key, { ...u, passwordHash });
      return true;
    }
  }
  return false;
}

export function demoCreateUser(input: {
  prenom: string;
  email: string;
  passwordHash: string;
}): DemoUser {
  const email = normEmail(input.email);
  const user: DemoUser = {
    id: `demo_${crypto.randomUUID().replace(/-/g, "")}`,
    prenom: input.prenom,
    email,
    passwordHash: input.passwordHash,
    role: "PATIENT",
  };
  usersByEmail.set(email, user);
  return user;
}

export function demoGetQuestionnaire(userId: string): DemoQuestionnaireRow | undefined {
  return questionnaireByUserId.get(userId);
}

export function demoUpsertQuestionnaire(
  userId: string,
  input: {
    objectif: string;
    poids: number;
    taille: number;
    imc: number;
    glpAntecedent: boolean;
    glpLequel?: string;
    antecedents: string[];
    medicaments: boolean;
    medicamentsDesc?: string;
    submittedAt: Date;
  },
): DemoQuestionnaireRow {
  const existing = questionnaireByUserId.get(userId);
  const row: DemoQuestionnaireRow = {
    id: existing?.id ?? `demo_q_${crypto.randomUUID().replace(/-/g, "")}`,
    userId,
    objectif: input.objectif,
    poids: input.poids,
    taille: input.taille,
    imc: input.imc,
    glpAntecedent: input.glpAntecedent,
    glpLequel: input.glpLequel ?? null,
    antecedents: input.antecedents,
    medicaments: input.medicaments,
    medicamentsDesc: input.medicamentsDesc ?? null,
    submittedAt: input.submittedAt,
  };
  questionnaireByUserId.set(userId, row);
  return row;
}
