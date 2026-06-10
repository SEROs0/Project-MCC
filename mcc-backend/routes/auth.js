const express  = require('express')
const router   = express.Router()
const db       = require('../db')
const jwt      = require('jsonwebtoken')
const bcrypt   = require('bcryptjs')

const SECRET = process.env.JWT_SECRET || 'medcare_dev_secret_CHANGE_IN_PROD'

// Patient login — HN + รหัสผ่าน (ถ้าตั้งไว้แล้ว)
router.post('/login', async (req, res) => {
  const { hn, password } = req.body
  if (!hn) return res.status(400).json({ success: false, message: 'กรุณากรอก HN' })
  try {
    const [rows] = await db.query('SELECT * FROM patients WHERE hn = ?', [hn.trim()])
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'ไม่พบ HN นี้ในระบบ' })

    const patient = rows[0]

    // ถ้าตั้งรหัสผ่านไว้แล้ว ต้องตรวจสอบ
    if (patient.password_hash) {
      if (!password) {
        return res.status(401).json({ success: false, needPassword: true, message: 'กรุณากรอกรหัสผ่าน' })
      }
      const match = await bcrypt.compare(password, patient.password_hash)
      if (!match) return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' })
    }

    const { password_hash: _ph, ...safePatient } = patient
    const token = jwt.sign({ type: 'patient', id: patient.id }, SECRET, { expiresIn: '12h' })
    res.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', patient: safePatient, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Doctor login — employee_id + password (bcrypt, auto-migrate plaintext)
router.post('/doctor-login', async (req, res) => {
  const { employeeId, password } = req.body
  if (!employeeId || !password) return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ' })
  try {
    const [rows] = await db.query(
      `SELECT d.*, dept.name AS dept_name
       FROM doctors d
       JOIN departments dept ON d.department_id = dept.id
       WHERE d.employee_id = ?`,
      [employeeId.trim()]
    )
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง' })

    const doctor = rows[0]
    let match = false

    if (doctor.password.startsWith('$2')) {
      match = await bcrypt.compare(password, doctor.password)
    } else {
      // plaintext (legacy) — migrate on first successful login
      match = password === doctor.password
      if (match) {
        const hashed = await bcrypt.hash(password, 10)
        await db.query('UPDATE doctors SET password = ? WHERE id = ?', [hashed, doctor.id])
      }
    }

    if (!match) return res.status(401).json({ success: false, message: 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง' })

    const { password: _pw, ...safeDoctor } = doctor
    const token = jwt.sign({ type: 'doctor', id: doctor.id }, SECRET, { expiresIn: '12h' })
    res.json({ success: true, doctor: safeDoctor, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
