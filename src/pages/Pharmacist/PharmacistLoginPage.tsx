import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithCredentials } from '../../api/mockApi'
import { useApp } from '../../context/AppContext'
import Layout from '../../components/Layout'

export default function PharmacistLoginPage() {
  const navigate = useNavigate()
  const { setUser } = useApp()
  const [email, setEmail] = useState('marc.beaupre@anne.ca')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const user = loginWithCredentials(email, password)
    if (!user || user.role !== 'pharmacist') {
      setError('Identifiants incorrects.')
      return
    }
    setUser(user)
    navigate('/dashboard/pharmacien')
  }

  return (
    <Layout variant="ips">
      <div className="page-center">
        <div className="card" style={{ maxWidth: 420 }}>
          <div className="card-header text-center">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💊</div>
            <h1>Espace pharmacien</h1>
            <p>Gestion des ordonnances et livraisons</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Courriel @anne.ca</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input type="password" className="form-control" value={password} onChange={e => { setPassword(e.target.value); setError('') }} placeholder="••••••••" />
            </div>
            {error && <div className="alert alert-danger">⚠ {error}</div>}
            <button type="submit" className="btn btn-primary btn-full btn-lg">Se connecter</button>
          </form>
          <div className="alert alert-info" style={{ marginTop: '1rem' }}>
            <strong>Démo :</strong> marc.beaupre@anne.ca / demo123
          </div>
        </div>
      </div>
    </Layout>
  )
}
