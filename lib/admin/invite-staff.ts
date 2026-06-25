import { randomBytes } from "node:crypto";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { sendEmail } from "@/lib/email/send-email";
import { hashPasswordResetToken } from "@/lib/password-reset-token";
import { hashPassword } from "@/lib/password";
import { ensureUniqueStaffEmail, staffEmailDomain } from "@/lib/admin/staff-email";
import {
  type AdminInvitableRole,
  isAdminInvitableRole,
  staffRoleHome,
  staffRoleLabel,
} from "@/lib/admin/staff-roles";
import type { CreateStaffMemberInput } from "@/lib/schemas/admin-team";

/** Génère un mot de passe temporaire lisible (12 chars, sans ambiguïtés). */
function generateTempPassword(): string {
  const charset = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#%";
  const bytes = randomBytes(12);
  return Array.from(bytes)
    .map((b) => charset[b % charset.length]!)
    .join("");
}

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

export async function sendStaffWelcomeEmail(opts: {
  userId: string;
  email: string;
  prenom: string;
  role: AdminInvitableRole;
  tempPassword: string;
  baseUrl: string;
  invitedByAdminId: string;
  notificationEmail?: string | null;
}): Promise<{ emailSent: boolean }> {
  const roleLabel = staffRoleLabel(opts.role);
  const home = staffRoleHome(opts.role);
  const loginUrl = `${opts.baseUrl}/auth/connexion`;
  const changeUrl = `${opts.baseUrl}/changer-mot-de-passe`;
  const deliverTo = opts.notificationEmail?.trim() || opts.email;

  const result = await sendEmail({
    to: deliverTo,
    subject: "Votre accès Anne-sante — identifiants de connexion",
    template: "staff_welcome",
    entityKey: `staff_welcome:${opts.userId}:${Date.now()}`,
    userId: opts.userId,
    html: `<p>Bonjour ${opts.prenom},</p>
<p>Un compte Anne-sante vous a été créé en tant que <strong>${roleLabel}</strong>.</p>
<table style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;background:#f8fafc;margin:16px 0">
  <tr><td style="padding:4px 12px 4px 0;color:#475569;font-size:14px"><strong>Courriel de connexion :</strong></td><td style="font-family:monospace;font-size:14px">${opts.email}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#475569;font-size:14px"><strong>Mot de passe temporaire :</strong></td><td style="font-family:monospace;font-size:14px">${opts.tempPassword}</td></tr>
</table>
<p style="color:#dc2626;font-size:13px">⚠️ Ce mot de passe est temporaire. Vous devrez le changer dès votre première connexion.</p>
<p><a href="${loginUrl}" style="display:inline-block;background:#16a34a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Se connecter</a></p>
<p style="font-size:12px;color:#94a3b8">Après connexion, vous serez automatiquement redirigé(e) vers <a href="${changeUrl}">${changeUrl}</a> pour choisir votre mot de passe définitif.</p>
<p style="font-size:12px;color:#94a3b8">Votre espace professionnel : <a href="${opts.baseUrl}${home}">${opts.baseUrl}${home}</a></p>
<p>— L'équipe Anne-sante</p>`,
    text: `Bonjour ${opts.prenom}, votre accès Anne-sante (${roleLabel}).\nCourriel: ${opts.email}\nMot de passe temporaire: ${opts.tempPassword}\nConnexion: ${loginUrl}\nVous devrez changer votre mot de passe à la première connexion.`,
  });

  await writeAuditLog({
    userId: opts.invitedByAdminId,
    action: "staff_invite_sent",
    entity: opts.userId,
  });

  if (process.env.NODE_ENV === "development") {
    console.info("[Anne-sante] Invitation équipe (dev) — mdp temporaire généré pour", opts.email);
  }

  return { emailSent: result.ok && !result.skipped };
}

/** Renvoi d'invitation : génère un nouveau token de réinitialisation (pour comptes sans mot de passe). */
async function sendStaffInviteTokenEmail(opts: {
  userId: string;
  email: string;
  prenom: string;
  role: AdminInvitableRole;
  baseUrl: string;
  invitedByAdminId: string;
}): Promise<{ inviteUrl: string; emailSent: boolean }> {
  const rawToken = await createInviteToken(opts.userId);
  const inviteUrl = `${opts.baseUrl}/connexion/reinitialisation?token=${encodeURIComponent(rawToken)}`;
  const roleLabel = staffRoleLabel(opts.role);
  const loginUrl = `${opts.baseUrl}/auth/connexion`;

  const result = await sendEmail({
    to: opts.email,
    subject: "Votre accès Anne-sante — nouveau lien d'activation",
    template: "staff_invite",
    entityKey: `staff_invite:${opts.userId}:${Date.now()}`,
    userId: opts.userId,
    html: `<p>Bonjour ${opts.prenom},</p>
<p>Voici un nouveau lien pour activer votre compte <strong>${roleLabel}</strong> sur Anne-sante.</p>
<p><strong>Identifiant :</strong> ${opts.email}</p>
<p><a href="${inviteUrl}">Créer mon mot de passe</a></p>
<p style="font-size:12px;color:#94a3b8">Ce lien expire dans 7 jours. Connexion ensuite sur <a href="${loginUrl}">${loginUrl}</a>.</p>
<p>— L'équipe Anne-sante</p>`,
    text: `Bonjour ${opts.prenom}, activez votre compte: ${inviteUrl}`,
  });

  await writeAuditLog({
    userId: opts.invitedByAdminId,
    action: "staff_invite_sent",
    entity: opts.userId,
  });

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

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const user = await prisma.user.create({
    data: {
      prenom: input.prenom,
      name: fullName,
      email,
      role: input.role,
      medecinLicenseNumber: input.licenseNumber?.trim() || null,
      emailVerified: new Date(),
      passwordHash,
      mustChangePassword: true,
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

  let emailSent = false;

  if (input.sendInvite) {
    const invite = await sendStaffWelcomeEmail({
      userId: user.id,
      email: user.email,
      prenom: user.prenom,
      role: input.role,
      tempPassword,
      baseUrl,
      invitedByAdminId: adminId,
      notificationEmail: input.notificationEmail,
    });
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
    emailSent,
  };
}

export async function resendStaffInvite(
  userId: string,
  adminId: string,
  baseUrl: string,
): Promise<{ inviteUrl?: string; emailSent: boolean; tempPassword?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      prenom: true,
      role: true,
      passwordHash: true,
      emailVerified: true,
      mustChangePassword: true,
    },
  });

  if (!user || !isAdminInvitableRole(user.role)) {
    throw new Error("Membre introuvable");
  }

  if (user.passwordHash && user.emailVerified && !user.mustChangePassword) {
    throw new Error("Ce compte est déjà activé");
  }

  const invitableRole = user.role as AdminInvitableRole;

  // Génère un nouveau mot de passe temporaire
  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, emailVerified: new Date(), mustChangePassword: true },
  });

  const invite = await sendStaffWelcomeEmail({
    userId: user.id,
    email: user.email,
    prenom: user.prenom,
    role: invitableRole,
    tempPassword,
    baseUrl,
    invitedByAdminId: adminId,
  });

  return { emailSent: invite.emailSent, tempPassword };
}
