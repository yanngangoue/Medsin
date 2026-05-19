export type Glp1WeightGoalId = "0_5_9" | "9_5_22_5" | "23_plus" | "unsure";

export type Glp1WeightGoalOption = {
  id: Glp1WeightGoalId;
  label: string;
};

export const GLP1_WEIGHT_GOAL_OPTIONS: readonly Glp1WeightGoalOption[] = [
  { id: "0_5_9", label: "Perte de 0,5 à 9 kg" },
  { id: "9_5_22_5", label: "Perte de 9,5 à 22,5 kg" },
  { id: "23_plus", label: "Perte de plus de 23 kg" },
  { id: "unsure", label: "Je ne sais pas trop, je veux juste perdre du poids." },
] as const;

export const GLP1_WEIGHT_GOAL_STORAGE_KEY = "medsim.glp1.weightGoal";
