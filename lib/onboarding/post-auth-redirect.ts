import {
  ELIGIBILITY_RESULT_KEY,
  getOrCreateEligibilitySessionId,
  readEligibilityDraft,
} from "@/lib/onboarding/eligibility-session";

/** Parcours éligibilité complété (résultat ou brouillon en session). */
export function hasEligibilityPreCheck(): boolean {
  if (typeof window === "undefined") return false;

  const result = sessionStorage.getItem(ELIGIBILITY_RESULT_KEY);
  if (result === "ELIGIBLE" || result === "BORDERLINE") {
    return true;
  }

  if (readEligibilityDraft()) {
    return true;
  }

  const sessionId = sessionStorage.getItem("medsim.eligibility.sessionId");
  return Boolean(sessionId?.trim());
}

export function getEligibilitySessionIdForLink(): string {
  return getOrCreateEligibilitySessionId();
}

export function resolvePatientPostAuthPath(options: {
  callbackUrl?: string | null;
  serviceGestionPoids?: boolean;
}): string {
  const { callbackUrl, serviceGestionPoids } = options;

  if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") && !callbackUrl.includes("\\")) {
    return callbackUrl;
  }

  if (serviceGestionPoids || hasEligibilityPreCheck()) {
    return "/paiement?onboarding=1";
  }

  return "/dashboard/patient";
}
