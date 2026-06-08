import './Notification.css'
import { useState, useEffect } from 'react'
import Sidebar from '../sidebar'
import { useAuth } from '../Context/AuthContext'
import { getNotifications, markAsRead as markNotifAsRead } from '../../api'
import {
  IconCalendarCheck, IconClock, IconAlertCircle,
  IconFileDescription, IconBell,
} from '@tabler/icons-react'

const ICON_MAP = {
  'ti-calendar-check': IconCalendarCheck,
  'ti-clock':          IconClock,
  'ti-alert-circle':   IconAlertCircle,
  'ti-file-text':      IconFileDescription,
  'ti-bell':           IconBell,
}

const getRelativeTime = (ts, now) => {
  const diff = Math.floor((now - ts) / 1000)
  if (isNaN(diff) || diff < 0) return 'เมื่อกี้'
  if (diff < 60)    return 'เมื่อกี้'
  if (diff < 3600)  return `${Math.floor(diff / 60)} นาทีที่แล้ว`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชม.ที่แล้ว`
  return `${Math.floor(diff / 86400)} วันที่แล้ว`
}

const DEFAULT_TOGGLES = { remind1day: true, remind2hr: true }

const DB_TYPE_MAP = {
  booking: { uiType: 'green', icon: 'ti-calendar-check' },
  result:  { uiType: 'blue',  icon: 'ti-file-text' },
}

function NotificationPage() {
  const { bookings, currentUser } = useAuth()
  const [now, setNow] = useState(Date.now())

  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('readNotifIds') || '[]')) }
    catch { return new Set() }
  })

  const [toggles, setToggles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notifToggles')) || DEFAULT_TOGGLES }
    catch { return DEFAULT_TOGGLES }
  })

  const [notifPermission, setNotifPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  )

  // อัปเดตเวลาทุก 60 วิ
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  // บันทึก toggles ลง localStorage ทุกครั้งที่เปลี่ยน
  useEffect(() => {
    localStorage.setItem('notifToggles', JSON.stringify(toggles))
  }, [toggles])

  // schedule browser notification ตาม bookings + toggles
  useEffect(() => {
    if (notifPermission !== 'granted' || !bookings?.length) return

    const timers = []

    bookings.forEach(b => {
      if (!b.time) return
      const [h, m] = b.time.split(':').map(Number)
      const apptTime = new Date()
      apptTime.setHours(h, m, 0, 0)

      if (toggles.remind2hr) {
        const delay = apptTime.getTime() - 2 * 3600 * 1000 - Date.now()
        if (delay > 0) {
          timers.push(setTimeout(() => {
            new Notification('MedCare — แจ้งเตือนนัดหมาย', {
              body: `อีก 2 ชั่วโมง คุณมีนัดกับ ${b.doctor} เวลา ${b.time} น.`,
              icon: '/favicon.ico'
            })
          }, delay))
        }
      }

      if (toggles.remind1day) {
        const delay = apptTime.getTime() - 24 * 3600 * 1000 - Date.now()
        if (delay > 0) {
          timers.push(setTimeout(() => {
            new Notification('MedCare — แจ้งเตือนนัดหมาย', {
              body: `พรุ่งนี้คุณมีนัดกับ ${b.doctor} เวลา ${b.time} น.`,
              icon: '/favicon.ico'
            })
          }, delay))
        }
      }
    })

    return () => timers.forEach(clearTimeout)
  }, [bookings, toggles, notifPermission])

  const [notifications, setNotifications] = useState([])

  // ดึงการแจ้งเตือนจาก DB
  useEffect(() => {
    if (!currentUser) return
    getNotifications(currentUser.id).then(data => {
      if (!Array.isArray(data)) return
      setNotifications(data.map(n => {
        const map = DB_TYPE_MAP[n.type] || { uiType: 'amber', icon: 'ti-bell' }
        return {
          id:        n.id,
          type:      map.uiType,
          icon:      map.icon,
          title:     n.title,
          sub:       n.message,
          createdAt: new Date(n.created_at).getTime(),
          read:      !!n.is_read || readIds.has(n.id),
          fromDb:    true,
        }
      }).sort((a, b) => b.createdAt - a.createdAt))
    })
  }, [currentUser])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    const unread = notifications.filter(n => !n.read)
    unread.filter(n => n.fromDb).forEach(n => markNotifAsRead(n.id))
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    const allIds = notifications.map(n => n.id)
    const newSet = new Set([...readIds, ...allIds])
    localStorage.setItem('readNotifIds', JSON.stringify([...newSet]))
    setReadIds(newSet)
  }

  const markRead = (id) => {
    const notif = notifications.find(n => n.id === id)
    if (notif && !notif.read) {
      if (notif.fromDb) markNotifAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setReadIds(prev => {
        const next = new Set([...prev, id])
        localStorage.setItem('readNotifIds', JSON.stringify([...next]))
        return next
      })
    }
  }

  const toggleSwitch = async (key) => {
    const newVal = !toggles[key]

    // ขอ permission เมื่อเปิด remind toggle
    if (newVal && (key === 'remind1day' || key === 'remind2hr')) {
      if ('Notification' in window && Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission()
        setNotifPermission(permission)
        if (permission === 'granted') {
          new Notification('MedCare', { body: 'เปิดการแจ้งเตือนสำเร็จแล้ว ✓', icon: '/favicon.ico' })
        }
      }
    }

    setToggles(prev => ({ ...prev, [key]: newVal }))
  }

  const iconColorMap = { green: 'ni-green', amber: 'ni-amber', blue: 'ni-blue', red: 'ni-red' }

  const toggleItems = [
    { key: 'remind1day', label: 'เตือนก่อนนัด 1 วัน', sub: 'Browser Push Notification' },
    { key: 'remind2hr',  label: 'เตือนก่อนนัด 2 ชม.', sub: 'Browser Push Notification' },
  ]

  return (
    <div className='notification-page'>
      <Sidebar />

      <div className='notification-content'>
        <div className='headertext'>
          <h1>การแจ้งเตือน</h1>
          <p>อัปเดตนัดหมาย ผลตรวจ และข้อความจากคลินิก</p>
        </div>

        <div className='notif-grid'>

          {/* คอลัมน์ซ้าย */}
          <div>
            <div className='notif-card'>
              <div className='notif-card-title'>
                ล่าสุด
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {unreadCount > 0 && (
                    <span style={{
                      background: '#0d3d2a', color: '#1D9E75',
                      border: '0.5px solid #1D9E75',
                      padding: '2px 8px', borderRadius: '20px', fontSize: '11px'
                    }}>
                      {unreadCount} ยังไม่อ่าน
                    </span>
                  )}
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{
                      background: 'transparent', border: 'none',
                      color: '#555', fontSize: '11px', cursor: 'pointer'
                    }}>
                      อ่านทั้งหมด
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className='empty-state'>
                  <IconBell size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
                  <br />ไม่มีการแจ้งเตือน
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className='notif-item' onClick={() => markRead(n.id)}>
                    {!n.read ? <div className='unread-dot' /> : <div className='read-dot' />}
                    <div className={`notif-icon-wrap ${iconColorMap[n.type]}`}>
                      {(() => { const Icon = ICON_MAP[n.icon] || IconBell; return <Icon size={18} /> })()}
                    </div>
                    <div className='notif-body'>
                      <p className={`notif-title ${n.read ? 'read' : ''}`}>{n.title}</p>
                      <p className='notif-sub'>{n.sub}</p>
                    </div>
                    <span className='notif-time'>{getRelativeTime(n.createdAt, now)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* คอลัมน์ขวา */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* นัดที่กำลังจะมาถึง */}
            <div className='notif-card'>
              <div className='notif-card-title'>นัดที่กำลังจะมาถึง</div>
              {bookings.filter(b => b.status !== 'เสร็จสิ้น').length === 0 ? (
                <p style={{ color: '#555', fontSize: '13px' }}>ไม่มีนัดหมายที่กำลังจะมาถึง</p>
              ) : (
                bookings.filter(b => b.status !== 'เสร็จสิ้น').map((b, i) => (
                  <div key={b.id ?? i} className='appt-item'>
                    <div className='appt-time-block'>
                      <p className='appt-time-main'>{b.time}</p>
                      <p className='appt-time-date'>วันนี้</p>
                    </div>
                    <div className='appt-divider' />
                    <div className='appt-info'>
                      <p className='appt-name'>{b.symptoms || 'นัดหมาย'}</p>
                      <p className='appt-detail'>{b.doctor}</p>
                    </div>
                    <span className='badge badge-green'>ยืนยัน</span>
                  </div>
                ))
              )}
            </div>

            {/* ตั้งค่าการแจ้งเตือน */}
            <div className='notif-card'>
              <div className='notif-card-title'>ตั้งค่าการแจ้งเตือน</div>

              {/* แสดงสถานะ permission */}
              {notifPermission === 'denied' && (
                <div style={{
                  background: '#3d0d0d', border: '1px solid #e57373',
                  borderRadius: '8px', padding: '8px 12px', marginBottom: '12px',
                  fontSize: '12px', color: '#e57373'
                }}>
                  ⚠ Browser ปฏิเสธการแจ้งเตือน — กรุณาเปิดอนุญาตในการตั้งค่าเบราว์เซอร์
                </div>
              )}
              {notifPermission === 'granted' && (
                <div style={{
                  background: '#0d3d2a', border: '1px solid #1D9E75',
                  borderRadius: '8px', padding: '8px 12px', marginBottom: '12px',
                  fontSize: '12px', color: '#1D9E75'
                }}>
                  ✓ เปิดใช้งาน Browser Push Notification แล้ว
                </div>
              )}

              {toggleItems.map(item => (
                <div key={item.key} className='toggle-item'>
                  <div>
                    <p className='toggle-label'>{item.label}</p>
                    <p className='toggle-sub'>{item.sub}</p>
                  </div>
                  <button
                    className='toggle-switch'
                    onClick={() => toggleSwitch(item.key)}
                    style={{ background: toggles[item.key] ? '#1D9E75' : '#2a2a2a' }}
                    aria-label={item.label}
                  >
                    <div className='toggle-knob' style={{ left: toggles[item.key] ? '19px' : '3px' }} />
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPage
