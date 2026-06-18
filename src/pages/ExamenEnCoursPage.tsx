import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getCurrentQuestionnaireId, getQuestionnaireById } from '../api/mockApi'
import Layout from '../components/Layout'

export default function ExamenEnCoursPage() {
  const navigate = useNavigate()
  const id = getCurrentQuestionnaireId()
  const [questionnaire, setQuestionnaire] = useState(() =>
    id ? getQuestionnaireById(id) : null
  )

  function checkStatus() {
    if (!id) return
    const updated = getQuestionnaireById(id)
    setQuestionnaire(updated)
    if (updated?.status === 'approved') { navigate('/paiement'); return }
    if (updated?.status === 'rejected') return
  }

  if (!questionnaire) {
    return (
      <Layout>
        <div className="page-center">
          <div className="card text-center" style={{ maxWidth: 520 }}>
            <p>Aucun questionnaire trouvé.</p>
            <Link to="/questionnaire" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Remplir le questionnaire
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const isApproved = questionnaire.status === 'approved'
  const isRejected = questionnaire.status === 'rejected'
  const isPending = questionnaire.status === 'pending'

  return (
    <Layout>
      <div className="page-center">
        <div className="card text-center" style={{ maxWidth: 560 }}>
          {isPending && (
            <>
              <div className="status-icon pending">⏳</div>
              <h1>Dossier en cours d'examen</h1>
              <p className="result-desc">
                Votre questionnaire médical a été soumis avec succès. Un(e) infirmier(ère)
                praticien(ne) spécialisé(e) examinera votre dossier dans les prochaines heures.
              </p>
              <div className="status-card pending">
                <strong>Statut : EN ATTENTE D'EXAMEN</strong>
                <p>Soumis le {new Date(questionnaire.createdAt).toLocaleDateString('fr-CA', { dateStyle: 'long' })}</p>
              </div>
              <button type="button" className="btn btn-outline btn-full" onClick={checkStatus} style={{ marginBottom: '1rem' }}>
                🔄 Vérifier le statut
              </button>
            </>
          )}

          {isApproved && (
            <>
              <div className="status-icon approved">✓</div>
              <h1>Dossier approuvé!</h1>
              <p className="result-desc">
                Votre dossier a été examiné et approuvé par votre IPS. Vous pouvez maintenant
                procéder au paiement pour recevoir votre ordonnance.
              </p>
              {questionnaire.ipsNotes && (
                <div className="alert alert-success" style={{ textAlign: 'left' }}>
                  <strong>Note de votre IPS :</strong> {questionnaire.ipsNotes}
                </div>
              )}
              <button type="button" className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/paiement')}>
                Procéder au paiement →
              </button>
            </>
          )}

          {isRejected && (
            <>
              <div className="status-icon danger">✗</div>
              <h1>Dossier non approuvé</h1>
              <p className="result-desc">
                Après examen de votre dossier, votre IPS ne peut pas vous prescrire un traitement
                en ligne pour le moment.
              </p>
              {questionnaire.ipsNotes && (
                <div className="alert alert-danger" style={{ textAlign: 'left' }}>
                  <strong>Motif :</strong> {questionnaire.ipsNotes}
                </div>
              )}
              <div className="alert alert-info" style={{ textAlign: 'left' }}>
                Nous vous recommandons de consulter un professionnel de santé en personne.
              </div>
            </>
          )}

          <div className="demo-box">
            <p className="demo-title">🎮 Zone de démonstration</p>
            <p>Pour tester le flux complet, accédez au tableau de bord IPS :</p>
            <Link to="/dashboard/ips" className="btn btn-ghost btn-sm">
              Accéder au tableau de bord IPS →
            </Link>
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
              Connexion : ips@anne.ca / demo123
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
