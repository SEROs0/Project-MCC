import Sidebar from "../sidebar"
import { useEffect, useState } from "react"
import { useAuth} from '../Context/AuthContext.js'
import { getPatientHistory, getBookings, getPatientByHn } from "../../api.js"
import './Patient.css'

function PatientHistory () {

    const { currentUser } = useAuth()
    const [Medicalhistory, setMedicalhistory] = useState([])
    const [dbBookings, setDbBookings]         = useState([])
    const [freshPatient, setFreshPatient]     = useState(null)
    const [selectedHistory, setSelectedHistory] = useState(null)

    useEffect(() => {
        const fetchAll = async () => {
            if (!currentUser) return
            const [historyData, bookingData, patientData] = await Promise.all([
                getPatientHistory(currentUser.id),
                getBookings(currentUser.id),
                getPatientByHn(currentUser.hn),
            ])
            setMedicalhistory(Array.isArray(historyData) ? historyData : [])
            setDbBookings(Array.isArray(bookingData) ? bookingData : [])
            if (patientData?.id) setFreshPatient(patientData)
        }
        fetchAll()
    }, [currentUser])

    const Latestprescription = Medicalhistory?.[0]?.medicine || []

    // bookings ที่มี medical_history บันทึกแล้ว → ไม่แสดงซ้ำ
    const treatedBookingIds = new Set(Medicalhistory.map(h => h.booking_id).filter(Boolean))

    const thaiDate = (raw) => {
        const d = new Date(raw)
        return isNaN(d) ? '-' : d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    const pendingHistory = dbBookings
        .filter(b => !treatedBookingIds.has(b.id))
        .map(b => ({
            id:     b.id,
            date:   thaiDate(b.booking_date),
            doctor: b.doctor_name,
            title:  b.symptom || '-',
            diagnosis: null,
            status: b.status,
            isNew:  b.status !== 'เสร็จสิ้น',
        }))

    const completedHistory = Medicalhistory.map(h => ({
        id:              `mh_${h.id}`,
        date:            thaiDate(h.visit_date),
        doctor:          h.doctor_name,
        title:           h.booking_symptom || h.symptoms || '-',
        diagnosis:       h.diagnosis || null,
        medicine:        h.medicine || [],
        nextAppointment: h.next_appointment,
        status:          'เสร็จสิ้น',
        isNew:           false,
    }))

    const renderItem = (history, index) => (
        <div key={history.id ?? index} className='tl-item'>
            <div className='tl-left'>
                <div className={`tl-dot ${index > 0 ? 'old' : ''}`} />
            </div>
            <div className='tl-body'>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <p className='tl-date'>{history.date}</p>
                    {history.isNew && (
                    <span style={{ background: '#0d3d2a', color: '#1D9E75', border: '0.5px solid #1D9E75', padding: '1px 7px', borderRadius: '20px', fontSize: '10px' }}>ใหม่</span>
                    )}
                    {history.status && (
                    <span style={{
                        background: history.status === 'รอตรวจ' ? '#3d2a0d' : history.status === 'กำลังตรวจ' ? '#0d2a3d' : '#0d3d2a',
                        color:      history.status === 'รอตรวจ' ? '#f0a500' : history.status === 'กำลังตรวจ' ? '#4fc3f7' : '#1D9E75',
                        padding: '1px 7px', borderRadius: '20px', fontSize: '10px'
                    }}>{history.status}</span>
                    )}
                </div>
                <p className='tl-title'>{history.title}</p>
                <p className='tl-meta'>{history.doctor}</p>
                {history.diagnosis && (
                <p className='tl-diagnosis'>วินิจฉัย: {history.diagnosis}</p>
                )}
            </div>
        </div>
    )

    return (
        <>
            <div className="patient-page">
            <Sidebar />

            <div className="patient-content">
                <div className="headertext">
                <h1>ประวัติผู้เข้ารักษา</h1>
                <p>ข้อมูลการรักษาและประวัติยา</p>
                </div>

                {/* Patient Header */}
                <div className="patient-header">
                <div className="patient-header-left">
                    <h1>{currentUser?.name}</h1>
                    <div className="patient-meta">
                    <p>HN: {currentUser?.hn}</p>
                    <div className="dot" />
                    <p>อายุ {currentUser?.age} ปี</p>
                    <div className="dot" />
                    <p>{currentUser?.sex}</p>
                    <div className="dot" />
                    <p>กรุ๊ปเลือด {currentUser?.blood_type}</p>
                    </div>
                </div>
                <div className="patient-badges">
                    <span className="badge badge-green">{currentUser?.status}</span>
                    {currentUser?.allergy !== '-' && (
                    <span className="badge badge-red">แพ้ยา {currentUser?.allergy}</span>
                    )}
                </div>
                </div>

                {/* Main Grid */}
                <div className="patient-grid">

                {/* Left Column */}
                <div className="patient-left">

                    {/* ข้อมูลสุขภาพ */}
                    <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0 }}>ข้อมูลสุขภาพ</h3>
                        {(freshPatient ?? currentUser)?.updated_at && (
                        <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>
                            อัปเดตล่าสุด {new Date((freshPatient ?? currentUser).updated_at).toLocaleDateString('th-TH', {
                            day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </p>
                        )}
                    </div>
                    <div className="box_information_heal">
                        <div className="health-item">
                        <p>น้ำหนัก</p>
                        <p>{currentUser?.weight} กก.</p>
                        </div>
                        <div className="health-item">
                        <p>ส่วนสูง</p>
                        <p>{currentUser?.height} ซม.</p>
                        </div>
                        <div className="health-item">
                        <p>BMI</p>
                        <p>{currentUser?.bmi}</p>
                        </div>
                        <div className="health-item">
                        <p>ความดัน</p>
                        <p>{currentUser?.blood_pressure}</p>
                        </div>
                        <div className="health-item">
                        <p>ชีพจร</p>
                        <p>{currentUser?.pulse} bpm</p>
                        </div>
                        <div className="health-item">
                        <p>อุณหภูมิ</p>
                        <p>{currentUser?.temperature} °C</p>
                        </div>
                    </div>
                    <hr className="divider" />
                    <p className="congenital-label">โรคประจำตัว</p>
                    <p className="congenital-value">{currentUser?.congenital}</p>
                    </div>

                    {/* ใบสั่งยาล่าสุด */}
                    <div className="card">
                    <h3>ใบสั่งยาล่าสุด</h3>
                    {Latestprescription.length === 0 ? (
                        <p style={{ color: '#555', fontSize: '13px' }}>ไม่มีข้อมูลยา</p>
                    ) : (
                        Latestprescription.map((med, index) => (
                        <div key={index} className="med-item">
                            <p className="med-name">{med.medicine_name}</p>
                            <p className="med-dose">{med.dosage}</p>
                        </div>
                        ))
                    )}

                    {Medicalhistory?.[0]?.next_appointment === '-' || !Medicalhistory?.[0]?.next_appointment ? (
                        <p className="no-appt">ไม่มีนัดติดตามอาการเพิ่มเติม</p>
                    ) : (
                        <div className="next-appt">
                        📅 นัดติดตามอาการ: {new Date(Medicalhistory[0].next_appointment).toLocaleString('th-TH',{
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                           
                        })}
                        </div>
                    )}
                    </div>
                </div>

                {/* นัดหมายที่รอดำเนินการ */}
                <div className="card">
                    <h3>นัดหมายที่รอดำเนินการ</h3>
                    <div className="timeline">
                    {pendingHistory.length === 0 ? (
                        <p style={{ color: '#444', fontSize: '12px' }}>ไม่มีนัดหมายที่รอดำเนินการ</p>
                    ) : (
                        pendingHistory.map((h, i) => renderItem(h, i))
                    )}
                    </div>
                </div>

                </div>

                {/* ประวัติการรักษาเสร็จสิ้น — full width grid */}
                <div className="card history-section">
                    <h3>ประวัติการรักษาเสร็จสิ้น</h3>
                    {completedHistory.length === 0 ? (
                        <p style={{ color: '#444', fontSize: '12px' }}>ยังไม่มีประวัติการรักษา</p>
                    ) : (
                        <div className="history-grid">
                        {completedHistory.map((h, i) => (
                            <div key={h.id ?? i} className="history-card" onClick={() => setSelectedHistory(h)} style={{ cursor: 'pointer' }}>
                                <div className="hc-header">
                                    <span className="hc-date">{h.date}</span>
                                    <span className="hc-status">เสร็จสิ้น</span>
                                </div>
                                <p className="hc-title">{h.title}</p>
                                <p className="hc-doctor">{h.doctor}</p>
                                {h.diagnosis && (
                                    <p className="hc-diagnosis">วินิจฉัย: {h.diagnosis}</p>
                                )}
                            </div>
                        ))}
                        </div>
                    )}
                </div>
            </div>
            </div>

            {/* Modal รายละเอียดประวัติการรักษา */}
            {selectedHistory && (
                <div onClick={() => setSelectedHistory(null)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '20px'
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: '#1e1e1e', border: '0.5px solid #2a2a2a',
                        borderRadius: '14px', padding: '24px', width: '100%',
                        maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <p style={{ color: '#555', fontSize: '11px', marginBottom: '4px' }}>{selectedHistory.date}</p>
                                <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: 0 }}>{selectedHistory.title}</h3>
                                <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>{selectedHistory.doctor}</p>
                            </div>
                            <button onClick={() => setSelectedHistory(null)} style={{
                                background: 'transparent', border: 'none', color: '#555',
                                fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '2px 6px'
                            }}>×</button>
                        </div>

                        {/* การวินิจฉัย */}
                        {selectedHistory.diagnosis && (
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ color: '#555', fontSize: '11px', marginBottom: '6px' }}>การวินิจฉัย</p>
                                <p style={{ color: 'white', fontSize: '13px', padding: '10px 14px', background: '#252525', borderRadius: '8px', borderLeft: '2px solid #1D9E75' }}>
                                    {selectedHistory.diagnosis}
                                </p>
                            </div>
                        )}

                        {/* ใบสั่งยา */}
                        {selectedHistory.medicine?.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ color: '#555', fontSize: '11px', marginBottom: '8px' }}>ใบสั่งยา ({selectedHistory.medicine.length} รายการ)</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {selectedHistory.medicine.map((m, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: '#252525', borderRadius: '8px' }}>
                                            <p style={{ color: 'white', fontSize: '13px' }}>{m.medicine_name}</p>
                                            <p style={{ color: '#888', fontSize: '11px' }}>{m.dosage}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* นัดติดตาม */}
                        {selectedHistory.nextAppointment ? (
                            <div style={{ padding: '10px 14px', background: '#0d3d2a', border: '0.5px solid #1D9E75', borderRadius: '8px', fontSize: '12px', color: '#1D9E75' }}>
                                📅 นัดติดตามอาการ: {new Date(selectedHistory.nextAppointment).toLocaleString('th-TH', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </div>
                        ) : (
                            <p style={{ color: '#444', fontSize: '12px', textAlign: 'center' }}>ไม่มีนัดติดตามอาการ</p>
                        )}
                    </div>
                </div>
            )}
        </>
)
}
export default PatientHistory