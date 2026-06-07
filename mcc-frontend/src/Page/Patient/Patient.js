import Sidebar from "../sidebar"
import {patients} from '../../Mock/data.js'
import { useEffect, useState } from "react"
import { currentUser, useAuth} from '../Context/AuthContext.js'
import { getPatientHistory } from "../../api.js"
import './Patient.css'

function PatientHistory () {

    const [Patients, setPatient] = useState(patients)
    const { currentUser, bookings } = useAuth()
    const [ Medicalhistory, setMedicalhistory] = useState([])

    useEffect(() => {
        const fetchHistory = async () => {
            if (!currentUser) return
            const data = await getPatientHistory(currentUser.id)
            setMedicalhistory(data)
        }
        fetchHistory()
    }, [currentUser])

    const Latestprescription = Medicalhistory?.[0]?.medicine || []

    // const Medicalhistory = currentUser?.history || []

    // รวม mock history + การจองใหม่เข้าด้วยกัน
  const allHistory = [
            ...bookings?.map(b => ({           // ← แปลง booking เป็น format เดียวกับ history
            id:              b.id,
            date:            b.date,
            doctor:          b.doctor,
            dept:            '-',
            diagnosis:       b.diagnosis,
            symptoms:        b.symptoms || '-',
            medicine:        b.medicine,
            nextAppointment: b.nextAppointment,
            status:          b.status,
            isNew:           true,          // ← flag ว่าเป็นการจองใหม่
            })) || [],
            ...Medicalhistory,                // ← ประวัติเดิมจาก mock
        ]

    // const Latestprescription = Medicalhistory.flatMap(h => h.medicine)

    console.log('++++++++',allHistory)
    console.log('Whoooo are uuuu:',currentUser)
    console.log('history',Medicalhistory)
    console.log('medicine',Latestprescription)

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
                    <h3>ข้อมูลสุขภาพ</h3>
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

                {/* Right Column — ประวัติการรักษา */}
                <div className="card">
                    <h3>ประวัติการรักษา</h3>
                    <div className="timeline">
                    {allHistory.length === 0 ? (
                        <p style={{ color: '#555', fontSize: '13px' }}>ยังไม่มีประวัติการรักษา</p>
                    ) : (
                        allHistory.map((history, index) => (
                        <div key={history.id ?? index} className='tl-item'>
                            <div className='tl-left'>
                            <div className={`tl-dot ${index > 0 ? 'old' : ''}`} />
                            </div>
                            <div className='tl-body'>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                <p className='tl-date'>{history.date}</p>
                                {history.isNew && (  // ← แสดง badge "ใหม่" เฉพาะที่เพิ่งจอง
                                <span style={{
                                    background: '#0d3d2a', color: '#1D9E75',
                                    border: '0.5px solid #1D9E75',
                                    padding: '1px 7px', borderRadius: '20px',
                                    fontSize: '10px'
                                }}>ใหม่</span>
                                )}
                                {history.status && (
                                <span style={{
                                    background: history.status === 'รอตรวจ' ? '#3d2a0d' : '#0d3d2a',
                                    color:      history.status === 'รอตรวจ' ? '#f0a500' : '#1D9E75',
                                    padding: '1px 7px', borderRadius: '20px',
                                    fontSize: '10px'
                                }}>{history.status}</span>
                                )}
                            </div>
                            <p className='tl-title'>{history.diagnosis}</p>
                            <p className='tl-meta'>{history.doctor}</p>
                            {history.symptoms !== '-' && (
                                <p className='tl-diagnosis'>{history.symptoms}</p>
                            )}
                            </div>
                        </div>
                        ))
                    )}
                    </div>
                </div>

                </div>
            </div>
            </div>
        </>
)
}
export default PatientHistory