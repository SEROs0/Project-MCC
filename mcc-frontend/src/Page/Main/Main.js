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

    const { currentUser } = useAuth()
    const today = new Date()

    const dateText = today.toLocaleDateString('th-TH',{
        weekday: 'long',   
        day:     'numeric', 
        month:   'long',   
        year:    'numeric' 
    })
    
    const [form, setForm] = useState({
        name:     '',
        phone:    '',
        age:      '',
        sex:      '',
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

    console.log('Who:', currentUser)
    console.log('ข้อมูลแพทย์:', bookingData) // ← ดูใน Console ได้เลย
    console.log('ข้อมูลผู้ป่วย:',form)
    setShowModal(true)
}

    return (
    <>
        <div className='boxmain'>
            <Sidebar />
            <div style={{width:'auto'}}>
                <div className='headertext'>
                    <h1 style={{color:'white'}}>จองนัดหมาย</h1>
                    <p style={{color:'white'}}>เลือกแพทย์ วัน-เวลา และกรอกข้อมูลเพื่อจองคิว</p>
                </div>
                <div className='book_an_appointment'>
                    <div className='choose_doctor_and_choose_time'>
                        <div className='card'>
                            <p style={{color:'white'}}>เลือกแพทย์</p>
                            <div id='doctors' className='doctor_card' style={{gap:'10px', paddingTop:'10px'}}>
                                {doctorList.map(doctor => (
                                    <div key={doctor.id} 
                                        style={{
                                            padding:'10px',
                                            background: selectedId === doctor.id ? '#1e9670' : 'transparent',
                                            border: '1px solid #929292',
                                            cursor: 'pointer',
                                            borderRadius: '8px',
                                            
                                        }}
                                        onClick={() => setSelectedId(doctor.id)}
                                        >
                                        {doctor.name} <br/>
                                        {doctor.dept} <br/>
                                        <p style={{
                                            color: doctor.available > 0 ? '#33f8ba' : '#FF0000',fontSize:'14px'
                                        }}>ว่าง {doctor.available} คิว</p>
                                    </div>
                                ))}
                            </div>
                           
                        </div>
                        <div className='card'>
                            <div className="time-picker-header">
                                <p>เลือกเวลา</p> 
                                <p className="date-text" style={{}}>{dateText}</p>
                            </div>
                                {/* แทนที่ div time-slot เดิม */}
                                <div className='time-slot'>
                                    {timeSlots.map(slot => (
                                        <div
                                            key={slot.time}
                                            onClick={() => {
                                                if (slot.available) setSelectedTime(slot.time) // ← กดได้เฉพาะที่ว่าง
                                            }}
                                            style={{
                                                padding: '8px',
                                                textAlign: 'center',
                                                borderRadius: '6px',
                                                cursor: slot.available ? 'pointer' : 'not-allowed',
                                                border: selectedTime === slot.time
                                                    ? '2px solid #1D9E75'          // ← เลือกอยู่ = กรอบเขียว
                                                    : '1px solid #ffffffcc',
                                                background: !slot.available
                                                    ? 'rgb(100,100,100)'            // ← ไม่ว่าง = สีทึบ
                                                    : selectedTime === slot.time
                                                        ? '#1e9670'                 // ← เลือกอยู่ = พื้นเขียว
                                                        : 'transparent',            // ← ว่าง = ใส
                                                color: !slot.available ? '#888' : 'white',
                                            }}
                                        >
                                            {slot.time}
                                        </div>
                                    ))}
                                </div>
                                <div className='text'>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            width: '10px',
                                            height: '10px',
                                            backgroundColor: '#25be8e', // สีเขียว สามารถเปลี่ยนรหัสสีได้ตามต้องการ
                                            borderRadius: '50%'
                                        }}></span>
                                        ปุ่มเวลาขึ้นสีเขียว = เลือกเวลานัด
                                    </p>
                                    {/* <p>ปุ่มทึบ = ไม่ว่าง</p>
                                    <p>ปุ่มไม่มีสี = ว่าง</p> */}
                                </div>
                        </div>
                    </div>
                    <div className='card_patient'>
                        <p>ข้อมูลผู้ป่วย</p>

                        {/* Row 1: ชื่อ + โทรศัพท์ */}
                        <div className='input-detail'>
                            <div style={{padding:'5px'}}>
                                <label>ชื่อ-นามสกุล</label><br/>
                                <input
                                    type="text"
                                    value={currentUser?.name}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^ก-๙a-zA-Z\s]/g, '') // รับแค่ภาษาไทย อังกฤษ และเว้นวรรค
                                        if (val.length <= 50) handleChange('name', val)
                                    }}
                                    placeholder="กรอกชื่อ-นามสกุล"
                                    style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '8px 12px', background: 'transparent' }}
                                    />
                            </div>
                            <div style={{padding:'5px'}}>
                                <label>หมายเลขโทรศัพท์</label><br/>
                                <input
                                    type="text"
                                    value={currentUser?.phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^0-9-]/g, '')  // รับแค่ตัวเลขและขีด
                                        if (val.length <= 12) handleChange('phone', val)
                                    }}
                                    placeholder="08x-xxx-xxxx"
                                    style={{ border:'1px solid #ccc', borderRadius:'8px', padding:'8px 12px', background:'transparent' }}
                                    />
                            </div>
                        </div>

                        {/* Row 2: อายุ + เพศ */}
                        <div className='input-detail' >
                            <div style={{padding:'5px'}}>
                                <label>อายุ</label><br/>
                                {/* <input
                                    type='number'
                                    value={form.age}
                                    onChange={e => {if (e.target.value.length <=3) {
                                        handleChange('age', e.target.value)}}
                                    }
                                        
                                    placeholder='อายุ'
                                    style={{border: '1px solid #ccc', borderRadius: '8px', padding: '8px 12px', background:'transparent' ,width:'100px'}}
                                /> */}
                                <select
                                    value={currentUser?.age}
                                    onChange={e => handleChange('age', e.target.value)}
                                    style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '8px', background: 'transparent' ,width:'110px'}}
                                    >
                                    <option value="" style={{background:'#252525'}}>-- เลือกอายุ --</option>
                                    {Array.from({ length: 100 }, (_, i) => i + 1).map(age => (
                                    <option key={age} value={age} style={{ background: '#2a2a2a', color: 'white' }}>{age} ปี</option>
                                    ))}
                                </select>

                            </div>
                            <div style={{padding:'5px'}}>
                                <label>เพศ</label><br/>
                                {/* select = dropdown */}
                                <select
                                    value={currentUser?.sex}
                                    onChange={e => handleChange('sex', e.target.value)}
                                    style={{ background: 'rgb(65,65,65)', padding: '8px', borderRadius: '6px', width: '110px', border: '1px solid #ccc' }}
                                >
                                    <option value=''>-- เลือกเพศ --</option>
                                    <option value='ชาย'>ชาย</option>
                                    <option value='หญิง'>หญิง</option>
                                    <option value='ไม่ระบุ'>ไม่ระบุ</option>
                                </select>
                                
                            </div>
                        </div>

                        {/* Row 3: อาการเบื้องต้น dropdown */}
                        <div style={{ marginTop: '10px' ,padding:'5px' }}>
                            <label>อาการเบื้องต้น</label><br/>
                            <select
                                value={form.symptom}
                                onChange={e => handleChange('symptom', e.target.value)}
                                style={{ background: 'rgb(65,65,65)', padding: '6px', borderRadius: '6px', width: '100%', marginTop: '4px' , border: '1px solid #ccc'}}
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

                        {/* Row 4: หมายเหตุ */}
                        <div style={{ marginTop: '10px',padding:'5px' }}>
                            <label>หมายเหตุเพิ่มเติม</label><br/>
                            <textarea
                                value={form.note}
                                onChange={e => handleChange('note', e.target.value)}
                                placeholder='อาการเพิ่มเติม หรือข้อมูลที่อยากแจ้งแพทย์...'
                                rows={4}
                                style={{
                                    width: '100%',
                                    marginTop: '4px',
                                    background: 'transparent',
                                    border: '1px solid #ffffff',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    resize: 'vertical', // ← ลากขยายแนวตั้งได้
                                }}
                            />
                        </div>
                        <div>
                            {selectedId && selectedTime && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '10px 14px',
                                    background: '#8bd8be',
                                    border: '1px solid #1D9E75',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '13px',
                                    color: '#aaa'
                                    }}>
                                    <span style={{ color: '#053627' }}>✓</span>
                                    <p style={{ color: '#0b523b' }}>เลือกแพทย์:</p> <span style={{ color: '#0b523b' }}>
                                        {doctorList.find(d => d.id === selectedId).name}
                                    </span><p style={{ color: '#0b523b' }}> — เวลา</p> <span style={{ fontWeight: '600', color: '#0b523b' }}>
                                        {selectedTime} น.
                                    </span>
                                </div>
                            )}
                        </div>

                            <button
                                onClick={handleSubmit}
                                style={{ marginTop: '12px', width: '100%', padding: '10px', background: '#1D9E75', borderRadius: '8px' }}
                            >
                            <p style={{textAlign:'center', fontSize:'17px'}}>  ยืนยันการจอง </p>
                            </button>
                    </div>
                </div>
            </div>
        </div>
                           // alert box //
                {showModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                    background: '#1e1e1e',
                    border: '1px solid #1D9E75',
                    borderRadius: '16px',
                    padding: '32px',
                    width: '320px',
                    textAlign: 'center'
                    }}>
                    {/* Icon */}
                    <div style={{
                        width: '56px', height: '56px',
                        background: '#0F6E56',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '24px'
                    }}>✓</div>

                    <h2 style={{ color: '#1D9E75', marginBottom: '8px' }}>จองสำเร็จแล้ว!</h2>

                    {/* ข้อมูลการจอง */}
                    <div style={{
                        background: '#2a2a2a',
                        borderRadius: '10px',
                        padding: '14px',
                        margin: '16px 0',
                        textAlign: 'left'
                    }}>
                        <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>
                        🩺 แพทย์: <span style={{ color: 'white' }}>{bookingData.doctor}</span>
                        </p>
                        <p style={{ color: '#aaa', fontSize: '13px' }}>
                        🕐 เวลา: <span style={{ color: 'white' }}>{bookingData.time}</span>
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(false)}
                        style={{
                        width: '100%',
                        padding: '10px',
                        background: '#1D9E75',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                        }}
                    >
                        <p style={{textAlign:'center'}}>รับทราบ</p>
                    </button>
                    </div>
                </div>
                )}
      
        
    </>
);
    
}
export default MainPage;

