import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../api/mockApi'
import Layout from '../components/Layout'

interface Answers {
  ageMajeur: string
  residenceCanada: string
  consentement: string
}

export default function EligibilitePage() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Answers>({ ageMajeur: '', residenceCanada: '', consentement: '' })
  const [error, setError] = useState('')

  // Si déjà connecté, aller directement au questionnaire
  useEffect(() => {
    const u = getCurrentUser()
    if (u && u.role === 'patient') navigate('/questionnaire', { replace: true })
  }, [navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!answers.ageMajeur || !answers.residenceCanada || !answers.consentement) {
      setError('Veuillez répondre à toutes les questions avant de continuer.')
      return
    }
    const eligible =
      answers.ageMajeur === 'oui' &&
      answers.residenceCanada === 'oui' &&
      answers.consentement === 'oui'
    navigate('/eligibilite/resultat', { state: { eligible } })
  }

  const questions = [
    { key: 'ageMajeur' as const, text: 'Avez-vous 18 ans ou plus?' },
    { key: 'residenceCanada' as const, text: 'Résidez-vous actuellement au Canada?' },
    {
      key: 'consentement' as const,
      text: "Consentez-vous à partager vos informations médicales avec un(e) infirmier(ère) praticien(ne) spécialisé(e)?",
    },
  ]

  return (
    <Layout>
      <div className="page-center">
        <div className="card" style={{ maxWidth: 580 }}>
          <div className="card-header">
            <div className="step-badge">Étape 1</div>
            <h1>Vérifiez votre éligibilité</h1>
            <p>Répondez à ces quelques questions pour commencer votre consultation médicale en ligne.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="questions-list">
              {questions.map((q, i) => (
                <div key={q.key} className="question-item">
                  <p className="question-text">
                    <span className="question-num">{i + 1}</span>
                    {q.text}
                  </p>
                  <div className="radio-group">
                    {['oui', 'non'].map(val => (
                      <label
                        key={val}
                        className={`radio-card ${answers[q.key] === val ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={q.key}
                          value={val}
                          checked={answers[q.key] === val}
                          onChange={e => {
                            setAnswers(prev => ({ ...prev, [q.key]: e.target.value }))
                            setError('')
                          }}
                        />
                        {val === 'oui' ? 'Oui' : 'Non'}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button type="submit" className="btn btn-primary btn-full btn-lg">
              Vérifier mon éligibilité →
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
