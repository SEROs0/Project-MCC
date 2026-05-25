import Sidebar from "../sidebar"
import {patients} from '../../Mock/data.js'
import { useState } from "react"

function PatientHistory () {

    const [patients, setPatient] = useState(patients)

    return(
        <>
          <div style={{background:'rgb(27, 27, 27)' , display:'flex'}}>
            <Sidebar/>
            <div className="headertext">
                <h1 style={{color:'white'}}>ประวัติผู้ป่วย</h1>
                <p>ข้อมูลการรักษาและประวัติยา</p>
            </div>
            <div>
                <h1></h1>
            </div>
          </div>
        </>
        
    )
}
export default PatientHistory