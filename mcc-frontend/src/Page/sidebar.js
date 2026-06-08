import './sidebar.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './Context/AuthContext'
import { Heart } from 'lucide-react'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()   // ← รู้ว่าอยู่หน้าไหน
  const { currentUser, logout } = useAuth()

  // เช็คว่า path ตรงกับปุ่มไหน
  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()           // ← ล้าง currentUser
    navigate('/login') // ← กลับหน้า login
  }

  // ตัวย่อชื่อสำหรับ avatar
  const initials = currentUser?.name
    ? currentUser.name.slice(0, 2)
    : 'ผป'

  const menuItems = [
    { path: '/main',          icon: 'ti-calendar-plus',    label: 'จองคิว' },
    { path: '/patient',   icon: 'ti-clipboard-list',   label: 'ประวัติการรักษา' },
    { path: '/notification', icon: 'ti-bell',          label: 'แจ้งเตือน' },
  ]

  return (
    <div className='sidebar'>

      {/* Logo */}
      <div className='boxlogo'>
        <div className='sidebar-logo-icon'>
          <Heart size={18} color='white' />
        </div>
        <h1>MedCare</h1>
      </div>

      {/* เมนูหลัก */}
      <span className='sidebar-section'>เมนู</span>
      {menuItems.map(item => (
        <button
          key={item.path}
          className={`sidebar-btn ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <i className={`ti ${item.icon} btn-icon`} aria-hidden="true" />
          <span className='btn-label'>{item.label}</span>
        </button>
      ))}

      {/* User footer */}
       <div className='sidebar-footer'>
        <div className='user-card'>
          <div className='user-avatar'>{initials}</div>
          <div className='user-info'>
            <p className='user-name'>{currentUser?.name ?? 'ผู้ป่วย'}</p>
            <p className='user-hn'>HN: {currentUser?.hn ?? '-'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            marginTop: '8px',
            padding: '8px',
            background: 'transparent',
            border: '0.5px solid #333',
            borderRadius: '8px',
            color: '#888',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#3d0d0d'
            e.currentTarget.style.color = '#e57373'
            e.currentTarget.style.borderColor = '#e57373'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#888'
            e.currentTarget.style.borderColor = '#333'
          }}
        >
          <i className='ti ti-logout' aria-hidden="true" />
          <span className='btn-label'>ออกจากระบบ</span>
        </button>
      </div>

    </div>
  )
}

export default Sidebar