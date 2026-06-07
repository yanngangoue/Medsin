export const ELIGIBILITY_QUESTIONNAIRE_PATH = "/eligibilite";

export type Glp1PenVisual = {
  id: string;
  src: string;
  alt: string;
};

/** Stylos injectables PNG fond transparent (scripts/cutout-pen-images.py). */
export const GLP1_PEN_VISUALS: readonly Glp1PenVisual[] = [
  {
    id: "ozempic",
    src: "/images/glp1-ozempic-pen.png",
    alt: "Stylo injectable Ozempic",
  },
  {
    id: "mounjaro",
    src: "/images/glp1-mounjaro-pen.png",
    alt: "Stylo injectable Mounjaro KwikPen",
  },
  {
    id: "wegovy",
    src: "/images/glp1-wegovy-pen.png",
    alt: "Stylo injectable Wegovy",
  },
] as const;
