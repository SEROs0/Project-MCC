const BASE_URL = 'http://localhost:8080/api'

// Auth
export const login = async (hn) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hn })
  })
  return res.json()

}

// Doctors
export const getDoctors = async () => {
  const res = await fetch(`${BASE_URL}/doctors`)
  return res.json()
}

// Patients
export const getPatientByHn = async (hn) => {
  const res = await fetch(`${BASE_URL}/patients/${hn}`)
  return res.json()
}

export const getPatientHistory = async (patientId) => {
  const res = await fetch(`${BASE_URL}/patients/${patientId}/history`)
  return res.json()
}

// Bookings
export const createBooking = async (data) => {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export const gettimeSlots = async () => {
  const res = await fetch(`${BASE_URL}/timeslots`)
  return res.json()
}

export const getSlotBookings = async (date) => {
  const res = await fetch(`${BASE_URL}/bookings/slots?date=${date}`)
  return res.json()
}

export const getBookings = async (patientId) => {
  const res = await fetch(`${BASE_URL}/bookings/patient/${patientId}`)
  return res.json()
}

// Doctor Portal
export const doctorLogin = async (employeeId, password) => {
  const res = await fetch(`${BASE_URL}/auth/doctor-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, password })
  })
  return res.json()
}

export const getDoctorQueue = async (doctorId, date) => {
  const res = await fetch(`${BASE_URL}/doctor-portal/${doctorId}/queue?date=${date}`)
  return res.json()
}

export const updateBookingStatus = async (bookingId, status) => {
  const res = await fetch(`${BASE_URL}/doctor-portal/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  return res.json()
}

export const saveMedicalHistory = async (data) => {
  const res = await fetch(`${BASE_URL}/doctor-portal/medical-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

// Notifications
export const getNotifications = async (patientId) => {
  const res = await fetch(`${BASE_URL}/notifications/${patientId}`)
  return res.json()
}

export const markAsRead = async (id) => {
  const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH'
  })
  return res.json()
}