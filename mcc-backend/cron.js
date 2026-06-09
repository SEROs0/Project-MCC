const cron = require('node-cron')
const db   = require('./db')

const runDailyCleanup = async () => {
  const today = new Date().toISOString().split('T')[0]

  const [res] = await db.query(
    `UPDATE bookings SET status = 'เสร็จสิ้น'
     WHERE booking_date < ? AND status IN ('รอตรวจ', 'กำลังตรวจ')`,
    [today]
  )
  if (res.affectedRows > 0)
    console.log(`[Cron] Auto-completed ${res.affectedRows} stale booking(s)`)

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  await db.query('DELETE FROM slot_bookings WHERE booking_date < ?', [cutoffStr])
  console.log(`[Cron] Slot cleanup done (before ${cutoffStr})`)
}

// รันทันทีตอน server start เพื่อจัดการ bookings ที่ค้างจากวันก่อน (กรณี server ดับ / cron ไม่ได้รัน)
runDailyCleanup().catch(err => console.error('[Cron] Startup cleanup error:', err.message))

// จากนั้น schedule ทุกวันเที่ยงคืน 00:01
cron.schedule('1 0 * * *', () => {
  runDailyCleanup().catch(err => console.error('[Cron] Daily run error:', err.message))
}, { timezone: 'Asia/Bangkok' })

console.log('[Cron] Scheduled: auto-complete stale bookings + slot cleanup at 00:01 daily (Bangkok)')
