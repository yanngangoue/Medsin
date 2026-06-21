import { randomBytes } from "node:crypto";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { sendEmail } from "@/lib/email/send-email";
import { hashPasswordResetToken } from "@/lib/password-reset-token";
import { ensureUniqueStaffEmail, staffEmailDomain } from "@/lib/admin/staff-email";
import {
  type AdminInvitableRole,
  isAdminInvitableRole,
  staffRoleHome,
  staffRoleLabel,
} from "@/lib/admin/staff-roles";
import type { CreateStaffMemberInput } from "@/lib/schemas/admin-team";

export type StaffMemberStatus = "invited" | "active";

export type StaffMemberRow = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: AdminInvitableRole;
  licenseNumber: string | null;
  status: StaffMemberStatus;
  isActive: boolean;
  pharmacyName: string | null;
  pharmacyCity: string | null;
  createdAt: string;
};

function parseNom(prenom: string, name: string | null): string {
  if (!name?.trim()) return "";
  const trimmed = name.trim();
  if (trimmed === prenom) return "";
  return trimmed.replace(prenom, "").trim() || trimmed;
}

export async function listStaffMembers(): Promise<{
  members: StaffMemberRow[];
  emailDomain: string;
}> {
  const users = await prisma.user.findMany({
    where: { role: { in: ["IPS", "MEDECIN", "PHARMACIEN"] } },
    select: {
      id: true,
      prenom: true,
      name: true,
      email: true,
      role: true,
      medecinLicenseNumber: true,
      emailVerified: true,
      isActive: true,
      passwordHash: true,
      createdAt: true,
      pharmacyPartner: { select: { name: true, city: true } },
    },
    orderBy: [{ role: "asc" }, { prenom: "asc" }],
  });

  const members: StaffMemberRow[] = users
    .filter((u) => isAdminInvitableRole(u.role))
    .map((u) => {
      const active = Boolean(u.emailVerified && u.passwordHash);
      return {
        id: u.id,
        prenom: u.prenom,
        nom: parseNom(u.prenom, u.name),
        email: u.email,
        role: u.role as AdminInvitableRole,
        licenseNumber: u.medecinLicenseNumber,
        status: active ? "active" : "invited",
        isActive: u.isActive,
        pharmacyName: u.pharmacyPartner?.name ?? null,
        pharmacyCity: u.pharmacyPartner?.city ?? null,
        createdAt: u.createdAt.toISOString(),
      };
    });

  return { members, emailDomain: staffEmailDomain() };
}

async function createInviteToken(userId: string): Promise<string> {
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  const raw = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashPasswordResetToken(raw),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  return raw;
}

export async function sendStaffInviteEmail(opts: {
  userId: string;
  email: string;
  prenom: string;
  role: Role;
  baseUrl: string;
  invitedByAdminId: string;
  notificationEmail?: string | null;
}): Promise<{ inviteUrl: string; emailSent: boolean }> {
  if (!isAdminInvitableRole(opts.role)) {
    throw new Error("Rôle non invitable");
  }

  const rawToken = await createInviteToken(opts.userId);
  const inviteUrl = `${opts.baseUrl}/connexion/reinitialisation?token=${encodeURIComponent(rawToken)}`;
  const roleLabel = staffRoleLabel(opts.role);
  const home = staffRoleHome(opts.role);
  const loginUrl = `${opts.baseUrl}/auth/connexion`;
  const deliverTo = opts.notificationEmail?.trim() || opts.email;

  const result = await sendEmail({
    to: deliverTo,
    subject: "Votre accès Anne-sante — activez votre compte",
    template: "staff_invite",
    entityKey: `staff_invite:${opts.userId}:${Date.now()}`,
    userId: opts.userId,
    html: `<p>Bonjour ${opts.prenom},</p>
<p>Un compte Anne-sante vous a été créé en tant que <strong>${roleLabel}</strong>.</p>
<p><strong>Identifiant de connexion :</strong> ${opts.email}</p>
<p><a href="${inviteUrl}">Créer mon mot de passe et activer mon compte</a></p>
<p>Ce lien expire dans 7 jours.</p>
<p>Après activation, connectez-vous avec votre identifiant (${opts.email}) sur <a href="${loginUrl}">${loginUrl}</a>, puis accédez à <a href="${opts.baseUrl}${home}">votre espace professionnel</a>.</p>
<p>— L'équipe Anne-sante</p>`,
    text: `Bonjour ${opts.prenom}, identifiant: ${opts.email}. Activez votre compte: ${inviteUrl}`,
  });

  await writeAuditLog({
    userId: opts.invitedByAdminId,
    action: "staff_invite_sent",
    entity: opts.userId,
  });

  if (process.env.NODE_ENV === "development") {
    console.info("[Anne-sante] Invitation équipe (dev) :", inviteUrl);
  }

  return { inviteUrl, emailSent: result.ok && !result.skipped };
}

export async function createStaffMember(
  input: CreateStaffMemberInput,
  adminId: string,
  baseUrl: string,
): Promise<{
  member: StaffMemberRow;
  inviteUrl?: string;
  emailSent: boolean;
}> {
  const email = await ensureUniqueStaffEmail(input.prenom, input.nom, input.email);
  const fullName = `${input.prenom} ${input.nom}`.trim();

  let pharmacyPartnerId: string | undefined;
  if (input.role === "PHARMACIEN" && input.pharmacy) {
    const pharmacy = await prisma.pharmacyPartner.create({
      data: {
        name: input.pharmacy.name,
        address: input.pharmacy.address,
        city: input.pharmacy.city,
        province: input.pharmacy.province.toUpperCase(),
        phone: input.pharmacy.phone,
        email,
        isActive: true,
      },
    });
    pharmacyPartnerId = pharmacy.id;
  }

  const user = await prisma.user.create({
    data: {
      prenom: input.prenom,
      name: fullName,
      email,
      role: input.role,
      medecinLicenseNumber: input.licenseNumber?.trim() || null,
      emailVerified: null,
      passwordHash: null,
      pharmacyPartnerId: pharmacyPartnerId ?? null,
    },
    include: {
      pharmacyPartner: { select: { name: true, city: true } },
    },
  });

  await writeAuditLog({
    userId: adminId,
    action: "staff_member_created",
    entity: `${user.role}:${user.id}`,
  });

  let inviteUrl: string | undefined;
  let emailSent = false;

  if (input.sendInvite) {
    const invite = await sendStaffInviteEmail({
      userId: user.id,
      email: user.email,
      prenom: user.prenom,
      role: user.role,
      baseUrl,
      invitedByAdminId: adminId,
      notificationEmail: input.notificationEmail,
    });
    inviteUrl = invite.inviteUrl;
    emailSent = invite.emailSent;
  }

  return {
    member: {
      id: user.id,
      prenom: user.prenom,
      nom: input.nom,
      email: user.email,
      role: user.role as AdminInvitableRole,
      licenseNumber: user.medecinLicenseNumber,
      status: "invited",
      isActive: true,
      pharmacyName: user.pharmacyPartner?.name ?? null,
      pharmacyCity: user.pharmacyPartner?.city ?? null,
      createdAt: user.createdAt.toISOString(),
    },
    inviteUrl,
    emailSent,
  };
}

export async function resendStaffInvite(
  userId: string,
  adminId: string,
  baseUrl: string,
): Promise<{ inviteUrl: string; emailSent: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      prenom: true,
      role: true,
      passwordHash: true,
      emailVerified: true,
    },
  });

  if (!user || !isAdminInvitableRole(user.role)) {
    throw new Error("Membre introuvable");
  }

  if (user.passwordHash && user.emailVerified) {
    throw new Error("Ce compte est déjà activé");
  }

  return sendStaffInviteEmail({
    userId: user.id,
    email: user.email,
    prenom: user.prenom,
    role: user.role,
    baseUrl,
    invitedByAdminId: adminId,
  });
}
