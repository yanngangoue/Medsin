/** Réponse API file médecin — toujours structurée (même vide ou en erreur). */
export type MedecinFileResponse = {
  urgent: MedecinFileDossierRow[];
  nouveau: MedecinFileDossierRow[];
  enCours: MedecinFileDossierRow[];
  stats: {
    enAttente: number;
    traitesAujourdhui: number;
    delaiMoyenHeures: number | null;
  };
};

export type MedecinFileDossierRow = {
  id: string;
  patientId: string;
  patientName: string;
  email: string;
  imc: number | null;
  age: number | null;
  status: string;
  createdAt: string;
  suggestionEligibilite: string | null;
};

export const EMPTY_MEDECIN_FILE_RESPONSE: MedecinFileResponse = {
  urgent: [],
  nouveau: [],
  enCours: [],
  stats: {
    enAttente: 0,
    traitesAujourdhui: 0,
    delaiMoyenHeures: null,
  },
};
