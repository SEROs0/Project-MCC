import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { getDoctorQueue, updateBookingStatus } from '../../api'
import DoctorSidebar from './DoctorSidebar'

const STATUS_COLOR = {
  'รอตรวจ':     { bg: '#3d2a0d', color: '#f0a500' },
  'กำลังตรวจ': { bg: '#0d2a3d', color: '#4fc3f7' },
  'เสร็จสิ้น':  { bg: '#0d3d2a', color: '#1D9E75' },
}

function DoctorQueue() {
  const { currentDoctor } = useAuth()
  const navigate = useNavigate()

  const [queue, setQueue]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [updating, setUpdating]         = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchText, setSearchText]     = useState('')

  const todayIso = new Date().toISOString().split('T')[0]
  const isToday  = selectedDate === todayIso

  const dateText = new Date(selectedDate + 'T12:00:00').toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  useEffect(() => {
    if (!currentDoctor) { navigate('/doctor-login'); return }

    const doFetch = async () => {
      const data = await getDoctorQueue(currentDoctor.id, selectedDate)
      setQueue(Array.isArray(data) ? data : [])
    }

    setLoading(true)
    doFetch().finally(() => setLoading(false))

    // auto-refresh ทุก 30 วิ (เฉพาะวันนี้)
    if (isToday) {
      const interval = setInterval(doFetch, 30000)
      return () => clearInterval(interval)
    }
  }, [currentDoctor, selectedDate])

  const handleStatus = async (bookingId, newStatus) => {
    setUpdating(bookingId)
    await updateBookingStatus(bookingId, newStatus)
    setQueue(prev => prev.map(q => q.id === bookingId ? { ...q, status: newStatus } : q))
    setUpdating(null)
  }

  const filteredQueue = queue.filter(q => {
    if (!searchText.trim()) return true
    const s = searchText.toLowerCase()
    return (
      q.patient_name?.toLowerCase().includes(s) ||
      q.hn?.toLowerCase().includes(s) ||
      q.symptom?.toLowerCase().includes(s)
    )
  })

  const counts = {
    รอตรวจ:     queue.filter(q => q.status === 'รอตรวจ').length,
    กำลังตรวจ: queue.filter(q => q.status === 'กำลังตรวจ').length,
    เสร็จสิ้น:  queue.filter(q => q.status === 'เสร็จสิ้น').length,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
      <DoctorSidebar />

      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '22px', margin: 0 }}>
              {isToday ? 'คิววันนี้' : 'คิวตามวันที่เลือก'}
            </h1>
            <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>{dateText}</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type='date'
              value={selectedDate}
              onChange={e => { setSearchText(''); setSelectedDate(e.target.value) }}
              style={{
                background: '#1e1e1e', border: '1px solid #2a2a2a',
                borderRadius: '8px', color: 'white', padding: '7px 10px',
                fontSize: '13px', cursor: 'pointer',
              }}
            />
            {!isToday && (
              <button
                onClick={() => setSelectedDate(todayIso)}
                style={{
                  padding: '7px 12px', background: '#1e1e1e',
                  border: '1px solid #2a2a2a', borderRadius: '8px',
                  color: '#888', fontSize: '12px', cursor: 'pointer',
                }}
              >
                กลับวันนี้
              </button>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'รอตรวจ',     count: counts['รอตรวจ'],     ...STATUS_COLOR['รอตรวจ'] },
            { label: 'กำลังตรวจ', count: counts['กำลังตรวจ'], ...STATUS_COLOR['กำลังตรวจ'] },
            { label: 'เสร็จสิ้น',  count: counts['เสร็จสิ้น'],  ...STATUS_COLOR['เสร็จสิ้น'] },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: s.bg, border: `1px solid ${s.color}22`,
              borderRadius: '10px', padding: '14px 18px',
            }}>
              <p style={{ color: s.color, fontSize: '24px', fontWeight: '700', margin: 0 }}>{s.count}</p>
              <p style={{ color: '#888', fontSize: '12px', margin: '2px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Queue table */}
        <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #2a2a2a',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
            flexWrap: 'wrap',
          }}>
            <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>
              รายการคิว ({searchText ? `${filteredQueue.length}/` : ''}{queue.length} คน)
              {isToday && <span style={{ color: '#444', fontSize: '11px', marginLeft: '8px' }}>รีเฟรชอัตโนมัติทุก 30 วิ</span>}
            </p>
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder='ค้นหาชื่อ / HN / อาการ...'
              style={{
                background: '#252525', border: '1px solid #333',
                borderRadius: '8px', color: 'white', padding: '7px 12px',
                fontSize: '12px', width: '220px',
              }}
            />
          </div>

          {loading ? (
            <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>กำลังโหลด...</p>
          ) : filteredQueue.length === 0 ? (
            <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>
              {queue.length === 0 ? 'ไม่มีคิว' : 'ไม่พบผลการค้นหา'}
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  {['คิว', 'เวลา', 'ชื่อผู้ป่วย', 'HN', 'อาการ', 'สถานะ', 'จัดการ'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: '#555', fontSize: '12px', textAlign: 'left', fontWeight: '400' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((q, i) => {
                  const sc = STATUS_COLOR[q.status] || STATUS_COLOR['รอตรวจ']
                  return (
                    <tr key={q.id} style={{ borderBottom: i < filteredQueue.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <td style={{ padding: '14px 16px', color: '#1D9E75', fontWeight: '600' }}>#{q.queue_number}</td>
                      <td style={{ padding: '14px 16px', color: 'white', fontSize: '13px' }}>
                        {q.slot_time ? q.slot_time.substring(0, 5) : '-'}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'white', fontSize: '13px' }}>{q.patient_name}</td>
                      <td style={{ padding: '14px 16px', color: '#888', fontSize: '12px' }}>{q.hn}</td>
                      <td style={{ padding: '14px 16px', color: '#888', fontSize: '12px', maxWidth: '160px' }}>{q.symptom}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: sc.bg, color: sc.color,
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                        }}>{q.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {q.status === 'รอตรวจ' && (
                            <button
                              onClick={() => handleStatus(q.id, 'กำลังตรวจ')}
                              disabled={updating === q.id}
                              style={{ padding: '5px 10px', background: '#0d2a3d', border: '1px solid #4fc3f7', borderRadius: '6px', color: '#4fc3f7', fontSize: '11px', cursor: 'pointer' }}
                            >
                              เรียกเข้าตรวจ
                            </button>
                          )}
                          {q.status === 'กำลังตรวจ' && (
                            <button
                              onClick={() => navigate(`/doctor/patient/${q.patient_id}?bookingId=${q.id}`, {
                                state: { patientName: q.patient_name, patientHn: q.hn },
                              })}
                              style={{ padding: '5px 10px', background: '#0d3d2a', border: '1px solid #1D9E75', borderRadius: '6px', color: '#1D9E75', fontSize: '11px', cursor: 'pointer' }}
                            >
                              บันทึกผล
                            </button>
                          )}
                          {q.status === 'เสร็จสิ้น' && (
                            <span style={{ color: '#555', fontSize: '11px' }}>เสร็จแล้ว</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorQueue
