import type { Role } from "@prisma/client";

export type StaffDemoRole = "IPS" | "MEDECIN" | "PHARMACIEN" | "ADMIN" | "PATIENT";

export type StaffDemoAccount = {
  role: StaffDemoRole;
  label: string;
  description: string;
  email: string;
  password: string;
  home: string;
};

/** Accès équipe 1-clic : dev par défaut, ou `MEDSIM_ENABLE_STAFF_DEMO_LOGIN=true` (staging). */
export function isStaffDemoLoginEnabled(): boolean {
  const flag = process.env.MEDSIM_ENABLE_STAFF_DEMO_LOGIN?.trim();
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV === "development";
}

const ACCOUNTS: StaffDemoAccount[] = [
  {
    role: "IPS",
    label: "IPS",
    description: "File des dossiers, revue clinique, ordonnance",
    email: "ips-test@medsim.ca",
    password: "Test1234!",
    home: "/dashboard/ips",
  },
  {
    role: "MEDECIN",
    label: "Médecin",
    description: "Dossiers GLP-1 et prescriptions",
    email: "medecin@medsim.ca",
    password: "Medecin2026!",
    home: "/medecin/file",
  },
  {
    role: "PHARMACIEN",
    label: "Pharmacien",
    description: "Espace pharmacie (MVP)",
    email: "pharmacien@medsim.ca",
    password: "Pharmacien2026!",
    home: "/pharmacien",
  },
  {
    role: "ADMIN",
    label: "Admin",
    description: "Administration Anne-sante",
    email: "admin@medsim.ca",
    password: "Admin2026!",
    home: "/admin/dashboard",
  },
  {
    role: "PATIENT",
    label: "Patient",
    description: "Dashboard et questionnaire",
    email: "sophie.eligible@medsim.ca",
    password: "Patient2026!",
    home: "/dashboard/patient",
  },
];

export function listStaffDemoAccounts(): Omit<StaffDemoAccount, "email" | "password">[] {
  return ACCOUNTS.map(({ role, label, description, home }) => ({
    role,
    label,
    description,
    home,
  }));
}

export function getStaffDemoAccount(role: StaffDemoRole): StaffDemoAccount | null {
  return ACCOUNTS.find((a) => a.role === role) ?? null;
}

export function isStaffDemoRole(value: string): value is StaffDemoRole {
  return ACCOUNTS.some((a) => a.role === value);
}

/** Vérifie que le rôle Prisma correspond (sécurité minimale côté API). */
export function prismaRoleForDemo(role: StaffDemoRole): Role {
  return role as Role;
}
