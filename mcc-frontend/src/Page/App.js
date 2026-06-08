import { AuthProvider, useAuth } from './Context/AuthContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainPage from './Main/Main'
import PatientHistory from './Patient/Patient'
import LoginPage from '../Page/Login/Login'
import Notification from './Notification/Notification.js'
import DoctorLogin from './DoctorLogin/DoctorLogin'
import DoctorQueue from './Doctor/Queue'
import PatientDetail from './Doctor/PatientDetail'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" />
  return children
}

function DoctorProtectedRoute({ children }) {
  const { currentDoctor } = useAuth()
  if (!currentDoctor) return <Navigate to="/doctor-login" />
  return children
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login"   element={<LoginPage />} />
                    <Route path='/main' element={<ProtectedRoute><MainPage/></ProtectedRoute>}/>
                    <Route path='/patient' element={<ProtectedRoute><PatientHistory/></ProtectedRoute>}/>
                    <Route path='/notification' element={<ProtectedRoute><Notification/></ProtectedRoute>}/>
                    <Route path='/doctor-login' element={<DoctorLogin />} />
                    <Route path='/doctor/queue' element={<DoctorProtectedRoute><DoctorQueue /></DoctorProtectedRoute>} />
                    <Route path='/doctor/patient/:patientId' element={<DoctorProtectedRoute><PatientDetail /></DoctorProtectedRoute>} />
                    <Route path='/' element={<Navigate to='/login' replace/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
export default App