const express = require('express')
const router  = express.Router()
const db      = require('../db')

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, dept.name as dept_name
      FROM doctors d
      JOIN departments dept ON d.department_id = dept.id
      WHERE d.is_active = true
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
