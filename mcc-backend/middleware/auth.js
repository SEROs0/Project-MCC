const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'medcare_dev_secret_CHANGE_IN_PROD'

const verify = (type) => (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อน' })
  }
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, SECRET)
    if (payload.type !== type) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' })
    }
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' })
  }
}

// ยอมรับ token ทุก type (ใช้กับ route ที่ทั้ง patient และ doctor เข้าถึงได้)
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อน' })
  }
  const token = header.slice(7)
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' })
  }
}

module.exports = {
  requirePatient: verify('patient'),
  requireDoctor:  verify('doctor'),
  requireAuth,
}
