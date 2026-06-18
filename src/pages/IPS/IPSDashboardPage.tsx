import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getAllQuestionnaires, getCurrentUser } from '../../api/mockApi'
import type { Questionnaire } from '../../types'
import Layout from '../../components/Layout'

const STATUS_LABELS: Record<Questionnaire['status'], string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
}

const STATUS_CLASSES: Record<Questionnaire['status'], string> = {
  pending: 'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
}

export default function IPSDashboardPage() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [filter, setFilter] = useState<'all' | Questionnaire['status']>('all')

  if (!user || user.role !== 'ips') {
    return (
      <Layout variant="ips">
        <div className="page-center">
          <div className="card text-center" style={{ maxWidth: 440 }}>
            <h2>Accès réservé aux IPS</h2>
            <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/auth/ips')}>
              Se connecter
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const all = getAllQuestionnaires().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const filtered = filter === 'all' ? all : all.filter(q => q.status === filter)
  const pendingCount = all.filter(q => q.status === 'pending').length

  return (
    <Layout variant="ips">
      <div className="dashboard-layout">
        <div className="dashboard-header">
          <div>
            <h1>Tableau de bord IPS</h1>
            <p>Bienvenue, {user.prenom} {user.nom}</p>
          </div>
          {pendingCount > 0 && (
            <div className="badge badge-pending" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {pendingCount} dossier{pendingCount > 1 ? 's' : ''} en attente
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="filter-tabs">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              type="button"
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Tous' : STATUS_LABELS[f]}
              <span className="filter-count">
                {f === 'all' ? all.length : all.filter(q => q.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <p style={{ color: 'var(--gray-500)' }}>Aucun dossier dans cette catégorie.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Motif</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(q => (
                  <tr key={q.id}>
                    <td>
                      <div className="patient-cell">
                        <strong>{q.patientName}</strong>
                        <span className="patient-email">{q.patientEmail}</span>
                      </div>
                    </td>
                    <td className="motif-cell">{q.answers.motif.slice(0, 60)}{q.answers.motif.length > 60 ? '…' : ''}</td>
                    <td>{new Date(q.createdAt).toLocaleDateString('fr-CA', { dateStyle: 'medium' })}</td>
                    <td>
                      <span className={`badge ${STATUS_CLASSES[q.status]}`}>
                        {STATUS_LABELS[q.status]}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/dashboard/ips/questionnaires/${q.id}`}
                        className={`btn btn-sm ${q.status === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {q.status === 'pending' ? 'Examiner' : 'Voir'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
