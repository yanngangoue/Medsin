import {
  appointmentConfirmedEmail,
  appointmentReminderEmail,
  eligibilityDecisionEmail,
  welcomeEmail,
} from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send-email";
import { formatAppointmentFr } from "@/lib/telehealth/video-consultation";
import type { EligibilityStatus } from "@prisma/client";

export async function notifyWelcome(params: {
  userId: string;
  email: string;
  prenom: string;
}) {
  const tpl = welcomeEmail(params.prenom);
  return sendEmail({
    ...tpl,
    to: params.email,
    template: "welcome",
    userId: params.userId,
    entityKey: `user:${params.userId}:welcome`,
  });
}

export async function notifyEligibilityDecision(params: {
  userId: string;
  email: string;
  prenom: string;
  eligibility: EligibilityStatus;
  patientMessage?: string | null;
  decisionId: string;
}) {
  const tpl = eligibilityDecisionEmail(
    params.prenom,
    params.eligibility,
    params.patientMessage,
  );
  return sendEmail({
    ...tpl,
    to: params.email,
    template: "eligibility_decision",
    userId: params.userId,
    entityKey: `decision:${params.decisionId}`,
  });
}

export async function notifyAppointmentConfirmed(params: {
  userId: string;
  email: string;
  prenom: string;
  appointmentId: string;
  scheduledAt: Date;
}) {
  const formatted = formatAppointmentFr(params.scheduledAt.toISOString());
  const tpl = appointmentConfirmedEmail(params.prenom, formatted, params.appointmentId);
  return sendEmail({
    ...tpl,
    to: params.email,
    template: "appointment_confirmed",
    userId: params.userId,
    entityKey: `appointment:${params.appointmentId}:confirmed`,
  });
}

export async function notifyAppointmentReminder(params: {
  userId: string;
  email: string;
  prenom: string;
  appointmentId: string;
  scheduledAt: Date;
  window: "24h" | "15min";
}) {
  const formatted = formatAppointmentFr(params.scheduledAt.toISOString());
  const windowLabel = params.window === "24h" ? "demain" : "dans environ 15 minutes";
  const tpl = appointmentReminderEmail(
    params.prenom,
    formatted,
    params.appointmentId,
    windowLabel,
  );
  return sendEmail({
    ...tpl,
    to: params.email,
    template: `appointment_reminder_${params.window}`,
    userId: params.userId,
    entityKey: `appointment:${params.appointmentId}:reminder_${params.window}`,
  });
}
