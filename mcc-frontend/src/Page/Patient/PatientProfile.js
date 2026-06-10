import { useState } from 'react'
import { useAuth } from '../Context/AuthContext'
import { updatePatientProfile, changePatientPassword } from '../../api'
import Sidebar from '../sidebar'

const Field = ({ label, children }) => (
  <div>
    <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
      {label}
    </label>
    {children}
  </div>
)

const ReadOnly = ({ value }) => (
  <p style={{
    padding: '9px 12px', background: '#1a1a1a', border: '1px solid #222',
    borderRadius: '8px', color: '#666', fontSize: '13px',
  }}>
    {value || '—'}
  </p>
)

function PatientProfile() {
  const { currentUser, setCurrentUser } = useAuth()

  const [form, setForm] = useState({
    phone:      currentUser?.phone      ?? '',
    allergy:    currentUser?.allergy    ?? '',
    congenital: currentUser?.congenital ?? '',
  })
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const [pwForm, setPwForm]   = useState({ current: '', newPw: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved]   = useState(false)
  const [pwError, setPwError]   = useState('')

  const handlePwChange = (field, val) => {
    setPwForm(prev => ({ ...prev, [field]: val }))
    setPwSaved(false)
    setPwError('')
  }

  const handlePwSave = async () => {
    if (pwForm.newPw.length < 6) { setPwError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('รหัสผ่านใหม่ไม่ตรงกัน'); return }
    setPwSaving(true)
    setPwError('')
    try {
      const res = await changePatientPassword(currentUser.id, pwForm.current || undefined, pwForm.newPw)
      if (res.success) {
        setPwSaved(true)
        setPwForm({ current: '', newPw: '', confirm: '' })
      } else {
        setPwError(res.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
      }
    } catch {
      setPwError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    } finally {
      setPwSaving(false)
    }
  }

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }))
    setSaved(false)
    setError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await updatePatientProfile(currentUser.id, form)
      if (res.success) {
        setCurrentUser({ ...currentUser, ...form })
        setSaved(true)
      } else {
        setError(res.message || 'บันทึกไม่สำเร็จ')
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    } finally {
      setSaving(false)
    }
  }

  const initials = currentUser?.name?.slice(0, 2) ?? 'ผป'

  return (
    <div className='patient-page'>
      <Sidebar />

      <div className='patient-content'>
        <div className='headertext'>
          <h1>โปรไฟล์ของฉัน</h1>
          <p>ข้อมูลส่วนตัวและการแพ้ยา</p>
        </div>

        <div style={{ maxWidth: '680px', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Avatar + ชื่อ */}
          <div style={{
            background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: '12px',
            padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#0d3d2a', border: '1px solid #1D9E75',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', color: '#1D9E75', fontWeight: '600', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: '600', fontSize: '16px', margin: 0 }}>
                {currentUser?.name}
              </p>
              <p style={{ color: '#555', fontSize: '12px', marginTop: '3px' }}>
                HN: {currentUser?.hn}
              </p>
            </div>
          </div>

          {/* ข้อมูลที่แก้ไม่ได้ */}
          <div style={{ background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: '0 0 16px', paddingBottom: '10px', borderBottom: '0.5px solid #2a2a2a' }}>
              ข้อมูลทั่วไป
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <Field label='อายุ'>      <ReadOnly value={currentUser?.age ? `${currentUser.age} ปี` : null} /></Field>
              <Field label='เพศ'>      <ReadOnly value={currentUser?.sex} /></Field>
              <Field label='กรุ๊ปเลือด'><ReadOnly value={currentUser?.blood_type} /></Field>
            </div>
            <p style={{ color: '#444', fontSize: '11px', marginTop: '12px' }}>
              * ข้อมูลด้านบนแก้ไขได้โดยเจ้าหน้าที่โรงพยาบาลเท่านั้น
            </p>
          </div>

          {/* ข้อมูลที่แก้ได้ */}
          <div style={{ background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: '0 0 16px', paddingBottom: '10px', borderBottom: '0.5px solid #2a2a2a' }}>
              ข้อมูลที่แก้ไขได้
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Field label='หมายเลขโทรศัพท์'>
                <input
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value.replace(/[^0-9-]/g, '').slice(0, 12))}
                  placeholder='08x-xxx-xxxx'
                  style={{ width: '100%', padding: '9px 12px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </Field>

              <Field label='การแพ้ยา / สารที่แพ้'>
                <input
                  value={form.allergy}
                  onChange={e => handleChange('allergy', e.target.value)}
                  placeholder='เช่น แพ้ Penicillin หรือ ไม่มี'
                  style={{ width: '100%', padding: '9px 12px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </Field>

              <Field label='โรคประจำตัว'>
                <textarea
                  value={form.congenital}
                  onChange={e => handleChange('congenital', e.target.value)}
                  placeholder='เช่น เบาหวาน ความดันโลหิตสูง หรือ ไม่มี'
                  rows={3}
                  style={{ width: '100%', padding: '9px 12px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </Field>
            </div>

            {error && (
              <p style={{ color: '#e57373', fontSize: '12px', marginTop: '12px' }}>{error}</p>
            )}

            {saved && (
              <p style={{ color: '#1D9E75', fontSize: '12px', marginTop: '12px' }}>✓ บันทึกข้อมูลเรียบร้อยแล้ว</p>
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
              {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>

          {/* ตั้ง/เปลี่ยนรหัสผ่าน */}
          <div style={{ background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: '0 0 16px', paddingBottom: '10px', borderBottom: '0.5px solid #2a2a2a' }}>
              รหัสผ่านสำหรับเข้าสู่ระบบ
            </h3>
            <p style={{ color: '#555', fontSize: '12px', marginBottom: '14px' }}>
              ตั้งรหัสผ่านเพื่อเพิ่มความปลอดภัยในการเข้าสู่ระบบด้วย HN ของคุณ
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { field: 'current', label: 'รหัสผ่านปัจจุบัน', placeholder: 'เว้นว่างถ้ายังไม่เคยตั้ง' },
                { field: 'newPw',   label: 'รหัสผ่านใหม่',    placeholder: 'อย่างน้อย 6 ตัวอักษร' },
                { field: 'confirm', label: 'ยืนยันรหัสผ่านใหม่', placeholder: '••••••' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '5px' }}>{label}</label>
                  <input
                    type='password'
                    value={pwForm[field]}
                    onChange={e => handlePwChange(field, e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={e => { if (e.key === 'Enter' && !pwSaving) handlePwSave() }}
                    style={{ width: '100%', padding: '9px 12px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>

            {pwError && <p style={{ color: '#e57373', fontSize: '12px', marginTop: '10px' }}>{pwError}</p>}
            {pwSaved && <p style={{ color: '#1D9E75', fontSize: '12px', marginTop: '10px' }}>✓ เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</p>}

            <button
              onClick={handlePwSave}
              disabled={pwSaving}
              style={{
                marginTop: '14px', padding: '10px 24px',
                background: pwSaving ? '#0a5c43' : '#1D9E75',
                border: 'none', borderRadius: '8px', color: 'white',
                fontSize: '13px', fontWeight: '500',
                cursor: pwSaving ? 'not-allowed' : 'pointer',
              }}
            >
              {pwSaving ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default PatientProfile
