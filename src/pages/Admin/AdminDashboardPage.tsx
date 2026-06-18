import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, getStaffList, addStaff, removeStaff, getAllQuestionnaires } from '../../api/mockApi'
import type { User } from '../../types'
import Layout from '../../components/Layout'

type Tab = 'overview' | 'ips' | 'pharmacists'

interface AddForm {
  prenom: string; nom: string; email: string; telephone: string
  specialisation?: string; pharmacyName?: string; licenceNumber?: string
}

const empty: AddForm = { prenom: '', nom: '', email: '', telephone: '', specialisation: '', pharmacyName: '', licenceNumber: '' }

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [tab, setTab] = useState<Tab>('overview')
  const [staff, setStaff] = useState<User[]>(() => getStaffList())
  const [showForm, setShowForm] = useState<'ips' | 'pharmacist' | null>(null)
  const [form, setForm] = useState<AddForm>(empty)
  const [formError, setFormError] = useState('')
  const [lastAdded, setLastAdded] = useState<User | null>(null)

  if (!user || user.role !== 'admin') {
    return (
      <Layout variant="ips">
        <div className="page-center">
          <div className="card text-center" style={{ maxWidth: 420 }}>
            <h2>Accès réservé à l'administrateur</h2>
            <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/auth/admin')}>Se connecter</button>
          </div>
        </div>
      </Layout>
    )
  }

  const qs = getAllQuestionnaires()
  const ipsList = staff.filter(s => s.role === 'ips')
  const pharmacistList = staff.filter(s => s.role === 'pharmacist')

  function handleAdd() {
    if (!form.prenom.trim() || !form.nom.trim()) { setFormError('Prénom et nom requis.'); return }
    if (showForm === 'pharmacist' && !form.pharmacyName?.trim()) { setFormError('Le nom de la pharmacie est requis.'); return }

    const slug = `${form.prenom.toLowerCase()}.${form.nom.toLowerCase()}`.replace(/[^a-z.]/g, '')
    const email = `${slug}@anne.ca`
    const role = showForm!
    const added = addStaff({ ...form, email, role })
    setStaff(getStaffList())
    setLastAdded({ ...added, email })
    setForm(empty)
    setShowForm(null)
    setFormError('')
  }

  function handleRemove(id: string) {
    if (!window.confirm('Supprimer ce membre du personnel?')) return
    removeStaff(id)
    setStaff(getStaffList())
  }

  const stats = [
    { icon: '🧑‍⚕️', label: 'IPS actifs',       value: ipsList.length },
    { icon: '💊',    label: 'Pharmaciens',       value: pharmacistList.length },
    { icon: '📋',    label: 'Dossiers total',    value: qs.length },
    { icon: '⏳',    label: 'En attente',         value: qs.filter(q => q.status === 'pending').length },
    { icon: '✅',    label: 'Approuvés',          value: qs.filter(q => q.status === 'approved').length },
    { icon: '📅',    label: 'Aujourd\'hui',       value: qs.filter(q => new Date(q.createdAt).toDateString() === new Date().toDateString()).length },
  ]

  return (
    <Layout variant="ips">
      <div className="ips-layout">

        <div className="ips-header">
          <div>
            <h1>Tableau de bord Admin</h1>
            <p className="ips-date">Bienvenue, {user.prenom} {user.nom}</p>
          </div>
          <div className="admin-badge">⚙ Administrateur système</div>
        </div>

        {/* Notification ajout */}
        {lastAdded && (
          <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <strong>✓ {lastAdded.prenom} {lastAdded.nom} ajouté(e) avec succès.</strong>
              <br />
              <span style={{ fontSize: '0.87rem' }}>
                Courriel : <strong>{lastAdded.email}</strong> · Mot de passe temporaire : <strong>demo123</strong>
              </span>
              <br />
              <span style={{ fontSize: '0.82rem', color: '#166534' }}>
                📧 Un courriel de bienvenue avec les identifiants de connexion a été envoyé automatiquement.
              </span>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLastAdded(null)}>✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="tab-nav">
          {([
            { id: 'overview',    label: '📊 Vue d\'ensemble' },
            { id: 'ips',         label: `🧑‍⚕️ IPS (${ipsList.length})` },
            { id: 'pharmacists', label: `💊 Pharmaciens (${pharmacistList.length})` },
          ] as { id: Tab; label: string }[]).map(t => (
            <button key={t.id} type="button" className={`tab-btn ${tab === t.id ? 'tab-active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {stats.map(s => (
                <div key={s.label} className="stat-card stat-primary">
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-number">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="admin-quick-actions">
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧑‍⚕️</div>
                <h3>Ajouter un IPS</h3>
                <p style={{ color: 'var(--gray-500)', margin: '0.4rem 0 1rem', fontSize: '0.88rem' }}>Générer les identifiants et envoyer l'invitation par courriel.</p>
                <button type="button" className="btn btn-primary" onClick={() => { setShowForm('ips'); setTab('ips') }}>+ Ajouter un IPS</button>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💊</div>
                <h3>Ajouter un pharmacien</h3>
                <p style={{ color: 'var(--gray-500)', margin: '0.4rem 0 1rem', fontSize: '0.88rem' }}>Intégrer une pharmacie partenaire au réseau Anne.</p>
                <button type="button" className="btn btn-primary" onClick={() => { setShowForm('pharmacist'); setTab('pharmacists') }}>+ Ajouter un pharmacien</button>
              </div>
            </div>
          </div>
        )}

        {/* IPS */}
        {tab === 'ips' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button type="button" className="btn btn-primary" onClick={() => setShowForm('ips')}>+ Ajouter un IPS</button>
            </div>
            {showForm === 'ips' && (
              <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>Nouvel IPS</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prénom *</label>
                    <input className="form-control" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} placeholder="Julie" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input className="form-control" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Martin" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Spécialisation</label>
                  <input className="form-control" value={form.specialisation} onChange={e => setForm(f => ({ ...f, specialisation: e.target.value }))} placeholder="Médecine générale & thérapeutique" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input className="form-control" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} placeholder="514-555-0000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">No de licence</label>
                    <input className="form-control" value={form.licenceNumber} onChange={e => setForm(f => ({ ...f, licenceNumber: e.target.value }))} placeholder="IPS-2024-XXXX" />
                  </div>
                </div>
                {formError && <div className="alert alert-danger">⚠ {formError}</div>}
                <div className="alert alert-info" style={{ fontSize: '0.84rem' }}>
                  📧 Un courriel @anne.ca sera généré automatiquement · Mot de passe temporaire : <strong>demo123</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(null); setFormError('') }}>Annuler</button>
                  <button type="button" className="btn btn-primary" onClick={handleAdd}>✓ Créer & envoyer l'invitation</button>
                </div>
              </div>
            )}
            <StaffTable staff={ipsList} onRemove={handleRemove} type="ips" />
          </div>
        )}

        {/* Pharmacists */}
        {tab === 'pharmacists' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button type="button" className="btn btn-primary" onClick={() => setShowForm('pharmacist')}>+ Ajouter un pharmacien</button>
            </div>
            {showForm === 'pharmacist' && (
              <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>Nouveau pharmacien</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prénom *</label>
                    <input className="form-control" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} placeholder="Marc" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input className="form-control" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Beaupré" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Nom de la pharmacie *</label>
                  <input className="form-control" value={form.pharmacyName} onChange={e => setForm(f => ({ ...f, pharmacyName: e.target.value }))} placeholder="Pharmacie Santé Plus" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input className="form-control" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} placeholder="514-555-0000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">No de licence</label>
                    <input className="form-control" value={form.licenceNumber} onChange={e => setForm(f => ({ ...f, licenceNumber: e.target.value }))} placeholder="PH-2024-XXXX" />
                  </div>
                </div>
                {formError && <div className="alert alert-danger">⚠ {formError}</div>}
                <div className="alert alert-info" style={{ fontSize: '0.84rem' }}>
                  📧 Un courriel @anne.ca sera généré automatiquement · Mot de passe temporaire : <strong>demo123</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(null); setFormError('') }}>Annuler</button>
                  <button type="button" className="btn btn-primary" onClick={handleAdd}>✓ Créer & envoyer l'invitation</button>
                </div>
              </div>
            )}
            <StaffTable staff={pharmacistList} onRemove={handleRemove} type="pharmacist" />
          </div>
        )}
      </div>
    </Layout>
  )
}

function StaffTable({ staff, onRemove, type }: { staff: User[]; onRemove: (id: string) => void; type: 'ips' | 'pharmacist' }) {
  if (staff.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{type === 'ips' ? '🧑‍⚕️' : '💊'}</div>
        <p>Aucun {type === 'ips' ? 'IPS' : 'pharmacien'} dans le système.</p>
      </div>
    )
  }
  return (
    <div className="patient-list">
      {staff.map(s => (
        <div key={s.id} className="patient-card">
          <div className="patient-avatar-lg avatar-approved">
            {s.prenom[0]}{s.nom[0]}
          </div>
          <div className="patient-info-col">
            <div className="patient-name-row">
              <strong className="patient-fullname">{s.prenom} {s.nom}</strong>
              <span className={`badge ${type === 'ips' ? 'badge-approved' : 'badge-pending'}`}>
                {type === 'ips' ? 'IPS' : 'Pharmacien'}
              </span>
            </div>
            <p className="patient-email-sm">{s.email}</p>
            <div className="patient-tags">
              {s.specialisation && <span className="risk-tag risk-chronic">{s.specialisation}</span>}
              {s.pharmacyName && <span className="risk-tag risk-chronic">{s.pharmacyName}</span>}
              {s.licenceNumber && <span className="risk-tag" style={{ background: '#f1f5f9', color: 'var(--gray-600)' }}>{s.licenceNumber}</span>}
              {s.telephone && <span className="tag-time">{s.telephone}</span>}
            </div>
          </div>
          <div className="patient-actions-col">
            <button type="button" className="btn btn-danger btn-sm" onClick={() => onRemove(s.id)}>Retirer</button>
            <p className="urgency-note" style={{ color: 'var(--gray-400)' }}>Depuis {new Date(s.createdAt).toLocaleDateString('fr-CA')}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
