import { useLocation, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function EligibiliteResultatPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const eligible: boolean = location.state?.eligible ?? false

  if (eligible) {
    return (
      <Layout>
        <div className="page-center">
          <div className="card text-center" style={{ maxWidth: 520 }}>
            <div className="result-icon success">✓</div>
            <h1>Vous êtes éligible!</h1>
            <p className="result-desc">
              Vous pouvez accéder à notre service de consultation médicale en ligne.
              Créez votre compte pour continuer.
            </p>
            <div className="result-features">
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Données 100% confidentielles</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⏱</span>
                <span>Réponse sous 24h</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚕</span>
                <span>Suivi par un(e) IPS certifié(e)</span>
              </div>
            </div>
            <Link to="/auth/inscription" className="btn btn-primary btn-full btn-lg">
              Créer mon compte →
            </Link>
            <button
              type="button"
              onClick={() => navigate('/eligibilite')}
              className="btn btn-ghost btn-full"
              style={{ marginTop: '0.75rem' }}
            >
              ← Retour
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="page-center">
        <div className="card text-center" style={{ maxWidth: 520 }}>
          <div className="result-icon danger">✗</div>
          <h1>Non éligible</h1>
          <p className="result-desc">
            Malheureusement, vous ne remplissez pas les critères pour utiliser notre service en ligne.
            Nous vous recommandons de consulter un professionnel de santé en personne.
          </p>
          <div className="alert alert-info" style={{ textAlign: 'left' }}>
            Pour être éligible, vous devez avoir 18 ans ou plus, résider au Canada et consentir
            au partage de vos informations médicales.
          </div>
          <button
            type="button"
            onClick={() => navigate('/eligibilite')}
            className="btn btn-primary btn-full"
          >
            ← Recommencer
          </button>
        </div>
      </div>
    </Layout>
  )
}
