import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { doctorLogin } from '../../api'
import { Heart } from 'lucide-react'

function DoctorLogin() {
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const { setCurrentDoctor } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!employeeId.trim() || !password.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบ')
      return
    }
    setLoading(true)
    setError('')
    const data = await doctorLogin(employeeId.trim(), password)
    setLoading(false)
    if (data.success) {
      setCurrentDoctor(data.doctor)
      navigate('/doctor/dashboard')
    } else {
      setError(data.message || 'เข้าสู่ระบบไม่สำเร็จ')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#121212',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: '380px', background: '#1e1e1e',
        border: '1px solid #2a2a2a', borderRadius: '16px', padding: '40px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{
            width: '36px', height: '36px', background: '#1D9E75',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Heart size={18} color='white' />
          </div>
          <div>
            <h2 style={{ color: 'white', fontSize: '18px', margin: 0 }}>MedCare</h2>
            <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>Doctor Portal</p>
          </div>
        </div>

        <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '4px' }}>เข้าสู่ระบบแพทย์</h3>
        <p style={{ color: '#555', fontSize: '12px', marginBottom: '24px' }}>ระบบจัดการคิวและบันทึกการรักษา</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ color: '#888', fontSize: '12px' }}>รหัสพนักงาน</label>
            <input
              type='text'
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              placeholder='EMP001'
              style={{
                width: '100%', marginTop: '6px', padding: '10px 12px',
                background: '#252525', border: '1px solid #333',
                borderRadius: '8px', color: 'white', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ color: '#888', fontSize: '12px' }}>รหัสผ่าน</label>
            <input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
              style={{
                width: '100%', marginTop: '6px', padding: '10px 12px',
                background: '#252525', border: '1px solid #333',
                borderRadius: '8px', color: 'white', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#e57373', fontSize: '12px', margin: 0 }}>{error}</p>
          )}

          <button
            type='submit'
            disabled={loading}
            style={{
              width: '100%', padding: '11px',
              background: loading ? '#0a5c43' : '#1D9E75',
              border: 'none', borderRadius: '8px',
              color: 'white', fontSize: '14px', fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px'
            }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to='/login' style={{ color: '#555', fontSize: '12px', textDecoration: 'none' }}>
            ← กลับหน้า Login ผู้ป่วย
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DoctorLogin
