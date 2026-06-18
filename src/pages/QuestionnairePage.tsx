import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitQuestionnaire, getCurrentUser, getBMI } from '../api/mockApi'
import type { MedicalAnswers } from '../types'
import Layout from '../components/Layout'

const SYMPTOMES_LIST = [
  'Douleur', 'Fièvre', 'Fatigue', 'Toux', 'Maux de tête',
  'Nausées / Vomissements', 'Essoufflement', 'Troubles du sommeil',
  'Palpitations', 'Perte de poids', 'Changement d\'humeur', 'Autres',
]
const MALADIES_LIST = [
  'Diabète type 1', 'Diabète type 2', 'Hypertension artérielle',
  'Asthme', 'MPOC', 'Maladie cardiaque', 'Insuffisance rénale',
  'Dépression / Anxiété', 'Hypothyroïdie', 'Hyperthyroïdie',
  'Cancer (actif ou rémission)', 'Autre',
]

const emptyAnswers: MedicalAnswers = {
  motif: '', symptomes: [], autresSymptomes: '', duree: '', intensite: '5', evolution: '',
  dateNaissance: '', sexe: '', poids: '', taille: '', fumeur: '', alcool: '',
  maladiesChroniques: [], autresMaladies: '', chirurgiesPassees: '', chirurgiesDetails: '',
  allergies: '', allergiesDetails: '', antecedentsFamiliaux: '',
  medicaments: '', medicamentsDetails: '', supplements: '', supplementsDetails: '',
  activitePhysique: '', frequenceActivite: '', alimentation: '', sommeil: '', stress: '', santeMentale: '',
  commentaires: '', consentement: false, consentementDonnees: false,
}

type SectionId = 'motif' | 'profil' | 'antecedents' | 'traitements' | 'modevie' | 'finalisation'

const SECTIONS: { id: SectionId; title: string; icon: string; subtitle: string }[] = [
  { id: 'motif',        title: 'Motif de consultation', icon: '🩺', subtitle: 'Décrivez vos symptômes' },
  { id: 'profil',       title: 'Profil personnel',      icon: '👤', subtitle: 'Informations médicales de base' },
  { id: 'antecedents',  title: 'Antécédents médicaux', icon: '📋', subtitle: 'Historique de santé' },
  { id: 'traitements',  title: 'Traitements en cours', icon: '💊', subtitle: 'Médicaments & suppléments' },
  { id: 'modevie',      title: 'Mode de vie',           icon: '🏃', subtitle: 'Habitudes quotidiennes' },
  { id: 'finalisation', title: 'Récapitulatif',         icon: '✅', subtitle: 'Vérification & consentement' },
]

export default function QuestionnairePage() {
  const navigate = useNavigate()
  const loggedUser = getCurrentUser()
  const savedBMI = getBMI()

  const [sectionIdx, setSectionIdx] = useState(0)
  const [answers, setAnswers] = useState<MedicalAnswers>(() => ({
    ...emptyAnswers,
    poids: savedBMI ? String(savedBMI.poids) : '',
    taille: savedBMI ? String(savedBMI.taille) : '',
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!loggedUser) navigate('/auth/inscription', { replace: true })
  }, [loggedUser, navigate])

  if (!loggedUser) return null

  const section = SECTIONS[sectionIdx]
  const isLast = sectionIdx === SECTIONS.length - 1

  function upd<K extends keyof MedicalAnswers>(field: K, value: MedicalAnswers[K]) {
    setAnswers(prev => ({ ...prev, [field]: value }))
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  function toggleArr(field: 'symptomes' | 'maladiesChroniques', val: string) {
    setAnswers(prev => {
      const arr = prev[field] as string[]
      return { ...prev, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }
    })
  }

  const p = parseFloat(answers.poids), t = parseFloat(answers.taille) / 100
  const imc = p > 20 && t > 0.5 ? (p / (t * t)).toFixed(1) : null

  function validate(): boolean {
    const e: Record<string, string> = {}
    const s = section.id
    if (s === 'motif') {
      if (!answers.motif.trim()) e.motif = 'Décrivez votre motif de consultation'
      if (!answers.duree) e.duree = 'Sélectionnez une durée'
      if (!answers.evolution) e.evolution = 'Indiquez l\'évolution'
    }
    if (s === 'profil') {
      if (!answers.dateNaissance) e.dateNaissance = 'Date de naissance requise'
      if (!answers.sexe) e.sexe = 'Sélectionnez une option'
      if (!answers.poids || p < 20) e.poids = 'Poids invalide'
      if (!answers.taille || parseFloat(answers.taille) < 100) e.taille = 'Taille invalide'
      if (!answers.fumeur) e.fumeur = 'Sélectionnez une option'
      if (!answers.alcool) e.alcool = 'Sélectionnez une option'
    }
    if (s === 'antecedents') {
      if (!answers.chirurgiesPassees) e.chirurgiesPassees = 'Répondez Oui ou Non'
      if (!answers.allergies) e.allergies = 'Répondez Oui ou Non'
    }
    if (s === 'modevie') {
      if (!answers.activitePhysique) e.activitePhysique = 'Sélectionnez une option'
      if (!answers.sommeil) e.sommeil = 'Sélectionnez une option'
      if (!answers.stress) e.stress = 'Sélectionnez une option'
    }
    if (s === 'finalisation') {
      if (!answers.consentement) e.consentement = 'Votre consentement est requis'
      if (!answers.consentementDonnees) e.consentementDonnees = 'Votre consentement est requis'
    }
    setErrors(e)
    if (Object.keys(e).length > 0) window.scrollTo({ top: 0, behavior: 'smooth' })
    return Object.keys(e).length === 0
  }

  function next() {
    if (!validate()) return
    setSectionIdx(i => i + 1)
    window.scrollTo(0, 0)
  }

  function prev() {
    setErrors({})
    setSectionIdx(i => i - 1)
    window.scrollTo(0, 0)
  }

  function handleSubmit() {
    if (!validate()) return
    setSubmitError('')
    setSubmitting(true)
    try {
      const user = getCurrentUser()
      if (!user) { navigate('/auth/inscription'); return }
      submitQuestionnaire(user.id, `${user.prenom} ${user.nom}`.trim(), user.email, answers, savedBMI)
      navigate('/examen-en-cours')
    } catch {
      setSubmitting(false)
      setSubmitError('Erreur lors de la soumission. Veuillez réessayer.')
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <Layout>
      <div className="q-page">

        {/* En-tête + barre de progression */}
        <div className="q-page-header">
          <div className="q-page-title">
            <h1>Questionnaire médical</h1>
            <p>Section {sectionIdx + 1} sur {SECTIONS.length} — {section.title}</p>
          </div>
          <div className="q-progress-bar-wrap">
            <div className="q-progress-bar" style={{ width: `${((sectionIdx + 1) / SECTIONS.length) * 100}%` }} />
          </div>
        </div>

        <div className="q-body">

          {/* Navigation latérale */}
          <div className="q-sections-nav">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`q-sec-btn ${i === sectionIdx ? 'q-sec-active' : ''} ${i < sectionIdx ? 'q-sec-done' : ''}`}
                onClick={() => { if (i < sectionIdx) { setErrors({}); setSectionIdx(i) } }}
                disabled={i > sectionIdx}
              >
                <div className="q-sec-icon-wrap">
                  {i < sectionIdx ? '✓' : s.icon}
                </div>
                <div className="q-sec-text">
                  <span className="q-sec-num">Section {i + 1}</span>
                  <span className="q-sec-title">{s.title}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Formulaire */}
          <div className="q-form-col">
            <div className="q-section-card">
              <div className="q-section-header">
                <span className="q-section-icon">{section.icon}</span>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.subtitle}</p>
                </div>
              </div>

              {hasErrors && <div className="alert alert-danger">⚠ Complétez les champs obligatoires avant de continuer.</div>}
              {submitError && <div className="alert alert-danger">⚠ {submitError}</div>}

              {/* Section 1 — Motif */}
              {section.id === 'motif' && (
                <div className="q-fields">
                  <div className="form-group">
                    <label className="form-label">Motif principal de consultation <span className="required">*</span></label>
                    <p className="field-hint">Décrivez en détail ce qui vous amène à consulter.</p>
                    <textarea className={`form-control ${errors.motif ? 'error' : ''}`} value={answers.motif} onChange={e => upd('motif', e.target.value)} rows={4} placeholder="Ex. : Depuis 2 semaines, je ressens des douleurs à la gorge accompagnées d'une fatigue inhabituelle…" />
                    {errors.motif && <span className="form-error">⚠ {errors.motif}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Symptômes présents <span className="optional">(tout ce qui s'applique)</span></label>
                    <div className="checkbox-group">
                      {SYMPTOMES_LIST.map(s => (
                        <label key={s} className={`checkbox-card ${answers.symptomes.includes(s) ? 'selected' : ''}`}>
                          <input type="checkbox" checked={answers.symptomes.includes(s)} onChange={() => toggleArr('symptomes', s)} />
                          {s}
                        </label>
                      ))}
                    </div>
                    {answers.symptomes.includes('Autres') && (
                      <textarea className="form-control" style={{ marginTop: '0.75rem' }} value={answers.autresSymptomes} onChange={e => upd('autresSymptomes', e.target.value)} placeholder="Précisez les autres symptômes…" rows={2} />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Durée des symptômes <span className="required">*</span></label>
                    <div className="radio-group radio-group-col">
                      {["Moins d'une semaine", '1 à 4 semaines', '1 à 3 mois', 'Plus de 3 mois', 'Chronique (récurrent)'].map(opt => (
                        <label key={opt} className={`radio-card ${answers.duree === opt ? 'selected' : ''}`}>
                          <input type="radio" name="duree" value={opt} checked={answers.duree === opt} onChange={e => upd('duree', e.target.value)} />
                          {opt}
                        </label>
                      ))}
                    </div>
                    {errors.duree && <span className="form-error">⚠ {errors.duree}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Intensité — {answers.intensite}/10</label>
                    <div className="intensity-slider-wrap">
                      <span className="intensity-label-left">Légère</span>
                      <input type="range" min="1" max="10" value={answers.intensite} onChange={e => upd('intensite', e.target.value)} className="intensity-slider" />
                      <span className="intensity-label-right">Sévère</span>
                    </div>
                    <div className="intensity-scale">
                      {[...Array(10)].map((_, i) => (
                        <span key={i} className={`intensity-dot ${parseInt(answers.intensite) > i ? 'intensity-dot-active' : ''}`} />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Évolution depuis le début <span className="required">*</span></label>
                    <div className="radio-group">
                      {["S'améliore", 'Stable', "S'aggrave", 'Variable'].map(opt => (
                        <label key={opt} className={`radio-card ${answers.evolution === opt ? 'selected' : ''}`}>
                          <input type="radio" name="evolution" value={opt} checked={answers.evolution === opt} onChange={e => upd('evolution', e.target.value)} />
                          {opt === "S'améliore" ? "📈 S'améliore" : opt === "S'aggrave" ? "📉 S'aggrave" : opt === 'Stable' ? '➡ Stable' : '🔄 Variable'}
                        </label>
                      ))}
                    </div>
                    {errors.evolution && <span className="form-error">⚠ {errors.evolution}</span>}
                  </div>
                </div>
              )}

              {/* Section 2 — Profil */}
              {section.id === 'profil' && (
                <div className="q-fields">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date de naissance <span className="required">*</span></label>
                      <input type="date" className={`form-control ${errors.dateNaissance ? 'error' : ''}`} value={answers.dateNaissance} onChange={e => upd('dateNaissance', e.target.value)} max={new Date().toISOString().split('T')[0]} />
                      {errors.dateNaissance && <span className="form-error">⚠ {errors.dateNaissance}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sexe assigné à la naissance <span className="required">*</span></label>
                      <div className="radio-group">
                        {['Masculin', 'Féminin', 'Intersexe'].map(opt => (
                          <label key={opt} className={`radio-card radio-card-sm ${answers.sexe === opt ? 'selected' : ''}`}>
                            <input type="radio" name="sexe" value={opt} checked={answers.sexe === opt} onChange={e => upd('sexe', e.target.value)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                      {errors.sexe && <span className="form-error">⚠ {errors.sexe}</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Poids (kg) <span className="required">*</span></label>
                      <input type="number" className={`form-control ${errors.poids ? 'error' : ''}`} value={answers.poids} onChange={e => upd('poids', e.target.value)} placeholder="70" min="20" max="400" />
                      {errors.poids && <span className="form-error">⚠ {errors.poids}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Taille (cm) <span className="required">*</span></label>
                      <input type="number" className={`form-control ${errors.taille ? 'error' : ''}`} value={answers.taille} onChange={e => upd('taille', e.target.value)} placeholder="170" min="100" max="250" />
                      {errors.taille && <span className="form-error">⚠ {errors.taille}</span>}
                    </div>
                  </div>
                  {imc && (
                    <div className="imc-inline-result">
                      <span>IMC calculé : <strong>{imc} kg/m²</strong></span>
                      <span className={`imc-inline-badge ${parseFloat(imc) < 18.5 ? 'imc-low' : parseFloat(imc) < 25 ? 'imc-normal' : parseFloat(imc) < 30 ? 'imc-over' : 'imc-obese'}`}>
                        {parseFloat(imc) < 18.5 ? 'Insuffisance pondérale' : parseFloat(imc) < 25 ? '✓ Poids santé' : parseFloat(imc) < 30 ? 'Surpoids' : 'Obésité'}
                      </span>
                    </div>
                  )}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Tabagisme <span className="required">*</span></label>
                      <div className="radio-group radio-group-col">
                        {['Non-fumeur', 'Fumeur actif', 'Ancien fumeur', 'Vaporisateur / E-cigarette'].map(opt => (
                          <label key={opt} className={`radio-card ${answers.fumeur === opt ? 'selected' : ''}`}>
                            <input type="radio" name="fumeur" value={opt} checked={answers.fumeur === opt} onChange={e => upd('fumeur', e.target.value)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                      {errors.fumeur && <span className="form-error">⚠ {errors.fumeur}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Consommation d'alcool <span className="required">*</span></label>
                      <div className="radio-group radio-group-col">
                        {['Jamais', 'Occasionnel (< 1x/sem)', 'Modéré (1-3x/sem)', 'Régulier (> 3x/sem)'].map(opt => (
                          <label key={opt} className={`radio-card ${answers.alcool === opt ? 'selected' : ''}`}>
                            <input type="radio" name="alcool" value={opt} checked={answers.alcool === opt} onChange={e => upd('alcool', e.target.value)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                      {errors.alcool && <span className="form-error">⚠ {errors.alcool}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3 — Antécédents */}
              {section.id === 'antecedents' && (
                <div className="q-fields">
                  <div className="form-group">
                    <label className="form-label">Maladies chroniques <span className="optional">(tout ce qui s'applique)</span></label>
                    <div className="checkbox-group">
                      {MALADIES_LIST.map(m => (
                        <label key={m} className={`checkbox-card ${answers.maladiesChroniques.includes(m) ? 'selected' : ''}`}>
                          <input type="checkbox" checked={answers.maladiesChroniques.includes(m)} onChange={() => toggleArr('maladiesChroniques', m)} />
                          {m}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chirurgies ou hospitalisations passées <span className="required">*</span></label>
                    <div className="radio-group">
                      {['oui', 'non'].map(opt => (
                        <label key={opt} className={`radio-card ${answers.chirurgiesPassees === opt ? 'selected' : ''}`}>
                          <input type="radio" name="chir" value={opt} checked={answers.chirurgiesPassees === opt} onChange={e => upd('chirurgiesPassees', e.target.value)} />
                          {opt === 'oui' ? 'Oui' : 'Non'}
                        </label>
                      ))}
                    </div>
                    {errors.chirurgiesPassees && <span className="form-error">⚠ {errors.chirurgiesPassees}</span>}
                    {answers.chirurgiesPassees === 'oui' && (
                      <textarea className="form-control" style={{ marginTop: '0.75rem' }} value={answers.chirurgiesDetails} onChange={e => upd('chirurgiesDetails', e.target.value)} placeholder="Type d'intervention et année (ex. : appendicectomie 2018)…" rows={3} />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Allergies connues (médicaments, aliments, autre) <span className="required">*</span></label>
                    <div className="radio-group">
                      {['oui', 'non'].map(opt => (
                        <label key={opt} className={`radio-card ${answers.allergies === opt ? 'selected' : ''}`}>
                          <input type="radio" name="allerg" value={opt} checked={answers.allergies === opt} onChange={e => upd('allergies', e.target.value)} />
                          {opt === 'oui' ? 'Oui' : 'Non — aucune allergie connue'}
                        </label>
                      ))}
                    </div>
                    {errors.allergies && <span className="form-error">⚠ {errors.allergies}</span>}
                    {answers.allergies === 'oui' && (
                      <textarea className="form-control allergy-input" style={{ marginTop: '0.75rem' }} value={answers.allergiesDetails} onChange={e => upd('allergiesDetails', e.target.value)} placeholder="Substance, type de réaction et gravité (ex. : Pénicilline — urticaire sévère)…" rows={3} />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Antécédents familiaux <span className="optional">(facultatif)</span></label>
                    <textarea className="form-control" value={answers.antecedentsFamiliaux} onChange={e => upd('antecedentsFamiliaux', e.target.value)} placeholder="Ex. : Père — diabète type 2. Mère — hypertension artérielle…" rows={3} />
                  </div>
                </div>
              )}

              {/* Section 4 — Traitements */}
              {section.id === 'traitements' && (
                <div className="q-fields">
                  <div className="form-group">
                    <label className="form-label">Médicaments actuels (sur ordonnance ou en vente libre)</label>
                    <div className="radio-group">
                      {['oui', 'non'].map(opt => (
                        <label key={opt} className={`radio-card ${answers.medicaments === opt ? 'selected' : ''}`}>
                          <input type="radio" name="meds" value={opt} checked={answers.medicaments === opt} onChange={e => upd('medicaments', e.target.value)} />
                          {opt === 'oui' ? 'Oui, je prends des médicaments' : 'Non, aucun médicament'}
                        </label>
                      ))}
                    </div>
                    {answers.medicaments === 'oui' && (
                      <div className="med-detail-box">
                        <p className="field-hint">Nom, dose et fréquence (ex. : Metformine 500mg — 2x/jour).</p>
                        <textarea className="form-control" value={answers.medicamentsDetails} onChange={e => upd('medicamentsDetails', e.target.value)} rows={4} placeholder={'1. Médicament — dose — fréquence\n2. Médicament — dose — fréquence'} />
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Suppléments, vitamines ou produits naturels <span className="optional">(facultatif)</span></label>
                    <div className="radio-group">
                      {['oui', 'non'].map(opt => (
                        <label key={opt} className={`radio-card ${answers.supplements === opt ? 'selected' : ''}`}>
                          <input type="radio" name="suppl" value={opt} checked={answers.supplements === opt} onChange={e => upd('supplements', e.target.value)} />
                          {opt === 'oui' ? 'Oui' : 'Non'}
                        </label>
                      ))}
                    </div>
                    {answers.supplements === 'oui' && (
                      <textarea className="form-control" style={{ marginTop: '0.75rem' }} value={answers.supplementsDetails} onChange={e => upd('supplementsDetails', e.target.value)} rows={2} placeholder="Ex. : Vitamine D 1000 UI, Oméga-3, Probiotiques…" />
                    )}
                  </div>
                  <div className="alert alert-info">
                    <strong>Pourquoi cette information?</strong> Les interactions médicamenteuses influencent le traitement prescrit. Toute information reste strictement confidentielle.
                  </div>
                </div>
              )}

              {/* Section 5 — Mode de vie */}
              {section.id === 'modevie' && (
                <div className="q-fields">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Niveau d'activité physique <span className="required">*</span></label>
                      <div className="radio-group radio-group-col">
                        {["Sédentaire (peu ou pas d'exercice)", 'Légèrement actif (1-2x/sem)', 'Modérément actif (3-4x/sem)', 'Très actif (5x+/sem)', 'Athlète / entraînement intensif'].map(opt => (
                          <label key={opt} className={`radio-card ${answers.activitePhysique === opt ? 'selected' : ''}`}>
                            <input type="radio" name="activ" value={opt} checked={answers.activitePhysique === opt} onChange={e => upd('activitePhysique', e.target.value)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                      {errors.activitePhysique && <span className="form-error">⚠ {errors.activitePhysique}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Type d'alimentation <span className="optional">(facultatif)</span></label>
                      <div className="radio-group radio-group-col">
                        {['Omnivore', 'Végétarien', 'Végétalien / Vegan', 'Sans gluten', 'Méditerranéen', 'Autre'].map(opt => (
                          <label key={opt} className={`radio-card ${answers.alimentation === opt ? 'selected' : ''}`}>
                            <input type="radio" name="alim" value={opt} checked={answers.alimentation === opt} onChange={e => upd('alimentation', e.target.value)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Qualité du sommeil <span className="required">*</span></label>
                      <div className="radio-group radio-group-col">
                        {['Excellent (7-9h, reposé)', 'Bon (quelques réveils)', 'Moyen (fatigue résiduelle)', 'Mauvais (insomnie fréquente)'].map(opt => (
                          <label key={opt} className={`radio-card ${answers.sommeil === opt ? 'selected' : ''}`}>
                            <input type="radio" name="sommeil" value={opt} checked={answers.sommeil === opt} onChange={e => upd('sommeil', e.target.value)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                      {errors.sommeil && <span className="form-error">⚠ {errors.sommeil}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Niveau de stress <span className="required">*</span></label>
                      <div className="radio-group radio-group-col">
                        {['Faible — je gère bien', 'Modéré — parfois difficile', 'Élevé — impact sur le quotidien', 'Très élevé — besoin d\'aide'].map(opt => (
                          <label key={opt} className={`radio-card ${answers.stress === opt ? 'selected' : ''}`}>
                            <input type="radio" name="stress" value={opt} checked={answers.stress === opt} onChange={e => upd('stress', e.target.value)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                      {errors.stress && <span className="form-error">⚠ {errors.stress}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Santé mentale <span className="optional">(facultatif — strictement confidentiel)</span></label>
                    <textarea className="form-control" value={answers.santeMentale} onChange={e => upd('santeMentale', e.target.value)} rows={3} placeholder="Si vous souhaitez partager quelque chose sur votre état émotionnel ou mental…" />
                    {(answers.santeMentale.toLowerCase().includes('suicid') || answers.santeMentale.toLowerCase().includes('me tuer')) && (
                      <div className="alert alert-danger" style={{ marginTop: '0.5rem' }}>
                        <strong>Si vous avez des pensées suicidaires, appelez le 1 866 APPELLE (277-3553) ou le 911.</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 6 — Finalisation */}
              {section.id === 'finalisation' && (
                <div className="q-fields">
                  <div className="recap-grid">
                    <div className="recap-block">
                      <div className="recap-label">🩺 Motif de consultation</div>
                      <p style={{ fontSize: '0.9rem', margin: '0.35rem 0' }}>{answers.motif || '—'}</p>
                      {answers.symptomes.length > 0 && <div className="recap-tags">{answers.symptomes.slice(0, 5).map(s => <span key={s} className="recap-tag">{s}</span>)}{answers.symptomes.length > 5 && <span className="recap-tag">+{answers.symptomes.length - 5}</span>}</div>}
                      <div className="recap-meta">Durée : {answers.duree || '—'} · Intensité : {answers.intensite}/10 · Évolution : {answers.evolution || '—'}</div>
                    </div>
                    <div className="recap-block">
                      <div className="recap-label">👤 Profil</div>
                      <div className="recap-meta">
                        {answers.sexe || '—'} · Né(e) le {answers.dateNaissance || '—'}<br />
                        {answers.poids} kg · {answers.taille} cm{imc ? ` · IMC ${imc}` : ''}<br />
                        Tabac : {answers.fumeur || '—'} · Alcool : {answers.alcool || '—'}
                      </div>
                    </div>
                    <div className="recap-block">
                      <div className="recap-label">📋 Antécédents</div>
                      <div className="recap-meta">
                        {answers.maladiesChroniques.length > 0 ? answers.maladiesChroniques.join(', ') : 'Aucune maladie chronique'}<br />
                        Chirurgies : {answers.chirurgiesPassees === 'oui' ? `Oui — ${answers.chirurgiesDetails}` : answers.chirurgiesPassees === 'non' ? 'Non' : '—'}<br />
                        <span style={{ color: answers.allergies === 'oui' ? 'var(--danger)' : 'inherit', fontWeight: answers.allergies === 'oui' ? 700 : 400 }}>
                          Allergies : {answers.allergies === 'oui' ? `⚠ ${answers.allergiesDetails}` : answers.allergies === 'non' ? 'Non' : '—'}
                        </span>
                      </div>
                    </div>
                    <div className="recap-block">
                      <div className="recap-label">🏃 Mode de vie</div>
                      <div className="recap-meta">
                        Activité : {answers.activitePhysique || '—'}<br />
                        Sommeil : {answers.sommeil || '—'}<br />
                        Stress : {answers.stress || '—'}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Commentaires supplémentaires <span className="optional">(facultatif)</span></label>
                    <textarea className="form-control" value={answers.commentaires} onChange={e => upd('commentaires', e.target.value)} rows={3} placeholder="Toute information complémentaire pour votre IPS…" />
                  </div>

                  <div className="consent-section">
                    <label className={`consent-item ${errors.consentement ? 'consent-error' : ''}`}>
                      <input type="checkbox" checked={answers.consentement} onChange={e => upd('consentement', e.target.checked)} />
                      <span>Je consens à recevoir des soins de santé par voie électronique et confirme que les informations fournies sont exactes et complètes. <span className="required">*</span></span>
                    </label>
                    {errors.consentement && <span className="form-error">⚠ {errors.consentement}</span>}
                    <label className={`consent-item ${errors.consentementDonnees ? 'consent-error' : ''}`}>
                      <input type="checkbox" checked={answers.consentementDonnees} onChange={e => upd('consentementDonnees', e.target.checked)} />
                      <span>J'autorise Anne à conserver mes données médicales de manière sécurisée conformément aux lois canadiennes sur la protection des renseignements personnels. <span className="required">*</span></span>
                    </label>
                    {errors.consentementDonnees && <span className="form-error">⚠ {errors.consentementDonnees}</span>}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="q-nav">
                {sectionIdx > 0 ? (
                  <button type="button" className="btn btn-secondary" onClick={prev}>← Précédent</button>
                ) : <span />}
                {!isLast ? (
                  <button type="button" className="btn btn-primary" onClick={next}>Suivant →</button>
                ) : (
                  <button type="button" className="btn btn-success btn-lg" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? '⏳ Envoi en cours…' : '✓ Soumettre mon questionnaire'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
