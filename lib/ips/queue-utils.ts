import type { ConsultationStatus } from "@prisma/client";

export type QueueFilter = "all" | "urgent" | "pending" | "approved";

export type QueueQuestionnaire = {
  id: string;
  status: ConsultationStatus;
  bmi: number;
  weight: number;
  height: number;
  createdAt: string;
  patientPrenom: string;
  patientNom: string | null;
  patientEmail: string;
  age: number | null;
  medicationRequested: string | null;
  isUrgent: boolean;
  urgentReasons: string[];
};

export function formatHoursAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 1) {
    const mins = Math.max(1, Math.floor(ms / (1000 * 60)));
    return `${mins} min`;
  }
  if (hours < 48) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} j`;
}

export function patientDisplayName(prenom: string, nom: string | null): string {
  return nom?.trim() ? `${prenom} ${nom}` : prenom;
}

export function patientInitials(prenom: string, nom: string | null): string {
  const a = prenom.charAt(0).toUpperCase();
  const b = nom?.trim() ? nom.trim().charAt(0).toUpperCase() : "";
  return `${a}${b}` || "?";
}

export function statusLabel(status: ConsultationStatus): string {
  const labels: Record<ConsultationStatus, string> = {
    DRAFT: "Brouillon",
    SUBMITTED: "Soumis",
    UNDER_REVIEW: "En révision",
    APPROVED: "Approuvé",
    REJECTED: "Rejeté",
    PRESCRIPTION_ISSUED: "Ordonnance émise",
  };
  return labels[status] ?? status;
}

export function statusColorClass(status: ConsultationStatus): string {
  switch (status) {
    case "SUBMITTED":
      return "bg-amber-100 text-amber-800";
    case "UNDER_REVIEW":
      return "bg-blue-100 text-blue-800";
    case "PRESCRIPTION_ISSUED":
    case "APPROVED":
      return "bg-emerald-100 text-emerald-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function isPendingStatus(status: ConsultationStatus): boolean {
  return status === "SUBMITTED" || status === "UNDER_REVIEW";
}

export function isApprovedStatus(status: ConsultationStatus): boolean {
  return status === "PRESCRIPTION_ISSUED" || status === "APPROVED";
}

export function matchesQueueFilter(q: QueueQuestionnaire, filter: QueueFilter): boolean {
  if (filter === "urgent") return q.isUrgent;
  if (filter === "pending") return isPendingStatus(q.status);
  if (filter === "approved") return isApprovedStatus(q.status);
  return true;
}

/** Urgent si nausée > 3 ou perte > 2 kg sur 7 jours. */
export function computeUrgentFromCheckIns(
  checkIns: { weight: number; nausee: number | null; recordedAt: Date }[],
): { isUrgent: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const sorted = [...checkIns].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
  const latest = sorted[0];
  if (latest?.nausee != null && latest.nausee > 3) {
    reasons.push(`Nausées ${latest.nausee}/5`);
  }

  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const inWeek = sorted.filter((c) => new Date(c.recordedAt).getTime() >= cutoff);
  if (inWeek.length >= 2) {
    const oldest = inWeek[inWeek.length - 1]!;
    const newest = inWeek[0]!;
    const delta = newest.weight - oldest.weight;
    if (delta <= -2) {
      reasons.push(`Perte ${Math.abs(delta).toFixed(1)} kg / semaine`);
    }
  }

  return { isUrgent: reasons.length > 0, reasons };
}
