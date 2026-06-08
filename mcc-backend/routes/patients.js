const express = require('express')
const router  = express.Router()
const db      = require('../db')

router.get('/:hn', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM patients WHERE hn = ?', [req.params.hn])
    if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบผู้ป่วย' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/:id/history', async (req, res) => {
  try {
    const [history] = await db.query(
      `SELECT mh.*, d.name as doctor_name, b.symptom as booking_symptom
       FROM medical_history mh
       JOIN doctors d ON mh.doctor_id = d.id
       JOIN bookings b ON mh.booking_id = b.id
       WHERE mh.patient_id = ?
       ORDER BY mh.visit_date DESC`,
      [req.params.id]
    )
    for (let h of history) {
      const [meds] = await db.query(
        'SELECT * FROM prescriptions WHERE medical_history_id = ?', [h.id]
      )
      h.medicine = meds
    }
    res.json(history)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/timeslots', async (req,res) => {
  try {
    const [timeSlots] = await db.query(
      `SELECT * 
      FROM mcc_project.time_slots` ,
      [req.params.id]
    )
    res.json(timeSlots)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

module.exports = router