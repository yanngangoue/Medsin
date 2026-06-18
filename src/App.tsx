import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import EligibilitePage from './pages/EligibilitePage'
import EligibiliteResultatPage from './pages/EligibiliteResultatPage'
import ImcPage from './pages/ImcPage'
import InscriptionPage from './pages/InscriptionPage'
import QuestionnairePage from './pages/QuestionnairePage'
import ExamenEnCoursPage from './pages/ExamenEnCoursPage'
import PaiementPage from './pages/PaiementPage'
import PatientDashboardPage from './pages/PatientDashboardPage'
import ChatPage from './pages/ChatPage'
import NutritionalGuidePage from './pages/NutritionalGuidePage'
import IPSLoginPage from './pages/IPS/IPSLoginPage'
import IPSDashboardPage from './pages/IPS/IPSDashboardPage'
import QuestionnaireDetailPage from './pages/IPS/QuestionnaireDetailPage'
import AdminLoginPage from './pages/Admin/AdminLoginPage'
import AdminDashboardPage from './pages/Admin/AdminDashboardPage'
import PharmacistLoginPage from './pages/Pharmacist/PharmacistLoginPage'
import PharmacistDashboardPage from './pages/Pharmacist/PharmacistDashboardPage'
import './App.css'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Entrée */}
          <Route path="/" element={<Navigate to="/imc" replace />} />
          <Route path="/eligibilite" element={<EligibilitePage />} />
          <Route path="/eligibilite/resultat" element={<EligibiliteResultatPage />} />

          {/* Onboarding patient */}
          <Route path="/imc" element={<ImcPage />} />
          <Route path="/auth/inscription" element={<InscriptionPage />} />
          <Route path="/onboarding/inscription" element={<InscriptionPage />} />

          {/* Flow patient */}
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/examen-en-cours" element={<ExamenEnCoursPage />} />
          <Route path="/paiement" element={<PaiementPage />} />
          <Route path="/dashboard/patient" element={<PatientDashboardPage />} />
          <Route path="/messagerie" element={<ChatPage />} />
          <Route path="/guide-nutritionnel" element={<NutritionalGuidePage />} />

          {/* IPS */}
          <Route path="/auth/ips" element={<IPSLoginPage />} />
          <Route path="/dashboard/ips" element={<IPSDashboardPage />} />
          <Route path="/dashboard/ips/questionnaires/:id" element={<QuestionnaireDetailPage />} />

          {/* Admin */}
          <Route path="/auth/admin" element={<AdminLoginPage />} />
          <Route path="/dashboard/admin" element={<AdminDashboardPage />} />

          {/* Pharmacist */}
          <Route path="/auth/pharmacien" element={<PharmacistLoginPage />} />
          <Route path="/dashboard/pharmacien" element={<PharmacistDashboardPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
