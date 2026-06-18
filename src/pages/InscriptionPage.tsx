import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../api/mockApi'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'

interface FormData {
  prenom: string
  nom: string
  email: string
  telephone: string
  password: string
  passwordConfirm: string
}

export default function InscriptionPage() {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const [form, setForm] = useState<FormData>({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    password: '',
    passwordConfirm: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Si déjà connecté, aller directement au questionnaire
  useEffect(() => {
    const existing = user
    if (existing && existing.role === 'patient') navigate('/questionnaire', { replace: true })
  }, [user, navigate])

  function update(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function validate(): boolean {
    const newErrors: Partial<FormData> = {}
    if (!form.prenom.trim()) newErrors.prenom = 'Le prénom est requis.'
    if (!form.nom.trim()) newErrors.nom = 'Le nom est requis.'
    if (!form.email.includes('@')) newErrors.email = 'Adresse courriel invalide.'
    if (form.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères.'
    if (form.password !== form.passwordConfirm) newErrors.passwordConfirm = 'Les mots de passe ne correspondent pas.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const user = registerUser({
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim(),
      role: 'patient',
    })
    setUser(user)
    navigate('/questionnaire')
  }

  return (
    <Layout>
      <div className="page-center">
        <div className="card" style={{ maxWidth: 540 }}>
          <div className="card-header">
            <div className="step-badge">Étape 2</div>
            <h1>Créez votre compte</h1>
            <p>Vos informations sont protégées et confidentielles.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Prénom *</label>
                <input
                  type="text"
                  className={`form-control ${errors.prenom ? 'error' : ''}`}
                  value={form.prenom}
                  onChange={e => update('prenom', e.target.value)}
                  placeholder="Marie"
                  autoComplete="given-name"
                />
                {errors.prenom && <span className="form-error">{errors.prenom}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  className={`form-control ${errors.nom ? 'error' : ''}`}
                  value={form.nom}
                  onChange={e => update('nom', e.target.value)}
                  placeholder="Tremblay"
                  autoComplete="family-name"
                />
                {errors.nom && <span className="form-error">{errors.nom}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adresse courriel *</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="marie@exemple.com"
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input
                type="tel"
                className="form-control"
                value={form.telephone}
                onChange={e => update('telephone', e.target.value)}
                placeholder="514-555-0000"
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe *</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="Minimum 6 caractères"
                autoComplete="new-password"
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirmer le mot de passe *</label>
              <input
                type="password"
                className={`form-control ${errors.passwordConfirm ? 'error' : ''}`}
                value={form.passwordConfirm}
                onChange={e => update('passwordConfirm', e.target.value)}
                placeholder="Répétez votre mot de passe"
                autoComplete="new-password"
              />
              {errors.passwordConfirm && <span className="form-error">{errors.passwordConfirm}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg">
              Créer mon compte →
            </button>

            <p className="form-footer">
              Déjà un compte?{' '}
              <Link to="/auth/ips" className="link">Connexion IPS</Link>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  )
}
