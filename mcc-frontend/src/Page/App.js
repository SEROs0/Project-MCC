import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './Main/Main'
import PatientHistory from './Patient/Patient'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/main' element={<MainPage/>}/>
                <Route path='/patient' element={<PatientHistory/>}/>
            </Routes>
        </BrowserRouter>
    )
    
}
export default App