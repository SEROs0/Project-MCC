import { createContext, useContext, useState, useEffect  } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })  // ← null = ยังไม่ได้ login

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('bookings')
    return saved ? JSON.parse(saved) : []
  })  // ← เก็บประวัติการจอง

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser',JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  },[currentUser])

  useEffect (() => {
    localStorage.setItem('booking', JSON.stringify(bookings))
  },[bookings])

  const logout = () => {        // ← ต้องมีตรงนี้
    setCurrentUser(null)
    setBookings([])
    localStorage.removeItem('currentUser')  // ← ล้างข้อมูลตอน logout ด้วย
    localStorage.removeItem('bookings')
  }

   const addBooking = (bookingData) => {
    const newBooking = {
      id: Date.now(),
      date: new Date().toLocaleDateString('th-TH', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
      doctor:    bookingData.doctor,
      time:      bookingData.time,
      symptoms:  bookingData.patient.symptom,
      note:      bookingData.patient.note,
      status:    'รอตรวจ',
      diagnosis: '-',
      medicine:  [],
      nextAppointment: null,
    }
    setBookings(prev => [newBooking, ...prev])  // ← เพิ่มไว้บนสุด
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout ,addBooking,bookings}}>
      {children}
    </AuthContext.Provider>
  )
}

// custom hook สำหรับเรียกใช้
export function useAuth() {
  return useContext(AuthContext)
}