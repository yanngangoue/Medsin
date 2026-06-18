export interface User {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string
  role: 'patient' | 'ips'
}

export interface MedicalAnswers {
  poids: string
  taille: string
  sexe: string
  fumeur: string
  motif: string
  duree: string
  intensite: string
  maladiesChroniques: string[]
  chirurgiesPassees: string
  chirurgiesDetails: string
  allergies: string
  allergiesDetails: string
  medicaments: string
  medicamentsDetails: string
  commentaires: string
}

export interface Questionnaire {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  answers: MedicalAnswers
  status: 'pending' | 'approved' | 'rejected'
  ipsId?: string
  ipsNotes?: string
  createdAt: string
}
