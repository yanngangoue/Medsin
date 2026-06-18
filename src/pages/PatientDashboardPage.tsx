import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import {
  getCurrentUser, getQuestionnaireById, getCurrentQuestionnaireId,
  getPaymentStatus,
} from '../api/mockApi'
import type { DeliveryStatus } from '../types'
import Layout from '../components/Layout'

/* ── Constants ───────────────────────────────────────────── */
const SUIVI_STEPS = [
  { key: 'submitted',  label: 'Questionnaire soumis',  icon: '📋', done: () => true },
  { key: 'anna',       label: 'Analyse par Anne IA',    icon: '🤖', done: () => true },
  { key: 'reviewed',   label: 'Examiné par votre IPS',  icon: '👩‍⚕️', done: (q: ReturnType<typeof getQuestionnaireById>) => !!q?.reviewedAt },
  { key: 'payment',    label: 'Paiement effectué',      icon: '💳', done: () => getPaymentStatus() === 'completed' },
  { key: 'pharmacy',   label: 'Envoyé à la pharmacie',  icon: '💊', done: (q: ReturnType<typeof getQuestionnaireById>) => !!q?.prescription?.sentToPharmacy },
]

const DELIVERY_STEPS: { status: DeliveryStatus; label: string; icon: string }[] = [
  { status: 'received',  label: 'Ordonnance reçue',  icon: '📥' },
  { status: 'preparing', label: 'En préparation',    icon: '⚗' },
  { status: 'ready',     label: 'Prête',             icon: '✅' },
  { status: 'shipped',   label: 'En livraison',      icon: '🚚' },
  { status: 'delivered', label: 'Livrée',            icon: '🏠' },
]
const DELIVERY_ORDER: DeliveryStatus[] = ['received','preparing','ready','shipped','delivered']

const FAQ = [
  { q: 'Combien de temps pour une réponse de mon IPS?', r: 'Nous nous engageons à examiner votre dossier en moins de 24 heures ouvrables. Vous serez notifié dès qu\'une décision est prise.' },
  { q: 'Ma prescription est-elle valide en pharmacie?', r: 'Oui — toutes les ordonnances de nos IPS sont légalement valides au Québec et transmises électroniquement à la pharmacie partenaire.' },
  { q: 'Comment modifier mes informations médicales?', r: 'Contactez votre IPS via la messagerie. Pour une nouvelle consultation, vous devrez soumettre un nouveau questionnaire.' },
  { q: 'Le service est-il couvert par l\'assurance?', r: 'Certains régimes couvrent les consultations virtuelles. Nous fournissons un reçu officiel soumissible à votre assureur.' },
]

type Tab = 'suivi' | 'ordonnance' | 'livraison' | 'guide'

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <Layout>
      <div className="pd-empty">
        <div className="pd-empty-inner">
          <div className="pd-empty-icon">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <rect width="52" height="52" rx="16" fill="#ede9fe"/>
              <path d="M18 36L26 18L34 36M22 30h8" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Aucun questionnaire soumis</h2>
          <p>Commencez par remplir votre questionnaire médical pour accéder à votre espace patient.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/questionnaire')}>
            Remplir le questionnaire →
          </button>
          <Link to="/guide-nutritionnel" className="pd-empty-guide">Consulter le guide santé gratuit</Link>
        </div>
      </div>
    </Layout>
  )
}

/* ─────────────────────────────────────────────────────────── */
export default function PatientDashboardPage() {
  const navigate   = useNavigate()
  const user       = getCurrentUser()
  const qId        = getCurrentQuestionnaireId()
  const q          = qId ? getQuestionnaireById(qId) : null
  const [tab, setTab]         = useState<Tab>('suivi')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (!user) return <Navigate to="/imc" replace />
  if (!q)    return <EmptyState navigate={navigate} />

  const isPending   = q.status === 'pending'
  const isApproved  = q.status === 'approved'
  const isRejected  = q.status === 'rejected'
  const paid        = getPaymentStatus() === 'completed'
  const rx          = q.prescription
  const delivery    = q.delivery
  const deliveryIdx = delivery ? DELIVERY_ORDER.indexOf(delivery.status) : -1

  const imc = q.answers.poids && q.answers.taille
    ? (parseFloat(q.answers.poids) / ((parseFloat(q.answers.taille) / 100) ** 2)).toFixed(1)
    : null

  /* Status meta */
  const statusMeta = isPending
    ? { label: 'En cours d\'examen', cls: 'pd-status-pending', msg: 'Votre IPS examine votre dossier. Délai habituel : moins de 24h.' }
    : isApproved && !paid
    ? { label: 'Approuvé — paiement requis', cls: 'pd-status-pay', msg: 'Votre ordonnance est prête. Activez la livraison en effectuant le paiement.' }
    : isApproved && paid
    ? { label: 'En traitement', cls: 'pd-status-active', msg: 'Votre ordonnance a été envoyée à la pharmacie. Suivez la livraison ci-dessous.' }
    : { label: 'Dossier évalué', cls: 'pd-status-rejected', msg: 'Votre IPS a évalué votre dossier. Consultez ses notes ci-dessous.' }

  return (
    <Layout>
      <div className="pd-page">

        {/* ── Status Banner ─────────────────────────────────── */}
        <div className={`pd-banner ${statusMeta.cls}`}>
          <div className="pd-banner-inner">
            <div className="pd-banner-left">
              <div className="pd-av">{user.prenom[0]}{user.nom[0]}</div>
              <div>
                <div className="pd-banner-greeting">Bonjour, {user.prenom}</div>
                <div className="pd-banner-msg">{statusMeta.msg}</div>
              </div>
            </div>
            <span className="pd-banner-badge">{statusMeta.label}</span>
          </div>
        </div>

        {/* ── Layout ─────────────────────────────────────────── */}
        <div className="pd-layout">

          {/* SIDEBAR */}
          <aside className="pd-sidebar">
            <nav className="pd-nav">
              {([
                { id: 'suivi',      label: 'Mon suivi',      icon: '📊', always: true },
                { id: 'ordonnance', label: 'Ordonnance',      icon: '📄', show: isApproved && !!rx },
                { id: 'livraison',  label: 'Livraison',       icon: '📦', show: isApproved && paid && !!delivery },
                { id: 'guide',      label: 'Guide santé',     icon: '🌿', always: true },
              ] as const).filter(t => t.always || (t as {show?: boolean}).show).map(t => (
                <button
                  key={t.id}
                  className={`pd-nav-btn${tab === t.id ? ' active' : ''}`}
                  onClick={() => setTab(t.id as Tab)}
                >
                  <span className="pd-nav-icon">{t.icon}</span>
                  {t.label}
                  {t.id === 'livraison' && deliveryIdx >= 0 && deliveryIdx < 4 && (
                    <span className="pd-nav-dot" />
                  )}
                </button>
              ))}
              <div className="pd-nav-sep" />
              <Link to="/messagerie" className="pd-nav-btn pd-nav-link">
                <span className="pd-nav-icon">💬</span>
                Messagerie Anne
              </Link>
            </nav>

            {/* Anne AI card */}
            <div className="pd-anne-card">
              <div className="pd-anne-head">
                <div className="pd-anne-av">A</div>
                <div>
                  <div className="pd-anne-name">Anne IA</div>
                  <div className="pd-anne-sub">Assistante santé</div>
                </div>
                <span className="pd-anne-live" />
              </div>
              <p className="pd-anne-msg">
                {isPending && 'J\'ai analysé votre dossier et l\'ai transmis à votre IPS. Je vous tiendrai informé(e) dès qu\'une décision est prise.'}
                {isApproved && !paid && 'Votre IPS a approuvé votre traitement. Activez la livraison pour commencer votre programme.'}
                {isApproved && paid && 'Votre traitement est lancé ! Je surveille vos données et serai là pour répondre à vos questions.'}
                {isRejected && 'Votre IPS recommande une consultation en personne. Je reste disponible pour vous aider à naviguer les prochaines étapes.'}
              </p>
              <Link to="/messagerie" className="pd-anne-cta">Ouvrir la messagerie →</Link>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="pd-main">

            {/* ── Mon suivi ───────────────────────────────── */}
            {tab === 'suivi' && (
              <div className="pd-section">

                {/* CTA urgent si paiement requis */}
                {isApproved && !paid && (
                  <div className="pd-cta-card pd-cta-pay">
                    <div className="pd-cta-body">
                      <span className="pd-cta-emoji">💳</span>
                      <div>
                        <strong>Ordonnance prête — activez votre traitement</strong>
                        <p>Votre IPS a approuvé votre dossier. Payez maintenant pour débuter la livraison.</p>
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/paiement')}>
                      Payer et activer →
                    </button>
                  </div>
                )}

                {isRejected && (
                  <div className="pd-cta-card pd-cta-info">
                    <div className="pd-cta-body">
                      <span className="pd-cta-emoji">🏥</span>
                      <div>
                        <strong>Consultation en personne recommandée</strong>
                        <p>Votre IPS a jugé qu'une évaluation médicale directe serait plus appropriée.</p>
                      </div>
                    </div>
                    <Link to="/messagerie" className="btn btn-outline">Contacter mon IPS</Link>
                  </div>
                )}

                <div className="pd-cards-row">
                  {/* Timeline progression */}
                  <div className="pd-card pd-card-lg">
                    <div className="pd-card-title">Progression de votre dossier</div>
                    <div className="pd-timeline">
                      {SUIVI_STEPS.map((step, i) => {
                        const done     = step.done(q)
                        const isActive = !done && SUIVI_STEPS.slice(0, i).every(s => s.done(q))
                        return (
                          <div key={step.key} className={`pd-tl-item${done?' pd-tl-done':isActive?' pd-tl-active':''}`}>
                            <div className="pd-tl-track">
                              <div className="pd-tl-dot">{done ? '✓' : step.icon}</div>
                              {i < SUIVI_STEPS.length - 1 && <div className="pd-tl-line" />}
                            </div>
                            <div className="pd-tl-body">
                              <div className="pd-tl-label">{step.label}</div>
                              {done     && <div className="pd-tl-sub pd-tl-sub-done">Complété</div>}
                              {isActive && <div className="pd-tl-sub pd-tl-sub-active">En cours…</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Note IPS */}
                    {q.ipsNotes && (
                      <div className="pd-ips-note">
                        <div className="pd-ips-note-head">
                          <span>👩‍⚕️ Note de {q.ipsName || 'votre IPS'}</span>
                        </div>
                        <p>{q.ipsNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Profil card */}
                  <div className="pd-card">
                    <div className="pd-card-title">Mon profil</div>
                    <div className="pd-profile">
                      <div className="pd-profile-av">{user.prenom[0]}{user.nom[0]}</div>
                      <div className="pd-profile-name">{user.prenom} {user.nom}</div>
                      <div className="pd-profile-email">{user.email}</div>
                    </div>
                    <div className="pd-fields">
                      {[
                        { k: 'Téléphone', v: user.telephone || '—' },
                        { k: 'Soumis le', v: new Date(q.createdAt).toLocaleDateString('fr-CA', { dateStyle: 'long' }) },
                        imc ? { k: 'IMC', v: `${imc} kg/m²` } : null,
                        { k: 'Motif', v: (q.answers.motif || '').slice(0, 55) + (q.answers.motif?.length > 55 ? '…' : '') },
                      ].filter(Boolean).map(f => f && (
                        <div key={f.k} className="pd-field">
                          <span className="pd-field-k">{f.k}</span>
                          <span className="pd-field-v">{f.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Ordonnance ──────────────────────────────── */}
            {tab === 'ordonnance' && rx && (
              <div className="pd-section">
                <div className="rx-wrap">
                  <div className="prescription-card">
                    <div className="rx-header">
                      <div className="rx-logo">
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                          <rect width="32" height="32" rx="9" fill="url(#rx-grad)"/>
                          <defs><linearGradient id="rx-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#4f46e5"/><stop offset="1" stopColor="#7c3aed"/></linearGradient></defs>
                          <path d="M10 22L16 10L22 22M13 18h6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Anne Santé</span>
                      </div>
                      {rx.sentToPharmacy && (
                        <div className="rx-stamp">✓ Envoyée à la pharmacie</div>
                      )}
                    </div>
                    <div className="rx-divider" />
                    <div className="rx-parties">
                      {[
                        { label: 'PATIENT',           name: rx.patientName,  sub: rx.patientEmail },
                        { label: 'IPS PRESCRIPTEUR',  name: rx.ipsName,      sub: 'Infirmière Praticienne Spécialisée' },
                        { label: 'PHARMACIE',         name: rx.pharmacyName, sub: `Valide jusqu'au ${new Date(rx.validUntil).toLocaleDateString('fr-CA')}` },
                      ].map(p => (
                        <div key={p.label} className="rx-party">
                          <div className="rx-party-label">{p.label}</div>
                          <div className="rx-party-name">{p.name}</div>
                          <div className="rx-party-sub">{p.sub}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rx-divider" />
                    <div className="rx-body">
                      <div className="rx-symbol">℞</div>
                      <div className="rx-meds">
                        {rx.medications.map((med, i) => (
                          <div key={i} className="rx-med-row">
                            <div className="rx-med-name">{med.name}</div>
                            <div className="rx-med-details">
                              {med.dosage   && <span>Dosage : {med.dosage}</span>}
                              {med.frequency && <span>Fréquence : {med.frequency}</span>}
                              {med.duration  && <span>Durée : {med.duration}</span>}
                            </div>
                            {med.notes && <div className="rx-med-note">Note : {med.notes}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                    {rx.instructions && (
                      <>
                        <div className="rx-divider" />
                        <div className="rx-instructions">
                          <strong>Instructions : </strong>{rx.instructions}
                        </div>
                      </>
                    )}
                    <div className="rx-divider" />
                    <div className="rx-footer">
                      <div className="rx-footer-col">
                        <div className="rx-footer-label">Date d'émission</div>
                        <div className="rx-footer-val">{new Date(rx.createdAt).toLocaleDateString('fr-CA', { dateStyle: 'long' })}</div>
                      </div>
                      <div className="rx-footer-col">
                        <div className="rx-footer-label">Renouvellements</div>
                        <div className="rx-footer-val">{rx.refills}</div>
                      </div>
                      <div className="rx-footer-col rx-signature">
                        <div className="rx-sig-line" />
                        <div className="rx-footer-label">{rx.ipsName}, IPS</div>
                      </div>
                    </div>
                  </div>
                  <div className="rx-actions">
                    <button className="btn btn-outline" onClick={() => window.print()}>🖨 Imprimer</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Livraison ───────────────────────────────── */}
            {tab === 'livraison' && delivery && (
              <div className="pd-section">
                <div className="pd-card">
                  <div className="pd-delivery-head">
                    <div>
                      <div className="pd-card-title">Suivi de livraison</div>
                      <div className="pd-delivery-no">N° {delivery.trackingNumber}</div>
                    </div>
                    <div className="pd-delivery-info">
                      <div>📦 {delivery.pharmacyName}</div>
                      <div>Livraison est. : {delivery.estimatedDelivery}</div>
                    </div>
                  </div>

                  <div className="pd-delivery-steps">
                    {DELIVERY_STEPS.map((step, i) => {
                      const done      = i <= deliveryIdx
                      const isCurrent = i === deliveryIdx
                      return (
                        <div key={step.status} className={`pd-ds${done?' pd-ds-done':''}${isCurrent?' pd-ds-current':''}`}>
                          <div className="pd-ds-dot">{done ? (isCurrent ? step.icon : '✓') : ''}</div>
                          {i < DELIVERY_STEPS.length - 1 && <div className="pd-ds-line" />}
                          <div className="pd-ds-label">{step.label}</div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="pd-delivery-history">
                    <div className="pd-delivery-history-title">Historique</div>
                    {[...delivery.history].reverse().map((ev, i) => (
                      <div key={i} className="pd-ev">
                        <span className="pd-ev-icon">{DELIVERY_STEPS.find(s => s.status === ev.status)?.icon}</span>
                        <div className="pd-ev-body">
                          <strong>{ev.label}</strong>
                          {ev.note && <p>{ev.note}</p>}
                          <span className="pd-ev-time">
                            {new Date(ev.timestamp).toLocaleDateString('fr-CA', { dateStyle: 'medium' })} à {new Date(ev.timestamp).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Guide santé ─────────────────────────────── */}
            {tab === 'guide' && (
              <div className="pd-section">
                <div className="pd-guide-hero">
                  <div className="pd-guide-hero-body">
                    <h2>Guide nutritionnel & bien-être</h2>
                    <p>Conseils fondés sur les données probantes, rédigés par notre équipe d'IPS certifiées.</p>
                    <Link to="/guide-nutritionnel" className="btn btn-primary">Consulter le guide complet →</Link>
                  </div>
                </div>

                <div className="pd-guide-grid">
                  {[
                    { icon: '🥗', title: 'Alimentation',    text: 'Composez des repas variés et riches en nutriments essentiels.' },
                    { icon: '💧', title: 'Hydratation',      text: 'Visez 2 à 2,5 litres d\'eau par jour, plus si vous êtes actif.' },
                    { icon: '🏃', title: 'Activité physique',text: '150 minutes d\'activité modérée par semaine selon l\'OMS.' },
                    { icon: '😴', title: 'Sommeil',          text: '7 à 9 heures par nuit à heure régulière pour votre santé.' },
                    { icon: '🧘', title: 'Gestion du stress',text: 'Méditation, respiration, connexions sociales — des outils gratuits.' },
                  ].map(item => (
                    <div key={item.title} className="pd-guide-card">
                      <span className="pd-guide-icon">{item.icon}</span>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="pd-faq">
                  <div className="pd-card-title" style={{ marginBottom: '1rem' }}>Questions fréquentes</div>
                  {FAQ.map((item, i) => (
                    <div key={i} className="pd-faq-item">
                      <button className="pd-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                        {item.q}
                        <span className={`pd-faq-chevron${openFaq === i ? ' open' : ''}`}>›</span>
                      </button>
                      {openFaq === i && <div className="pd-faq-a">{item.r}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </Layout>
  )
}
