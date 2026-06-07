import { AuthProvider, useAuth } from './Context/AuthContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainPage from './Main/Main'
import PatientHistory from './Patient/Patient'
import LoginPage from '../Page/Login/Login'
import Notification from './Notification/Notification.js'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()

  // ถ้า logout แล้ว currentUser = null → พาไป login ทันที
  if (!currentUser) return <Navigate to="/login" />

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
                    <Route path='/' element={<Navigate to='/login' replace/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
    
}
export default App