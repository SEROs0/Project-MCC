import './Main/Main.css'          // ← ชี้ไปที่ Main.css ใน Main/
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'

function Sidebar() {
  const navigate = useNavigate()  // ← ต้องประกาศในฟังก์ชัน

  return (
    <div className='sidebar'>
      <div className='boxlogo'>
        <Heart size={50} color='white' style={{ marginTop:'27px', backgroundColor:'#00FF99', padding:'7px', borderRadius:'8px' }}/>
        <h1 style={{ color:'white', padding:'10px' }}>MedCare Clinic</h1>
      </div>

      <button onClick={() => navigate('/main')}>จองคิว</button>
      <button onClick={() => navigate('/patient')}>ประวัติผู้ป่วย</button>
      <button onClick={() => navigate('/notification')}>แจ้งเตือน</button>
    </div>
  )
}

export default Sidebar