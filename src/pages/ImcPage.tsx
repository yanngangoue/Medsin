import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveBMI } from '../api/mockApi'
import type { BMIResult, BMICategory } from '../types'
import Layout from '../components/Layout'

/* ─── IMC ────────────────────────────────────────────────── */
interface BMIInfo { label: string; color: string; bg: string; border: string }
const BMI_INFO: Record<BMICategory, BMIInfo> = {
  insuffisance: { label: 'Insuffisance pondérale', color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' },
  normal:       { label: 'Poids santé',            color: '#15803d', bg: '#dcfce7', border: '#86efac' },
  surpoids:     { label: 'Surpoids',               color: '#b45309', bg: '#fef3c7', border: '#fcd34d' },
  obese_1:      { label: 'Obésité modérée',        color: '#c2410c', bg: '#ffedd5', border: '#fdba74' },
  obese_2:      { label: 'Obésité sévère',         color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' },
}
function getCategory(imc: number): BMICategory {
  if (imc < 18.5) return 'insuffisance'
  if (imc < 25)   return 'normal'
  if (imc < 30)   return 'surpoids'
  if (imc < 35)   return 'obese_1'
  return 'obese_2'
}

/* ─── Hooks ──────────────────────────────────────────────── */
function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, on }
}

function useCounter(target: number, duration = 1600) {
  const [count, setCount] = useState(0)
  const [go, setGo]       = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGo(true) }, { threshold: 0.5 })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!go) return
    let s = 0; const step = target / (duration / 16)
    const id = setInterval(() => {
      s += step
      if (s >= target) { setCount(target); clearInterval(id) } else setCount(Math.floor(s))
    }, 16)
    return () => clearInterval(id)
  }, [go, target, duration])
  return { count, ref }
}

/* Mouse parallax for hero cards */
function useMouseParallax() {
  const heroRef = useRef<HTMLElement>(null)
  const [mx, setMx] = useState(0)
  const [my, setMy] = useState(0)
  const onMove = useCallback((e: MouseEvent) => {
    const el = heroRef.current; if (!el) return
    const r = el.getBoundingClientRect()
    setMx((e.clientX - r.left - r.width  / 2) / r.width)
    setMy((e.clientY - r.top  - r.height / 2) / r.height)
  }, [])
  useEffect(() => {
    const el = heroRef.current; if (!el) return
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [onMove])
  return { heroRef, mx, my }
}

/* Typewriter */
function useTypewriter(text: string, speed = 55, startDelay = 900) {
  const [out, setOut] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    let i = 0
    const t0 = setTimeout(() => {
      const id = setInterval(() => {
        if (i >= text.length) { setDone(true); clearInterval(id); return }
        setOut(text.slice(0, ++i))
      }, speed)
      return () => clearInterval(id)
    }, startDelay)
    return () => clearTimeout(t0)
  }, [text, speed, startDelay])
  return { out, done }
}

/* Parallax scroll */
function useParallax(factor = 0.12) {
  const [y, setY] = useState(0)
  useEffect(() => {
    const fn = () => setY(window.scrollY * factor)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [factor])
  return y
}

/* ─── Data ───────────────────────────────────────────────── */
const MEDS = [
  { name: 'Ozempic®',  mol: 'Sémaglutide 0.5–1 mg',  pct: '−8 à −12%', badge: 'Prescrit le plus souvent', desc: "Le GLP-1 hebdomadaire de référence au Québec. Approuvé, bien toléré et efficace sur le contrôle du poids.", grad: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)', light: 'rgba(79,70,229,0.15)' },
  { name: 'Wegovy®',   mol: 'Sémaglutide 2.4 mg',     pct: '−12 à −15%', badge: 'Meilleurs résultats',      desc: "Dose haute spécifiquement approuvée pour la perte de poids. Perte moyenne en essais cliniques : 15 %.", grad: 'linear-gradient(135deg,#0d9488 0%,#0891b2 100%)', light: 'rgba(13,148,136,0.15)' },
  { name: 'Mounjaro®', mol: 'Tirzépatide',             pct: '−15 à −22%', badge: 'Le plus efficace',         desc: "Double agoniste GIP/GLP-1 nouvelle génération. Les essais SURMOUNT montrent jusqu'à 22 % de perte.", grad: 'linear-gradient(135deg,#7c3aed 0%,#ec4899 100%)', light: 'rgba(124,58,237,0.15)' },
]

const IPS_TEAM = [
  { name: 'Marie-Claude F.', loc: 'Québec',        exp: 12, tags: ['GLP-1','Télémédecine'],  quote: "Chaque dossier mérite une écoute attentive. Mon rôle : sécuriser le traitement.", img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=320&h=320&crop=faces&q=85', fb: 'https://picsum.photos/seed/ips1/320/320' },
  { name: 'Sophie B.',        loc: 'Montréal',     exp: 8,  tags: ['Obésité','Diabète T2'],  quote: "Le GLP-1 change la vie de beaucoup de patients. Je veille à chaque étape.",        img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=320&h=320&crop=faces&q=85', fb: 'https://picsum.photos/seed/ips2/320/320' },
  { name: 'Amélie T.',        loc: 'Laval',        exp: 6,  tags: ['Prévention','Primaires'], quote: "Disponible, claire et humaine à chaque consultation en ligne.",                    img: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=320&h=320&crop=faces&q=85', fb: 'https://picsum.photos/seed/ips3/320/320' },
  { name: 'Catherine L.',     loc: 'Sherbrooke',   exp: 10, tags: ['Endocrino','Suivi'],      quote: "Prescrire, suivre les effets et le moral — c'est tout le parcours Anne.",           img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=320&h=320&crop=faces&q=85', fb: 'https://picsum.photos/seed/ips4/320/320' },
  { name: 'Isaac R.',         loc: 'Gatineau',     exp: 9,  tags: ['GLP-1','Effets II°'],    quote: "Je suis là pour répondre sans jugement sur les effets secondaires.",                img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=320&h=320&crop=faces&q=85', fb: 'https://picsum.photos/seed/ips5/320/320' },
  { name: 'Véronique D.',     loc: 'Trois-Rivières', exp: 7, tags: ['Télémédecine','Adultes'], quote: "Le parcours en ligne doit rester humain. J'explique chaque décision.",           img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=320&h=320&crop=faces&q=85', fb: 'https://picsum.photos/seed/ips6/320/320' },
]

const STATS = [
  { val: 2400, suf: '+', label: 'Consultations' },
  { val: 98,   suf: '%', label: 'Satisfaction' },
  { val: 24,   suf: 'h', label: 'Délai max' },
  { val: 150,  suf: '+', label: 'IPS QC' },
]

const FEATURES = [
  { icon: '👩‍⚕️', title: '100% en ligne',           desc: 'Consultation complète depuis chez vous. Aucun déplacement.', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=85', fb: 'https://picsum.photos/seed/f1/500/340' },
  { icon: '💉', title: 'Traitement GLP-1',           desc: 'Prescrit par une IPS certifiée selon votre profil médical exact.', img: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=500&q=85', fb: 'https://picsum.photos/seed/f2/500/340' },
  { icon: '📦', title: 'Livraison en pharmacie',     desc: 'Ordonnance transmise directement à votre pharmacie partenaire.', img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=500&q=85', fb: 'https://picsum.photos/seed/f3/500/340' },
  { icon: '🤖', title: 'Anna, coach IA',             desc: 'Votre assistant IA vous suit chaque semaine. Disponible 24h/24.', img: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=500&q=85', fb: 'https://picsum.photos/seed/f4/500/340' },
]

/* ─── Sub-components ─────────────────────────────────────── */
function StatCard({ val, suf, label }: { val: number; suf: string; label: string }) {
  const { count, ref } = useCounter(val)
  return (
    <div ref={ref} className="hp-stat">
      <div className="hp-stat-val">{count.toLocaleString('fr-CA')}{suf}</div>
      <div className="hp-stat-lbl">{label}</div>
    </div>
  )
}

function MedCard({ med, idx, on }: { med: typeof MEDS[0]; idx: number; on: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 18
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 14
    el.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-6px)`
  }
  const onLeave = () => { if (cardRef.current) cardRef.current.style.transform = '' }
  return (
    <div
      ref={cardRef}
      className={`hp-med rv rv-up ${on ? 'on' : ''}`}
      style={{ transitionDelay: `${idx * 0.14}s`, transition: 'opacity .85s ease, transform .85s ease' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="hp-med-top" style={{ background: med.grad }}>
        <span className="hp-med-badge">{med.badge}</span>
        <div className="hp-med-name">{med.name}</div>
        <div className="hp-med-mol">{med.mol}</div>
        <div className="hp-med-pct">{med.pct} <span>du poids corporel</span></div>
        <div className="hp-med-shine" />
      </div>
      <div className="hp-med-body" style={{ background: `linear-gradient(135deg, ${med.light}, transparent)` }}>
        <p className="hp-med-desc">{med.desc}</p>
        <button className="hp-med-btn">Visite gratuite →</button>
      </div>
    </div>
  )
}

function DashboardCard() {
  const PTS = [210,205,199,194,191,188,184,181,178,176,174,172]
  const W=320, H=80, mn=160, mx=215
  const y = (v: number) => H - ((v-mn)/(mx-mn))*H
  const d = PTS.map((p,i)=>`${i===0?'M':'L'}${(i/(PTS.length-1))*W},${y(p)}`).join(' ')
  return (
    <div className="hp-db">
      <div className="hp-db-bar">
        <div className="hp-db-av">CG</div>
        <div><div className="hp-db-nm">Bonjour, Cédric</div><div className="hp-db-wk">Semaine 12 · Programme GLP-1</div></div>
        <span className="hp-db-status">En cours</span>
      </div>
      <div className="hp-db-kpis">
        {[{v:'−18,7 lb',l:'Poids perdu',c:'#22d3ee'},{v:'68%',l:'Objectif',c:'#a78bfa'},{v:'4,2/5',l:'Énergie',c:'#34d399'},{v:'Sem. 12',l:'Programme',c:'#fb923c'}].map(k=>(
          <div key={k.l} className="hp-db-kpi">
            <div className="hp-db-kv" style={{color:k.c}}>{k.v}</div>
            <div className="hp-db-kl">{k.l}</div>
          </div>
        ))}
      </div>
      <div className="hp-db-chart">
        <div className="hp-db-chart-title">Évolution du poids · 12 semaines</div>
        <svg viewBox={`0 0 ${W} ${H+10}`} style={{width:'100%',height:90}} preserveAspectRatio="none">
          <defs>
            <linearGradient id="lg1" x1="0" y1="0" x2={W} y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4f46e5"/><stop offset="100%" stopColor="#22d3ee"/>
            </linearGradient>
            <linearGradient id="lg2" x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity=".25"/><stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={`${d} L${W},${H+10} L0,${H+10}Z`} fill="url(#lg2)"/>
          <path d={d} fill="none" stroke="url(#lg1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="hp-chart-line"/>
          <circle cx={W} cy={y(172)} r="4" fill="#22d3ee" stroke="#0a0514" strokeWidth="1.5"/>
        </svg>
        <div className="hp-db-axis"><span>Sem. 1</span><span>Sem. 6</span><span>Sem. 12</span></div>
      </div>
      <p className="hp-db-note">Aperçu illustratif · vos données s'affichent dans votre espace.</p>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function ImcPage() {
  const navigate  = useNavigate()
  const py        = useParallax(0.12)
  const { heroRef, mx, my } = useMouseParallax()
  const { out: twOut, done: twDone } = useTypewriter('pour de bon.', 55, 800)

  const [poids,  setPoids]  = useState('')
  const [taille, setTaille] = useState('')
  const [result, setResult] = useState<BMIResult | null>(null)
  const [errs,   setErrs]   = useState<{poids?:string;taille?:string}>({})

  useEffect(() => {
    const p = parseFloat(poids), t = parseFloat(taille)/100
    if (p>20&&p<400&&t>0.5&&t<2.6) {
      const imc = p/(t*t)
      setResult({ poids:p, taille:parseFloat(taille), imc, categorie:getCategory(imc) })
    } else setResult(null)
  }, [poids, taille])

  function go() {
    const e: {poids?:string;taille?:string} = {}
    if (!poids||parseFloat(poids)<20||parseFloat(poids)>400) e.poids='Poids valide requis (20–400 kg)'
    if (!taille||parseFloat(taille)<100||parseFloat(taille)>250) e.taille='Taille valide requise (100–250 cm)'
    if (Object.keys(e).length) { setErrs(e); return }
    if (result) saveBMI(result)
    navigate('/auth/inscription')
  }

  const info = result ? BMI_INFO[result.categorie] : null
  const gPct = result ? Math.min(100,Math.max(0,((result.imc-15)/25)*100)) : 0
  const rDash = 314
  const rOff  = result ? rDash-(rDash*gPct/100) : rDash

  const medsRv  = useReveal(0.06)
  const featRv  = useReveal(0.06)
  const dbRv    = useReveal(0.06)
  const ipsRv   = useReveal(0.05)
  const formRv  = useReveal(0.05)
  const statsRv = useReveal(0.06)
  const testiRv = useReveal(0.06)
  const ctaRv   = useReveal(0.08)

  return (
    <Layout fullWidth>
    <div className="hp-page">

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="hp-hero" ref={heroRef as React.RefObject<HTMLDivElement>}>
        {/* animated background */}
        <div className="hp-hero-bg">
          <div className="hp-orb hp-orb-a" />
          <div className="hp-orb hp-orb-b" />
          <div className="hp-orb hp-orb-c" />
          <div className="hp-grid" />
          <div className="hp-noise" />
        </div>

        <div className="hp-hero-inner">
          {/* LEFT */}
          <div className="hp-hero-left">
            <div className="hp-chip hp-fade-in" style={{animationDelay:'0s'}}>
              <span className="hp-chip-dot" /> Anne Santé · Télémédecine GLP-1 · Québec
            </div>
            <h1 className="hp-h1 hp-fade-in" style={{animationDelay:'0.1s'}}>
              Reprenez le contrôle<br/>
              de votre poids,<br/>
              <span className="hp-grad hp-grad-anim">
                {twOut}<span className={`hp-cursor ${twDone ? 'hp-cursor-hide' : ''}`}>|</span>
              </span>
            </h1>
            <p className="hp-sub hp-fade-in" style={{animationDelay:'0.2s'}}>
              Traitement GLP-1 encadré par une IPS certifiée, entièrement en ligne. Questionnaire IA, ordonnance sous 24h, livraison en pharmacie.
            </p>
            <div className="hp-ctas hp-fade-in" style={{animationDelay:'0.3s'}}>
              <button className="hp-btn-primary" onClick={() => navigate('/auth/inscription')}>
                Commencer gratuitement
                <span className="hp-btn-arrow">→</span>
                <span className="hp-btn-shine" />
              </button>
              <button className="hp-btn-ghost" onClick={() => document.getElementById('eligibility')?.scrollIntoView({behavior:'smooth'})}>
                Vérifier mon éligibilité
              </button>
            </div>
            <div className="hp-pills hp-fade-in" style={{animationDelay:'0.4s'}}>
              {['🛡 SSL','👩‍⚕️ IPS certifiée','⚡ Ordonnance 24h','🇨🇦 Québec'].map(p=>(
                <span key={p} className="hp-pill">{p}</span>
              ))}
            </div>
          </div>

          {/* RIGHT — image + floating cards */}
          <div className="hp-hero-right hp-fade-in" style={{animationDelay:'0.25s'}}>
            <div className="hp-img-frame">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=90"
                alt="IPS Anne" className="hp-img"
                style={{transform:`translateY(${py}px) scale(1.04)`}}
                onError={e=>{(e.currentTarget as HTMLImageElement).src='https://picsum.photos/seed/anne-hero/600/700'}}
              />
              <div className="hp-img-vignette" />
            </div>

            {/* Floating cards with mouse parallax */}
            <div className="hp-card hp-card-1" style={{transform:`translate(${mx*-12}px,${my*-8}px)`}}>
              <div className="hp-card-icon">⚖️</div>
              <div><div className="hp-card-lbl">Poids perdu</div><div className="hp-card-val">−18,7 lb <em>12 semaines</em></div></div>
            </div>
            <div className="hp-card hp-card-2" style={{transform:`translate(${mx*10}px,${my*7}px)`}}>
              <div className="hp-av">SR</div>
              <div><div className="hp-card-lbl">Votre IPS</div><div className="hp-card-val">Sophie R.</div></div>
              <span className="hp-dot" />
            </div>
            <div className="hp-card hp-card-3" style={{transform:`translate(${mx*-8}px,${my*12}px)`}}>
              <div className="hp-card-icon" style={{fontSize:'1.2rem'}}>🤖</div>
              <div><div className="hp-card-lbl">Anna · Coach IA</div><div className="hp-card-val">Actif <em>24h/24</em></div></div>
            </div>

            {/* scroll cue */}
            <div className="hp-scroll-cue">
              <div className="hp-scroll-line" />
              <span>Défiler</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ══════════════════════════════════════ */}
      <div className="hp-marquee-wrap">
        <div className="hp-marquee">
          {Array.from({length:10}).map((_,i)=>(
            <span key={i} className="hp-marquee-item">
              Laissez-nous vous montrer qu'une vraie prise en charge GLP-1, c'est possible en ligne.&nbsp;🩺
            </span>
          ))}
        </div>
      </div>

      {/* ══ MEDICATIONS ═══════════════════════════════════ */}
      <section className="hp-meds" ref={medsRv.ref}>
        <div className="hp-section-inner">
          <div className={`hp-head rv rv-up ${medsRv.on?'on':''}`}>
            <div className="hp-tag">Médicaments GLP-1</div>
            <h2 className="hp-h2">Traitements prescrits par nos IPS</h2>
            <p className="hp-lead">Chaque ordonnance est émise uniquement après évaluation rigoureuse par une IPS certifiée.</p>
          </div>
          <div className="hp-meds-grid">
            {MEDS.map((m,i)=><MedCard key={m.name} med={m} idx={i} on={medsRv.on}/>)}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════ */}
      <section className="hp-features" ref={featRv.ref}>
        <div className="hp-section-inner">
          <div className={`hp-head rv rv-up ${featRv.on?'on':''}`}>
            <div className="hp-tag">Accompagnement complet</div>
            <h2 className="hp-h2">Ce à quoi vous avez droit, dès le premier jour.</h2>
          </div>
          <div className="hp-feat-grid">
            {FEATURES.map((f,i)=>(
              <div key={f.title} className={`hp-feat rv rv-up ${featRv.on?'on':''}`} style={{transitionDelay:`${i*0.11}s`}}>
                <div className="hp-feat-img-wrap">
                  <img src={f.img} alt={f.title} className="hp-feat-img"
                    onError={e=>{(e.currentTarget as HTMLImageElement).src=f.fb}}/>
                  <div className="hp-feat-overlay">
                    <span className="hp-feat-icon">{f.icon}</span>
                    <span className="hp-feat-title">{f.title}</span>
                  </div>
                </div>
                <div className="hp-feat-body"><p>{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DASHBOARD PREVIEW ═════════════════════════════ */}
      <section className="hp-db-section" ref={dbRv.ref}>
        <div className="hp-section-inner hp-db-inner">
          <div className={`hp-db-left rv rv-left ${dbRv.on?'on':''}`} style={{transitionDelay:'0.05s'}}>
            <div className="hp-tag hp-tag-light">Mon espace Anne</div>
            <h2 className="hp-h2 hp-h2-light">Votre progression, en temps réel.</h2>
            <p className="hp-db-desc">Poids, objectif, énergie, semaine de programme — tout votre parcours GLP-1 visible en un coup d'œil.</p>
            <ul className="hp-db-list">
              {['Prescription GLP-1 rapide','Suivi médical par votre IPS','Anna, coach IA proactif','Assistance 24h/24, 7j/7'].map(it=>(
                <li key={it}><span className="hp-check">✓</span>{it}</li>
              ))}
            </ul>
            <button className="hp-btn-primary" onClick={()=>navigate('/auth/inscription')} style={{marginTop:'2rem'}}>
              Ouvrir mon espace patient →<span className="hp-btn-shine"/>
            </button>
          </div>
          <div className={`rv rv-right ${dbRv.on?'on':''}`} style={{transitionDelay:'0.2s'}}>
            <DashboardCard/>
          </div>
        </div>
      </section>

      {/* ══ IPS CAROUSEL ══════════════════════════════════ */}
      <section className="hp-ips" ref={ipsRv.ref}>
        <div className={`hp-head hp-head-center rv rv-up ${ipsRv.on?'on':''}`}>
          <div className="hp-tag">Nos IPS spécialisées</div>
          <h2 className="hp-h2">Des professionnels certifiés au Québec</h2>
          <p className="hp-lead" style={{maxWidth:520,margin:'0 auto 2.5rem'}}>Votre IPS examine votre dossier, prescrit si approprié et assure votre suivi GLP-1 partout au Québec.</p>
        </div>
        <div className="hp-ticker-wrap">
          <div className="hp-ticker">
            {[...IPS_TEAM,...IPS_TEAM].map((ips,i)=>(
              <div key={i} className="hp-ips-card">
                <div className="hp-ips-img-wrap">
                  <img src={ips.img} alt={ips.name} className="hp-ips-img"
                    onError={e=>{(e.currentTarget as HTMLImageElement).src=ips.fb}}/>
                  <div className="hp-ips-img-grad"/>
                  <span className="hp-ips-badge">IPS certifiée</span>
                </div>
                <div className="hp-ips-body">
                  <div className="hp-ips-exp">{ips.exp} ans d'expérience</div>
                  <p className="hp-ips-quote">"{ips.quote}"</p>
                  <div className="hp-ips-name">{ips.name}</div>
                  <div className="hp-ips-loc">{ips.loc}</div>
                  <div className="hp-ips-tags">{ips.tags.map(t=><span key={t}>{t}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="hp-ips-note">Portraits à titre illustratif. Votre IPS assignée apparaît dans votre espace après évaluation.</p>
      </section>

      {/* ══ ELIGIBILITY FORM ══════════════════════════════ */}
      <section className="hp-form-section" id="eligibility" ref={formRv.ref}>
        <div className={`hp-form-wrap rv rv-up ${formRv.on?'on':''}`}>
          <div className="hp-form-left">
            <div className="hp-tag">Étape 1 sur 5</div>
            <h2 className="hp-h2">Vérifiez votre éligibilité au GLP-1</h2>
            <p className="hp-lead" style={{marginBottom:'2rem'}}>Un IMC ≥ 27 kg/m² est généralement requis pour un traitement GLP-1. Calculez le vôtre en 30 secondes.</p>
            <div className="hp-steps">
              {['Calculez votre IMC ci-contre','Remplissez le questionnaire médical guidé','Votre IPS prescrit sous 24h'].map((s,i)=>(
                <div key={i} className="hp-step">
                  <div className="hp-step-num">{i+1}</div><span>{s}</span>
                </div>
              ))}
            </div>
            <div className="hp-trust-badge">
              <span>🩺</span>
              <div><strong>Consultation de départ gratuite</strong><p>Aucune carte de crédit requise</p></div>
            </div>
          </div>

          <div className="hp-imc-card">
            <div className="hp-imc-header"><span>⚖</span> Calculateur d'éligibilité GLP-1</div>
            <div className="form-row" style={{gap:'1rem'}}>
              <div className="form-group">
                <label className="form-label">Poids</label>
                <div className="unit-input-wrap">
                  <input type="number" className={`form-control unit-input${errs.poids?' error':''}`}
                    value={poids} onChange={e=>{setPoids(e.target.value);setErrs(p=>({...p,poids:''}))}}
                    placeholder="85" min="20" max="400"/>
                  <span className="unit-suffix">kg</span>
                </div>
                {errs.poids && <span className="form-error">{errs.poids}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Taille</label>
                <div className="unit-input-wrap">
                  <input type="number" className={`form-control unit-input${errs.taille?' error':''}`}
                    value={taille} onChange={e=>{setTaille(e.target.value);setErrs(p=>({...p,taille:''}))}}
                    placeholder="170" min="100" max="250"/>
                  <span className="unit-suffix">cm</span>
                </div>
                {errs.taille && <span className="form-error">{errs.taille}</span>}
              </div>
            </div>

            {result && info ? (
              <div className="hp-result">
                <div className="hp-ring">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke={info.border} strokeWidth="8"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke={info.color} strokeWidth="8"
                      strokeDasharray={rDash} strokeDashoffset={rOff} strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      style={{transition:'stroke-dashoffset .9s cubic-bezier(0.34,1.56,0.64,1)'}}/>
                  </svg>
                  <div className="hp-ring-val" style={{color:info.color}}>{result.imc.toFixed(1)}</div>
                  <div className="hp-ring-unit">IMC</div>
                </div>
                <div className="hp-result-info">
                  <div className="hp-result-badge" style={{background:info.bg,color:info.color,border:`1.5px solid ${info.border}`}}>{info.label}</div>
                  {result.imc>=27
                    ? <div className="hp-eligible">✓ Éligible au traitement GLP-1</div>
                    : <div className="hp-ineligible">Votre IPS évaluera la pertinence</div>}
                  <div className="hp-gauge"><div className="hp-gauge-pin" style={{left:`${gPct}%`,borderColor:info.color}}/></div>
                  <div className="hp-gauge-labs"><span>Insuffisant</span><span>Normal</span><span>Surpoids</span><span>Obésité</span></div>
                </div>
              </div>
            ) : (
              <div className="hp-placeholder">
                <div className="hp-placeholder-ring"/>
                <span>Entrez vos mesures pour vérifier votre éligibilité</span>
              </div>
            )}

            <button className="hp-submit" onClick={go}>
              Commencer la consultation gratuite →
              <span className="hp-btn-shine"/>
            </button>
            <p className="hp-note">🔒 Données médicales chiffrées · Strictement confidentielles</p>
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════ */}
      <div ref={statsRv.ref} className={`hp-stats rv rv-up ${statsRv.on?'on':''}`}>
        {STATS.map(s=><StatCard key={s.label} val={s.val} suf={s.suf} label={s.label}/>)}
      </div>

      {/* ══ TESTIMONIALS ══════════════════════════════════ */}
      <section className="hp-testi" ref={testiRv.ref}>
        <div className="hp-section-inner">
          <div className={`hp-head hp-head-center rv rv-up ${testiRv.on?'on':''}`}>
            <div className="hp-tag">Résultats réels</div>
            <h2 className="hp-h2">Des vraies personnes, de vrais résultats.</h2>
          </div>
          <div className="hp-testi-grid">
            {[
              {init:'MT',name:'Marie T.',loc:'Montréal',text:"En 12 semaines avec Wegovy, j'ai perdu 22 lb. L'IPS était disponible à chaque question. Je ne pensais pas que c'était possible en ligne."},
              {init:'JB',name:'Jean-Luc B.',loc:'Québec',text:"J'avais essayé plusieurs régimes. Le GLP-1 prescrit par mon IPS a tout changé. Le suivi d'Anna chaque semaine, c'est vraiment rassurant."},
              {init:'SM',name:'Sarah M.',loc:'Laval',text:"Questionnaire rempli un soir, ordonnance reçue le lendemain matin. La pharmacie l'avait déjà. Service impeccable."},
            ].map((t,i)=>(
              <div key={t.name} className={`hp-testi-card rv rv-up ${testiRv.on?'on':''}`} style={{transitionDelay:`${i*0.13}s`}}>
                <div className="hp-stars">⭐⭐⭐⭐⭐</div>
                <p className="hp-testi-text">"{t.text}"</p>
                <div className="hp-testi-author">
                  <div className="hp-testi-av">{t.init}</div>
                  <div><strong>{t.name}</strong><span>{t.loc}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════ */}
      <section className="hp-cta" ref={ctaRv.ref}>
        <div className="hp-cta-orb hp-cta-orb-a" />
        <div className="hp-cta-orb hp-cta-orb-b" />
        <div className={`hp-cta-inner rv rv-up ${ctaRv.on?'on':''}`}>
          <h2 className="hp-cta-h2">Une nouvelle façon de vivre<br/>les soins de santé au Québec.</h2>
          <p className="hp-cta-sub">Rejoignez +2 400 Québécois qui reprennent le contrôle de leur santé avec Anne Santé.</p>
          <button className="hp-btn-primary hp-btn-lg" onClick={()=>navigate('/auth/inscription')}>
            Commencer gratuitement <span className="hp-btn-arrow">→</span>
            <span className="hp-btn-shine"/>
          </button>
          <div className="hp-cta-trust">
            <span>✓ Gratuit pour commencer</span>
            <span>✓ IPS certifiée</span>
            <span>✓ Résultats sous 24h</span>
          </div>
        </div>
      </section>

    </div>
    </Layout>
  )
}
