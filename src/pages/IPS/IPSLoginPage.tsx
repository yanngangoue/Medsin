import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithCredentials } from '../../api/mockApi'
import { useApp } from '../../context/AppContext'
import Layout from '../../components/Layout'

export default function IPSLoginPage() {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const user = loginWithCredentials(email, password)
    if (!user) {
      setError('Identifiants invalides. Vérifiez votre courriel et mot de passe.')
      return
    }
    setUser(user)
    navigate('/dashboard/ips')
  }

  return (
    <Layout variant="ips">
      <div className="page-center">
        <div className="card" style={{ maxWidth: 440 }}>
          <div className="card-header">
            <div className="step-badge">Espace professionnel</div>
            <h1>Connexion IPS</h1>
            <p>Réservé aux infirmier(ère)s praticien(ne)s spécialisé(e)s.</p>
          </div>

          <div className="alert alert-info">
            <strong>Démo :</strong> ips@anne.ca / demo123
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Adresse courriel</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="ips@anne.ca"
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••"
                autoComplete="current-password"
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
