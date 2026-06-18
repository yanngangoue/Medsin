import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getAllQuestionnaires, getCurrentUser } from '../../api/mockApi'
import type { Questionnaire } from '../../types'
import Layout from '../../components/Layout'

function initials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (d > 0) return `${d}j`
  if (h > 0) return `${h}h`
  return 'À l\'instant'
}

const SL: Record<Questionnaire['status'], string> = { pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté' }

export default function IPSDashboardPage() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [filter, setFilter] = useState<'all' | Questionnaire['status']>('all')
  const [search, setSearch] = useState('')

  if (!user || user.role !== 'ips') {
    return (
      <Layout variant="ips">
        <div className="page-center">
          <div className="card text-center" style={{ maxWidth: 400, padding: '3rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔐</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Accès IPS uniquement</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Ce tableau de bord est réservé aux IPS certifiées.</p>
            <button className="btn btn-primary" onClick={() => navigate('/auth/ips')}>Se connecter →</button>
          </div>
        </div>
      </Layout>
    )
  }

  const all = getAllQuestionnaires().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const pending  = all.filter(q => q.status === 'pending')
  const approved = all.filter(q => q.status === 'approved')
  const rejected = all.filter(q => q.status === 'rejected')

  const filtered = all
    .filter(q => filter === 'all' || q.status === filter)
    .filter(q =>
      !search ||
      q.patientName.toLowerCase().includes(search.toLowerCase()) ||
      q.patientEmail.toLowerCase().includes(search.toLowerCase()) ||
      q.answers.motif.toLowerCase().includes(search.toLowerCase())
    )

  const today = new Date().toLocaleDateString('fr-CA', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <Layout variant="ips">
      <div className="ips-page">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="ips-top">
          <div className="ips-top-left">
            <div className="ips-greeting">Bonjour, {user.prenom}</div>
            <div className="ips-date">{today.charAt(0).toUpperCase() + today.slice(1)}</div>
          </div>
          {pending.length > 0 && (
            <div className="ips-urgent-chip">
              <span className="ips-urgent-dot" />
              {pending.length} dossier{pending.length > 1 ? 's' : ''} en attente
            </div>
          )}
        </div>

        {/* ── Stats ───────────────────────────────────────────── */}
        <div className="ips-stats">
          {[
            { label: 'En attente', value: pending.length,  color: '#f59e0b', bg: '#fef3c7', active: pending.length > 0 },
            { label: 'Approuvés',  value: approved.length, color: '#059669', bg: '#d1fae5', active: false },
            { label: 'Rejetés',    value: rejected.length, color: '#dc2626', bg: '#fee2e2', active: false },
            { label: 'Total',      value: all.length,      color: '#4f46e5', bg: '#ede9fe', active: false },
          ].map(s => (
            <div key={s.label} className="ips-stat">
              <div className="ips-stat-val" style={{ color: s.color }}>{s.value}</div>
              <div className="ips-stat-lbl">{s.label}</div>
              {s.active && <div className="ips-stat-dot" style={{ background: s.color }} />}
            </div>
          ))}
        </div>

        {/* ── Toolbar ─────────────────────────────────────────── */}
        <div className="ips-toolbar">
          <div className="ips-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="ips-search-input"
              placeholder="Rechercher un patient ou un motif…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="ips-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <div className="ips-filters">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button
                key={f}
                className={`ips-filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Tous' : SL[f]}
                <span className="ips-filter-count">{f === 'all' ? all.length : all.filter(q => q.status === f).length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Liste patients ───────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="ips-empty">
            <div className="ips-empty-icon">📂</div>
            <p>Aucun dossier trouvé.</p>
          </div>
        ) : (
          <div className="ips-list">
            {filtered.map(q => {
              const hasAllergy  = q.answers.allergies === 'oui'
              const hasMaladies = q.answers.maladiesChroniques?.length > 0
              const isPending   = q.status === 'pending'
              const imc = q.answers.poids && q.answers.taille
                ? (parseFloat(q.answers.poids) / ((parseFloat(q.answers.taille) / 100) ** 2)).toFixed(1)
                : null
              return (
                <div key={q.id} className={`ips-patient-card${isPending ? ' ips-patient-card--urgent' : ''}`}>

                  {/* Avatar + status */}
                  <div className="ips-pc-left">
                    <div className={`ips-pc-av ips-pc-av--${q.status}`}>{initials(q.patientName)}</div>
                    <div className="ips-pc-time">{timeAgo(q.createdAt)}</div>
                  </div>

                  {/* Info */}
                  <div className="ips-pc-info">
                    <div className="ips-pc-name-row">
                      <span className="ips-pc-name">{q.patientName}</span>
                      <span className={`ips-pc-badge ips-pc-badge--${q.status}`}>{SL[q.status]}</span>
                      {hasAllergy && <span className="ips-pc-risk">⚠ Allergies</span>}
                    </div>
                    <div className="ips-pc-email">{q.patientEmail}</div>
                    <div className="ips-pc-motif">{q.answers.motif.slice(0, 100)}{q.answers.motif.length > 100 ? '…' : ''}</div>
                    <div className="ips-pc-tags">
                      {imc && <span className="ips-pc-tag">IMC {imc}</span>}
                      {hasMaladies && q.answers.maladiesChroniques.slice(0, 2).map(m => (
                        <span key={m} className="ips-pc-tag">{m}</span>
                      ))}
                      {q.answers.maladiesChroniques?.length > 2 && (
                        <span className="ips-pc-tag">+{q.answers.maladiesChroniques.length - 2}</span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="ips-pc-action">
                    <Link
                      to={`/dashboard/ips/questionnaires/${q.id}`}
                      className={`btn btn-sm${isPending ? ' btn-primary' : ' btn-secondary'}`}
                    >
                      {isPending ? 'Examiner →' : 'Voir le dossier'}
                    </Link>
                    {isPending && <div className="ips-pc-urgent-label">Action requise</div>}
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </div>
    </Layout>
  )
}
