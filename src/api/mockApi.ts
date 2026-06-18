import type { User, Questionnaire, MedicalAnswers } from '../types'

const KEYS = {
  USER: 'medsim_user',
  QUESTIONNAIRES: 'medsim_questionnaires',
  CURRENT_Q: 'medsim_current_q',
  PAYMENT: 'medsim_payment',
}

const DEMO_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: 'demo-1',
    patientId: 'demo-patient-1',
    patientName: 'Marie Tremblay',
    patientEmail: 'marie.tremblay@example.com',
    answers: {
      poids: '65',
      taille: '168',
      sexe: 'Féminin',
      fumeur: 'Non-fumeur',
      motif: 'Douleurs persistantes à la gorge et fatigue depuis 2 semaines.',
      duree: '1-4 semaines',
      intensite: 'Modérée',
      maladiesChroniques: ['Asthme'],
      chirurgiesPassees: 'non',
      chirurgiesDetails: '',
      allergies: 'oui',
      allergiesDetails: 'Pénicilline',
      medicaments: 'oui',
      medicamentsDetails: 'Ventolin (au besoin)',
      commentaires: "J'ai déjà eu une angine l'an dernier avec des symptômes similaires.",
    },
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    patientId: 'demo-patient-2',
    patientName: 'Jean-François Côté',
    patientEmail: 'jf.cote@example.com',
    answers: {
      poids: '82',
      taille: '180',
      sexe: 'Masculin',
      fumeur: 'Ancien fumeur',
      motif: 'Tension artérielle élevée et maux de tête fréquents.',
      duree: 'Plus de 3 mois',
      intensite: 'Légère',
      maladiesChroniques: ['Hypertension'],
      chirurgiesPassees: 'non',
      chirurgiesDetails: '',
      allergies: 'non',
      allergiesDetails: '',
      medicaments: 'oui',
      medicamentsDetails: 'Ramipril 5mg',
      commentaires: 'Mon médecin est en congé, je cherche un renouvellement.',
    },
    status: 'approved',
    ipsNotes: 'Renouvellement approuvé pour 3 mois. Surveiller la tension régulièrement.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

function initDemoData() {
  if (!localStorage.getItem(KEYS.QUESTIONNAIRES)) {
    localStorage.setItem(KEYS.QUESTIONNAIRES, JSON.stringify(DEMO_QUESTIONNAIRES))
  }
}

function getQuestionnaires(): Questionnaire[] {
  initDemoData()
  const data = localStorage.getItem(KEYS.QUESTIONNAIRES)
  return data ? JSON.parse(data) : []
}

function saveQuestionnaires(questionnaires: Questionnaire[]): void {
  localStorage.setItem(KEYS.QUESTIONNAIRES, JSON.stringify(questionnaires))
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(KEYS.USER)
  return data ? JSON.parse(data) : null
}

export function registerUser(data: Omit<User, 'id'>): User {
  const user: User = { ...data, id: crypto.randomUUID() }
  localStorage.setItem(KEYS.USER, JSON.stringify(user))
  return user
}

export function loginIPS(email: string): User | null {
  if (email === 'ips@medsim.ca') {
    const ips: User = {
      id: 'ips-1',
      prenom: 'Sophie',
      nom: 'Lavoie',
      email: 'ips@medsim.ca',
      telephone: '514-555-0100',
      role: 'ips',
    }
    localStorage.setItem(KEYS.USER, JSON.stringify(ips))
    return ips
  }
  return null
}

export function logout(): void {
  localStorage.removeItem(KEYS.USER)
  localStorage.removeItem(KEYS.CURRENT_Q)
  localStorage.removeItem(KEYS.PAYMENT)
}

export function submitQuestionnaire(
  patientId: string,
  patientName: string,
  patientEmail: string,
  answers: MedicalAnswers
): Questionnaire {
  const questionnaire: Questionnaire = {
    id: crypto.randomUUID(),
    patientId,
    patientName,
    patientEmail,
    answers,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  const questionnaires = getQuestionnaires()
  questionnaires.push(questionnaire)
  saveQuestionnaires(questionnaires)
  localStorage.setItem(KEYS.CURRENT_Q, questionnaire.id)
  return questionnaire
}

export function getCurrentQuestionnaireId(): string | null {
  return localStorage.getItem(KEYS.CURRENT_Q)
}

export function getQuestionnaireById(id: string): Questionnaire | null {
  return getQuestionnaires().find(q => q.id === id) ?? null
}

export function getAllQuestionnaires(): Questionnaire[] {
  return getQuestionnaires()
}

export function approveQuestionnaire(id: string, notes: string): void {
  const questionnaires = getQuestionnaires()
  const q = questionnaires.find(item => item.id === id)
  if (q) {
    q.status = 'approved'
    q.ipsNotes = notes
    saveQuestionnaires(questionnaires)
  }
}

export function rejectQuestionnaire(id: string, notes: string): void {
  const questionnaires = getQuestionnaires()
  const q = questionnaires.find(item => item.id === id)
  if (q) {
    q.status = 'rejected'
    q.ipsNotes = notes
    saveQuestionnaires(questionnaires)
  }
}

export function completePayment(): void {
  localStorage.setItem(KEYS.PAYMENT, 'completed')
}

export function getPaymentStatus(): string | null {
  return localStorage.getItem(KEYS.PAYMENT)
}
