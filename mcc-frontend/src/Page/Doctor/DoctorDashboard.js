import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { getDoctorQueue, getDoctorStats } from '../../api'
import DoctorSidebar from './DoctorSidebar'
import {
  IconUsers, IconClock, IconStethoscope, IconCircleCheck,
} from '@tabler/icons-react'
import './Doctor.css'

const STATUS_COLOR = {
  'รอตรวจ':     { bg: '#3d2a0d', color: '#f0a500' },
  'กำลังตรวจ': { bg: '#0d2a3d', color: '#4fc3f7' },
  'เสร็จสิ้น':  { bg: '#0d3d2a', color: '#1D9E75' },
}

// สร้าง array 7 วันล่าสุด (ISO string) เติม 0 ในวันที่ไม่มีข้อมูล
const buildWeek = (weekRows) => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 6 + i)
    const iso = d.toISOString().split('T')[0]
    const found = weekRows.find(r => r.booking_date === iso)
    return {
      date:      iso,
      total:     Number(found?.total     ?? 0),
      done:      Number(found?.done      ?? 0),
      cancelled: Number(found?.cancelled ?? 0),
    }
  })
}

function DoctorDashboard() {
  const { currentDoctor } = useAuth()
  const navigate = useNavigate()

  const [queue, setQueue]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [monthStats, setMonth]    = useState(null)
  const [weekData, setWeek]       = useState([])
  const [statsLoading, setStatsL] = useState(true)

  const todayIso = new Date().toISOString().split('T')[0]
  const dateText = new Date(todayIso + 'T12:00:00').toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const monthText = new Date(todayIso + 'T12:00:00').toLocaleDateString('th-TH', {
    month: 'long', year: 'numeric',
  })

  useEffect(() => {
    if (!currentDoctor) { navigate('/doctor-login'); return }

    getDoctorQueue(currentDoctor.id, todayIso)
      .then(data => setQueue(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))

    getDoctorStats(currentDoctor.id)
      .then(data => {
        if (data?.month) setMonth(data.month)
        if (Array.isArray(data?.week)) setWeek(buildWeek(data.week))
      })
      .finally(() => setStatsL(false))
  }, [currentDoctor])

  const counts = {
    total:      queue.length,
    waiting:    queue.filter(q => q.status === 'รอตรวจ').length,
    inProgress: queue.filter(q => q.status === 'กำลังตรวจ').length,
    done:       queue.filter(q => q.status === 'เสร็จสิ้น').length,
  }

  const statCards = [
    { label: 'ผู้ป่วยทั้งหมด', count: counts.total,      Icon: IconUsers,       bg: '#1a2a1a', color: '#1D9E75' },
    { label: 'รอตรวจ',        count: counts.waiting,    Icon: IconClock,       bg: '#3d2a0d', color: '#f0a500' },
    { label: 'กำลังตรวจ',    count: counts.inProgress,  Icon: IconStethoscope, bg: '#0d2a3d', color: '#4fc3f7' },
    { label: 'เสร็จสิ้น',    count: counts.done,        Icon: IconCircleCheck, bg: '#0d3d2a', color: '#1D9E75' },
  ]

  const waitingQueue = queue.filter(q => q.status === 'รอตรวจ')
  const maxBar = Math.max(...weekData.map(d => d.total), 1)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
      <DoctorSidebar />

      <div className="doctor-main-content">

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: 'white', fontSize: '22px', margin: 0 }}>ภาพรวม</h1>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>{dateText}</p>
        </div>

        {/* Doctor info */}
        <div style={{
          background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '12px',
          padding: '20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: '#0d3d2a', border: '1px solid #1D9E75',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', color: '#1D9E75', fontWeight: '600', flexShrink: 0,
          }}>
            {currentDoctor?.name?.slice(0, 2)}
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: '600', fontSize: '15px', margin: 0 }}>
              {currentDoctor?.name}
            </p>
            <p style={{ color: '#555', fontSize: '12px', marginTop: '3px' }}>
              {currentDoctor?.dept_name}
            </p>
          </div>
        </div>

        {/* วันนี้ */}
        <p style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
          วันนี้
        </p>
        <div className="doctor-stats-grid" style={{ marginBottom: '24px' }}>
          {statCards.map(s => (
            <div key={s.label} style={{
              background: s.bg, border: `1px solid ${s.color}22`,
              borderRadius: '12px', padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: s.color, fontSize: '30px', fontWeight: '700', margin: 0 }}>
                    {loading ? '—' : s.count}
                  </p>
                  <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 0' }}>{s.label}</p>
                </div>
                <s.Icon size={20} color={s.color} style={{ opacity: 0.5 }} />
              </div>
            </div>
          ))}
        </div>

        {/* สถิติเดือนนี้ */}
        <div style={{
          background: '#1e1e1e', border: '1px solid #2a2a2a',
          borderRadius: '12px', padding: '20px', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>สถิติเดือนนี้</p>
            <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>{monthText}</p>
          </div>

          {/* Month summary */}
          <div className="doctor-monthly-grid">
            {[
              { label: 'ผู้ป่วยทั้งหมด', val: monthStats?.total,     color: '#1D9E75' },
              { label: 'รักษาเสร็จแล้ว', val: monthStats?.done,      color: '#4fc3f7' },
              { label: 'ยกเลิกนัด',      val: monthStats?.cancelled, color: '#e57373' },
            ].map(item => (
              <div key={item.label} style={{ background: '#252525', borderRadius: '8px', padding: '12px 14px' }}>
                <p style={{ color: item.color, fontSize: '24px', fontWeight: '700', margin: 0 }}>
                  {statsLoading ? '—' : (Number(item.val) || 0)}
                </p>
                <p style={{ color: '#666', fontSize: '11px', margin: '3px 0 0' }}>{item.label}</p>
              </div>
            ))}
          </div>

          {/* 7-day bar chart */}
          <p style={{ color: '#444', fontSize: '11px', marginBottom: '10px' }}>7 วันล่าสุด</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '72px' }}>
            {weekData.length === 0 && !statsLoading
              ? <p style={{ color: '#444', fontSize: '12px' }}>ไม่มีข้อมูล</p>
              : weekData.map((d, i) => {
                  const barH   = d.total > 0 ? Math.max((d.total / maxBar) * 52, 6) : 3
                  const isToday = d.date === todayIso
                  const dayLabel = new Date(d.date + 'T12:00:00')
                    .toLocaleDateString('th-TH', { weekday: 'short' })
                    .slice(0, 2)
                  return (
                    <div key={i} style={{
                      flex: 1, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '4px', justifyContent: 'flex-end',
                    }}>
                      {d.total > 0 && (
                        <p style={{ color: '#888', fontSize: '9px', margin: 0 }}>{d.total}</p>
                      )}
                      <div title={`${d.date}: ${d.total} คน`} style={{
                        width: '100%',
                        height: `${barH}px`,
                        background: isToday ? '#1D9E75' : d.total > 0 ? '#1D9E7566' : '#252525',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s',
                      }} />
                      <p style={{
                        color: isToday ? '#1D9E75' : '#555',
                        fontSize: '9px', margin: 0, fontWeight: isToday ? '600' : '400',
                      }}>
                        {dayLabel}
                      </p>
                    </div>
                  )
                })
            }
          </div>
        </div>

        {/* Waiting list */}
        <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #2a2a2a',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>
              ผู้ป่วยที่รอตรวจ
              <span style={{ color: '#555', fontSize: '12px', fontWeight: '400', marginLeft: '8px' }}>
                ({counts.waiting} คน)
              </span>
            </p>
            <button
              onClick={() => navigate('/doctor/queue')}
              style={{
                background: 'transparent', border: '1px solid #2a2a2a',
                borderRadius: '8px', color: '#888', fontSize: '12px',
                padding: '5px 12px', cursor: 'pointer',
              }}
            >
              ดูคิวทั้งหมด →
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#555', textAlign: 'center', padding: '32px', fontSize: '13px' }}>
              กำลังโหลด...
            </p>
          ) : waitingQueue.length === 0 ? (
            <p style={{ color: '#555', textAlign: 'center', padding: '32px', fontSize: '13px' }}>
              ไม่มีผู้ป่วยที่รอตรวจ
            </p>
          ) : (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {waitingQueue.slice(0, 6).map(q => {
                const sc = STATUS_COLOR[q.status] || STATUS_COLOR['รอตรวจ']
                return (
                  <div key={q.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', background: '#252525', borderRadius: '8px',
                  }}>
                    <span style={{ color: '#1D9E75', fontWeight: '600', minWidth: '28px', fontSize: '13px' }}>
                      #{q.queue_number}
                    </span>
                    <span style={{ color: 'white', fontSize: '13px', flex: 1 }}>{q.patient_name}</span>
                    <span style={{ color: '#888', fontSize: '11px', minWidth: '36px' }}>
                      {q.slot_time?.substring(0, 5)}
                    </span>
                    <span style={{
                      background: sc.bg, color: sc.color,
                      padding: '2px 8px', borderRadius: '20px', fontSize: '10px', whiteSpace: 'nowrap',
                    }}>
                      {q.status}
                    </span>
                  </div>
                )
              })}
              {waitingQueue.length > 6 && (
                <p style={{ color: '#555', fontSize: '12px', textAlign: 'center', margin: '4px 0' }}>
                  และอีก {waitingQueue.length - 6} คน...
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default DoctorDashboard
