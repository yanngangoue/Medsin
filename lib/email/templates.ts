import { getAppBaseUrl } from "@/lib/email/app-url";
import type { EligibilityStatus } from "@prisma/client";

const ELIGIBILITY_FR: Record<EligibilityStatus, string> = {
  PENDING: "En analyse",
  ELIGIBLE: "Admissible (simulation)",
  NOT_ELIGIBLE: "Non admissible (simulation)",
  MEDICAL_REVIEW_REQUIRED: "Revue médicale requise",
};

function layout(body: string): string {
  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;color:#1e293b;line-height:1.5;max-width:560px;margin:0 auto;padding:24px">
  <p style="color:#1D9E75;font-weight:700;font-size:14px;letter-spacing:.05em">MEDSIM</p>
  ${body}
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
  <p style="font-size:11px;color:#64748b">Plateforme de télésanté et simulation. Ce message ne constitue pas un avis médical d&apos;urgence.</p>
</body></html>`;
}

export function welcomeEmail(prenom: string) {
  const base = getAppBaseUrl();
  const subject = "Bienvenue sur MedSim";
  const html = layout(`
    <h1 style="font-size:20px">Bonjour ${prenom},</h1>
    <p>Votre compte MedSim est créé. Vous pouvez poursuivre votre parcours de santé à tout moment.</p>
    <p><a href="${base}/dashboard/patient" style="display:inline-block;background:#1D9E75;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Accéder à mon espace</a></p>
  `);
  const text = `Bonjour ${prenom},\n\nVotre compte MedSim est créé.\nMon espace : ${base}/dashboard/patient`;
  return { subject, html, text };
}

export function eligibilityDecisionEmail(
  prenom: string,
  eligibility: EligibilityStatus,
  patientMessage?: string | null,
) {
  const base = getAppBaseUrl();
  const label = ELIGIBILITY_FR[eligibility];
  const subject = `MedSim — mise à jour de votre dossier (${label})`;
  const extra = patientMessage
    ? `<p style="background:#f0fbf7;padding:12px;border-radius:8px">${patientMessage}</p>`
    : "";
  const html = layout(`
    <h1 style="font-size:20px">Bonjour ${prenom},</h1>
    <p>Votre dossier a été mis à jour par notre équipe : <strong>${label}</strong>.</p>
    ${extra}
    <p><a href="${base}/dashboard/patient/dossier">Voir mon dossier GLP-1</a> · <a href="${base}/dashboard/patient#contact-medical">Contact médical</a></p>
  `);
  const text = `Bonjour ${prenom},\n\nStatut : ${label}\n${patientMessage ?? ""}\n\nDossier : ${base}/dashboard/patient/dossier`;
  return { subject, html, text };
}

export function appointmentConfirmedEmail(
  prenom: string,
  formattedDate: string,
  appointmentId: string,
) {
  const base = getAppBaseUrl();
  const joinUrl = `${base}/dashboard/patient/consultation/${appointmentId}`;
  const subject = `MedSim — consultation vidéo planifiée (${formattedDate})`;
  const html = layout(`
    <h1 style="font-size:20px">Bonjour ${prenom},</h1>
    <p>Votre téléconsultation est planifiée pour le <strong>${formattedDate}</strong>.</p>
    <p>Vous pourrez rejoindre la salle 15 minutes avant l&apos;heure prévue.</p>
    <p><a href="${joinUrl}" style="display:inline-block;background:#1D9E75;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Rejoindre la visio (à l&apos;heure H)</a></p>
  `);
  const text = `Consultation planifiée : ${formattedDate}\nLien : ${joinUrl}`;
  return { subject, html, text };
}

export function appointmentReminderEmail(
  prenom: string,
  formattedDate: string,
  appointmentId: string,
  windowLabel: string,
) {
  const base = getAppBaseUrl();
  const joinUrl = `${base}/dashboard/patient/consultation/${appointmentId}`;
  const subject = `Rappel MedSim — visio ${windowLabel} (${formattedDate})`;
  const html = layout(`
    <h1 style="font-size:20px">Bonjour ${prenom},</h1>
    <p>Rappel : votre consultation vidéo MedSim a lieu <strong>${windowLabel}</strong> (${formattedDate}).</p>
    <p><a href="${joinUrl}" style="display:inline-block;background:#1D9E75;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Rejoindre la salle</a></p>
  `);
  const text = `Rappel visio ${windowLabel} — ${formattedDate}\n${joinUrl}`;
  return { subject, html, text };
}
