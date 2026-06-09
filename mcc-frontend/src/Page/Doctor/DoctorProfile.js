import { useState } from 'react'
import { useAuth } from '../Context/AuthContext'
import { changeDoctorPassword } from '../../api'
import DoctorSidebar from './DoctorSidebar'
import './Doctor.css'

function DoctorProfile() {
  const { currentDoctor } = useAuth()

  const [form, setForm]   = useState({ current: '', newPw: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState('')

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }))
    setSaved(false)
    setError('')
  }

  const handleSave = async () => {
    if (!form.current) { setError('กรุณากรอกรหัสผ่านปัจจุบัน'); return }
    if (form.newPw.length < 4) { setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร'); return }
    if (form.newPw !== form.confirm) { setError('รหัสผ่านใหม่ไม่ตรงกัน'); return }

    setSaving(true)
    setError('')
    try {
      const res = await changeDoctorPassword(currentDoctor.id, form.current, form.newPw)
      if (res.success) {
        setSaved(true)
        setForm({ current: '', newPw: '', confirm: '' })
      } else {
        setError(res.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    } finally {
      setSaving(false)
    }
  }

  const initials = currentDoctor?.name?.slice(0, 2) ?? 'หม'

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: '#252525', border: '1px solid #333',
    borderRadius: '8px', color: 'white',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
      <DoctorSidebar />

      <div className="doctor-main-content">
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: 'white', fontSize: '22px', margin: 0 }}>โปรไฟล์</h1>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>ข้อมูลส่วนตัวและรหัสผ่าน</p>
        </div>

        <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Info card */}
          <div style={{
            background: '#1e1e1e', border: '1px solid #2a2a2a',
            borderRadius: '12px', padding: '24px 20px',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: '#0d3d2a', border: '1px solid #1D9E75',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', color: '#1D9E75', fontWeight: '600', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: '600', fontSize: '16px', margin: 0 }}>
                {currentDoctor?.name}
              </p>
              <p style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>
                {currentDoctor?.dept_name}
              </p>
              <p style={{ color: '#444', fontSize: '11px', marginTop: '2px' }}>
                รหัสพนักงาน: {currentDoctor?.employee_id}
              </p>
            </div>
          </div>

          {/* Doctor read-only details */}
          <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{
              color: 'white', fontSize: '13px', fontWeight: '600',
              margin: '0 0 16px', paddingBottom: '10px', borderBottom: '1px solid #2a2a2a',
            }}>
              ข้อมูลทั่วไป
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'ชื่อ-นามสกุล',    val: currentDoctor?.name },
                { label: 'รหัสพนักงาน',     val: currentDoctor?.employee_id },
                { label: 'แผนก',            val: currentDoctor?.dept_name },
                { label: 'ความจุคิว/วัน',   val: currentDoctor?.capacity ? `${currentDoctor.capacity} คน` : '—' },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p style={{ color: '#888', fontSize: '11px', margin: '0 0 4px' }}>{label}</p>
                  <p style={{
                    padding: '9px 12px', background: '#1a1a1a',
                    border: '1px solid #222', borderRadius: '8px',
                    color: '#666', fontSize: '13px', margin: 0,
                  }}>
                    {val || '—'}
                  </p>
                </div>
              ))}
            </div>
            <p style={{ color: '#444', fontSize: '11px', marginTop: '12px' }}>
              * ข้อมูลด้านบนแก้ไขได้โดยผู้ดูแลระบบเท่านั้น
            </p>
          </div>

          {/* Change password */}
          <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{
              color: 'white', fontSize: '13px', fontWeight: '600',
              margin: '0 0 16px', paddingBottom: '10px', borderBottom: '1px solid #2a2a2a',
            }}>
              เปลี่ยนรหัสผ่าน
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { field: 'current', label: 'รหัสผ่านปัจจุบัน',   placeholder: '••••••' },
                { field: 'newPw',   label: 'รหัสผ่านใหม่',       placeholder: 'อย่างน้อย 4 ตัวอักษร' },
                { field: 'confirm', label: 'ยืนยันรหัสผ่านใหม่',  placeholder: '••••••' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                    {label}
                  </label>
                  <input
                    type='password'
                    value={form[field]}
                    onChange={e => handleChange(field, e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={e => { if (e.key === 'Enter' && !saving) handleSave() }}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            {error && (
              <p style={{ color: '#e57373', fontSize: '12px', marginTop: '12px' }}>{error}</p>
            )}
            {saved && (
              <p style={{ color: '#1D9E75', fontSize: '12px', marginTop: '12px' }}>✓ เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                marginTop: '16px', padding: '10px 24px',
                background: saving ? '#0a5c43' : '#1D9E75',
                border: 'none', borderRadius: '8px', color: 'white',
                fontSize: '13px', fontWeight: '500',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
