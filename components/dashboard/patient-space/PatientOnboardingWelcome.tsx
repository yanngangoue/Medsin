import type { WeightCheckInPublic } from "@/lib/patient/weight-program";

type QuestionnaireStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PRESCRIPTION_ISSUED";

type FulfillmentSnap = {
  paymentStatus: string;
  status: string;
} | null;

type Step = {
  id: string;
  label: string;
  done: boolean;
  pending?: boolean;
  eta?: string;
};

function buildSteps(
  questionnaireStatus: QuestionnaireStatus | null | undefined,
  fulfillment: FulfillmentSnap,
  checkIns: WeightCheckInPublic[],
): Step[] {
  const qOk =
    questionnaireStatus != null &&
    questionnaireStatus !== "DRAFT";
  const paid = fulfillment?.paymentStatus === "PAID";
  const prescriptionReady =
    questionnaireStatus === "APPROVED" ||
    questionnaireStatus === "PRESCRIPTION_ISSUED" ||
    (fulfillment != null &&
      ["ISSUED", "SENT_TO_PHARMACY", "IN_PREPARATION", "SHIPPED", "DELIVERED"].includes(
        fulfillment.status,
      ));
  const shipped =
    fulfillment != null &&
    (fulfillment.status === "SHIPPED" || fulfillment.status === "DELIVERED");
  const hasCheckIn = checkIns.length > 0;

  return [
    { id: "1", label: "Éligibilité confirmée", done: qOk },
    { id: "2", label: "Dossier médical soumis", done: qOk },
    {
      id: "3",
      label: "Paiement confirmé",
      done: paid,
      pending: qOk && !paid,
      eta: "Après validation IPS",
    },
    {
      id: "4",
      label: "Ordonnance IPS",
      done: prescriptionReady && paid,
      pending: paid && !prescriptionReady,
      eta: "Moins de 48 h ouvrables",
    },
    {
      id: "5",
      label: "Livraison médicament",
      done: shipped,
      pending: prescriptionReady && paid && !shipped,
      eta: "3 à 5 jours ouvrables",
    },
    {
      id: "6",
      label: "Premier bilan hebdomadaire avec Anne",
      done: hasCheckIn,
      pending: shipped && !hasCheckIn,
      eta: "Dès réception",
    },
  ];
}

type Props = {
  questionnaireStatus?: QuestionnaireStatus | null;
  fulfillment: FulfillmentSnap;
  checkIns: WeightCheckInPublic[];
};

export function PatientOnboardingWelcome({
  questionnaireStatus,
  fulfillment,
  checkIns,
}: Props) {
  const steps = buildSteps(questionnaireStatus, fulfillment, checkIns);

  return (
    <section className="rounded-2xl border border-[#3EBD93]/25 bg-gradient-to-br from-[#F0F7F4] to-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Bienvenue chez MedSim ! 🎉</h2>
      <p className="mt-1 text-sm text-slate-600">Voici où en est votre parcours :</p>
      <ol className="mt-5 space-y-4">
        {steps.map((step) => (
          <li key={step.id} className="flex gap-3">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step.done
                  ? "bg-[#1D4D3A] text-white"
                  : step.pending
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-400"
              }`}
              aria-hidden
            >
              {step.done ? "✓" : step.pending ? "⏳" : "○"}
            </span>
            <div>
              <p
                className={`text-sm font-semibold ${
                  step.done ? "text-slate-900" : step.pending ? "text-amber-900" : "text-slate-500"
                }`}
              >
                Étape {step.id} — {step.label}
              </p>
              {step.pending && step.eta ? (
                <p className="mt-0.5 text-xs text-slate-500">Délai estimé : {step.eta}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
