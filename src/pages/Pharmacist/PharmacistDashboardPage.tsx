import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, getPharmacistQuestionnaires, updateDeliveryStatus } from '../../api/mockApi'
import type { Questionnaire, DeliveryStatus } from '../../types'
import Layout from '../../components/Layout'

const DELIVERY_STEPS: { status: DeliveryStatus; label: string; icon: string }[] = [
  { status: 'received',  label: 'Reçue',         icon: '📥' },
  { status: 'preparing', label: 'En préparation', icon: '⚗' },
  { status: 'ready',     label: 'Prête',          icon: '✅' },
  { status: 'shipped',   label: 'Expédiée',       icon: '🚚' },
  { status: 'delivered', label: 'Livrée',         icon: '🏠' },
]

const ORDER: DeliveryStatus[] = ['received', 'preparing', 'ready', 'shipped', 'delivered']

export default function PharmacistDashboardPage() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [qs, setQs] = useState<Questionnaire[]>(() => getPharmacistQuestionnaires())
  const [updating, setUpdating] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [done, setDone] = useState<string[]>([])

  if (!user || user.role !== 'pharmacist') {
    return (
      <Layout variant="ips">
        <div className="page-center">
          <div className="card text-center" style={{ maxWidth: 420 }}>
            <h2>Accès réservé aux pharmaciens</h2>
            <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/auth/pharmacien')}>Se connecter</button>
          </div>
        </div>
      </Layout>
    )
  }

  function nextStatus(current: DeliveryStatus): DeliveryStatus | null {
    const idx = ORDER.indexOf(current)
    return idx < ORDER.length - 1 ? ORDER[idx + 1] : null
  }

  function handleAdvance(q: Questionnaire) {
    if (!q.delivery) return
    const next = nextStatus(q.delivery.status)
    if (!next) return
    updateDeliveryStatus(q.id, next, note || undefined)
    setQs(getPharmacistQuestionnaires())
    if (next === 'delivered') setDone(prev => [...prev, q.id])
    setUpdating(null)
    setNote('')
  }

  const pending   = qs.filter(q => q.delivery?.status !== 'delivered')
  const delivered = qs.filter(q => q.delivery?.status === 'delivered')

  function statusIdx(s: DeliveryStatus) { return ORDER.indexOf(s) }

  return (
    <Layout variant="ips">
      <div className="ips-layout">
        <div className="ips-header">
          <div>
            <h1>Gestion des ordonnances</h1>
            <p className="ips-date">{user.pharmacyName} · {user.prenom} {user.nom}</p>
          </div>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 0 }}>
            <div className="stat-card stat-warning"><div className="stat-icon">⏳</div><div className="stat-number">{pending.length}</div><div className="stat-label">En cours</div></div>
            <div className="stat-card stat-success"><div className="stat-icon">✅</div><div className="stat-number">{delivered.length}</div><div className="stat-label">Livrées</div></div>
            <div className="stat-card stat-primary"><div className="stat-icon">📋</div><div className="stat-number">{qs.length}</div><div className="stat-label">Total</div></div>
          </div>
        </div>

        {qs.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💊</div>
            <p>Aucune ordonnance reçue pour l'instant.</p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--gray-800)' }}>
                  Ordonnances en cours
                </h2>
                <div className="patient-list" style={{ marginBottom: '2rem' }}>
                  {pending.map(q => {
                    const d = q.delivery!
                    const rx = q.prescription!
                    const si = statusIdx(d.status)
                    const next = nextStatus(d.status)
                    return (
                      <div key={q.id} className="patient-card">
                        <div className="patient-avatar-lg avatar-pending">
                          {q.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="patient-info-col">
                          <div className="patient-name-row">
                            <strong className="patient-fullname">{q.patientName}</strong>
                            <span className="badge badge-pending">{DELIVERY_STEPS[si]?.icon} {DELIVERY_STEPS[si]?.label}</span>
                          </div>
                          <p className="patient-email-sm">{q.patientEmail} · No {d.trackingNumber}</p>

                          {/* Médicaments */}
                          {rx.medications.map((m, i) => (
                            <div key={i} className="patient-tags" style={{ marginTop: i === 0 ? '0.4rem' : 0 }}>
                              <span className="risk-tag risk-chronic">💊 {m.name} {m.dosage}</span>
                              <span className="risk-tag" style={{ background: '#f1f5f9', color: 'var(--gray-600)' }}>{m.frequency}</span>
                              <span className="tag-time">{m.duration}</span>
                            </div>
                          ))}

                          {/* Progression */}
                          <div className="pharma-progress">
                            {DELIVERY_STEPS.map((step, i) => (
                              <div key={step.status} className={`pharma-step ${i <= si ? 'pharma-done' : ''}`}>
                                <div className="pharma-dot">{i <= si ? '✓' : i + 1}</div>
                                <span>{step.label}</span>
                              </div>
                            ))}
                          </div>

                          {/* Panel de mise à jour */}
                          {updating === q.id && next && (
                            <div className="pharma-update-panel">
                              <label className="form-label" style={{ fontSize: '0.82rem' }}>
                                Note (facultatif)
                              </label>
                              <input
                                className="form-control"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder={`Ex. : Médicament préparé, estimation livraison : ${d.estimatedDelivery}`}
                              />
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setUpdating(null)}>Annuler</button>
                                <button type="button" className="btn btn-success btn-sm" onClick={() => handleAdvance(q)}>
                                  ✓ Passer à : {DELIVERY_STEPS.find(s => s.status === next)?.label}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="patient-actions-col">
                          {next && updating !== q.id && (
                            <button type="button" className="btn btn-primary btn-sm" onClick={() => setUpdating(q.id)}>
                              Avancer → {DELIVERY_STEPS.find(s => s.status === next)?.label}
                            </button>
                          )}
                          <p className="urgency-note">Livraison prévue : {d.estimatedDelivery}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {delivered.length > 0 && (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--gray-800)' }}>
                  Ordonnances livrées
                </h2>
                <div className="patient-list">
                  {delivered.map(q => (
                    <div key={q.id} className="patient-card" style={{ opacity: 0.8 }}>
                      <div className="patient-avatar-lg avatar-approved">
                        {q.patientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="patient-info-col">
                        <div className="patient-name-row">
                          <strong className="patient-fullname">{q.patientName}</strong>
                          <span className="badge badge-approved">✓ Livrée</span>
                        </div>
                        <p className="patient-email-sm">{q.patientEmail} · No {q.delivery?.trackingNumber}</p>
                        {q.prescription?.medications.map((m, i) => (
                          <span key={i} className="risk-tag risk-chronic" style={{ marginTop: '0.4rem', display: 'inline-block' }}>
                            💊 {m.name} {m.dosage}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
