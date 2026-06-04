const express = require('express')
const router  = express.Router()
const db      = require('../db')

router.post('/', async (req, res) => {
  const { patientId, doctorId, slotTimeId, bookingDate, symptom, note } = req.body
  try {
    const [doctor]   = await db.query('SELECT * FROM doctors WHERE id = ?', [doctorId])
    const [slotRows] = await db.query(
      'SELECT * FROM slot_bookings WHERE doctor_id = ? AND slot_time_id = ? AND booking_date = ?',
      [doctorId, slotTimeId, bookingDate]
    )
    const bookedCount = slotRows.length > 0 ? slotRows[0].booked_count : 0
    if (bookedCount >= doctor[0].capacity) {
      return res.status(400).json({ message: 'คิวช่วงเวลานี้เต็มแล้ว' })
    }
    const [todayBookings] = await db.query(
      'SELECT * FROM bookings WHERE doctor_id = ? AND booking_date = ?',
      [doctorId, bookingDate]
    )
    const queueNumber = todayBookings.length + 1
    const [result] = await db.query(
      `INSERT INTO bookings (patient_id, doctor_id, slot_time_id, booking_date, queue_number, symptom, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patientId, doctorId, slotTimeId, bookingDate, queueNumber, symptom, note]
    )
    if (slotRows.length > 0) {
      await db.query(
        'UPDATE slot_bookings SET booked_count = booked_count + 1 WHERE id = ?',
        [slotRows[0].id]
      )
    } else {
      await db.query(
        'INSERT INTO slot_bookings (doctor_id, slot_time_id, booking_date, booked_count) VALUES (?, ?, ?, 1)',
        [doctorId, slotTimeId, bookingDate]
      )
    }
    await db.query(
      'INSERT INTO notifications (patient_id, type, title, message) VALUES (?, ?, ?, ?)',
      [patientId, 'booking', 'ยืนยันนัดหมายเรียบร้อย', `คิวที่ ${queueNumber} — วันที่ ${bookingDate}`]
    )
    res.json({ success: true, bookingId: result.insertId, queueNumber })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/patient/:patientId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, d.name as doctor_name, t.slot_time
       FROM bookings b
       JOIN doctors d ON b.doctor_id = d.id
       JOIN time_slots t ON b.slot_time_id = t.id
       WHERE b.patient_id = ?
       ORDER BY b.created_at DESC`,
      [req.params.patientId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
