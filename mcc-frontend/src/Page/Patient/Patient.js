import Sidebar from "../sidebar"
import {patients} from '../../Mock/data.js'
import { useState } from "react"
import { currentUser, useAuth} from '../Context/AuthContext.js'
import './Patient.css'

function PatientHistory () {

    const [Patients, setPatient] = useState(patients)
    const { currentUser } = useAuth()

    const Medicalhistory = currentUser?.history || []
    const Latestprescription = Medicalhistory?.medicine || []
    
    console.log('Whoooo are uuuu:',currentUser)
    console.log('history',Medicalhistory)
    console.log('medicine',Medicalhistory)

    return(
        <>
          <div style={{background:'rgb(27, 27, 27)' , display:'flex'}}>
            <Sidebar/>
            <div>
                <div className="headertext">
                    <h1 style={{color:'white'}}>ประวัติผู้เข้ารักษา</h1>
                    <p>ข้อมูลการรักษาและประวัติยา</p>
                </div>
                <div style={{display:'flex'}}>
                    <div>
                        <h1>{currentUser?.name}</h1>
                        <div style={{gap:'5px', display:'flex'}}>
                            <p>HN: {currentUser?.hn}</p>
                            <span style={{ display: 'inline-block',
                                                width: '10px',
                                                height: '10px',
                                                backgroundColor: '#25be8e', 
                                                borderRadius: '50%',
                                                marginTop:'7px'
                                            }}></span>
                            <p>อายุ: {currentUser?.age}</p>
                            <span style={{ display: 'inline-block',
                                                width: '10px',
                                                height: '10px',
                                                backgroundColor: '#25be8e', 
                                                borderRadius: '50%',
                                                marginTop:'7px'
                                            }}></span>
                            <p>เพศ: {currentUser?.sex}</p>
                            <span style={{ display: 'inline-block',
                                                width: '10px',
                                                height: '10px',
                                                backgroundColor: '#25be8e', 
                                                borderRadius: '50%',
                                                marginTop:'7px'
                                            }}></span>
                            <p>กรุ๊ปเลือด: {currentUser?.blood}</p>             
                        </div>
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <p>{currentUser?.status}</p> <p>แพ้ยา {currentUser?.allergy}</p>
                    </div>
                    
                </div>
                <div></div>
                <div style={{padding:'20px 0 0 20px', width:'auto'}}>
                    <div style={{background:'#424242',borderRadius:'8px'}}>
                        <h3 style={{padding:'20px 0 0 20px'}}>ข้อมูลสุขภาพ</h3>
                        <div className="box_information_heal">
                            <div>
                                <p style={{gap:'5px'}}>น่ำหนัก</p>
                                <p>{currentUser?.weight} กก.</p>
                            </div>
                            <div>
                                <p>ส่วนสูง</p>
                                <p>{currentUser?.height}</p>             
                            </div>
                            <div>
                                <p style={{gap:'5px'}}>BMI</p>
                                <p>{currentUser?.bmi} </p>
                            </div>
                            <div>
                                <p>ความดัน</p>
                                <p>{currentUser?.bloodPressure}</p>             
                            </div>
                            <div>
                                <p style={{gap:'5px'}}>ชีพจร</p>
                                <p>{currentUser?.pulse} bpm</p>
                            </div>
                            <div>
                                <p>อุณหภูมิ</p>
                                <p>{currentUser?.temp} °C</p>             
                            </div>
                            
                        </div>
                        <div>
                            <p>โรคประจำตัว</p>
                            <div>
                                <p>{currentUser?.congenital}</p>
                            </div>
                        </div>
                    </div>
                    <div style={{background:'#424242',borderRadius:'8px', margin:'10px 0 0 0'}}>
                        <h3>ใบสั่งยา</h3>
                        <div>
                            
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </>
        
    )
}
export default PatientHistory