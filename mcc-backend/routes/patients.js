const express = require('express')
const router  = express.Router()
const db      = require('../db')

// B1: /:hn ต้องมาก่อน /:id/history (ไม่งั้น Express อาจ route ผิด)
router.get('/:hn', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM patients WHERE hn = ?', [req.params.hn])
    if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบผู้ป่วย' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// B1 fix: LEFT JOIN bookings (booking_id อาจ NULL ได้)
// B4 fix: ดึง prescriptions ทั้งหมดใน 1 query แทน N+1
router.get('/:id/history', async (req, res) => {
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

// F6: ผู้ป่วยแก้ข้อมูลส่วนตัว (phone, allergy, congenital)
router.patch('/:id', async (req, res) => {
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
