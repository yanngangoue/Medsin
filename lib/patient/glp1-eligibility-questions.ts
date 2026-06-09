export const GLP1_ELIGIBILITY_STORAGE_KEY = "medsim.glp1.eligibility";

/** Case à cocher « je ne suis concerné par aucune de ces situations ». */
export const GLP1_HEALTH_NONE_LABEL = "Aucune des réponses ci-dessus";

export const GLP1_HEALTH_NONE_IDS = {
  health1: "none_health_1",
  health2: "none_health_2",
  health3: "none_health_3",
} as const;

/** Nombre d’éléments révélés (titre + options + « aucune ») pour une liste santé. */
export function glp1HealthStepRevealCount(itemCount: number) {
  return itemCount + 2;
}

export type Glp1YesNo = "oui" | "non";

export type Glp1Gender = "male" | "female";

export type Glp1BloodPressure =
  | "normal"
  | "elevated"
  | "stage1"
  | "stage2";

export type Glp1HeartRate =
  | "slow"
  | "normal"
  | "slightly_fast"
  | "fast";

export type Glp1EligibilityAnswers = {
  weightGoal?: string;
  heightCm?: string;
  weightKg?: string;
  idealWeightKg?: string;
  gender?: Glp1Gender;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
  health1?: string[];
  health2?: string[];
  health3?: string[];
  opioids3Months?: Glp1YesNo;
  bariatricSurgery?: Glp1YesNo;
  prescriptionMeds?: Glp1YesNo;
  bloodPressure?: Glp1BloodPressure;
  restingHeartRate?: Glp1HeartRate;
};

export const GLP1_HEALTH_1 = [
  {
    id: "renal_esrd",
    label:
      "Insuffisance rénale terminale (sous dialyse ou sur le point de l'être)",
  },
  {
    id: "liver_terminal",
    label: "Maladie hépatique en phase terminale (cirrhose)",
  },
  {
    id: "suicidal",
    label:
      "Pensées suicidaires actuelles et/ou tentative de suicide antérieure",
  },
  {
    id: "cancer_active",
    label:
      "Cancer (diagnostic actif, traitement actif, ou en rémission depuis moins de 5 ans — sauf cancer de la peau non mélanome guéri par excision)",
  },
  {
    id: "gi_severe",
    label:
      "Affections gastro-intestinales graves (gastroparésie, occlusion intestinale, maladie inflammatoire de l'intestin)",
  },
] as const;

export const GLP1_HEALTH_2 = [
  {
    id: "substance_use",
    label:
      "Diagnostic ou traitement actuel pour un trouble ou une dépendance à l'alcool, aux opioïdes ou à d'autres substances",
  },
  { id: "hypothyroid_untreated", label: "Hypothyroïdie non traitée" },
  { id: "gallbladder", label: "Maladie de la vésicule biliaire" },
  { id: "hypertension", label: "Hypertension (pression artérielle élevée)" },
  { id: "seizures", label: "Crises" },
  { id: "glaucoma", label: "Glaucome" },
  { id: "sleep_apnea", label: "Apnée du sommeil" },
] as const;

export const GLP1_HEALTH_3 = [
  { id: "t2_non_insulin", label: "Diabète de type 2 (non insulinodépendant)" },
  { id: "t2_insulin", label: "Diabète de type 2 (sous insuline)" },
  { id: "t1", label: "Diabète de type 1" },
  {
    id: "retinopathy",
    label:
      "Rétinopathie diabétique, lésions du nerf optique ou cécité liée au diabète",
  },
  { id: "warfarin", label: "Utilisation de l'anticoagulant warfarine (Coumadin)" },
  { id: "pancreatitis", label: "Antécédents de pancréatite ou pancréatite actuelle" },
  {
    id: "thyroid_cancer_history",
    label:
      "Antécédents personnels ou familiaux de cancer de la thyroïde ou syndrome MEN2",
  },
  { id: "gout", label: "Goutte" },
  { id: "high_cholesterol", label: "Cholestérol ou triglycérides élevés" },
  { id: "depression", label: "Dépression" },
  { id: "head_trauma", label: "Traumatisme crânien" },
  { id: "brain_tumor", label: "Tumeur ou infection du cerveau / moelle épinière" },
  { id: "low_sodium", label: "Faible teneur en sodium" },
  { id: "liver_disease", label: "Maladies du foie, notamment stéatose hépatique" },
  { id: "kidney_disease", label: "Maladie du rein" },
  { id: "tachycardia", label: "Fréquence cardiaque au repos élevée (tachycardie)" },
  {
    id: "cad_recent",
    label:
      "Maladie coronarienne ou infarctus / AVC au cours des 2 dernières années",
  },
  { id: "all_meds_allergy", label: "Allergie à tous les médicaments" },
  { id: "chf", label: "Insuffisance cardiaque congestive" },
  { id: "qt_prolongation", label: "Allongement de l'intervalle QT ou trouble du rythme" },
  { id: "hospitalization_year", label: "Hospitalisation au cours de la dernière année" },
  { id: "hiv", label: "Virus de l'immunodéficience humaine (VIH)" },
  { id: "acid_reflux", label: "Reflux acide" },
  { id: "asthma", label: "Asthme / maladie réactive des voies respiratoires" },
  { id: "urinary_incontinence", label: "Incontinence urinaire d'effort" },
  { id: "pcos", label: "Syndrome des ovaires polykystiques (SOPK)" },
  { id: "low_testosterone", label: "Faible taux de testostérone cliniquement prouvé" },
  { id: "osteoarthritis", label: "Arthrose" },
  { id: "constipation", label: "Constipation" },
] as const;

export const GLP1_BLOOD_PRESSURE_OPTIONS = [
  { id: "normal" as const, label: "< 120/80", hint: "Normale", tone: "teal" },
  { id: "elevated" as const, label: "120 - 129/<80", hint: "Élevé", tone: "amber" },
  {
    id: "stage1" as const,
    label: "130 - 139/80-89",
    hint: "Hypertension de stade 1",
    tone: "orange",
  },
  {
    id: "stage2" as const,
    label: "≥ 140/90",
    hint: "Hypertension de stade 2",
    tone: "red",
  },
] as const;

export const GLP1_HEART_RATE_OPTIONS = [
  {
    id: "slow" as const,
    label: "<60 battements par minute",
    hint: "Lent",
    tone: "teal",
  },
  {
    id: "normal" as const,
    label: "60 à 100 battements par minute",
    hint: "Normale",
    tone: "green",
  },
  {
    id: "slightly_fast" as const,
    label: "101 à 110 battements par minute",
    hint: "Légèrement rapide",
    tone: "orange",
  },
  {
    id: "fast" as const,
    label: ">110 battements par minute",
    hint: "Rapide",
    tone: "red",
  },
] as const;

export const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

/** Nombre d’étapes affichées dans la barre de progression (page B). */
export const GLP1_WIZARD_STEP_COUNT = 12;
