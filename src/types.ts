export type UserRole = 'patient' | 'ips' | 'pharmacist' | 'admin'

export interface User {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string
  role: UserRole
  specialisation?: string
  pharmacyName?: string
  licenceNumber?: string
  password?: string
  createdAt: string
}

export type BMICategory = 'insuffisance' | 'normal' | 'surpoids' | 'obese_1' | 'obese_2'

export interface BMIResult {
  poids: number
  taille: number
  imc: number
  categorie: BMICategory
}

export interface MedicalAnswers {
  // Section 1 — Motif de consultation
  motif: string
  symptomes: string[]
  autresSymptomes: string
  duree: string
  intensite: string
  evolution: string

  // Section 2 — Profil personnel
  dateNaissance: string
  sexe: string
  poids: string
  taille: string
  fumeur: string
  alcool: string

  // Section 3 — Antécédents médicaux
  maladiesChroniques: string[]
  autresMaladies: string
  chirurgiesPassees: string
  chirurgiesDetails: string
  allergies: string
  allergiesDetails: string
  antecedentsFamiliaux: string

  // Section 4 — Traitements en cours
  medicaments: string
  medicamentsDetails: string
  supplements: string
  supplementsDetails: string

  // Section 5 — Mode de vie & bien-être
  activitePhysique: string
  frequenceActivite: string
  alimentation: string
  sommeil: string
  stress: string
  santeMentale: string

  // Section 6 — Finalisation
  commentaires: string
  consentement: boolean
  consentementDonnees: boolean
}

export interface PrescriptionMedication {
  name: string
  dosage: string
  frequency: string
  duration: string
  notes: string
}

export interface Prescription {
  id: string
  questionnaireId: string
  patientId: string
  patientName: string
  patientEmail: string
  ipsId: string
  ipsName: string
  medications: PrescriptionMedication[]
  instructions: string
  refills: number
  validUntil: string
  pharmacyId: string
  pharmacyName: string
  sentToPharmacy: boolean
  createdAt: string
}

export type DeliveryStatus = 'received' | 'preparing' | 'ready' | 'shipped' | 'delivered'

export interface DeliveryEvent {
  status: DeliveryStatus
  label: string
  timestamp: string
  note?: string
}

export interface DeliveryTracking {
  id: string
  prescriptionId: string
  pharmacistId: string
  pharmacyName: string
  status: DeliveryStatus
  history: DeliveryEvent[]
  estimatedDelivery: string
  trackingNumber: string
}

export interface Questionnaire {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  answers: MedicalAnswers
  bmi?: BMIResult
  annaSummary?: string
  status: 'pending' | 'approved' | 'rejected'
  ipsId?: string
  ipsName?: string
  ipsNotes?: string
  prescription?: Prescription
  delivery?: DeliveryTracking
  createdAt: string
  reviewedAt?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: UserRole | 'anna'
  content: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  patientId: string
  questionnaireId: string
  type: 'patient-ips' | 'patient-anna'
  participantName: string
  messages: ChatMessage[]
  updatedAt: string
}
