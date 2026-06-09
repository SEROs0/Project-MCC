import './Main.css';
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Sidebar from '../sidebar.js'
import { useAuth } from '../Context/AuthContext.js';
import { getDoctors,createBooking,gettimeSlots,getSlotBookings } from '../../api.js';

// คำนวณ slot ปัจจุบันจากเวลาจริง
const getCurrentSlot = () => {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  // ปัดลงเป็น 30 นาที → 00 หรือ 30
  const roundedM = m < 30 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${roundedM}`
}

function MainPage() {
    
    const { currentUser, addBooking } = useAuth()
    
    const todayIso = new Date().toISOString().split('T')[0]

    const [doctorList, setDoctorList]     = useState([])
    const [selectedId, setSelectedId]     = useState(null)
    const [selectedTime, setSelectedTime] = useState(null)
    const [selectedSlotId, setSelectedSlotId] = useState(null)
    const [selectedDate, setSelectedDate] = useState(todayIso)
    const [slotBookings, setSlotBookings] = useState({})
    const [timeSlotsList, setTimeSlotsList] = useState([])
    const [showModal, setShowModal]       = useState(false)
    const [bookingData, setBookingData]   = useState(null)

    const [form, setForm] = useState({
        name:    currentUser?.name  ?? '',
        phone:   currentUser?.phone ?? '',
        age:     currentUser?.age   ?? '',
        sex:     currentUser?.sex   ?? '',
        symptom: '',
        note:    '',
    })

    // โหลดหมอ + time slots ครั้งเดียว
    useEffect(() => {
        getDoctors().then(data => setDoctorList(Array.isArray(data) ? data : []))
        gettimeSlots().then(data => setTimeSlotsList(Array.isArray(data) ? data : []))
    }, [])

    // โหลด slot bookings ทุกครั้งที่วันเปลี่ยน
    useEffect(() => {
        setSelectedTime(null)
        setSelectedSlotId(null)
        setSelectedId(null)
        getSlotBookings(selectedDate).then(data => {
            const map = {}
            if (Array.isArray(data)) data.forEach(row => {
                map[`${row.doctor_id}_${row.slot_time_id}`] = row.booked_count
            })
            setSlotBookings(map)
        })
    }, [selectedDate])

    if (!currentUser) return <Navigate to="/login"/>


    const isToday = selectedDate === todayIso
    const now = new Date()
    const currentHour   = now.getHours()
    const currentMinute = now.getMinutes()

    // เช็คว่า slot นั้นเต็มไหม
    const isSlotFull = (doctorId, slotId) => {
        const doctor = doctorList.find(d => d.id === doctorId)
        const capacity = doctor?.capacity ?? 5
        const key = `${doctorId}_${slotId}`
        return (slotBookings[key] ?? 0) >= capacity
    }

    // คิวที่เหลือของแพทย์ในเวลาที่เลือก
    const getRemainingSlot = (doctorId) => {
        const doctor = doctorList.find(d => d.id === doctorId)
        const capacity = doctor?.capacity ?? 5
        if (!selectedSlotId) return capacity
        const key = `${doctorId}_${selectedSlotId}`
        return capacity - (slotBookings[key] ?? 0)
    }

    // แปลง timeSlots เป็น object พร้อม available
    const slots = timeSlotsList.map(slot => {
        const time = slot?.slot_time || ''
        const [slotHour, slotMinute] = time.includes(':') ? time.split(':').map(Number) : [0, 0]
        // เช็ค isPast เฉพาะวันนี้ — วันอื่นทุก slot ที่ is_active ถือว่าว่าง
        const slotTotalMinutes    = slotHour * 60 + slotMinute
        const currentTotalMinutes = currentHour * 60 + currentMinute
        const isPast = isToday && currentTotalMinutes >= slotTotalMinutes + 30
        return {
            id:        slot?.id,
            time:      time ? time.substring(0, 5) : '--:--',
            available: time ? (!isPast && slot.is_active === 1) : false,
        }
    })

    const dateText = new Date(selectedDate + 'T12:00:00').toLocaleDateString('th-TH', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    

    const handleChange = (field, value) => {
        setForm({...form,[field]: value})
    }

    const handleSubmit = async () => {
    // ตรวจสอบว่ากรอกครบหรือยัง
    if (!selectedId) {
        alert('กรุณาเลือกแพทย์ก่อน')
        return
    }
    if (!selectedTime) {
        alert('กรุณาเลือกเวลาก่อน')
        return
    }
    if (!form.name.trim()) {
        alert('กรุณากรอกชื่อ-นามสกุล')
        return
    }
    if (!form.phone.trim()) {
        alert('กรุณากรอกเบอร์โทรศัพท์')
        return
    }
    if (!form.symptom) {
        alert('กรุณากรอกอาการเบื้องต้น')
        return
    }
    if (form.symptom === 'อื่นๆ' && !form.note.trim()) {
        alert('กรุณากรอกรายละเอียดในช่องหมายเหตุเพิ่มเติม')
        return
    }

    if (isSlotFull(selectedId, selectedSlotId)) {
        alert('คิวช่วงเวลานี้เต็มแล้ว กรุณาเลือกเวลาอื่น')
        return
    }

    const data = await createBooking({
        patientId:   currentUser.id,
        doctorId:    selectedId,
        slotTimeId:  selectedSlotId,
        bookingDate: selectedDate,
        symptom:     form.symptom,
        note:        form.note
    })

    if (data.success) {
        const key = `${selectedId}_${selectedSlotId}`
        setSlotBookings(prev => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }))
        setBookingData({
            doctor: doctorList.find(d => d.id === selectedId)?.name,
            time:   selectedTime,
        })
        addBooking({
            doctor:      doctorList.find(d => d.id === selectedId)?.name,
            time:        selectedTime,
            bookingDate: selectedDate,
            patient:     { symptom: form.symptom, note: form.note },
        })
        setShowModal(true)
    } else {
        alert(data.message)
    }
}

    return (
            <>
                <div className='boxmain'>
                <Sidebar />

                <div className='main-content'>
                    <div className='headertext' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <h1>จองนัดหมาย</h1>
                            <p>เลือกแพทย์ วัน-เวลา และกรอกข้อมูลเพื่อจองคิว</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ color: '#666', fontSize: '12px' }}>เลือกวันนัด:</label>
                            <input
                                type='date'
                                value={selectedDate}
                                min={todayIso}
                                onChange={e => setSelectedDate(e.target.value)}
                                style={{
                                    background: '#1e1e1e', border: '1px solid #2a2a2a',
                                    borderRadius: '8px', color: 'white',
                                    padding: '7px 10px', fontSize: '13px', cursor: 'pointer',
                                }}
                            />
                            {!isToday && (
                                <button
                                    onClick={() => setSelectedDate(todayIso)}
                                    style={{ padding: '7px 10px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#666', fontSize: '12px', cursor: 'pointer' }}
                                >
                                    วันนี้
                                </button>
                            )}
                        </div>
                    </div>

                    <div className='book_an_appointment'>

                    {/* คอลัมน์ซ้าย */}
                    <div className='choose_doctor_and_choose_time'>

                        {/* เลือกเวลา */}
                        <div className='card'>
                            <div className="time-picker-header">
                            <p>เลือกเวลา</p>
                            <p className="date-text">{dateText}</p>
                        </div>
                        <div className='time-slot'>
                            {slots.map(slot => (
                                <div key={slot.id}
                                onClick={() => { if (slot.available) { setSelectedTime(slot.time); setSelectedSlotId(slot.id) } }}
                                style={{
                                    padding: '8px',
                                    textAlign: 'center',
                                    borderRadius: '6px',
                                    cursor: slot.available ? 'pointer' : 'not-allowed',
                                    border: selectedTime === slot.time ? '1.5px solid #1D9E75' : '1px solid #333',
                                    background: !slot.available ? '#252525'
                                    : selectedTime === slot.time ? '#0d3d2a' : 'transparent',
                                    color: !slot.available ? '#444' : 'white',
                                    fontSize: '12px',
                                    transition: 'all 0.15s',
                                    position: 'relative'
                                }}
                                >
                                {slot.time }
                                {slot.available && (
                                    <p style={{fontSize: '9px', color: '#1D9E75', marginTop: '2px'}}>อยู่ในเวลาทำการ</p>
                                )}
                                {/* แสดง "หมดเวลา" ใต้เวลา */}
                                {!slot.available && (
                                    <p style={{ fontSize: '9px', color: '#333', marginTop: '2px' }}>หมดเวลา</p>
                                )}
                                </div>
                            ))}
                            </div>
                        <div className='text'>
                            <span style={{ width: '8px', height: '8px', background: '#1D9E75', borderRadius: '50%', flexShrink: 0 }} />
                            สีเขียว = เวลาที่เลือก &nbsp;|&nbsp;
                            <span style={{ width: '8px', height: '8px', background: '#252525', border: '1px solid #333', borderRadius: '50%', flexShrink: 0 }} />
                            ทึบ = ไม่ว่าง
                        </div>
                        
                        </div>

                        
                        {/* เลือกแพทย์ */}
                        <div className='card'>
                            <p>เลือกแพทย์</p>
                            {!selectedTime && (
                                <p style={{ fontSize: '12px', color: '#555', marginBottom: '10px' }}>
                                ← เลือกเวลาก่อนเพื่อดูคิวที่ว่าง
                                </p>
                            )}
                            <div className='doctor_card'>
                                {doctorList.map(doctor => {
                                const isFull = selectedSlotId ? isSlotFull(doctor.id, selectedSlotId) : false
                                const remaining = getRemainingSlot(doctor.id)

                                return (
                                    <div key={doctor.id}
                                    onClick={() => { if (!isFull) setSelectedId(doctor.id) }}
                                    style={{
                                        padding: '10px',
                                        background: isFull ? '#1a1a1a'
                                        : selectedId === doctor.id ? '#0d3d2a' : 'transparent',
                                        border: isFull ? '1px solid #222'
                                        : selectedId === doctor.id ? '1px solid #1D9E75' : '1px solid #333',
                                        cursor: isFull ? 'not-allowed' : 'pointer',
                                        borderRadius: '8px',
                                        transition: 'all 0.15s',
                                        opacity: isFull ? 0.4 : 1
                                    }}
                                    >
                                    <p style={{ fontWeight:'500', fontSize:'13px', color: isFull ? '#555' : 'white', textAlign: 'center'}}>
                                        {doctor.name}
                                    </p>
                                    <p style={{ fontSize:'12px', color:'#555', margin:'2px 0 6px', textAlign: 'center'}}>
                                        {doctor.dept_name}
                                    </p>
                                    {selectedTime && (
                                    <p style={{ fontSize:'12px', color: isFull ? '#e57373' : '#1D9E75', textAlign: 'center' }}>
                                        {isFull ? '● คิวเต็มแล้ว' : `● ว่าง ${remaining} คิว`}
                                    </p>
                                    )}
                                    </div>
                                )
                                })}
                            </div>
                            </div>
                    </div>

                    {/* คอลัมน์ขวา — ฟอร์ม */}
                    <div className='card_patient'>
                        <p>ข้อมูลผู้ป่วย</p>

                        <div className='input-detail'>
                        <div style={{ padding: '5px' }}>
                            <label>ชื่อ-นามสกุล</label><br />
                            <input type="text"
                            value={form.name}
                            onChange={e => {
                                const val = e.target.value.replace(/[^ก-๙a-zA-Z\s]/g, '')
                                if (val.length <= 50) handleChange('name', val)
                            }}
                            placeholder="กรอกชื่อ-นามสกุล"
                            style={{ border: '1px solid #333', borderRadius: '8px', padding: '8px 12px', background: 'transparent' }}
                            />
                        </div>
                        <div style={{ padding: '5px' }}>
                            <label>หมายเลขโทรศัพท์</label><br />
                            <input type="text"
                            value={form.phone}
                            onChange={e => {
                                const val = e.target.value.replace(/[^0-9-]/g, '')
                                if (val.length <= 12) handleChange('phone', val)
                            }}
                            placeholder="08x-xxx-xxxx"
                            style={{ border: '1px solid #333', borderRadius: '8px', padding: '8px 12px', background: 'transparent' }}
                            />
                        </div>
                        </div>

                        <div className='input-detail'>
                        <div style={{ padding: '5px' }}>
                            <label>อายุ</label><br />
                            <select value={form.age}
                            onChange={e => handleChange('age', e.target.value)}
                            style={{ border: '1px solid #333', borderRadius: '8px', padding: '8px', background: '#1e1e1e', width: '100%' }}
                            >
                            <option value="" style={{ background: '#1e1e1e' }}>-- เลือกอายุ --</option>
                            {Array.from({ length: 100 }, (_, i) => i + 1).map(age => (
                                <option key={age} value={age} style={{ background: '#1e1e1e' }}>{age} ปี</option>
                            ))}
                            </select>
                        </div>
                        <div style={{ padding: '5px' }}>
                            <label>เพศ</label><br />
                            <select value={form.sex}
                            onChange={e => handleChange('sex', e.target.value)}
                            style={{ border: '1px solid #333', borderRadius: '8px', padding: '8px', background: '#1e1e1e', width: '100%' }}
                            >
                            <option value=''>-- เลือกเพศ --</option>
                            <option value='ชาย'>ชาย</option>
                            <option value='หญิง'>หญิง</option>
                            </select>
                        </div>
                        </div>
                        

                        <div style={{ padding: '5px', marginTop: '4px' }}>
                        <label>อาการเบื้องต้น</label><br />
                        <select value={form.symptom}
                            onChange={e => handleChange('symptom', e.target.value)}
                            style={{ border: '1px solid #333', borderRadius: '8px', padding: '8px', background: '#1e1e1e', width: '100%', marginTop: '4px' }}
                        >
                            <option value=''>-- เลือกอาการ --</option>
                            <option value='ตรวจสุขภาพทั่วไป'>ตรวจสุขภาพทั่วไป</option>
                            <option value='ไข้ / ปวดหัว'>ไข้ / ปวดหัว</option>
                            <option value='ปวดท้อง'>ปวดท้อง</option>
                            <option value='ไอ / เจ็บคอ'>ไอ / เจ็บคอ</option>
                            <option value='ผื่น / แพ้'>ผื่น / แพ้</option>
                            <option value='ปวดกระดูก / กล้ามเนื้อ'>ปวดกระดูก / กล้ามเนื้อ</option>
                            <option value='หมอนัดติดตามอาการ'>หมอนัดติดตามอาการ</option>
                            <option value='อื่นๆ'>อื่นๆ</option>
                        </select>
                        </div>

                        <div style={{ padding: '5px', marginTop: '4px' }}>
                        <label>หมายเหตุเพิ่มเติม</label><br />
                        <textarea value={form.note}
                            onChange={e => handleChange('note', e.target.value)}
                            placeholder='อาการเพิ่มเติม หรือข้อมูลที่อยากแจ้งแพทย์...'
                            rows={4}
                            style={{
                            width: '100%', marginTop: '4px',
                            background: 'transparent',
                            border: '1px solid #333',
                            borderRadius: '8px', padding: '8px',
                            resize: 'vertical', fontSize: '13px'
                            }}
                        />
                        </div>

                        {/* Summary */}
                        {selectedId && selectedTime && (
                        <div style={{
                            margin: '8px 5px 0',
                            padding: '10px 14px',
                            background: '#0d3d2a',
                            border: '1px solid #1D9E75',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '13px'
                        }}>
                            <span style={{ color: '#1D9E75', fontSize: '16px' }}>✓</span>
                            <span style={{ color: '#aaa' }}>เลือกแพทย์:</span>
                            <span style={{ color: 'white' }}>{doctorList.find(d => d.id === selectedId)?.name}</span>
                            <span style={{ color: '#aaa' }}>— เวลา</span>
                            <span style={{ fontWeight: '600', color: 'white' }}>{selectedTime} น.</span>
                        </div>
                        )}

                        <button className='confirm-btn' onClick={handleSubmit}>
                        ยืนยันการจอง
                        </button>
                    </div>
                    </div>
                </div>
                </div>

                {/* Modal */}
                {showModal && bookingData && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                    background: '#1e1e1e',
                    border: '1px solid #1D9E75',
                    borderRadius: '16px',
                    padding: '32px', width: '320px', textAlign: 'center'
                    }}>
                    <div style={{
                        width: '52px', height: '52px', background: '#0d3d2a',
                        border: '1px solid #1D9E75',
                        borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', fontSize: '22px', color: '#1D9E75'
                    }}>✓</div>

                    <h2 style={{ color: '#1D9E75', marginBottom: '6px', fontSize: '18px' }}>จองสำเร็จแล้ว!</h2>
                    <p style={{ color: '#666', fontSize: '12px', marginBottom: '16px' }}>ระบบได้รับการจองของคุณแล้ว</p>

                    <div style={{
                        background: '#252525', borderRadius: '10px',
                        padding: '14px', margin: '0 0 16px', textAlign: 'left'
                    }}>
                        <p style={{ color: '#888', fontSize: '12px', marginBottom: '6px' }}>
                        📅 วันที่: <span style={{ color: 'white' }}>{new Date(selectedDate + 'T12:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </p>
                        <p style={{ color: '#888', fontSize: '12px', marginBottom: '6px' }}>
                        🩺 แพทย์: <span style={{ color: 'white' }}>{bookingData.doctor}</span>
                        </p>
                        <p style={{ color: '#888', fontSize: '12px' }}>
                        🕐 เวลา: <span style={{ color: 'white' }}>{bookingData.time}</span>
                        </p>
                    </div>

                    <button onClick={() => setShowModal(false)} style={{
                        width: '100%', padding: '10px',
                        background: '#1D9E75', color: 'white',
                        border: 'none', borderRadius: '8px',
                        fontSize: '14px', fontWeight: '500', cursor: 'pointer'
                    }}>
                        รับทราบ
                    </button>
                    </div>
                </div>
                )}
            </>
)
    
}
export default MainPage;

