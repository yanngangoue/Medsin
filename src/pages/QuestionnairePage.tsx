import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitQuestionnaire, getCurrentUser, registerUser } from '../api/mockApi'
import { useApp } from '../context/AppContext'
import type { MedicalAnswers } from '../types'
import Layout from '../components/Layout'

interface PersonalInfo {
  prenom: string
  nom: string
  email: string
  telephone: string
}

const emptyPersonal: PersonalInfo = { prenom: '', nom: '', email: '', telephone: '' }

const emptyAnswers: MedicalAnswers = {
  poids: '', taille: '', sexe: '', fumeur: '',
  motif: '', duree: '', intensite: '',
  maladiesChroniques: [],
  chirurgiesPassees: '', chirurgiesDetails: '',
  allergies: '', allergiesDetails: '',
  medicaments: '', medicamentsDetails: '',
  commentaires: '',
}

const MALADIES = ['Diabète', 'Hypertension', 'Asthme', 'MPOC', 'Maladie cardiaque', 'Autre']

type StepId = 'info' | 'profil' | 'symptomes' | 'antecedents' | 'medicaments'

const STEP_TITLES: Record<StepId, string> = {
  info:        'Vos informations',
  profil:      'Votre profil',
  symptomes:   'Motif de consultation',
  antecedents: 'Antécédents médicaux',
  medicaments: 'Médicaments & finalisation',
}

export default function QuestionnairePage() {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const loggedUser = getCurrentUser()

  // Si déjà connecté, on saute l'étape "info"
  const steps: StepId[] = [
    ...(loggedUser ? [] : ['info' as StepId]),
    'profil',
    'symptomes',
    'antecedents',
    'medicaments',
  ]

  const [stepIdx, setStepIdx] = useState(0)
  const [personal, setPersonal] = useState<PersonalInfo>(emptyPersonal)
  const [answers, setAnswers] = useState<MedicalAnswers>(emptyAnswers)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const currentStep = steps[stepIdx]
  const isLastStep = stepIdx === steps.length - 1

  function updateP(field: keyof PersonalInfo, value: string) {
    setPersonal(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function updateA(field: keyof MedicalAnswers, value: string) {
    setAnswers(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function toggleMaladie(m: string) {
    setAnswers(prev => ({
      ...prev,
      maladiesChroniques: prev.maladiesChroniques.includes(m)
        ? prev.maladiesChroniques.filter(x => x !== m)
        : [...prev.maladiesChroniques, m],
    }))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}

    if (currentStep === 'info') {
      if (!personal.prenom.trim()) e.prenom = 'Requis'
      if (!personal.email.includes('@')) e.email = 'Courriel invalide'
    }
    if (currentStep === 'profil') {
      if (!answers.poids)  e.poids  = 'Requis'
      if (!answers.taille) e.taille = 'Requis'
      if (!answers.sexe)   e.sexe   = 'Sélectionnez une option'
      if (!answers.fumeur) e.fumeur = 'Sélectionnez une option'
    }
    if (currentStep === 'symptomes') {
      if (!answers.motif.trim()) e.motif     = 'Requis'
      if (!answers.duree)        e.duree     = 'Sélectionnez une durée'
      if (!answers.intensite)    e.intensite = 'Sélectionnez une intensité'
    }
    if (currentStep === 'antecedents') {
      if (!answers.chirurgiesPassees) e.chirurgiesPassees = 'Répondez Oui ou Non'
      if (!answers.allergies)         e.allergies         = 'Répondez Oui ou Non'
    }
    // medicaments : aucun champ obligatoire, soumission toujours possible

    setErrors(e)
    if (Object.keys(e).length > 0) window.scrollTo({ top: 0, behavior: 'smooth' })
    return Object.keys(e).length === 0
  }

  function next() {
    if (!validate()) return
    setErrors({})
    setStepIdx(i => i + 1)
    window.scrollTo(0, 0)
  }

  function prev() {
    setErrors({})
    setStepIdx(i => i - 1)
    window.scrollTo(0, 0)
  }

  function handleSubmit() {
    if (!validate()) return
    setSubmitError('')
    setSubmitting(true)

    try {
      let activeUser = getCurrentUser()

      if (!activeUser) {
        activeUser = registerUser({
          prenom: personal.prenom.trim(),
          nom: personal.nom.trim(),
          email: personal.email.trim(),
          telephone: personal.telephone.trim(),
          role: 'patient',
        })
        setUser(activeUser)
      }

      submitQuestionnaire(
        activeUser.id,
        `${activeUser.prenom} ${activeUser.nom}`.trim(),
        activeUser.email,
        answers,
      )

      navigate('/examen-en-cours')
    } catch {
      setSubmitting(false)
      setSubmitError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <Layout>
      <div className="page-center">
        <div className="card" style={{ maxWidth: 660 }}>
          <div className="card-header">
            <h1>Questionnaire médical</h1>
            <p>Remplissez les informations suivantes pour démarrer votre consultation en ligne.</p>
          </div>

          {/* Barre de progression */}
          <div className="progress-steps">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`progress-step ${i < stepIdx ? 'done' : ''} ${i === stepIdx ? 'active' : ''}`}
              >
                <div className="step-circle">{i < stepIdx ? '✓' : i + 1}</div>
                <span className="step-label">{STEP_TITLES[s]}</span>
              </div>
            ))}
          </div>

          {/* Bannières d'erreur */}
          {hasErrors && (
            <div className="alert alert-danger">
              ⚠ Complétez les champs obligatoires ci-dessous avant de continuer.
            </div>
          )}
          {submitError && <div className="alert alert-danger">⚠ {submitError}</div>}

          <div className="step-content">
            <h2 className="step-title">
              Étape {stepIdx + 1}/{steps.length} — {STEP_TITLES[currentStep]}
            </h2>

            {/* ── Info personnelles ── */}
            {currentStep === 'info' && (
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prénom <span className="required">*</span></label>
                    <input type="text" className={`form-control ${errors.prenom ? 'error' : ''}`} value={personal.prenom} onChange={e => updateP('prenom', e.target.value)} placeholder="Marie" autoComplete="given-name" />
                    {errors.prenom && <span className="form-error">⚠ {errors.prenom}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input type="text" className="form-control" value={personal.nom} onChange={e => updateP('nom', e.target.value)} placeholder="Tremblay" autoComplete="family-name" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Courriel <span className="required">*</span></label>
                  <input type="email" className={`form-control ${errors.email ? 'error' : ''}`} value={personal.email} onChange={e => updateP('email', e.target.value)} placeholder="marie@exemple.com" autoComplete="email" />
                  {errors.email && <span className="form-error">⚠ {errors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone <span className="optional">(facultatif)</span></label>
                  <input type="tel" className="form-control" value={personal.telephone} onChange={e => updateP('telephone', e.target.value)} placeholder="514-555-0000" autoComplete="tel" />
                </div>
              </div>
            )}

            {/* ── Profil ── */}
            {currentStep === 'profil' && (
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Poids (kg) <span className="required">*</span></label>
                    <input type="number" className={`form-control ${errors.poids ? 'error' : ''}`} value={answers.poids} onChange={e => updateA('poids', e.target.value)} placeholder="70" min="30" max="300" />
                    {errors.poids && <span className="form-error">⚠ {errors.poids}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Taille (cm) <span className="required">*</span></label>
                    <input type="number" className={`form-control ${errors.taille ? 'error' : ''}`} value={answers.taille} onChange={e => updateA('taille', e.target.value)} placeholder="170" min="100" max="250" />
                    {errors.taille && <span className="form-error">⚠ {errors.taille}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Sexe assigné à la naissance <span className="required">*</span></label>
                  <div className="radio-group">
                    {['Masculin', 'Féminin', 'Autre'].map(opt => (
                      <label key={opt} className={`radio-card ${answers.sexe === opt ? 'selected' : ''}`}>
                        <input type="radio" name="sexe" value={opt} checked={answers.sexe === opt} onChange={e => updateA('sexe', e.target.value)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {errors.sexe && <span className="form-error">⚠ {errors.sexe}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Tabagisme <span className="required">*</span></label>
                  <div className="radio-group">
                    {['Non-fumeur', 'Fumeur actif', 'Ancien fumeur'].map(opt => (
                      <label key={opt} className={`radio-card ${answers.fumeur === opt ? 'selected' : ''}`}>
                        <input type="radio" name="fumeur" value={opt} checked={answers.fumeur === opt} onChange={e => updateA('fumeur', e.target.value)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {errors.fumeur && <span className="form-error">⚠ {errors.fumeur}</span>}
                </div>
              </div>
            )}

            {/* ── Symptômes ── */}
            {currentStep === 'symptomes' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Motif de consultation <span className="required">*</span></label>
                  <textarea className={`form-control ${errors.motif ? 'error' : ''}`} value={answers.motif} onChange={e => updateA('motif', e.target.value)} placeholder="Décrivez vos symptômes, leur localisation et leur évolution..." rows={4} />
                  {errors.motif && <span className="form-error">⚠ {errors.motif}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Durée des symptômes <span className="required">*</span></label>
                  <div className="radio-group radio-group-col">
                    {["Moins d'une semaine", '1 à 4 semaines', '1 à 3 mois', 'Plus de 3 mois'].map(opt => (
                      <label key={opt} className={`radio-card ${answers.duree === opt ? 'selected' : ''}`}>
                        <input type="radio" name="duree" value={opt} checked={answers.duree === opt} onChange={e => updateA('duree', e.target.value)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {errors.duree && <span className="form-error">⚠ {errors.duree}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Intensité <span className="required">*</span></label>
                  <div className="radio-group">
                    {['Légère', 'Modérée', 'Sévère'].map(opt => (
                      <label key={opt} className={`radio-card ${answers.intensite === opt ? 'selected' : ''}`}>
                        <input type="radio" name="intensite" value={opt} checked={answers.intensite === opt} onChange={e => updateA('intensite', e.target.value)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {errors.intensite && <span className="form-error">⚠ {errors.intensite}</span>}
                </div>
              </div>
            )}

            {/* ── Antécédents ── */}
            {currentStep === 'antecedents' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Maladies chroniques <span className="optional">(tout ce qui s'applique)</span></label>
                  <div className="checkbox-group">
                    {MALADIES.map(m => (
                      <label key={m} className={`checkbox-card ${answers.maladiesChroniques.includes(m) ? 'selected' : ''}`}>
                        <input type="checkbox" checked={answers.maladiesChroniques.includes(m)} onChange={() => toggleMaladie(m)} />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Chirurgies passées <span className="required">*</span></label>
                  <div className="radio-group">
                    {['oui', 'non'].map(opt => (
                      <label key={opt} className={`radio-card ${answers.chirurgiesPassees === opt ? 'selected' : ''}`}>
                        <input type="radio" name="chir" value={opt} checked={answers.chirurgiesPassees === opt} onChange={e => updateA('chirurgiesPassees', e.target.value)} />
                        {opt === 'oui' ? 'Oui' : 'Non'}
                      </label>
                    ))}
                  </div>
                  {errors.chirurgiesPassees && <span className="form-error">⚠ {errors.chirurgiesPassees}</span>}
                  {answers.chirurgiesPassees === 'oui' && (
                    <textarea className="form-control" style={{ marginTop: '0.75rem' }} value={answers.chirurgiesDetails} onChange={e => updateA('chirurgiesDetails', e.target.value)} placeholder="Type et année approximative..." rows={2} />
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Allergies connues <span className="required">*</span></label>
                  <div className="radio-group">
                    {['oui', 'non'].map(opt => (
                      <label key={opt} className={`radio-card ${answers.allergies === opt ? 'selected' : ''}`}>
                        <input type="radio" name="allerg" value={opt} checked={answers.allergies === opt} onChange={e => updateA('allergies', e.target.value)} />
                        {opt === 'oui' ? 'Oui' : 'Non'}
                      </label>
                    ))}
                  </div>
                  {errors.allergies && <span className="form-error">⚠ {errors.allergies}</span>}
                  {answers.allergies === 'oui' && (
                    <textarea className="form-control" style={{ marginTop: '0.75rem' }} value={answers.allergiesDetails} onChange={e => updateA('allergiesDetails', e.target.value)} placeholder="Ex : Pénicilline, arachides..." rows={2} />
                  )}
                </div>
              </div>
            )}

            {/* ── Médicaments ── */}
            {currentStep === 'medicaments' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Médicaments actuels <span className="optional">(facultatif)</span></label>
                  <p className="field-hint">Incluez suppléments, vitamines et produits naturels.</p>
                  <div className="radio-group">
                    {['oui', 'non'].map(opt => (
                      <label key={opt} className={`radio-card ${answers.medicaments === opt ? 'selected' : ''}`}>
                        <input type="radio" name="meds" value={opt} checked={answers.medicaments === opt} onChange={e => updateA('medicaments', e.target.value)} />
                        {opt === 'oui' ? 'Oui' : 'Non'}
                      </label>
                    ))}
                  </div>
                  {answers.medicaments === 'oui' && (
                    <textarea className="form-control" style={{ marginTop: '0.75rem' }} value={answers.medicamentsDetails} onChange={e => updateA('medicamentsDetails', e.target.value)} placeholder="Ex : Metformine 500mg, Vitamine D..." rows={3} />
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Commentaires pour votre IPS <span className="optional">(facultatif)</span></label>
                  <textarea className="form-control" value={answers.commentaires} onChange={e => updateA('commentaires', e.target.value)} placeholder="Toute information complémentaire..." rows={3} />
                </div>
                <div className="alert alert-info">
                  En soumettant, vous confirmez que toutes les informations fournies sont exactes.
                </div>
              </div>
            )}
          </div>

          {/* ── Navigation ── */}
          <div className="step-nav">
            {stepIdx > 0 ? (
              <button type="button" className="btn btn-secondary" onClick={prev}>
                ← Précédent
              </button>
            ) : (
              <span />
            )}

            {!isLastStep ? (
              <button type="button" className="btn btn-primary" onClick={next}>
                Suivant →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-success btn-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '⏳ Envoi en cours...' : '✓ Soumettre ma demande'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
