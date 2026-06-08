const express = require('express')
const router  = express.Router()
const db      = require('../db')

router.post('/login', async (req, res) => {
  const { hn } = req.body
  try {
    const [rows] = await db.query('SELECT * FROM patients WHERE hn = ?', [hn])
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'ไม่พบ HN นี้ในระบบ' })
    }
    res.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', patient: rows[0] })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/doctor-login', async (req, res) => {
  const { employeeId, password } = req.body
  try {
    const [rows] = await db.query(
      'SELECT d.*, dept.name as dept_name FROM doctors d JOIN departments dept ON d.department_id = dept.id WHERE d.employee_id = ? AND d.password = ?',
      [employeeId, password]
    )
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง' })
    }
    res.json({ success: true, doctor: rows[0] })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
