const express = require('express')
const cors    = require('cors')
require('dotenv').config()

require('./cron')

const { requirePatient, requireDoctor, requireAuth } = require('./middleware/auth')

const app = express()

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

// Routes — public
app.use('/api/auth',      require('./routes/auth'))
app.use('/api/doctors',   require('./routes/doctors'))
app.use('/api/timeslots', require('./routes/timeslots'))

// Routes — mixed auth (สมัครสมาชิก/slot ดูได้ public, อื่นๆ ต้องการ token)
app.use('/api/bookings', require('./routes/bookings'))

// Routes — patient หรือ doctor token (doctor เข้าได้ข้อมูลทุกคน, patient เข้าได้เฉพาะของตัวเอง)
app.use('/api/patients',      requireAuth, require('./routes/patients'))
app.use('/api/notifications', requirePatient, require('./routes/notifications'))

// Routes — doctor token required
app.use('/api/doctor-portal', requireDoctor, require('./routes/doctor-portal'))

// รัน server
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server รันอยู่ที่ http://localhost:${PORT}`)
})
