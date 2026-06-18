import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getCurrentQuestionnaireId, getPaymentStatus } from '../api/mockApi'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  variant?: 'patient' | 'ips'
}

const FLOW = [
  { label: 'Éligibilité', paths: ['/eligibilite'] },
  { label: 'Inscription',  paths: ['/auth/inscription', '/onboarding/inscription'] },
  { label: 'Questionnaire', paths: ['/questionnaire'] },
  { label: 'Examen',       paths: ['/examen-en-cours'] },
  { label: 'Paiement',     paths: ['/paiement', '/dashboard/patient'] },
]

function FlowStepper() {
  const location = useLocation()
  const { user } = useApp()
  const hasQ = !!getCurrentQuestionnaireId()
  const paid  = getPaymentStatus() === 'completed'

  const currentIdx = FLOW.findIndex(s =>
    s.paths.some(p => location.pathname.startsWith(p))
  )
  if (currentIdx === -1) return null

  function isDone(i: number) {
    if (i < currentIdx) return true
    if (i === 1 && !!user) return true
    if (i === 2 && hasQ) return true
    if (i === 3 && paid) return true
    return false
  }

  return (
    <div className="flow-stepper-wrap">
      <div className="flow-stepper container">
        {FLOW.map((step, i) => (
          <div key={i} className={`flow-step ${i === currentIdx ? 'active' : ''} ${isDone(i) ? 'done' : ''}`}>
            <div className="flow-circle">
              {isDone(i) ? '✓' : i + 1}
            </div>
            <span className="flow-label">{step.label}</span>
            {i < FLOW.length - 1 && <div className="flow-connector" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Layout({ children, variant = 'patient' }: LayoutProps) {
  const { user, logout } = useApp()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const showFlow = variant === 'patient'

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">⚕</span>
            <span className="brand-name">Medsim</span>
          </Link>
          <div className="navbar-nav">
            {user ? (
              <>
                <span className="nav-user">
                  {user.prenom} {user.nom}
                  {user.role === 'ips' && <span className="role-badge">IPS</span>}
                </span>
                {user.role === 'patient' && (
                  <Link to="/dashboard/patient" className="nav-link">Mon dossier</Link>
                )}
                {user.role === 'ips' && (
                  <Link to="/dashboard/ips" className="nav-link">Tableau de bord</Link>
                )}
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Déconnexion
                </button>
              </>
            ) : (
              variant === 'ips'
                ? <Link to="/auth/ips" className="btn btn-outline btn-sm">Connexion IPS</Link>
                : <Link to="/auth/inscription" className="btn btn-primary btn-sm">Commencer</Link>
            )}
          </div>
        </div>
      </nav>

      {showFlow && <FlowStepper />}

      <main className="main-content">{children}</main>

      <footer className="footer">
        <div className="container">
          <p>© 2026 Medsim · Service de consultation médicale en ligne · Confidentiel</p>
        </div>
      </footer>
    </div>
  )
}
