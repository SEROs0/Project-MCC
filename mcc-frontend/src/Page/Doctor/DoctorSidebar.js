import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { Heart } from 'lucide-react'

function DoctorSidebar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { currentDoctor, doctorLogout } = useAuth()

  const isActive = (path) => location.pathname === path

  const menuItems = [
    { path: '/doctor/queue', icon: 'ti-list-numbers', label: 'คิววันนี้' },
  ]

  const initials = currentDoctor?.name ? currentDoctor.name.slice(0, 2) : 'หม'

  return (
    <div className='sidebar'>
      <div className='boxlogo'>
        <div className='sidebar-logo-icon'>
          <Heart size={18} color='white' />
        </div>
        <h1>MedCare</h1>
      </div>

      <span className='sidebar-section' style={{ color: '#1D9E75', fontSize: '10px' }}>DOCTOR PORTAL</span>

      {menuItems.map(item => (
        <button
          key={item.path}
          className={`sidebar-btn ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <i className={`ti ${item.icon} btn-icon`} aria-hidden='true' />
          <span className='btn-label'>{item.label}</span>
        </button>
      ))}

      <div className='sidebar-footer'>
        <div className='user-card'>
          <div className='user-avatar'>{initials}</div>
          <div className='user-info'>
            <p className='user-name'>{currentDoctor?.name ?? 'แพทย์'}</p>
            <p className='user-hn'>{currentDoctor?.dept_name ?? ''}</p>
          </div>
        </div>
        <button
          onClick={() => { doctorLogout(); navigate('/doctor-login') }}
          style={{
            width: '100%', marginTop: '8px', padding: '8px',
            background: 'transparent', border: '0.5px solid #333',
            borderRadius: '8px', color: '#888', fontSize: '12px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px', transition: 'all 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#3d0d0d'; e.currentTarget.style.color = '#e57373'; e.currentTarget.style.borderColor = '#e57373' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#333' }}
        >
          <i className='ti ti-logout' />
          <span className='btn-label'>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  )
}

export default DoctorSidebar
