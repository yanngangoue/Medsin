"use client";

import { Glp1FlowNavRow } from "@/components/navigation/Glp1FlowNavRow";
import type { Glp1FlowNavAction } from "@/components/onboarding/Glp1FlowHeader";
import { glp1QuestionnaireResumeUrl } from "@/lib/patient/glp1-wizard-progress";

type Props = {
  back?: Glp1FlowNavAction;
  forward?: Glp1FlowNavAction;
  hint?: string;
};

/** Bloc Retour + Suivant (inscription et formulaires). */
export function BackSection({
  back = { href: glp1QuestionnaireResumeUrl(), label: "Retour" },
  forward,
  hint,
}: Props) {
  return <Glp1FlowNavRow back={back} forward={forward} hint={hint} />;
}
