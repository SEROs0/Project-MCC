const express = require('express')
const router  = express.Router()
const db      = require('../db')

router.get('/', async (req,res) => {
  try {
    const [timeSlots] = await db.query(
      `SELECT * 
      FROM mcc_project.time_slots
      WHERE is_active = 1`
    )
    res.json(timeSlots)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

module.exports = router