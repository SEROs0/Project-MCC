import { createContext, useContext, useState, useEffect } from 'react'
import { getBookings } from '../../api'

const AuthContext = createContext()

const mapDbBooking = (b) => ({
  id:              new Date(b.created_at).getTime() || b.id,
  date:            new Date(b.booking_date).toLocaleDateString('th-TH', {
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

  const logout = () => {
    setCurrentUser(null)
    setBookings([])
    localStorage.removeItem('currentUser')
    localStorage.removeItem('bookings')
  }

  const addBooking = (bookingData) => {
    const newBooking = {
      id:              Date.now(),
      date:            new Date().toLocaleDateString('th-TH', {
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

  const doctorLogout = () => {
    setCurrentDoctor(null)
    localStorage.removeItem('currentDoctor')
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout, addBooking, bookings, currentDoctor, setCurrentDoctor, doctorLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
