import './Main.css';
import { Calendar, LayoutDashboard, ClipboardList, Bell, User, Heart, AlignCenter } from 'lucide-react';
import {doctors, patients, notifications,timeSlots } from '../Mock/data.js'
import { useState, useRef, useEffect } from 'react';

function MainPage() {
    
    const [doctorList, setDoctorList] = useState(doctors)
    const [selectedId, setSelectedId] = useState(null)
    const [selectedTime, setSelectedTime] = useState(null)
    
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

    // รวมข้อมูลทั้งหมด
    const bookingData = {
        doctor:    doctorList.find(d => d.id === selectedId).name,
        time:      selectedTime,
        patient:   form,
    }

    console.log('ข้อมูลการจอง:',bookingData + form) // ← ดูใน Console ได้เลย
    alert(`จองสำเร็จ!\nแพทย์: ${bookingData.doctor}\nเวลา: ${bookingData.time}`)
}

    return (
        <div className='boxmain'>
            <div className='sidebar'>
                <div className='boxlogo'>
                    <Heart size={50} color='white' style={{marginTop:'27px',backgroundColor:'#00FF99',padding:'7px'}}/>
                    <h1 style={{color: 'white',padding:'10px'}}>MedCare Clinic</h1>
                </div>
                    {/* <div  className='sidebar'> */}
                
                            <button>
                                <i className='ti ti-calendar-plus'></i>
                                    จองคิว
                            </button>
                       
                            <button>Dashboard</button>
                       
                            <button>ประวัติผู้ป่วย</button>
                        
                            <button>แจ้งเตือน</button>
                        
                            <button>User</button>
                   
                    {/* </div> */}
            </div>
            <div style={{width:'130vh'}}>
                <div className='headertext'>
                    <h1 style={{color:'white'}}>จองนัดหมาย</h1>
                    <p style={{color:'white'}}>เลือกแพทย์ วัน-เวลา และกรอกข้อมูลเพื่อจองคิว</p>
                </div>
                <div className='book_an_appointment'>
                    <div className='choose_doctor_and_choose_time'>
                        <div className='card'>
                            <p style={{color:'white'}}>เลือกแพทย์</p>
                            <div id='doctors' className='doctor_card'>
                                {doctorList.map(doctor => (
                                    <div key={doctor.id} 
                                        style={{
                                            padding:'10px',
                                            background: selectedId === doctor.id ? '#1e9670' : 'transparent',
                                            cursor: 'pointer',
                                            borderRadius: '8px'
                                        }}
                                        onClick={() => setSelectedId(doctor.id)}
                                        >
                                        {doctor.name} <br/>
                                        {doctor.dept} <br/>
                                        <p style={{
                                            color: doctor.available > 0 ? '#33f8ba' : '#FF0000'
                                        }}>ว่าง {doctor.available} คิว</p>
                                    </div>
                                ))}
                            </div>
                           
                        </div>
                        <div className='card'>
                            <div className="time-picker-header">
                                <p>เลือกเวลา</p> 
                                <p className="date-text">วันศุกร์ที่ 22 พ.ค. 2026</p>
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
                                                    : '1px solid transparent',
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
                                    <p>ปุ่มมีสีเขียว = เลือกเวลานัด</p>
                                    <p>ปุ่มทึบ = ไม่ว่าง</p>
                                    <p>ปุ่มไม่มีสี = ว่าง</p>
                                </div>
                        </div>
                    </div>
                    <div className='card_patient'>
                        <p>ข้อมูลผู้ป่วย</p>

                        {/* Row 1: ชื่อ + โทรศัพท์ */}
                        <div className='input-detail'>
                            <div>
                                <label>ชื่อ-นามสกุล</label><br/>
                                <input
                                    value={form.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    placeholder='กรอกชื่อ-นามสกุล'
                                    style={{border: '1px solid #ccc', borderRadius: '8px', padding: '8px 12px', background:'transparent' }}
                                />
                            </div>
                            <div>
                                <label>หมายเลขโทรศัพท์</label><br/>
                                <input
                                    type='number'
                                    maxLength={10}
                                    value={form.phone}
                                    onChange={e => handleChange('phone', e.target.value)}
                                    placeholder='08x-xxx-xxxx'
                                    style={{border: '1px solid #ccc', borderRadius: '8px', padding: '8px 12px', background:'transparent' }}
                                />
                            </div>
                        </div>

                        {/* Row 2: อายุ + เพศ */}
                        <div className='input-detail'>
                            <div>
                                <label>อายุ</label><br/>
                                <input
                                    type='number'
                                    maxLength={3}
                                    value={form.age}
                                    onChange={e => handleChange('age', e.target.value)}
                                    placeholder='อายุ'
                                    style={{border: '1px solid #ccc', borderRadius: '8px', padding: '8px 12px', background:'transparent' }}
                                />
                            </div>
                            <div>
                                <label>เพศ</label><br/>
                                {/* select = dropdown */}
                                <select
                                    value={form.sex}
                                    onChange={e => handleChange('sex', e.target.value)}
                                    style={{ background: 'rgb(65,65,65)', padding: '6px', borderRadius: '6px', width: '100%', border: '1px solid #ccc' }}
                                >
                                    <option value=''>-- เลือกเพศ --</option>
                                    <option value='ชาย'>ชาย</option>
                                    <option value='หญิง'>หญิง</option>
                                    <option value='ไม่ระบุ'>ไม่ระบุ</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 3: อาการเบื้องต้น dropdown */}
                        <div style={{ marginTop: '10px' }}>
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
                        <div style={{ marginTop: '10px' }}>
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
                                    border: '1px solid #555',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    resize: 'vertical', // ← ลากขยายแนวตั้งได้
                                }}
                            />
                        </div>

                        {/* แสดงว่าเลือกแพทย์ใคร */}
                        {selectedId && (
                            <p style={{ color: 'white', marginTop: '8px' }}>
                                แพทย์: {doctorList.find(d => d.id === selectedId).name}
                            </p>
                        )}

                        {/* แสดงว่าเลือกเวลาไหน */}
                        {selectedTime && (
                            <p style={{ color: 'white' }}>
                                เวลา: {selectedTime}
                            </p>
                        )}

                        <button
                            onClick={handleSubmit}
                            style={{ marginTop: '12px', width: '100%', padding: '10px', background: '#1D9E75', borderRadius: '8px' }}
                        >
                            ยืนยันการจอง
                        </button>
                    </div>
                </div>
            </div>
        </div>



    );
}
export default MainPage;

