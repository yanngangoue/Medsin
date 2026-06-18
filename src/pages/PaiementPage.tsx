import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { completePayment, getCurrentUser } from '../api/mockApi'
import Layout from '../components/Layout'

const PRIX_CONSULTATION = 45.0
const PRIX_TRAITEMENT = 35.0
const TOTAL = PRIX_CONSULTATION + PRIX_TRAITEMENT

function formatCAD(amount: number) {
  return amount.toFixed(2).replace('.', ',') + ' $'
}

export default function PaiementPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paid = searchParams.get('paid') === '1'
  const user = getCurrentUser()

  const [form, setForm] = useState({ titulaire: '', numero: '', expiration: '', cvv: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiration(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.titulaire.trim()) e.titulaire = 'Requis'
    if (form.numero.replace(/\s/g, '').length < 16) e.numero = 'Numéro de carte invalide'
    if (form.expiration.length < 5) e.expiration = 'Date invalide'
    if (form.cvv.length < 3) e.cvv = 'CVV invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setProcessing(true)
    setTimeout(() => {
      completePayment()
      navigate('/paiement?paid=1')
    }, 1500)
  }

  if (paid) {
    const ref = 'MED-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    return (
      <Layout>
        <div className="page-center">
          <div className="card text-center" style={{ maxWidth: 520 }}>
            <div className="result-icon success">✓</div>
            <h1>Paiement réussi!</h1>
            <p className="result-desc">
              Merci pour votre paiement de <strong>{formatCAD(TOTAL)}</strong>.
              Votre ordonnance a été transmise à la pharmacie partenaire.
            </p>
            <div className="receipt-card">
              <div className="receipt-row">
                <span>Référence</span>
                <span className="receipt-value">{ref}</span>
              </div>
              <div className="receipt-row">
                <span>Date</span>
                <span className="receipt-value">{new Date().toLocaleDateString('fr-CA', { dateStyle: 'long' })}</span>
              </div>
              <div className="receipt-row">
                <span>Montant payé</span>
                <span className="receipt-value">{formatCAD(TOTAL)}</span>
              </div>
              <div className="receipt-row">
                <span>Patient</span>
                <span className="receipt-value">{user ? `${user.prenom} ${user.nom}` : '—'}</span>
              </div>
            </div>
            <div className="alert alert-success">
              Un courriel de confirmation vous a été envoyé. Votre médicament sera disponible à la pharmacie sous 24-48h.
            </div>
            <button type="button" className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/dashboard/patient')}>
              Aller à mon tableau de bord →
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="page-center" style={{ alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Summary */}
        <div className="card" style={{ flex: '1 1 280px', maxWidth: 340 }}>
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Résumé de votre consultation</h2>
          <div className="price-row">
            <span>Consultation médicale en ligne</span>
            <span>{formatCAD(PRIX_CONSULTATION)}</span>
          </div>
          <div className="price-row">
            <span>Traitement prescrit</span>
            <span>{formatCAD(PRIX_TRAITEMENT)}</span>
          </div>
          <div className="price-divider" />
          <div className="price-row total">
            <span>Total</span>
            <span>{formatCAD(TOTAL)}</span>
          </div>
          <div className="secure-badge">
            <span>🔒</span>
            <span>Paiement sécurisé par chiffrement SSL</span>
          </div>
        </div>

        {/* Payment form */}
        <div className="card" style={{ flex: '1 1 320px', maxWidth: 460 }}>
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Informations de paiement</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Titulaire de la carte *</label>
              <input
                type="text"
                className={`form-control ${errors.titulaire ? 'error' : ''}`}
                value={form.titulaire}
                onChange={e => update('titulaire', e.target.value)}
                placeholder="Marie Tremblay"
                autoComplete="cc-name"
              />
              {errors.titulaire && <span className="form-error">{errors.titulaire}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Numéro de carte *</label>
              <input
                type="text"
                className={`form-control ${errors.numero ? 'error' : ''}`}
                value={form.numero}
                onChange={e => update('numero', formatCardNumber(e.target.value))}
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                autoComplete="cc-number"
              />
              {errors.numero && <span className="form-error">{errors.numero}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Expiration *</label>
                <input
                  type="text"
                  className={`form-control ${errors.expiration ? 'error' : ''}`}
                  value={form.expiration}
                  onChange={e => update('expiration', formatExpiration(e.target.value))}
                  placeholder="MM/AA"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
                {errors.expiration && <span className="form-error">{errors.expiration}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">CVV *</label>
                <input
                  type="text"
                  className={`form-control ${errors.cvv ? 'error' : ''}`}
                  value={form.cvv}
                  onChange={e => update('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
                {errors.cvv && <span className="form-error">{errors.cvv}</span>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={processing}>
              {processing ? '⏳ Traitement en cours...' : `Payer ${formatCAD(TOTAL)}`}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.75rem' }}>
              Ceci est une simulation. Aucun montant réel ne sera débité.
            </p>
          </form>
        </div>
      </div>
    </Layout>
  )
}
