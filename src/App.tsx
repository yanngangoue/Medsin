import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import EligibilitePage from './pages/EligibilitePage'
import EligibiliteResultatPage from './pages/EligibiliteResultatPage'
import InscriptionPage from './pages/InscriptionPage'
import QuestionnairePage from './pages/QuestionnairePage'
import ExamenEnCoursPage from './pages/ExamenEnCoursPage'
import PaiementPage from './pages/PaiementPage'
import PatientDashboardPage from './pages/PatientDashboardPage'
import IPSLoginPage from './pages/IPS/IPSLoginPage'
import IPSDashboardPage from './pages/IPS/IPSDashboardPage'
import QuestionnaireDetailPage from './pages/IPS/QuestionnaireDetailPage'
import './App.css'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/eligibilite" replace />} />
          <Route path="/eligibilite" element={<EligibilitePage />} />
          <Route path="/eligibilite/resultat" element={<EligibiliteResultatPage />} />
          <Route path="/auth/inscription" element={<InscriptionPage />} />
          <Route path="/onboarding/inscription" element={<InscriptionPage />} />
          <Route path="/auth/ips" element={<IPSLoginPage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/examen-en-cours" element={<ExamenEnCoursPage />} />
          <Route path="/paiement" element={<PaiementPage />} />
          <Route path="/dashboard/patient" element={<PatientDashboardPage />} />
          <Route path="/dashboard/ips" element={<IPSDashboardPage />} />
          <Route path="/dashboard/ips/questionnaires/:id" element={<QuestionnaireDetailPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
