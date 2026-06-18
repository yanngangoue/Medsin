import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getQuestionnaireById, approveQuestionnaire, rejectQuestionnaire,
  getCurrentUser, getStaffList,
} from '../../api/mockApi'
import type { Prescription, PrescriptionMedication } from '../../types'
import Layout from '../../components/Layout'

const NOTE_TEMPLATES = [
  'Dossier examiné. Traitement approuvé selon les informations fournies.',
  'Renouvellement approuvé pour 3 mois. Consultation de suivi recommandée.',
  'Dossier incomplet — veuillez consulter un médecin en personne.',
  'Contre-indication détectée. Traitement non recommandé par voie télé-médicale.',
]

const emptyMed = (): PrescriptionMedication => ({ name: '', dosage: '', frequency: '', duration: '', notes: '' })

export default function QuestionnaireDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [questionnaire, setQuestionnaire] = useState(() => id ? getQuestionnaireById(id) : null)
  const [notes, setNotes] = useState('')
  const [notesError, setNotesError] = useState('')
  const [confirmed, setConfirmed] = useState<'approve' | 'reject' | null>(null)

  // Prescription form
  const pharmacists = getStaffList().filter(u => u.role === 'pharmacist')
  const [medications, setMedications] = useState<PrescriptionMedication[]>([emptyMed()])
  const [instructions, setInstructions] = useState('')
  const [refills, setRefills] = useState('2')
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 3)
    return d.toISOString().split('T')[0]
  })
  const [pharmacyId, setPharmacyId] = useState(pharmacists[0]?.id ?? '')
  const [rxError, setRxError] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'ips') navigate('/auth/ips', { replace: true })
  }, [user, navigate])

  if (!user || user.role !== 'ips') return null
  if (!questionnaire) {
    return (
      <Layout variant="ips">
        <div className="page-center">
          <div className="card" style={{ maxWidth: 480 }}>
            <p>Dossier introuvable.</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/dashboard/ips')}>← Retour</button>
          </div>
        </div>
      </Layout>
    )
  }

  const { answers } = questionnaire
  const isPending = questionnaire.status === 'pending'
  const hasAllergies = answers.allergies === 'oui'
  const hasMaladies = answers.maladiesChroniques.length > 0
  const p = parseFloat(answers.poids), t = parseFloat(answers.taille) / 100
  const imc = p > 0 && t > 0 ? (p / (t * t)).toFixed(1) : null
  const age = answers.dateNaissance
    ? Math.floor((Date.now() - new Date(answers.dateNaissance).getTime()) / (365.25 * 86400000))
    : null

  function addMed() { setMedications(m => [...m, emptyMed()]) }
  function removeMed(i: number) { setMedications(m => m.filter((_, idx) => idx !== i)) }
  function updMed(i: number, field: keyof PrescriptionMedication, val: string) {
    setMedications(m => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med))
  }

  function handleDecision(decision: 'approve' | 'reject') {
    if (!notes.trim()) { setNotesError('Une note clinique est requise.'); return }

    let prescription: Prescription | undefined
    if (decision === 'approve') {
      if (medications.some(m => !m.name.trim())) { setRxError('Indiquez le nom de chaque médicament.'); return }
      const pharmacy = getStaffList().find(u => u.id === pharmacyId)
      prescription = {
        id: crypto.randomUUID(),
        questionnaireId: questionnaire!.id,
        patientId: questionnaire!.patientId,
        patientName: questionnaire!.patientName,
        patientEmail: questionnaire!.patientEmail,
        ipsId: user.id,
        ipsName: `${user.prenom} ${user.nom}`,
        medications,
        instructions,
        refills: parseInt(refills),
        validUntil,
        pharmacyId,
        pharmacyName: pharmacy?.pharmacyName ?? 'Pharmacie partenaire',
        sentToPharmacy: false,
        createdAt: new Date().toISOString(),
      }
    }

    if (decision === 'approve') {
      approveQuestionnaire(questionnaire!.id, notes, prescription)
    } else {
      rejectQuestionnaire(questionnaire!.id, notes)
    }
    setQuestionnaire(getQuestionnaireById(questionnaire!.id))
    setConfirmed(decision)
  }

  const statusBadge = questionnaire.status === 'pending' ? 'badge-pending' : questionnaire.status === 'approved' ? 'badge-approved' : 'badge-rejected'
  const statusLabel = questionnaire.status === 'pending' ? 'En attente' : questionnaire.status === 'approved' ? 'Approuvé' : 'Rejeté'

  return (
    <Layout variant="ips">
      <div className="ips-layout">

        <div className="dossier-header">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/ips')}>← Tableau de bord</button>
          <div className="dossier-title">
            <h1>Dossier · {questionnaire.patientName}</h1>
            <p>Soumis le {new Date(questionnaire.createdAt).toLocaleDateString('fr-CA', { dateStyle: 'long' })} à {new Date(questionnaire.createdAt).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <span className={`badge ${statusBadge}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>{statusLabel}</span>
        </div>

        {/* Résumé Anna */}
        {questionnaire.annaSummary && (
          <div className="anna-summary-card">
            <div className="anna-summary-header">
              <span className="anna-icon">🤖</span>
              <div>
                <strong>Analyse Anna — Coordinatrice IA</strong>
                <span className="anna-badge">Généré automatiquement</span>
              </div>
            </div>
            <pre className="anna-summary-body">{questionnaire.annaSummary}</pre>
          </div>
        )}

        <div className="dossier-split">

          {/* ── Colonne principale ── */}
          <div className="dossier-main">

            {/* Motif */}
            <div className="card dossier-card">
              <div className="dossier-card-label">Motif de consultation</div>
              <p className="motif-text">"{answers.motif}"</p>
              {answers.symptomes.length > 0 && (
                <div className="symptom-pills">
                  {answers.symptomes.map(s => <span key={s} className="symptom-pill">{s}</span>)}
                </div>
              )}
              <div className="symptom-pills" style={{ marginTop: '0.5rem' }}>
                <span className="symptom-pill">⏱ {answers.duree}</span>
                <span className={`symptom-pill ${parseInt(answers.intensite) >= 7 ? 'pill-danger' : parseInt(answers.intensite) >= 4 ? 'pill-warning' : 'pill-ok'}`}>
                  Intensité {answers.intensite}/10
                </span>
                <span className="symptom-pill">{answers.evolution}</span>
              </div>
            </div>

            {/* Grille médicale */}
            <div className="dossier-grid">
              <div className="card dossier-card">
                <div className="dossier-card-label">Profil physique</div>
                <div className="med-rows">
                  {age !== null && <div className="med-row"><span>Âge</span><strong>{age} ans</strong></div>}
                  <div className="med-row"><span>Sexe</span><strong>{answers.sexe}</strong></div>
                  <div className="med-row"><span>Poids</span><strong>{answers.poids} kg</strong></div>
                  <div className="med-row"><span>Taille</span><strong>{answers.taille} cm</strong></div>
                  {imc && (
                    <div className="med-row">
                      <span>IMC</span>
                      <strong>
                        <span className={`imc-badge ${parseFloat(imc) < 18.5 ? 'imc-low' : parseFloat(imc) < 25 ? 'imc-normal' : parseFloat(imc) < 30 ? 'imc-over' : 'imc-obese'}`}>
                          {imc} — {parseFloat(imc) < 18.5 ? 'Insuffisance' : parseFloat(imc) < 25 ? 'Poids santé' : parseFloat(imc) < 30 ? 'Surpoids' : 'Obésité'}
                        </span>
                      </strong>
                    </div>
                  )}
                  <div className="med-row"><span>Tabagisme</span><strong>{answers.fumeur}</strong></div>
                  <div className="med-row"><span>Alcool</span><strong>{answers.alcool}</strong></div>
                </div>
              </div>

              <div className="card dossier-card">
                <div className="dossier-card-label">Antécédents médicaux</div>
                <div className="med-rows">
                  <div className="med-row">
                    <span>Maladies chroniques</span>
                    <strong>{hasMaladies ? answers.maladiesChroniques.join(', ') : 'Aucune'}</strong>
                  </div>
                  <div className="med-row">
                    <span>Chirurgies</span>
                    <strong>{answers.chirurgiesPassees === 'oui' ? answers.chirurgiesDetails || 'Oui' : 'Non'}</strong>
                  </div>
                  {answers.antecedentsFamiliaux && (
                    <div className="med-row"><span>Familiaux</span><strong style={{ fontSize: '0.82rem' }}>{answers.antecedentsFamiliaux}</strong></div>
                  )}
                </div>
                {hasAllergies && (
                  <div className="allergy-alert">
                    <span className="allergy-icon">⚠</span>
                    <div>
                      <strong>ALLERGIE DÉCLARÉE</strong>
                      <p>{answers.allergiesDetails || 'Voir dossier'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="card dossier-card">
                <div className="dossier-card-label">Traitements en cours</div>
                {answers.medicaments === 'oui'
                  ? <p className="med-text">{answers.medicamentsDetails || 'Oui — non précisés'}</p>
                  : <p className="med-text muted">Aucun médicament déclaré</p>}
                {answers.supplements === 'oui' && answers.supplementsDetails && (
                  <>
                    <div className="dossier-card-label" style={{ marginTop: '0.75rem' }}>Suppléments</div>
                    <p className="med-text">{answers.supplementsDetails}</p>
                  </>
                )}
              </div>

              <div className="card dossier-card">
                <div className="dossier-card-label">Mode de vie</div>
                <div className="med-rows">
                  <div className="med-row"><span>Activité</span><strong>{answers.activitePhysique || '—'}</strong></div>
                  <div className="med-row"><span>Alimentation</span><strong>{answers.alimentation || '—'}</strong></div>
                  <div className="med-row"><span>Sommeil</span><strong>{answers.sommeil || '—'}</strong></div>
                  <div className="med-row"><span>Stress</span><strong>{answers.stress || '—'}</strong></div>
                </div>
                {answers.santeMentale && (
                  <>
                    <div className="dossier-card-label" style={{ marginTop: '0.75rem' }}>Santé mentale</div>
                    <p className="med-text">{answers.santeMentale}</p>
                  </>
                )}
              </div>
            </div>

            {answers.commentaires && (
              <div className="card dossier-card">
                <div className="dossier-card-label">Commentaire du patient</div>
                <p className="med-text">{answers.commentaires}</p>
              </div>
            )}

            {confirmed && (
              <div className={`alert ${confirmed === 'approve' ? 'alert-success' : 'alert-danger'}`} style={{ fontSize: '1rem' }}>
                {confirmed === 'approve' ? '✓ Dossier approuvé — ordonnance créée et patient notifié.' : '✗ Dossier rejeté — patient notifié.'}
              </div>
            )}

            {!isPending && questionnaire.ipsNotes && !confirmed && (
              <div className="card dossier-card">
                <div className="dossier-card-label">Note IPS enregistrée</div>
                <p className="med-text">{questionnaire.ipsNotes}</p>
              </div>
            )}
          </div>

          {/* ── Panneau latéral ── */}
          <div className="dossier-sidebar">
            <div className="card sidebar-patient">
              <div className="sidebar-avatar">{questionnaire.patientName.split(' ').map(n => n[0]).join('')}</div>
              <div className="sidebar-patient-info">
                <strong>{questionnaire.patientName}</strong>
                <span>{questionnaire.patientEmail}</span>
              </div>
            </div>

            {(hasAllergies || hasMaladies) && (
              <div className="card sidebar-risks">
                <div className="dossier-card-label">Alertes cliniques</div>
                {hasAllergies && <div className="risk-item risk-high"><span>⚠</span> Allergie : {answers.allergiesDetails || 'Déclarée'}</div>}
                {answers.maladiesChroniques.map(m => (
                  <div key={m} className="risk-item risk-medium"><span>●</span> {m}</div>
                ))}
              </div>
            )}

            {/* Panneau de décision */}
            {isPending && !confirmed && (
              <div className="card sidebar-decision">
                <div className="dossier-card-label">Décision clinique</div>

                {/* Prescription */}
                <div className="rx-form-section">
                  <div className="rx-form-label">Ordonnance à émettre</div>
                  {medications.map((med, i) => (
                    <div key={i} className="rx-med-form">
                      <div className="rx-med-form-header">
                        <span>Médicament {i + 1}</span>
                        {medications.length > 1 && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeMed(i)}>✕</button>
                        )}
                      </div>
                      <input className="form-control" placeholder="Nom du médicament *" value={med.name} onChange={e => updMed(i, 'name', e.target.value)} />
                      <div className="form-row" style={{ gap: '0.5rem' }}>
                        <input className="form-control" placeholder="Dosage" value={med.dosage} onChange={e => updMed(i, 'dosage', e.target.value)} />
                        <input className="form-control" placeholder="Fréquence" value={med.frequency} onChange={e => updMed(i, 'frequency', e.target.value)} />
                      </div>
                      <input className="form-control" placeholder="Durée (ex. : 3 mois)" value={med.duration} onChange={e => updMed(i, 'duration', e.target.value)} />
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addMed} style={{ width: '100%', marginBottom: '0.75rem' }}>+ Ajouter un médicament</button>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Instructions générales</label>
                    <textarea className="form-control" rows={2} value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Ex. : Prendre avec les repas, éviter le soleil…" />
                  </div>

                  <div className="form-row" style={{ gap: '0.5rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Renouvellements</label>
                      <select className="form-control" value={refills} onChange={e => setRefills(e.target.value)}>
                        {['0','1','2','3','5'].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Valide jusqu'au</label>
                      <input type="date" className="form-control" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                    </div>
                  </div>

                  {pharmacists.length > 0 ? (
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Pharmacie partenaire</label>
                      <select className="form-control" value={pharmacyId} onChange={e => setPharmacyId(e.target.value)}>
                        {pharmacists.map(ph => (
                          <option key={ph.id} value={ph.id}>{ph.pharmacyName} — {ph.prenom} {ph.nom}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="alert alert-danger" style={{ fontSize: '0.83rem' }}>
                      ⚠ Aucun pharmacien configuré. L'ordonnance sera approuvée sans pharmacie assignée — le suivi de livraison ne démarrera pas. Contactez l'admin pour ajouter un pharmacien.
                    </div>
                  )}

                  {rxError && <div className="form-error">⚠ {rxError}</div>}
                </div>

                {/* Note clinique */}
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Modèles de notes</label>
                  <select className="form-control" style={{ fontSize: '0.82rem' }} onChange={e => { if (e.target.value) setNotes(e.target.value); setNotesError('') }} defaultValue="">
                    <option value="" disabled>Choisir un modèle…</option>
                    {NOTE_TEMPLATES.map((t, i) => <option key={i} value={t}>{t.slice(0, 45)}…</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Note pour le patient <span className="required">*</span></label>
                  <textarea className={`form-control ${notesError ? 'error' : ''}`} value={notes} onChange={e => { setNotes(e.target.value); setNotesError('') }} placeholder="Résumez votre évaluation clinique et vos recommandations…" rows={4} />
                  {notesError && <span className="form-error">⚠ {notesError}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button type="button" className="btn btn-success btn-full" onClick={() => handleDecision('approve')}>
                    ✓ Approuver & émettre l'ordonnance
                  </button>
                  <button type="button" className="btn btn-danger btn-full" onClick={() => handleDecision('reject')}>
                    ✗ Rejeter le dossier
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
