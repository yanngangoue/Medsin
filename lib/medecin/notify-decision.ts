import { sendEmail } from "@/lib/email/send-email";
import type { DossierStatus } from "@prisma/client";

export async function notifyDossierDecision(params: {
  patientId: string;
  patientEmail: string;
  patientPrenom: string;
  medecinName: string;
  status: DossierStatus;
  motifRefus?: string | null;
  dossierId: string;
}) {
  const { patientPrenom, medecinName, status, motifRefus } = params;

  let subject: string;
  let html: string;

  if (status === "APPROUVE") {
    subject = "Votre dossier GLP-1 a été approuvé";
    html = `<p>Bonjour ${patientPrenom},</p>
<p><strong>Dr. ${medecinName}</strong> a examiné votre dossier et approuvé votre traitement GLP-1.</p>
<p>Votre ordonnance sera disponible dans votre espace patient dès qu'elle sera signée.</p>
<p><a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3001"}/dashboard/patient">Voir mon espace patient</a></p>`;
  } else if (status === "REFUSE") {
    subject = "Votre dossier GLP-1 a été examiné";
    html = `<p>Bonjour ${patientPrenom},</p>
<p>Après examen de votre dossier, <strong>Dr. ${medecinName}</strong> a déterminé que le traitement GLP-1 n'est pas approprié pour vous actuellement.</p>
${motifRefus ? `<p><strong>Motif :</strong> ${motifRefus}</p>` : ""}
<p><a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3001"}/dashboard/patient">Voir les alternatives Anne-sante</a></p>`;
  } else {
    subject = "Informations complémentaires requises";
    html = `<p>Bonjour ${patientPrenom},</p>
<p><strong>Dr. ${medecinName}</strong> a besoin d'informations supplémentaires avant de statuer sur votre dossier GLP-1.</p>
<p><a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3001"}/dashboard/patient/messages">Répondre au médecin</a></p>`;
  }

  return sendEmail({
    to: params.patientEmail,
    subject,
    html,
    text: html.replace(/<[^>]+>/g, " "),
    template: "dossier_glp1_decision",
    userId: params.patientId,
    entityKey: `dossier:${params.dossierId}:decision:${status}`,
  });
}
