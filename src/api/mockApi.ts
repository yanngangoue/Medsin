import type {
  User, Questionnaire, MedicalAnswers, BMIResult,
  Prescription, DeliveryStatus,
  DeliveryEvent, ChatMessage, Conversation,
} from '../types'

// ─── Storage keys ───────────────────────────────────────────
const SCHEMA_VERSION = '2'

const K = {
  USER:            'ms_user',
  USERS:           'ms_users',
  QUESTIONNAIRES:  'ms_questionnaires',
  CURRENT_Q:       'ms_current_q',
  PAYMENT:         'ms_payment',
  CONVERSATIONS:   'ms_conversations',
  BMI:             'ms_bmi',
  SCHEMA:          'ms_schema_v',
}

// ─── Demo data ───────────────────────────────────────────────
const DEMO_IPS: User = {
  id: 'ips-1',
  prenom: 'Sophie',
  nom: 'Lavoie',
  email: 'ips@anne.ca',
  telephone: '514-555-0100',
  role: 'ips',
  specialisation: 'Médecine générale & thérapeutique',
  licenceNumber: 'IPS-2024-0042',
  password: 'demo123',
  createdAt: '2024-01-15T08:00:00.000Z',
}

const DEMO_PHARMACIST: User = {
  id: 'pharma-1',
  prenom: 'Marc',
  nom: 'Beaupré',
  email: 'marc.beaupre@anne.ca',
  telephone: '514-555-0200',
  role: 'pharmacist',
  pharmacyName: 'Pharmacie Santé Plus',
  licenceNumber: 'PH-2024-0088',
  password: 'demo123',
  createdAt: '2024-01-15T08:00:00.000Z',
}

const DEMO_ADMIN: User = {
  id: 'admin-1',
  prenom: 'Anne',
  nom: 'Directrice',
  email: 'admin@anne.ca',
  telephone: '514-555-0001',
  role: 'admin',
  password: 'admin123',
  createdAt: '2024-01-01T00:00:00.000Z',
}

function makeAnswers(partial: Partial<MedicalAnswers>): MedicalAnswers {
  return {
    motif: '', symptomes: [], autresSymptomes: '', duree: '', intensite: '5', evolution: '',
    dateNaissance: '', sexe: '', poids: '', taille: '', fumeur: '', alcool: '',
    maladiesChroniques: [], autresMaladies: '', chirurgiesPassees: '', chirurgiesDetails: '',
    allergies: '', allergiesDetails: '', antecedentsFamiliaux: '',
    medicaments: '', medicamentsDetails: '', supplements: '', supplementsDetails: '',
    activitePhysique: '', frequenceActivite: '', alimentation: '', sommeil: '', stress: '', santeMentale: '',
    commentaires: '', consentement: true, consentementDonnees: true,
    ...partial,
  }
}

function annaSummary(q: Questionnaire): string {
  const a = q.answers
  const imc = q.bmi ? q.bmi.imc.toFixed(1) : '?'
  const flags: string[] = []
  if (a.allergies === 'oui') flags.push(`⚠ ALLERGIE : ${a.allergiesDetails || 'déclarée'}`)
  if (a.maladiesChroniques.length > 0) flags.push(`Maladies chroniques : ${a.maladiesChroniques.join(', ')}`)
  if (a.medicaments === 'oui') flags.push(`Médicaments : ${a.medicamentsDetails || 'en cours'}`)
  const urgence = parseInt(a.intensite) >= 8 ? '🔴 URGENCE ÉLEVÉE' : parseInt(a.intensite) >= 5 ? '🟡 Priorité normale' : '🟢 Priorité basse'
  return `RÉSUMÉ ANNA — Généré automatiquement
Statut : ${urgence}
IMC : ${imc} kg/m²
Motif : ${a.motif.slice(0, 120)}
Durée : ${a.duree} · Intensité : ${a.intensite}/10 · Évolution : ${a.evolution || 'non précisée'}
${flags.length > 0 ? '\nALERTES CLINIQUES :\n' + flags.map(f => `• ${f}`).join('\n') : 'Aucune alerte clinique majeure.'}
Mode de vie : ${[a.fumeur, a.activitePhysique, a.alimentation].filter(Boolean).join(' | ')}`
}

const DEMO_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: 'demo-1',
    patientId: 'demo-p1',
    patientName: 'Marie Tremblay',
    patientEmail: 'marie.tremblay@example.com',
    bmi: { poids: 65, taille: 168, imc: 23.0, categorie: 'normal' },
    answers: makeAnswers({
      motif: 'Douleurs persistantes à la gorge et fatigue intense depuis 2 semaines.',
      symptomes: ['Douleur', 'Fatigue', 'Fièvre'],
      duree: '1 à 4 semaines',
      intensite: '6',
      evolution: 'Stable',
      dateNaissance: '1989-03-15',
      sexe: 'Féminin',
      poids: '65',
      taille: '168',
      fumeur: 'Non-fumeur',
      alcool: 'Occasionnel',
      maladiesChroniques: ['Asthme'],
      allergies: 'oui',
      allergiesDetails: 'Pénicilline',
      medicaments: 'oui',
      medicamentsDetails: 'Ventolin (au besoin)',
      activitePhysique: 'Modérée',
      frequenceActivite: '3-4x / semaine',
      alimentation: 'Omnivore',
      sommeil: 'Bon',
      stress: 'Modéré',
      commentaires: "Déjà eu une angine similaire l'an dernier.",
    }),
    annaSummary: '',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'demo-2',
    patientId: 'demo-p2',
    patientName: 'Jean-François Côté',
    patientEmail: 'jf.cote@example.com',
    bmi: { poids: 82, taille: 180, imc: 25.3, categorie: 'surpoids' },
    answers: makeAnswers({
      motif: 'Tension artérielle élevée mesurée à 145/95 et maux de tête fréquents matinaux.',
      symptomes: ['Maux de tête', 'Fatigue'],
      duree: 'Plus de 3 mois',
      intensite: '4',
      evolution: 'S\'aggrave',
      dateNaissance: '1975-11-22',
      sexe: 'Masculin',
      poids: '82',
      taille: '180',
      fumeur: 'Ancien fumeur',
      alcool: 'Modéré',
      maladiesChroniques: ['Hypertension'],
      allergies: 'non',
      medicaments: 'oui',
      medicamentsDetails: 'Ramipril 5mg (matin)',
      activitePhysique: 'Légère',
      frequenceActivite: '1-2x / semaine',
      alimentation: 'Omnivore',
      sommeil: 'Moyen',
      stress: 'Élevé',
      commentaires: 'Mon médecin est en congé. Je cherche un renouvellement.',
    }),
    annaSummary: '',
    status: 'approved',
    ipsId: 'ips-1',
    ipsName: 'Sophie Lavoie',
    ipsNotes: 'Renouvellement approuvé pour 3 mois. Surveiller la tension deux fois par jour.',
    prescription: {
      id: 'rx-demo-2',
      questionnaireId: 'demo-2',
      patientId: 'demo-p2',
      patientName: 'Jean-François Côté',
      patientEmail: 'jf.cote@example.com',
      ipsId: 'ips-1',
      ipsName: 'Sophie Lavoie',
      medications: [
        { name: 'Ramipril', dosage: '5 mg', frequency: '1 fois par jour (matin)', duration: '3 mois', notes: 'Prendre avec un grand verre d\'eau' },
      ],
      instructions: 'Surveiller la tension artérielle deux fois par jour. Réduire le sodium. Éviter l\'alcool pendant le traitement.',
      refills: 2,
      validUntil: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      pharmacyId: 'pharma-1',
      pharmacyName: 'Pharmacie Santé Plus',
      sentToPharmacy: true,
      createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    },
    delivery: {
      id: 'del-demo-2',
      prescriptionId: 'rx-demo-2',
      pharmacistId: 'pharma-1',
      pharmacyName: 'Pharmacie Santé Plus',
      status: 'preparing',
      history: [
        { status: 'received',  label: 'Ordonnance reçue',    timestamp: new Date(Date.now() - 15 * 3600000).toISOString() },
        { status: 'preparing', label: 'En préparation',      timestamp: new Date(Date.now() -  8 * 3600000).toISOString() },
      ],
      estimatedDelivery: new Date(Date.now() + 36 * 3600000).toISOString().split('T')[0],
      trackingNumber: 'MS-2024-88421',
    },
    createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    reviewedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
]

// ─── Init ────────────────────────────────────────────────────
function initData() {
  // Clear stale data when schema changes
  if (localStorage.getItem(K.SCHEMA) !== SCHEMA_VERSION) {
    Object.values(K).forEach(key => localStorage.removeItem(key))
    localStorage.setItem(K.SCHEMA, SCHEMA_VERSION)
  }
  if (!localStorage.getItem(K.QUESTIONNAIRES)) {
    const qs = DEMO_QUESTIONNAIRES.map(q => ({ ...q, annaSummary: annaSummary(q) }))
    localStorage.setItem(K.QUESTIONNAIRES, JSON.stringify(qs))
  }
  if (!localStorage.getItem(K.USERS)) {
    localStorage.setItem(K.USERS, JSON.stringify([DEMO_IPS, DEMO_PHARMACIST, DEMO_ADMIN]))
  }
  if (!localStorage.getItem(K.CONVERSATIONS)) {
    const convs: Conversation[] = [
      {
        id: 'conv-anna-demo-1',
        patientId: 'demo-p1',
        questionnaireId: 'demo-1',
        type: 'patient-anna',
        participantName: 'Anna (Coordinatrice)',
        messages: [
          {
            id: 'm1',
            conversationId: 'conv-anna-demo-1',
            senderId: 'anna',
            senderName: 'Anna',
            senderRole: 'anna',
            content: '👋 Bonjour Marie! Votre questionnaire a bien été reçu. Je l\'ai analysé et transmis à notre IPS Sophie Lavoie. Vous recevrez une réponse sous 24 à 48h. N\'hésitez pas à me poser des questions.',
            timestamp: new Date(Date.now() - 1.9 * 3600000).toISOString(),
            read: true,
          },
          {
            id: 'm2',
            conversationId: 'conv-anna-demo-1',
            senderId: 'demo-p1',
            senderName: 'Marie Tremblay',
            senderRole: 'patient',
            content: 'Merci! Est-ce que je dois faire quelque chose en attendant?',
            timestamp: new Date(Date.now() - 1.5 * 3600000).toISOString(),
            read: true,
          },
          {
            id: 'm3',
            conversationId: 'conv-anna-demo-1',
            senderId: 'anna',
            senderName: 'Anna',
            senderRole: 'anna',
            content: 'Pour l\'instant, restez bien hydratée, reposez-vous et évitez les analgésiques qui pourraient masquer les symptômes. Si votre état empire rapidement, consultez un médecin en personne ou appelez le 811. 💊',
            timestamp: new Date(Date.now() - 1.4 * 3600000).toISOString(),
            read: true,
          },
        ],
        updatedAt: new Date(Date.now() - 1.4 * 3600000).toISOString(),
      },
    ]
    localStorage.setItem(K.CONVERSATIONS, JSON.stringify(convs))
  }
}

// ─── Helpers ─────────────────────────────────────────────────
function getQuestionnaires(): Questionnaire[] {
  initData()
  return JSON.parse(localStorage.getItem(K.QUESTIONNAIRES) || '[]')
}

function saveQuestionnaires(qs: Questionnaire[]) {
  localStorage.setItem(K.QUESTIONNAIRES, JSON.stringify(qs))
}

function getUsers(): User[] {
  initData()
  return JSON.parse(localStorage.getItem(K.USERS) || '[]')
}

function saveUsers(users: User[]) {
  localStorage.setItem(K.USERS, JSON.stringify(users))
}

// ─── Auth ─────────────────────────────────────────────────────
export function getCurrentUser(): User | null {
  const d = localStorage.getItem(K.USER)
  return d ? JSON.parse(d) : null
}

export function registerUser(data: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers()
  const user: User = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  users.push(user)
  saveUsers(users)
  localStorage.setItem(K.USER, JSON.stringify(user))
  return user
}

export function loginWithCredentials(email: string, password: string): User | null {
  const users = getUsers()
  const found = users.find(u => u.email === email)
  if (found && found.password === password) {
    localStorage.setItem(K.USER, JSON.stringify(found))
    return found
  }
  return null
}

export function logout(): void {
  localStorage.removeItem(K.USER)
  localStorage.removeItem(K.CURRENT_Q)
  localStorage.removeItem(K.PAYMENT)
  localStorage.removeItem(K.BMI)
}

// ─── BMI ──────────────────────────────────────────────────────
export function saveBMI(bmi: BMIResult): void {
  localStorage.setItem(K.BMI, JSON.stringify(bmi))
}

export function getBMI(): BMIResult | null {
  const d = localStorage.getItem(K.BMI)
  return d ? JSON.parse(d) : null
}

// ─── Questionnaire ────────────────────────────────────────────
export function submitQuestionnaire(
  patientId: string,
  patientName: string,
  patientEmail: string,
  answers: MedicalAnswers,
  bmi?: BMIResult | null,
): Questionnaire {
  const questionnaire: Questionnaire = {
    id: crypto.randomUUID(),
    patientId,
    patientName,
    patientEmail,
    answers,
    bmi: bmi ?? undefined,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  questionnaire.annaSummary = annaSummary(questionnaire)
  const qs = getQuestionnaires()
  qs.push(questionnaire)
  saveQuestionnaires(qs)
  localStorage.setItem(K.CURRENT_Q, questionnaire.id)
  // Anna crée automatiquement une conversation
  _createAnnaConversation(questionnaire)
  return questionnaire
}

export function getCurrentQuestionnaireId(): string | null {
  return localStorage.getItem(K.CURRENT_Q)
}

export function getQuestionnaireById(id: string): Questionnaire | null {
  return getQuestionnaires().find(q => q.id === id) ?? null
}

export function getAllQuestionnaires(): Questionnaire[] {
  return getQuestionnaires()
}

export function approveQuestionnaire(id: string, notes: string, prescription?: Prescription): void {
  const qs = getQuestionnaires()
  const q = qs.find(item => item.id === id)
  if (q) {
    q.status = 'approved'
    q.ipsNotes = notes
    q.reviewedAt = new Date().toISOString()
    const ipsUser = getCurrentUser()
    if (ipsUser) {
      q.ipsId = ipsUser.id
      q.ipsName = `${ipsUser.prenom} ${ipsUser.nom}`
    }
    if (prescription) {
      q.prescription = prescription
      // Init delivery tracking
      if (prescription.pharmacyId) {
        q.delivery = {
          id: crypto.randomUUID(),
          prescriptionId: prescription.id,
          pharmacistId: prescription.pharmacyId,
          pharmacyName: prescription.pharmacyName,
          status: 'received',
          history: [],
          estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          trackingNumber: `MS-${Date.now().toString().slice(-6)}`,
        }
      }
    }
    saveQuestionnaires(qs)
    // Anna notifie le patient
    _annaNotifyApproval(id, q.status)
  }
}

export function rejectQuestionnaire(id: string, notes: string): void {
  const qs = getQuestionnaires()
  const q = qs.find(item => item.id === id)
  if (q) {
    q.status = 'rejected'
    q.ipsNotes = notes
    q.reviewedAt = new Date().toISOString()
    const ipsUser = getCurrentUser()
    if (ipsUser) {
      q.ipsId = ipsUser.id
      q.ipsName = `${ipsUser.prenom} ${ipsUser.nom}`
    }
    saveQuestionnaires(qs)
    _annaNotifyApproval(id, q.status)
  }
}

// ─── Prescription & paiement ──────────────────────────────────
export function completePayment(): void {
  localStorage.setItem(K.PAYMENT, 'completed')
  // Auto-envoyer ordonnance à la pharmacie
  const qId = getCurrentQuestionnaireId()
  if (qId) {
    const qs = getQuestionnaires()
    const q = qs.find(item => item.id === qId)
    if (q?.prescription) {
      q.prescription.sentToPharmacy = true
      if (q.delivery) {
        const event = {
          status: 'received' as DeliveryStatus,
          label: 'Ordonnance reçue par la pharmacie',
          timestamp: new Date().toISOString(),
          note: 'Transmise automatiquement suite au paiement',
        }
        if (!q.delivery.history.some(e => e.status === 'received')) {
          q.delivery.history.push(event)
        }
      }
      saveQuestionnaires(qs)
    }
  }
}

export function getPaymentStatus(): string | null {
  return localStorage.getItem(K.PAYMENT)
}

// ─── Pharmacist — mise à jour livraison ───────────────────────
export function updateDeliveryStatus(
  questionnaireId: string,
  newStatus: DeliveryStatus,
  note?: string,
): void {
  const LABELS: Record<DeliveryStatus, string> = {
    received:  'Ordonnance reçue',
    preparing: 'En préparation',
    ready:     'Prête pour retrait / expédition',
    shipped:   'Expédiée',
    delivered: 'Livrée',
  }
  const qs = getQuestionnaires()
  const q = qs.find(item => item.id === questionnaireId)
  if (q?.delivery) {
    q.delivery.status = newStatus
    const event: DeliveryEvent = {
      status: newStatus,
      label: LABELS[newStatus],
      timestamp: new Date().toISOString(),
      note,
    }
    q.delivery.history.push(event)
    saveQuestionnaires(qs)
  }
}

export function getPharmacistQuestionnaires(): Questionnaire[] {
  const user = getCurrentUser()
  if (!user || user.role !== 'pharmacist') return []
  return getQuestionnaires().filter(
    q => q.prescription?.sentToPharmacy && q.prescription.pharmacyId === user.id
  )
}

// ─── Admin — gestion des utilisateurs ────────────────────────
export function getAllStaff(): User[] {
  return getUsers().filter(u => u.role === 'ips' || u.role === 'pharmacist')
}

export function addStaff(data: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers()
  const user: User = {
    password: 'demo123',
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  saveUsers(users)
  return user
}

export function removeStaff(userId: string): void {
  const users = getUsers().filter(u => u.id !== userId)
  saveUsers(users)
}

export function getStaffList(): User[] {
  return getUsers().filter(u => u.role !== 'patient' && u.role !== 'admin')
}

// ─── Chat / Conversations ─────────────────────────────────────
function getConversations(): Conversation[] {
  initData()
  return JSON.parse(localStorage.getItem(K.CONVERSATIONS) || '[]')
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(K.CONVERSATIONS, JSON.stringify(convs))
}

export function getConversationsForUser(patientId: string): Conversation[] {
  return getConversations().filter(c => c.patientId === patientId)
}

export function getConversationById(id: string): Conversation | null {
  return getConversations().find(c => c.id === id) ?? null
}

export function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: ChatMessage['senderRole'],
  content: string,
): ChatMessage {
  const convs = getConversations()
  const conv = convs.find(c => c.id === conversationId)
  if (!conv) throw new Error('Conversation introuvable')

  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    conversationId,
    senderId,
    senderName,
    senderRole,
    content,
    timestamp: new Date().toISOString(),
    read: false,
  }
  conv.messages.push(msg)
  conv.updatedAt = msg.timestamp

  // Réponse automatique d'Anna
  if (conv.type === 'patient-anna' && senderRole === 'patient') {
    const annaReply = _annaAutoReply(content)
    if (annaReply) {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: 'anna',
        senderName: 'Anna',
        senderRole: 'anna',
        content: annaReply,
        timestamp: new Date(Date.now() + 2000).toISOString(),
        read: false,
      }
      conv.messages.push(reply)
    }
  }
  saveConversations(convs)
  return msg
}

function _createAnnaConversation(q: Questionnaire) {
  const convs = getConversations()
  const existing = convs.find(c => c.patientId === q.patientId && c.type === 'patient-anna')
  if (existing) return

  const welcomeMsg: ChatMessage = {
    id: crypto.randomUUID(),
    conversationId: `conv-anna-${q.id}`,
    senderId: 'anna',
    senderName: 'Anna',
    senderRole: 'anna',
    content: `👋 Bonjour ${q.patientName.split(' ')[0]}! Votre questionnaire a bien été reçu et analysé. Il a été transmis à notre IPS qui vous répondra sous 24 à 48h. En attendant, n'hésitez pas à me poser vos questions — je suis là pour vous accompagner. 💙`,
    timestamp: new Date().toISOString(),
    read: false,
  }

  const conv: Conversation = {
    id: `conv-anna-${q.id}`,
    patientId: q.patientId,
    questionnaireId: q.id,
    type: 'patient-anna',
    participantName: 'Anna (Coordinatrice)',
    messages: [welcomeMsg],
    updatedAt: welcomeMsg.timestamp,
  }
  convs.push(conv)
  saveConversations(convs)
}

function _annaNotifyApproval(questionnaireId: string, status: string) {
  const convs = getConversations()
  const q = getQuestionnaires().find(item => item.id === questionnaireId)
  if (!q) return
  const conv = convs.find(c => c.patientId === q.patientId && c.type === 'patient-anna')
  if (!conv) return

  const content = status === 'approved'
    ? `✅ Bonne nouvelle, ${q.patientName.split(' ')[0]}! Votre dossier a été approuvé par l'IPS. Rendez-vous dans votre espace "Mon ordonnance" pour procéder au paiement et recevoir votre traitement. Je reste disponible si vous avez des questions!`
    : `Bonjour ${q.patientName.split(' ')[0]}, votre dossier a été examiné par l'IPS. Malheureusement, le traitement en ligne ne correspond pas à votre situation. Consultez la note de l'IPS pour plus de détails. N'hésitez pas à consulter un médecin en personne si nécessaire.`

  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    conversationId: conv.id,
    senderId: 'anna',
    senderName: 'Anna',
    senderRole: 'anna',
    content,
    timestamp: new Date().toISOString(),
    read: false,
  }
  conv.messages.push(msg)
  conv.updatedAt = msg.timestamp
  saveConversations(convs)
}

function _annaAutoReply(userMessage: string): string | null {
  const msg = userMessage.toLowerCase()
  if (msg.includes('délai') || msg.includes('attente') || msg.includes('combien'))
    return 'Notre IPS traite les dossiers en général sous 24 à 48 heures ouvrables. Vous serez notifié(e) par courriel et via cette messagerie. 📬'
  if (msg.includes('urgent') || msg.includes('grave') || msg.includes('douleur'))
    return 'Si vous ressentez des symptômes graves ou une urgence médicale, appelez le 911 ou rendez-vous aux urgences. Pour une situation non urgente, vous pouvez aussi appeler Info-Santé au 811. 🚨'
  if (msg.includes('annul') || msg.includes('cancel'))
    return 'Pour annuler votre demande, envoyez un courriel à support@anne.ca dans les 24h suivant la soumission. Notez qu\'une fois l\'examen complété, aucun remboursement n\'est possible.'
  if (msg.includes('pharmacie') || msg.includes('médic') || msg.includes('traitement'))
    return 'Une fois votre dossier approuvé et le paiement effectué, votre ordonnance sera transmise automatiquement à la pharmacie. Vous pourrez suivre la préparation en temps réel dans votre tableau de bord. 💊'
  if (msg.includes('merci') || msg.includes('thank'))
    return 'Avec plaisir! N\'hésitez pas si vous avez d\'autres questions. Je suis là pour vous. 😊'
  return 'Je prends note de votre message. Si votre question nécessite une expertise médicale, l\'IPS vous répondra directement. Pour toute urgence, contactez le 811 ou le 911. 🏥'
}
