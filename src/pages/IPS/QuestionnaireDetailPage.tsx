import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getQuestionnaireById, approveQuestionnaire, rejectQuestionnaire, getCurrentUser } from '../../api/mockApi'
import Layout from '../../components/Layout'

export default function QuestionnaireDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [questionnaire, setQuestionnaire] = useState(() => (id ? getQuestionnaireById(id) : null))
  const [notes, setNotes] = useState('')
  const [notesError, setNotesError] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  if (!user || user.role !== 'ips') {
    navigate('/auth/ips')
    return null
  }

  if (!questionnaire) {
    return (
      <Layout variant="ips">
        <div className="page-center">
          <div className="card" style={{ maxWidth: 480 }}>
            <p>Dossier introuvable.</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/dashboard/ips')}>
              ← Retour
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const { answers } = questionnaire

  function handleDecision(decision: 'approve' | 'reject') {
    if (!notes.trim()) {
      setNotesError('Veuillez ajouter une note avant de prendre une décision.')
      return
    }
    if (decision === 'approve') {
      approveQuestionnaire(questionnaire!.id, notes)
    } else {
      rejectQuestionnaire(questionnaire!.id, notes)
    }
    const updated = getQuestionnaireById(questionnaire!.id)
    setQuestionnaire(updated)
    setAction(decision)
  }

  const isPending = questionnaire.status === 'pending'

  return (
    <Layout variant="ips">
      <div className="dashboard-layout">
        <div className="detail-header">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/ips')}>
            ← Retour au tableau de bord
          </button>
          <div className="detail-title">
            <h1>Dossier de {questionnaire.patientName}</h1>
            <p>Soumis le {new Date(questionnaire.createdAt).toLocaleDateString('fr-CA', { dateStyle: 'long' })}</p>
          </div>
          <span className={`badge ${questionnaire.status === 'pending' ? 'badge-pending' : questionnaire.status === 'approved' ? 'badge-approved' : 'badge-rejected'}`} style={{ fontSize: '0.95rem', padding: '0.4rem 0.9rem' }}>
            {questionnaire.status === 'pending' ? 'En attente' : questionnaire.status === 'approved' ? 'Approuvé' : 'Rejeté'}
          </span>
        </div>

        <div className="detail-grid">
          {/* Profil */}
          <div className="card">
            <h3 className="detail-section-title">Profil du patient</h3>
            <div className="detail-list">
              <div className="detail-row"><span>Poids</span><strong>{answers.poids} kg</strong></div>
              <div className="detail-row"><span>Taille</span><strong>{answers.taille} cm</strong></div>
              <div className="detail-row"><span>Sexe</span><strong>{answers.sexe}</strong></div>
              <div className="detail-row"><span>Tabagisme</span><strong>{answers.fumeur}</strong></div>
            </div>
          </div>

          {/* Symptômes */}
          <div className="card">
            <h3 className="detail-section-title">Motif & symptômes</h3>
            <div className="detail-list">
              <div className="detail-row"><span>Durée</span><strong>{answers.duree}</strong></div>
              <div className="detail-row"><span>Intensité</span><strong>{answers.intensite}</strong></div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <span className="detail-label">Description</span>
              <p className="detail-text">{answers.motif}</p>
            </div>
          </div>

          {/* Antécédents */}
          <div className="card">
            <h3 className="detail-section-title">Antécédents médicaux</h3>
            <div className="detail-list">
              <div className="detail-row">
                <span>Maladies chroniques</span>
                <strong>{answers.maladiesChroniques.length > 0 ? answers.maladiesChroniques.join(', ') : 'Aucune'}</strong>
              </div>
              <div className="detail-row">
                <span>Chirurgies</span>
                <strong>{answers.chirurgiesPassees === 'oui' ? answers.chirurgiesDetails || 'Oui' : 'Non'}</strong>
              </div>
              <div className="detail-row">
                <span>Allergies</span>
                <strong>{answers.allergies === 'oui' ? answers.allergiesDetails || 'Oui' : 'Non'}</strong>
              </div>
            </div>
          </div>

          {/* Médicaments */}
          <div className="card">
            <h3 className="detail-section-title">Médicaments & notes</h3>
            <div className="detail-list">
              <div className="detail-row">
                <span>Médicaments actuels</span>
                <strong>{answers.medicaments === 'oui' ? answers.medicamentsDetails || 'Oui' : 'Non'}</strong>
              </div>
            </div>
            {answers.commentaires && (
              <div style={{ marginTop: '0.75rem' }}>
                <span className="detail-label">Commentaire du patient</span>
                <p className="detail-text">{answers.commentaires}</p>
              </div>
            )}
          </div>
        </div>

        {/* Decision panel */}
        {action && (
          <div className={`alert ${action === 'approve' ? 'alert-success' : 'alert-danger'}`}>
            ✓ Décision enregistrée : dossier {action === 'approve' ? 'approuvé' : 'rejeté'}.
            Le patient a été notifié.
          </div>
        )}

        {isPending && !action && (
          <div className="card decision-panel">
            <h3>Décision</h3>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Note pour le patient *</label>
              <textarea
                className={`form-control ${notesError ? 'error' : ''}`}
                value={notes}
                onChange={e => { setNotes(e.target.value); setNotesError('') }}
                placeholder="Résumez votre évaluation et vos recommandations..."
                rows={4}
              />
              {notesError && <span className="form-error">{notesError}</span>}
            </div>
            <div className="decision-buttons">
              <button type="button" className="btn btn-danger" onClick={() => handleDecision('reject')}>
                ✗ Rejeter le dossier
              </button>
              <button type="button" className="btn btn-success" onClick={() => handleDecision('approve')}>
                ✓ Approuver le dossier
              </button>
            </div>
          </div>
        )}

        {!isPending && questionnaire.ipsNotes && (
          <div className="card">
            <h3>Note enregistrée</h3>
            <p style={{ marginTop: '0.75rem' }}>{questionnaire.ipsNotes}</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
