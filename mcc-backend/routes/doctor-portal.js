const express = require('express')
const router  = express.Router()
const db      = require('../db')

// สถิติรายเดือน + 7 วันล่าสุด
router.get('/:doctorId/stats', async (req, res) => {
  const { doctorId } = req.params
  try {
    const [[monthRow]] = await db.query(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'เสร็จสิ้น') AS done,
         SUM(status = 'ยกเลิก')    AS cancelled
       FROM bookings
       WHERE doctor_id = ?
         AND YEAR(booking_date)  = YEAR(CURDATE())
         AND MONTH(booking_date) = MONTH(CURDATE())`,
      [doctorId]
    )

    const [weekRows] = await db.query(
      `SELECT booking_date,
              COUNT(*) AS total,
              SUM(status = 'เสร็จสิ้น') AS done,
              SUM(status = 'ยกเลิก')    AS cancelled
       FROM bookings
       WHERE doctor_id = ?
         AND booking_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE()
       GROUP BY booking_date
       ORDER BY booking_date ASC`,
      [doctorId]
    )

    res.json({ month: monthRow, week: weekRows })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// คิววันนี้ของแพทย์
router.get('/:doctorId/queue', async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0]
  try {
    const [rows] = await db.query(
      `SELECT b.id, b.queue_number, b.symptom, b.note, b.status, b.booking_date,
              t.slot_time,
              p.id as patient_id, p.name as patient_name, p.hn, p.age, p.sex,
              p.blood_type, p.allergy, p.congenital
       FROM bookings b
       JOIN time_slots t  ON b.slot_time_id = t.id
       JOIN patients  p   ON b.patient_id   = p.id
       WHERE b.doctor_id = ? AND b.booking_date = ?
       ORDER BY b.queue_number ASC`,
      [req.params.doctorId, date]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// อัปเดตสถานะคิว
router.patch('/bookings/:bookingId/status', async (req, res) => {
  const { status } = req.body
  const allowed = ['รอตรวจ', 'กำลังตรวจ', 'เสร็จสิ้น']
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' })
  }
  try {
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.bookingId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// บันทึกผลการรักษา (วินิจฉัย + ยา + นัดติดตาม + vitals)
router.post('/medical-history', async (req, res) => {
  const { patientId, doctorId, bookingId, diagnosis, symptoms, nextAppointment, medicines,
          bloodPressure, pulse, temperature, weight, height } = req.body
  try {
    const visitDate = new Date().toISOString().split('T')[0]
    const [result] = await db.query(
      `INSERT INTO medical_history (patient_id, doctor_id, booking_id, visit_date, diagnosis, symptoms, next_appointment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patientId, doctorId, bookingId || null, visitDate, diagnosis, symptoms, nextAppointment || null]
    )

    // อัปเดต vital signs + น้ำหนัก/ส่วนสูง/BMI ของผู้ป่วยถ้ามีข้อมูล
    if (bloodPressure || pulse || temperature || weight || height) {
      const updates = []
      const vals    = []
      if (bloodPressure) { updates.push('blood_pressure = ?'); vals.push(bloodPressure) }
      if (pulse)         { updates.push('pulse = ?');          vals.push(pulse) }
      if (temperature)   { updates.push('temperature = ?');    vals.push(temperature) }
      if (weight)        { updates.push('weight = ?');         vals.push(weight) }
      if (height)        { updates.push('height = ?');         vals.push(height) }
      if (weight && height) {
        const bmi = (weight / ((height / 100) ** 2)).toFixed(2)
        updates.push('bmi = ?')
        vals.push(bmi)
      }
      vals.push(patientId)
      await db.query(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`, vals)
    }
    const historyId = result.insertId

    if (medicines && medicines.length > 0) {
      const medValues = medicines.map(m => [historyId, m.name, m.dosage])
      await db.query(
        'INSERT INTO prescriptions (medical_history_id, medicine_name, dosage) VALUES ?',
        [medValues]
      )
    }

    await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['เสร็จสิ้น', bookingId])

    await db.query(
      'INSERT INTO notifications (patient_id, type, title, message) VALUES (?, ?, ?, ?)',
      [patientId, 'result', 'ผลการรักษาพร้อมแล้ว', `วินิจฉัย: ${diagnosis}`]
    )

    res.json({ success: true, historyId })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// F5: เปลี่ยน password หมอ
router.patch('/:doctorId/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!newPassword || newPassword.length < 4)
    return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร' })
  try {
    const [rows] = await db.query(
      'SELECT id FROM doctors WHERE id = ? AND password = ?',
      [req.params.doctorId, currentPassword]
    )
    if (rows.length === 0)
      return res.status(400).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' })
    await db.query('UPDATE doctors SET password = ? WHERE id = ?', [newPassword, req.params.doctorId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
