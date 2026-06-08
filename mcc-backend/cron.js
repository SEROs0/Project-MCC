const cron = require('node-cron')
const db   = require('./db')

// ทุกเที่ยงคืน 00:01 — auto-complete bookings ค้างจากวันก่อน + ล้าง slot_bookings เก่า
cron.schedule('1 0 * * *', async () => {
  const today = new Date().toISOString().split('T')[0]
  try {
    // Auto-complete bookings ที่ยังค้าง 'รอตรวจ' / 'กำลังตรวจ' จากวันก่อน
    const [res] = await db.query(
      `UPDATE bookings SET status = 'เสร็จสิ้น'
       WHERE booking_date < ? AND status IN ('รอตรวจ', 'กำลังตรวจ')`,
      [today]
    )
    if (res.affectedRows > 0) {
      console.log(`[Cron] Auto-completed ${res.affectedRows} stale booking(s)`)
    }

    // ลบ slot_bookings ที่เก่ากว่า 30 วัน
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const cutoffStr = cutoff.toISOString().split('T')[0]
    await db.query('DELETE FROM slot_bookings WHERE booking_date < ?', [cutoffStr])
    console.log(`[Cron] Slot cleanup done (before ${cutoffStr})`)
  } catch (err) {
    console.error('[Cron] Error:', err.message)
  }
}, { timezone: 'Asia/Bangkok' })

console.log('[Cron] Scheduled: auto-complete stale bookings + slot cleanup at 00:01 daily')
