import { createContext, useContext, useState, useEffect } from 'react'
import { getBookings } from '../../api'

const AuthContext = createContext()

const mapDbBooking = (b) => ({
  id:              b.id,
  rawDate:         b.booking_date,
  date:            new Date(b.booking_date + 'T12:00:00').toLocaleDateString('th-TH', {
                     day: 'numeric', month: 'long', year: 'numeric'
                   }),
  doctor:          b.doctor_name,
  time:            b.slot_time ? b.slot_time.substring(0, 5) : '',
  symptoms:        b.symptom || '-',
  note:            b.note || '',
  status:          b.status || 'รอตรวจ',
  diagnosis:       '-',
  medicine:        [],
  nextAppointment: null,
})

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  const [bookings, setBookings] = useState([])

  // sync currentUser ลง localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  // fetch bookings จาก DB ทุกครั้งที่ login (currentUser เปลี่ยนจาก null → user)
  useEffect(() => {
    if (!currentUser) {
      setBookings([])
      return
    }
    const fetchBookings = async () => {
      const data = await getBookings(currentUser.id)
      if (!Array.isArray(data)) return
      setBookings(data.map(mapDbBooking))
    }
    fetchBookings()
  }, [currentUser])

  const loginUser = (patient, token) => {
    localStorage.setItem('authToken', token)
    setCurrentUser(patient)
  }

  const logout = () => {
    setCurrentUser(null)
    setBookings([])
    localStorage.removeItem('currentUser')
    localStorage.removeItem('bookings')
    localStorage.removeItem('authToken')
  }

  const addBooking = (bookingData) => {
    const dateRaw = bookingData.bookingDate || new Date().toISOString().split('T')[0]
    const newBooking = {
      id:              Date.now(),
      rawDate:         dateRaw,
      date:            new Date(dateRaw + 'T12:00:00').toLocaleDateString('th-TH', {
                         day: 'numeric', month: 'long', year: 'numeric'
                       }),
      doctor:          bookingData.doctor,
      time:            bookingData.time,
      symptoms:        bookingData.patient.symptom,
      note:            bookingData.patient.note,
      status:          'รอตรวจ',
      diagnosis:       '-',
      medicine:        [],
      nextAppointment: null,
    }
    setBookings(prev => [newBooking, ...prev])
  }

  const [currentDoctor, setCurrentDoctor] = useState(() => {
    const saved = localStorage.getItem('currentDoctor')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (currentDoctor) {
      localStorage.setItem('currentDoctor', JSON.stringify(currentDoctor))
    } else {
      localStorage.removeItem('currentDoctor')
    }
  }, [currentDoctor])

  const loginDoctor = (doctor, token) => {
    localStorage.setItem('authToken', token)
    setCurrentDoctor(doctor)
  }

  const doctorLogout = () => {
    setCurrentDoctor(null)
    localStorage.removeItem('currentDoctor')
    localStorage.removeItem('authToken')
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loginUser, logout, addBooking, bookings, currentDoctor, setCurrentDoctor, loginDoctor, doctorLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
