import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext.js'
import { patients } from '../../Mock/data.js'
import { AuthProvider } from '../Context/AuthContext.js'
import { login } from '../../api.js'

function LoginPage() {
  const [hn, setHn] = useState('')
  const [error, setError] = useState('')
  const { setCurrentUser } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    // ค้นหาผู้ป่วยจาก HN
    // const found = patients.find(p => p.hn === hn.trim())
    if (!hn.trim()) { setError('กรุณากรอก HN'); return}

    const data = await login(hn)

    if (data.success) {
      setCurrentUser(data.patient)
      navigate('/main')
    } else {
      setError(data.message)
    }

  }

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:"#2b2b2b"}}>
      <div style={{ background:'#1e1e1e', padding:'32px', borderRadius:'16px', width:'320px', border:'1px solid #1D9E75' }}>
        <h2 style={{ color:'#1D9E75', marginBottom:'16px', textAlign:'center' }}>เข้าสู่ระบบ</h2>

        <label style={{ color:'#aaa', fontSize:'13px' }}>หมายเลข HN</label>
        <input
          value={hn}
          onChange={e => setHn(e.target.value)}
          placeholder="เช่น 2026-00182"
          style={{ width:'100%', marginTop:'6px', padding:'8px 12px', borderRadius:'8px', border:'1px solid #ccc', background:'transparent', color:'white' }}
        />

        {error && <p style={{ color:'#ff6b6b', fontSize:'12px', marginTop:'6px' }}>{error}</p>}

        <button
          onClick={handleLogin}
          style={{ marginTop:'16px', width:'100%', padding:'10px', background:'#1D9E75', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' }}
        >
            <p style={{textAlign:'center'}}>เข้าสู่ระบบ</p>
        </button>
      </div>
    </div>
  )
}

export default LoginPage