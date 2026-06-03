import './Main.css';
import App from '../App.js'
import { Calendar, LayoutDashboard, ClipboardList, Bell, User, Heart, AlignCenter } from 'lucide-react';
import {doctors, patients, notifications,timeSlots } from '../../Mock/data.js'
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar.js'
import { useAuth } from '../Context/AuthContext.js';

function MainPage() {
    
    const [doctorList, setDoctorList] = useState(doctors)
    const [selectedId, setSelectedId] = useState(null)
    const [selectedTime, setSelectedTime] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [bookingData, setBookingData] = useState(null)

    const { currentUser, addBooking } = useAuth()

    const today = new Date()

    const now = new Date()
    const currentHour   = now.getHours()
    const currentMinute = now.getMinutes()

    // แปลง timeSlots เป็น object พร้อม available
    const slots = timeSlots.map(time => {
    const [slotHour, slotMinute] = time.split(':').map(Number)

    // เปรียบเทียบกับเวลาปัจจุบัน
    const isPast = slotHour < currentHour ||
        (slotHour === currentHour && slotMinute <= currentMinute)

    return {
        time,
        available: !isPast   // ← ผ่านไปแล้ว = ไม่ว่าง
    }
    })

    const dateText = today.toLocaleDateString('th-TH',{
        weekday: 'long',   
        day:     'numeric', 
        month:   'long',   
        year:    'numeric' 
    })
    
    const [form, setForm] = useState({
        name:     currentUser.name,
        phone:    currentUser.phone,
        age:      currentUser.age,
        sex:      currentUser.sex,
        symptom:  '',
        note:     '',
    })

    const handleChange = (field, value) => {
        setForm({...form,[field]: value})
    }

    const handleSubmit = () => {
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
    if (form.symptom === 'อื่นๆ') {
        alert('กรุณากรอกรายระเอียด')
        return
    }

    setBookingData({                              // ← เก็บลง state
        doctor: doctorList.find(d => d.id === selectedId).name,
        time:   selectedTime,
        patient: form,
    })

    // รวมข้อมูลทั้งหมด
    const bookingData = {
        doctor:    doctorList.find(d => d.id === selectedId).name,
        time:      selectedTime,
        patient:   form,
    }

    setDoctorList(prev => prev.map(d =>
        d.id === selectedId
            ? {...d, available: d.available -1 } : d
    ))

    const doctor = {
        Doctor: doctorList.find(d => d.id === selectedId)
    }

    console.log('Doctor',doctor)

    addBooking(bookingData)
    setBookingData(bookingData)
    setShowModal(true)

    console.log('bookingData',bookingData)
    console.log('addBooking',addBooking)
}

    return (
            <>
                <div className='boxmain'>
                <Sidebar />

                <div className='main-content'>
                    <div className='headertext'>
                    <h1>จองนัดหมาย</h1>
                    <p>เลือกแพทย์ วัน-เวลา และกรอกข้อมูลเพื่อจองคิว</p>
                    </div>

                    <div className='book_an_appointment'>

                    {/* คอลัมน์ซ้าย */}
                    <div className='choose_doctor_and_choose_time'>

                        {/* เลือกแพทย์ */}
                        <div className='card'>
                        <p>เลือกแพทย์</p>
                            <div className='doctor_card'>
                            {doctorList.map(doctor => {
                                const isFull = doctor.available === 0  // ← คิวเต็ม

                                return (
                                <div key={doctor.id}
                                    onClick={() => {
                                    if (!isFull) setSelectedId(doctor.id)  // ← กดได้เฉพาะที่ว่าง
                                    }}
                                    style={{
                                    padding: '10px',
                                    background: isFull ? '#1a1a1a'
                                        : selectedId === doctor.id ? '#0d3d2a' : 'transparent',
                                    border: isFull ? '1px solid #222'
                                        : selectedId === doctor.id ? '1px solid #1D9E75' : '1px solid #333',
                                    cursor: isFull ? 'not-allowed' : 'pointer',  // ← เปลี่ยน cursor
                                    borderRadius: '8px',
                                    transition: 'all 0.15s',
                                    opacity: isFull ? 0.4 : 1  // ← จางลงถ้าเต็ม
                                    }}
                                >
                                    <p style={{
                                    fontWeight: '500', fontSize: '13px',
                                    color: isFull ? '#555' : 'white'  // ← ตัวอักษรจางลงด้วย
                                    }}>
                                    {doctor.name}
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#555', margin: '2px 0 6px' }}>
                                    {doctor.dept}
                                    </p>
                                    <p style={{ color: isFull ? '#e57373' : '#1D9E75', fontSize: '12px' }}>
                                    {isFull ? '● คิวเต็มแล้ว' : `● ว่าง ${doctor.available} คิว`}
                                    </p>
                                </div>
                                )
                            })}
                            </div>
                        </div>

                        {/* เลือกเวลา */}
                        <div className='card'>
                        <div className="time-picker-header">
                            <p>เลือกเวลา</p>
                            <p className="date-text">{dateText}</p>
                        </div>
                        <div className='time-slot'>
                            {slots.map(slot => (
                                <div key={slot.time}
                                onClick={() => { if (slot.available) setSelectedTime(slot.time) }}
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
                    </div>

                    {/* คอลัมน์ขวา — ฟอร์ม */}
                    <div className='card_patient'>
                        <p>ข้อมูลผู้ป่วย</p>

                        <div className='input-detail'>
                        <div style={{ padding: '5px' }}>
                            <label>ชื่อ-นามสกุล</label><br />
                            <input type="text"
                            value={currentUser?.name}
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
                            value={currentUser?.phone}
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
                            <select value={currentUser?.age}
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
                            <select value={currentUser?.sex}
                            onChange={e => handleChange('sex', e.target.value)}
                            style={{ border: '1px solid #333', borderRadius: '8px', padding: '8px', background: '#1e1e1e', width: '100%' }}
                            >
                            <option value=''>-- เลือกเพศ --</option>
                            <option value='ชาย'>ชาย</option>
                            <option value='หญิง'>หญิง</option>
                            <option value='ไม่ระบุ'>ไม่ระบุ</option>
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
                        <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
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

