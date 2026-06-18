import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getCurrentQuestionnaireId, getPaymentStatus } from '../api/mockApi'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  variant?: 'patient' | 'ips'
  fullWidth?: boolean
}

const FLOW = [
  { label: 'IMC',           paths: ['/imc'] },
  { label: 'Inscription',   paths: ['/auth/inscription', '/onboarding/inscription'] },
  { label: 'Questionnaire', paths: ['/questionnaire'] },
  { label: 'Examen',        paths: ['/examen-en-cours'] },
  { label: 'Activation',    paths: ['/paiement', '/dashboard/patient'] },
]

function FlowStepper() {
  const location = useLocation()
  const { user } = useApp()
  const hasQ = !!getCurrentQuestionnaireId()
  const paid = getPaymentStatus() === 'completed'

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
          <div key={i} className={`flow-step${i === currentIdx ? ' active' : ''}${isDone(i) ? ' done' : ''}`}>
            <div className="flow-circle">{isDone(i) ? '✓' : i + 1}</div>
            <span className="flow-label">{step.label}</span>
            {i < FLOW.length - 1 && <div className="flow-connector" />}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Logo mark ─────────────────────────────────────────── */
function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="as-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#as-grad)" />
      <path d="M10 22L16 10L22 22M13 18h6" stroke="white" strokeWidth="2.3"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── Navbar scroll shadow ──────────────────────────────── */
function useNavScroll() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return scrolled
}

export default function Layout({ children, variant = 'patient', fullWidth = false }: LayoutProps) {
  const { user, logout } = useApp()
  const navigate  = useNavigate()
  const scrolled  = useNavScroll()

  function handleLogout() { logout(); navigate('/imc') }

  const isAdmin   = user?.role === 'admin'
  const isIPS     = user?.role === 'ips'
  const isPharma  = user?.role === 'pharmacist'
  const isPatient = user?.role === 'patient'
  const showFlow  = variant === 'patient'

  return (
    <div className="app-layout">

      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container navbar-inner">

          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <BrandMark />
            <span className="brand-wordmark">
              <span className="brand-anne">Anne</span>
              <span className="brand-sante"> Santé</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="navbar-nav">
            {!user && (
              <div className="nav-guest-links">
                {variant !== 'ips' && <>
                  <Link to="/guide-nutritionnel" className="nav-link">Guide santé</Link>
                  <Link to="/auth/ips"           className="nav-link nav-link-subtle">Espace IPS</Link>
                </>}
                {variant === 'ips'
                  ? <Link to="/imc" className="nav-link">Retour patient</Link>
                  : <Link to="/imc" className="btn btn-primary btn-sm">Commencer →</Link>
                }
              </div>
            )}

            {user && (
              <>
                {/* Patient nav */}
                {isPatient && <>
                  <Link to="/dashboard/patient"   className="nav-link">Mon espace</Link>
                  <Link to="/messagerie"           className="nav-link">Messagerie</Link>
                  <Link to="/guide-nutritionnel"   className="nav-link">Guide</Link>
                </>}

                {/* IPS nav */}
                {isIPS && <>
                  <Link to="/dashboard/ips" className="nav-link">Patients</Link>
                </>}

                {/* Pharmacist nav */}
                {isPharma && <>
                  <Link to="/dashboard/pharmacien" className="nav-link">Ordonnances</Link>
                </>}

                {/* Admin nav */}
                {isAdmin && <>
                  <Link to="/dashboard/admin" className="nav-link">Administration</Link>
                </>}

                {/* User pill */}
                <div className="nav-user-pill">
                  <div className="nav-avatar">
                    {user.prenom[0]}{user.nom[0]}
                  </div>
                  <span className="nav-user-name">
                    {user.prenom}
                    {isIPS    && <span className="role-badge role-ips">IPS</span>}
                    {isPharma && <span className="role-badge role-pharma">Pharm.</span>}
                    {isAdmin  && <span className="role-badge role-admin">Admin</span>}
                  </span>
                  <button onClick={handleLogout} className="nav-logout" title="Déconnexion">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {showFlow && <FlowStepper />}

      <main className={`main-content${fullWidth ? ' main-content-full' : ''}`}>
        {children}
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <BrandMark size={22} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-700)', marginLeft: '0.4rem' }}>Anne Santé</span>
            <span style={{ color: 'var(--gray-400)', margin: '0 0.75rem' }}>·</span>
            <span style={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>© 2026 · Québec · Confidentiel</span>
          </div>
          <div className="footer-links">
            <Link to="/guide-nutritionnel" className="footer-link">Guide santé</Link>
            <Link to="/auth/ips"           className="footer-link">IPS</Link>
            <Link to="/auth/pharmacien"    className="footer-link">Pharmacien</Link>
            <Link to="/auth/admin"         className="footer-link">Admin</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
