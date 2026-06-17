import { redirect } from "next/navigation";

/** Ancien parcours questionnaire — redirige vers le questionnaire clinique v2. */
export default function LegacyQuestionnaireRedirect() {
  redirect("/questionnaire");
}
