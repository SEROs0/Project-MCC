const express = require('express')
const router  = express.Router()
const db      = require('../db')
const bcrypt  = require('bcryptjs')

// helper: patient เข้าได้เฉพาะของตัวเอง, doctor เข้าได้ทุกคน
const isOwnerOrDoctor = (req, patientId) =>
  req.user.type === 'doctor' || req.user.id === parseInt(patientId)

// GET /:hn — ใช้โดย Patient.js (fresh data) และ PatientDetail.js (doctor lookup)
router.get('/:hn', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM patients WHERE hn = ?', [req.params.hn])
    if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบผู้ป่วย' })
    if (!isOwnerOrDoctor(req, rows[0].id)) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลผู้ป่วยคนอื่น' })
    }
    const { password_hash: _ph, ...safe } = rows[0]
    res.json(safe)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /:id/password — patient ตั้ง/เปลี่ยนรหัสผ่าน
router.patch('/:id/password', async (req, res) => {
  if (req.user.type !== 'patient' || req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์' })
  }
  const { currentPassword, newPassword } = req.body
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' })
  }
  try {
    const [rows] = await db.query('SELECT password_hash FROM patients WHERE id = ?', [req.params.id])
    const stored = rows[0]?.password_hash

    if (stored) {
      if (!currentPassword) return res.status(400).json({ message: 'กรุณากรอกรหัสผ่านปัจจุบัน' })
      const match = await bcrypt.compare(currentPassword, stored)
      if (!match) return res.status(400).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await db.query('UPDATE patients SET password_hash = ? WHERE id = ?', [hashed, req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /:id/history — patient ดูของตัวเอง, doctor ดูได้ทุกคน
router.get('/:id/history', async (req, res) => {
  if (!isOwnerOrDoctor(req, req.params.id)) {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลผู้ป่วยคนอื่น' })
  }
  try {
    const [history] = await db.query(
      `SELECT mh.*, d.name AS doctor_name, b.symptom AS booking_symptom
       FROM medical_history mh
       JOIN doctors d ON mh.doctor_id = d.id
       LEFT JOIN bookings b ON mh.booking_id = b.id
       WHERE mh.patient_id = ?
       ORDER BY mh.visit_date DESC`,
      [req.params.id]
    )
    if (history.length > 0) {
      const ids = history.map(h => h.id)
      const [meds] = await db.query(
        'SELECT * FROM prescriptions WHERE medical_history_id IN (?)',
        [ids]
      )
      const medMap = {}
      meds.forEach(m => {
        if (!medMap[m.medical_history_id]) medMap[m.medical_history_id] = []
        medMap[m.medical_history_id].push(m)
      })
      history.forEach(h => { h.medicine = medMap[h.id] || [] })
    }
    res.json(history)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /:id — patient แก้ข้อมูลตัวเองเท่านั้น
router.patch('/:id', async (req, res) => {
  if (req.user.type !== 'patient' || req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์แก้ไขข้อมูลผู้ป่วยคนอื่น' })
  }
  const { phone, allergy, congenital } = req.body
  try {
    await db.query(
      'UPDATE patients SET phone = ?, allergy = ?, congenital = ? WHERE id = ?',
      [phone ?? null, allergy ?? null, congenital ?? null, req.params.id]
    )
    const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [req.params.id])
    res.json({ success: true, patient: rows[0] })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
