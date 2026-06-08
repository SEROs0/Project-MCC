const express = require('express')
const cors    = require('cors')
require('dotenv').config()

require('./cron')

const app = express()

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

// Routes
app.use('/api/auth',          require('./routes/auth'))
app.use('/api/patients',      require('./routes/patients'))
app.use('/api/doctors',       require('./routes/doctors'))
app.use('/api/bookings',      require('./routes/bookings'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/timeslots',     require('./routes/timeslots'))
app.use('/api/doctor-portal', require('./routes/doctor-portal'))

// รัน server
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server รันอยู่ที่ http://localhost:${PORT}`)
})
