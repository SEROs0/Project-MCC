import './Notification.css'
import { useState, useEffect } from 'react'
import Sidebar from '../sidebar'
import { useAuth } from '../Context/AuthContext'

function NotificationPage() {
  const { currentUser, bookings } = useAuth()

  // แปลง bookings เป็น notifications
  const bookingNotifs = bookings.map(b => ({
    id:    b.id,
    type:  'green',
    icon:  'ti-calendar-check',
    title: 'จองคิวสำเร็จแล้ว',
    sub:   `${b.doctor} — ${b.date} เวลา ${b.time} น.`,
    time:  'ล่าสุด',
    read:  false,
  })) 

  const [notifications, setNotifications] = useState([
    ...bookingNotifs,
    {
      id: 'n1', type: 'amber', icon: 'ti-clock',
      title: 'เตือนนัดหมายพรุ่งนี้',
      sub: 'มีนัด 09:00 น. — นพ. สมชาย',
      time: '1 ชม.', read: false
    },
  ])

  const [toggles, setToggles] = useState({
    remind1day: true,
    remind2hr: true,
    medicine: false,
    result: true,
  })

  const upcomingAppts = [
    { time: '10:30', date: 'วันนี้',    name: currentUser?.name ?? 'ผู้ป่วย', detail: 'พญ. สุดา • กุมารเวช',  badge: 'badge-amber', label: 'เร็วๆ นี้' },
    { time: '09:00', date: 'พรุ่งนี้',  name: 'ติดตามอาการ',                  detail: 'นพ. สมชาย • อายุรกรรม', badge: 'badge-green', label: 'ยืนยัน' },
    { time: '10:30', date: '29 พ.ค.',   name: 'ติดตามอาการ',                  detail: 'พญ. สุดา • กุมารเวช',  badge: 'badge-blue',  label: 'จอง' },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const toggleSwitch = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const iconColorMap = {
    green: 'ni-green',
    amber: 'ni-amber',
    blue:  'ni-blue',
    red:   'ni-red',
  }

//   // แปลง bookings เป็น notifications
//   const bookingNotifs = bookings.map(b => ({
//     id:    b.id,
//     type:  'green',
//     icon:  'ti-calendar-check',
//     title: 'จองคิวสำเร็จแล้ว',
//     sub:   `${b.doctor} — ${b.date} เวลา ${b.time} น.`,
//     time:  'ล่าสุด',
//     read:  false,
//   }))

    useEffect(() => {
        
        if (!bookings || !Array.isArray(bookings)) return

        const newNotifs = bookings.map(b => ({
        id:    b.id,
        type:  'green',
        icon:  'ti-calendar-check',
        title: 'จองคิวสำเร็จแล้ว',
        sub:   `${b.doctor} — ${b.date} เวลา ${b.time} น.`,
        time:  'ล่าสุด',
        read:  false,
        }))

    setNotifications(prev => {

        // กรองเอาแจ้งเตือนเก่าที่ไม่ซ้ำกับไอดีที่เข้ามาใหม่
      const filteredPrev = prev.filter(p => !newNotifs.some(n => n.id === p.id))
      // กันซ้ำ — เอาเฉพาะที่ไม่ใช่ booking notification เดิม
      const nonBookingNotifs = prev.filter(n => typeof n.id === 'string')
      return [...newNotifs
        , ...nonBookingNotifs
    ]
    })
  }, [bookings])  // ← รันใหม่ทุกครั้งที่ bookings เปลี่ยน


  return (
    <div className='notification-page'>
      <Sidebar />

      <div className='notification-content'>
        <div className='headertext'>
          <h1>การแจ้งเตือน</h1>
          <p>อัปเดตนัดหมาย ผลตรวจ และข้อความจากคลินิก</p>
        </div>

        <div className='notif-grid'>

          {/* คอลัมน์ซ้าย — รายการแจ้งเตือน */}
          <div>
            <div className='notif-card'>
              <div className='notif-card-title'>
                ล่าสุด
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {unreadCount > 0 && (
                    <span style={{
                      background: '#0d3d2a', color: '#1D9E75',
                      border: '0.5px solid #1D9E75',
                      padding: '2px 8px', borderRadius: '20px',
                      fontSize: '11px'
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
                  <i className='ti ti-bell-off' style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }} />
                  ไม่มีการแจ้งเตือน
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className='notif-item' onClick={() => markRead(n.id)}>
                    {!n.read
                      ? <div className='unread-dot' />
                      : <div className='read-dot' />
                    }
                    <div className={`notif-icon-wrap ${iconColorMap[n.type]}`}>
                      <i className={`ti ${n.icon}`} aria-hidden="true" />
                    </div>
                    <div className='notif-body'>
                      <p className={`notif-title ${n.read ? 'read' : ''}`}>{n.title}</p>
                      <p className='notif-sub'>{n.sub}</p>
                    </div>
                    <span className='notif-time'>{n.time}</span>
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
              {upcomingAppts.map((appt, i) => (
                <div key={i} className='appt-item'>
                  <div className='appt-time-block'>
                    <p className='appt-time-main'>{appt.time}</p>
                    <p className='appt-time-date'>{appt.date}</p>
                  </div>
                  <div className='appt-divider' />
                  <div className='appt-info'>
                    <p className='appt-name'>{appt.name}</p>
                    <p className='appt-detail'>{appt.detail}</p>
                  </div>
                  <span className={`badge ${appt.badge}`}>{appt.label}</span>
                </div>
              ))}
            </div>

            {/* ตั้งค่าการแจ้งเตือน */}
            <div className='notif-card'>
              <div className='notif-card-title'>ตั้งค่าการแจ้งเตือน</div>

              {[
                { key: 'remind1day', label: 'เตือนก่อนนัด 1 วัน',   sub: 'แจ้งเตือนผ่าน Line / SMS' },
                { key: 'remind2hr',  label: 'เตือนก่อนนัด 2 ชม.',   sub: 'แจ้งเตือนทาง Push notification' },
                { key: 'medicine',   label: 'แจ้งเมื่อใบสั่งยาพร้อม', sub: 'แจ้งเตือนผ่านแอป' },
                { key: 'result',     label: 'แจ้งเมื่อผลตรวจพร้อม', sub: 'แจ้งเตือนผ่านแอป' },
              ].map(item => (
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
                    <div className='toggle-knob'
                      style={{ left: toggles[item.key] ? '19px' : '3px' }}
                    />
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