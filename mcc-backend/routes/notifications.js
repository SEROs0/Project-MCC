const express = require('express')
const router  = express.Router()
const db      = require('../db')

router.get('/:patientId', async (req, res) => {
  if (req.user.id !== parseInt(req.params.patientId)) {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึงการแจ้งเตือนของผู้ป่วยคนอื่น' })
  }
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE patient_id = ? ORDER BY created_at DESC',
      [req.params.patientId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.patch('/:id/read', async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = true WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
