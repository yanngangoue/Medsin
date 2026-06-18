import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithCredentials } from '../../api/mockApi'
import { useApp } from '../../context/AppContext'
import Layout from '../../components/Layout'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const [email, setEmail] = useState('admin@anne.ca')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const user = loginWithCredentials(email, password)
    if (!user || user.role !== 'admin') {
      setError('Identifiants incorrects.')
      return
    }
    setUser(user)
    navigate('/dashboard/admin')
  }

  return (
    <Layout variant="ips">
      <div className="page-center">
        <div className="card" style={{ maxWidth: 420 }}>
          <div className="card-header text-center">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚙</div>
            <h1>Espace administrateur</h1>
            <p>Gestion des IPS et des pharmaciens</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Courriel administrateur</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@anne.ca" />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input type="password" className="form-control" value={password} onChange={e => { setPassword(e.target.value); setError('') }} placeholder="••••••••" />
            </div>
            {error && <div className="alert alert-danger">⚠ {error}</div>}
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              Se connecter
            </button>
          </form>
          <div className="alert alert-info" style={{ marginTop: '1rem' }}>
            <strong>Démo :</strong> admin@anne.ca / admin123
          </div>
        </div>
      </div>
    </Layout>
  )
}
