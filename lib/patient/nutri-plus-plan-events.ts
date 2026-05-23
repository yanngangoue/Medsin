/** Ouvre le configurateur Nutri+ (clic « Commencer ma transformation » ou lien Mon plan). */
export const NUTRI_OPEN_PLAN_EVENT = "nutri-open-plan";

export function dispatchNutriOpenPlan() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NUTRI_OPEN_PLAN_EVENT));
  }
}

export function scrollToNutriPlan() {
  requestAnimationFrame(() => {
    document.getElementById("configurer-mon-suivi")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
