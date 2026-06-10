const BASE_URL = 'http://localhost:8080/api'

const authHeader = () => {
  const token = localStorage.getItem('authToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const authJson = () => ({ ...authHeader(), 'Content-Type': 'application/json' })

// Auth — public (ไม่ต้องการ token)
export const login = async (hn, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hn, ...(password ? { password } : {}) }),
  })
  return res.json()
}

export const doctorLogin = async (employeeId, password) => {
  const res = await fetch(`${BASE_URL}/auth/doctor-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, password }),
  })
  return res.json()
}

// Doctors — public
export const getDoctors = async () => {
  const res = await fetch(`${BASE_URL}/doctors`)
  return res.json()
}

// Bookings — public (slot availability)
export const getSlotBookings = async (date) => {
  const res = await fetch(`${BASE_URL}/bookings/slots?date=${date}`)
  return res.json()
}

export const gettimeSlots = async () => {
  const res = await fetch(`${BASE_URL}/timeslots`)
  return res.json()
}

// Bookings — patient auth required
export const createBooking = async (data) => {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: authJson(),
    body: JSON.stringify(data),
  })
  return res.json()
}

export const getBookings = async (patientId) => {
  const res = await fetch(`${BASE_URL}/bookings/patient/${patientId}`, {
    headers: authHeader(),
  })
  return res.json()
}

export const cancelBooking = async (bookingId) => {
  const res = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    headers: authHeader(),
  })
  return res.json()
}

// Patients — patient auth required (doctor ก็เรียกได้)
export const getPatientByHn = async (hn) => {
  const res = await fetch(`${BASE_URL}/patients/${hn}`, {
    headers: authHeader(),
  })
  return res.json()
}

export const getPatientHistory = async (patientId) => {
  const res = await fetch(`${BASE_URL}/patients/${patientId}/history`, {
    headers: authHeader(),
  })
  return res.json()
}

export const changePatientPassword = async (patientId, currentPassword, newPassword) => {
  const res = await fetch(`${BASE_URL}/patients/${patientId}/password`, {
    method: 'PATCH',
    headers: authJson(),
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  return res.json()
}

export const updatePatientProfile = async (patientId, data) => {
  const res = await fetch(`${BASE_URL}/patients/${patientId}`, {
    method: 'PATCH',
    headers: authJson(),
    body: JSON.stringify(data),
  })
  return res.json()
}

// Notifications — patient auth required
export const getNotifications = async (patientId) => {
  const res = await fetch(`${BASE_URL}/notifications/${patientId}`, {
    headers: authHeader(),
  })
  return res.json()
}

export const markAsRead = async (id) => {
  const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeader(),
  })
  return res.json()
}

// Doctor Portal — doctor auth required
export const getDoctorStats = async (doctorId) => {
  const res = await fetch(`${BASE_URL}/doctor-portal/${doctorId}/stats`, {
    headers: authHeader(),
  })
  return res.json()
}

export const getDoctorQueue = async (doctorId, date) => {
  const res = await fetch(`${BASE_URL}/doctor-portal/${doctorId}/queue?date=${date}`, {
    headers: authHeader(),
  })
  return res.json()
}

export const updateBookingStatus = async (bookingId, status) => {
  const res = await fetch(`${BASE_URL}/doctor-portal/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: authJson(),
    body: JSON.stringify({ status }),
  })
  return res.json()
}

export const saveMedicalHistory = async (data) => {
  const res = await fetch(`${BASE_URL}/doctor-portal/medical-history`, {
    method: 'POST',
    headers: authJson(),
    body: JSON.stringify(data),
  })
  return res.json()
}

export const changeDoctorPassword = async (doctorId, currentPassword, newPassword) => {
  const res = await fetch(`${BASE_URL}/doctor-portal/${doctorId}/password`, {
    method: 'PATCH',
    headers: authJson(),
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  return res.json()
}
