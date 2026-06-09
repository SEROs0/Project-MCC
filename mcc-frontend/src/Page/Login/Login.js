import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext.js'
import { login } from '../../api.js'
import { Heart } from 'lucide-react'

function LoginPage() {
  const [hn, setHn]         = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { setCurrentUser }  = useAuth()
  const navigate            = useNavigate()

  const handleLogin = async () => {
    if (!hn.trim()) { setError('กรุณากรอก HN'); return }
    setLoading(true)
    setError('')
    try {
      const data = await login(hn.trim())
      if (data.success) {
        setCurrentUser(data.patient)
        navigate('/main')
      } else {
        setError(data.message || 'เข้าสู่ระบบไม่สำเร็จ')
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#121212' }}>
      <div style={{ background: '#1e1e1e', padding: '32px', borderRadius: '16px', width: '320px', border: '1px solid #2a2a2a' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{
            width: '36px', height: '36px', background: '#1D9E75',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={18} color='white' />
          </div>
          <div>
            <h2 style={{ color: 'white', fontSize: '18px', margin: 0 }}>MedCare</h2>
            <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>ระบบนัดหมายแพทย์</p>
          </div>
        </div>

        <label style={{ color: '#888', fontSize: '12px' }}>หมายเลข HN</label>
        <input
          value={hn}
          onChange={e => setHn(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !loading) handleLogin() }}
          placeholder="เช่น 2026-00182"
          autoFocus
          style={{
            width: '100%', marginTop: '6px', padding: '10px 12px',
            borderRadius: '8px', border: '1px solid #333',
            background: '#252525', color: 'white', fontSize: '14px',
            outline: 'none', boxSizing: 'border-box',
          }}
        />

        {error && <p style={{ color: '#e57373', fontSize: '12px', marginTop: '8px' }}>{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            marginTop: '16px', width: '100%', padding: '11px',
            background: loading ? '#0a5c43' : '#1D9E75',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
          <a href="/doctor-login" style={{ color: '#555', textDecoration: 'none' }}>
            เข้าสู่ระบบสำหรับแพทย์ →
          </a>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
