import { AuthProvider } from './Context/AuthContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './Main/Main'
import PatientHistory from './Patient/Patient'
import LoginPage from '../Page/Login/Login'


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login"   element={<LoginPage />} />
                    <Route path='/' element={<MainPage/>}/>
                    <Route path='/patient' element={<PatientHistory/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
    
}
export default App