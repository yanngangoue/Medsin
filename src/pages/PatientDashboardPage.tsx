import { useNavigate } from 'react-router-dom'
import {
  getCurrentUser,
  getQuestionnaireById,
  getCurrentQuestionnaireId,
  getPaymentStatus,
} from '../api/mockApi'
import Layout from '../components/Layout'

export default function PatientDashboardPage() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const qId = getCurrentQuestionnaireId()
  const questionnaire = qId ? getQuestionnaireById(qId) : null
  const paid = getPaymentStatus() === 'completed'

  if (!user) {
    return (
      <Layout>
        <div className="page-center">
          <div className="card text-center" style={{ maxWidth: 480 }}>
            <h2>Accès refusé</h2>
            <p>Vous devez être connecté pour accéder à cette page.</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/eligibilite')}>
              Commencer
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const statusLabel = {
    pending: 'En attente d\'examen',
    approved: paid ? 'Traitement en cours' : 'Approuvé — paiement requis',
    rejected: 'Non approuvé',
  }

  const statusClass = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  }

  return (
    <Layout>
      <div className="dashboard-layout">
        <div className="dashboard-header">
          <h1>Bonjour, {user.prenom}!</h1>
          <p>Voici un aperçu de votre dossier médical en ligne.</p>
        </div>

        <div className="dashboard-grid">
          {/* Statut */}
          <div className="card dashboard-card">
            <h3>Statut du dossier</h3>
            {questionnaire ? (
              <>
                <div className={`badge ${statusClass[questionnaire.status]}`} style={{ fontSize: '0.95rem', padding: '0.4rem 0.9rem', marginTop: '0.75rem', display: 'inline-block' }}>
                  {statusLabel[questionnaire.status]}
                </div>
                <p className="dashboard-meta">
                  Soumis le {new Date(questionnaire.createdAt).toLocaleDateString('fr-CA', { dateStyle: 'medium' })}
                </p>
                {questionnaire.status === 'approved' && !paid && (
                  <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/paiement')}>
                    Procéder au paiement →
                  </button>
                )}
                {questionnaire.status === 'pending' && (
                  <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => navigate('/examen-en-cours')}>
                    Suivre l'examen →
                  </button>
                )}
              </>
            ) : (
              <>
                <p style={{ color: 'var(--gray-500)', marginTop: '0.75rem' }}>Aucun questionnaire soumis.</p>
                <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => navigate('/questionnaire')}>
                  Remplir le questionnaire
                </button>
              </>
            )}
          </div>

          {/* Profil */}
          <div className="card dashboard-card">
            <h3>Mon profil</h3>
            <div className="profile-list">
              <div className="profile-row">
                <span className="profile-key">Nom complet</span>
                <span>{user.prenom} {user.nom}</span>
              </div>
              <div className="profile-row">
                <span className="profile-key">Courriel</span>
                <span>{user.email}</span>
              </div>
              {user.telephone && (
                <div className="profile-row">
                  <span className="profile-key">Téléphone</span>
                  <span>{user.telephone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Paiement */}
          {paid && (
            <div className="card dashboard-card">
              <h3>Paiement</h3>
              <div className={`badge badge-approved`} style={{ display: 'inline-block', marginTop: '0.75rem' }}>
                ✓ Payé
              </div>
              <p className="dashboard-meta">80,00 $ · Consultation + traitement</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                Votre médicament sera disponible à la pharmacie sous 24-48h.
              </p>
            </div>
          )}

          {/* Note IPS */}
          {questionnaire?.ipsNotes && (
            <div className="card dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <h3>Note de votre IPS</h3>
              <p style={{ marginTop: '0.75rem', color: 'var(--gray-700)' }}>{questionnaire.ipsNotes}</p>
            </div>
          )}

          {/* Prochaine étape */}
          <div className="card dashboard-card" style={{ gridColumn: '1 / -1' }}>
            <h3>Prochaine étape</h3>
            <div style={{ marginTop: '0.75rem' }}>
              {!questionnaire && (
                <p>Remplissez votre questionnaire médical pour commencer votre consultation.</p>
              )}
              {questionnaire?.status === 'pending' && (
                <p>⏳ Votre dossier est en cours d'examen. Nous vous notifierons par courriel dès qu'une décision est prise.</p>
              )}
              {questionnaire?.status === 'approved' && !paid && (
                <p>✓ Dossier approuvé! Procédez au paiement pour recevoir votre ordonnance.</p>
              )}
              {questionnaire?.status === 'approved' && paid && (
                <p>✓ Traitement en cours. Votre médicament sera disponible à la pharmacie sous 24-48h.</p>
              )}
              {questionnaire?.status === 'rejected' && (
                <p>Consultez un professionnel de santé en personne pour votre situation.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
