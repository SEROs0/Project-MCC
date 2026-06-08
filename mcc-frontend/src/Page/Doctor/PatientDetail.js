import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { getPatientHistory, saveMedicalHistory, getPatientByHn } from '../../api'
import DoctorSidebar from './DoctorSidebar'

function PatientDetail() {
  const { patientId }         = useParams()
  const [searchParams]        = useSearchParams()
  const bookingId             = searchParams.get('bookingId')
  const { currentDoctor }     = useAuth()
  const navigate              = useNavigate()
  const location              = useLocation()
  const patientName           = location.state?.patientName || `ผู้ป่วย #${patientId}`
  const patientHn             = location.state?.patientHn   || '-'

  const [history, setHistory]       = useState([])
  const [patientInfo, setPatientInfo] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  const [form, setForm] = useState({
    diagnosis:       '',
    nextAppointment: '',
    medicines:       [{ name: '', dosage: '' }],
    bloodPressure:   '',
    pulse:           '',
    temperature:     '',
    weight:          '',
    height:          '',
  })

  useEffect(() => {
    if (!currentDoctor) { navigate('/doctor-login'); return }
    const doFetch = async () => {
      setLoading(true)
      const [histData, ptData] = await Promise.all([
        getPatientHistory(patientId),
        patientHn && patientHn !== '-' ? getPatientByHn(patientHn) : Promise.resolve(null),
      ])
      setHistory(Array.isArray(histData) ? histData : [])
      if (ptData?.id) setPatientInfo(ptData)
      setLoading(false)
    }
    doFetch()
  }, [patientId])

  const handleMedChange = (i, field, value) => {
    setForm(prev => {
      const meds = [...prev.medicines]
      meds[i] = { ...meds[i], [field]: value }
      return { ...prev, medicines: meds }
    })
  }

  const addMedicine = () => setForm(prev => ({ ...prev, medicines: [...prev.medicines, { name: '', dosage: '' }] }))
  const removeMedicine = (i) => setForm(prev => ({ ...prev, medicines: prev.medicines.filter((_, idx) => idx !== i) }))

  const handleSave = async () => {
    if (!form.diagnosis.trim()) { alert('กรุณากรอกการวินิจฉัย'); return }
    setSaving(true)
    const medicines = form.medicines.filter(m => m.name.trim())
    const data = await saveMedicalHistory({
      patientId:       Number(patientId),
      doctorId:        currentDoctor.id,
      bookingId:       Number(bookingId),
      diagnosis:       form.diagnosis,
      symptoms:        form.diagnosis,
      nextAppointment: form.nextAppointment || null,
      medicines,
      bloodPressure:   form.bloodPressure || null,
      pulse:           form.pulse        ? Number(form.pulse)        : null,
      temperature:     form.temperature  ? Number(form.temperature)  : null,
      weight:          form.weight       ? Number(form.weight)       : null,
      height:          form.height       ? Number(form.height)       : null,
    })
    setSaving(false)
    if (data.success) {
      setSaved(true)
      setTimeout(() => navigate('/doctor/queue'), 1500)
    } else {
      alert('บันทึกไม่สำเร็จ: ' + (data.message || ''))
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
      <DoctorSidebar />

      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => navigate('/doctor/queue')}
            style={{ background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#888', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>
            ← กลับ
          </button>
          <div>
            <h1 style={{ color: 'white', fontSize: '20px', margin: 0 }}>{patientName}</h1>
            <p style={{ color: '#555', fontSize: '12px', margin: '2px 0 0' }}>HN: {patientHn} &nbsp;·&nbsp; คิว #{bookingId}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* ซ้าย — ประวัติเดิม + vitals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Vitals ปัจจุบัน */}
            {patientInfo && (
              <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: 'white', fontSize: '14px', margin: '0 0 14px' }}>ข้อมูลสุขภาพปัจจุบัน</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                  {[
                    { label: 'ความดัน',  value: patientInfo.blood_pressure },
                    { label: 'ชีพจร',    value: patientInfo.pulse ? `${patientInfo.pulse} bpm` : null },
                    { label: 'อุณหภูมิ', value: patientInfo.temperature ? `${patientInfo.temperature}°C` : null },
                    { label: 'น้ำหนัก',  value: patientInfo.weight ? `${patientInfo.weight} กก.` : null },
                    { label: 'ส่วนสูง',  value: patientInfo.height ? `${patientInfo.height} ซม.` : null },
                    { label: 'BMI',      value: patientInfo.bmi },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#252525', borderRadius: '8px', padding: '8px 10px' }}>
                      <p style={{ color: '#555', fontSize: '10px', margin: '0 0 3px' }}>{item.label}</p>
                      <p style={{ color: item.value ? 'white' : '#444', fontSize: '13px', fontWeight: '600', margin: 0 }}>
                        {item.value || '—'}
                      </p>
                    </div>
                  ))}
                </div>
                {patientInfo.allergy && patientInfo.allergy !== '-' && (
                  <div style={{ padding: '7px 10px', background: '#3d0d0d', border: '0.5px solid #e57373', borderRadius: '7px', fontSize: '12px', color: '#e57373' }}>
                    แพ้ยา: {patientInfo.allergy}
                  </div>
                )}
                {patientInfo.congenital && patientInfo.congenital !== '-' && (
                  <p style={{ color: '#888', fontSize: '12px', margin: '8px 0 0' }}>โรคประจำตัว: {patientInfo.congenital}</p>
                )}
              </div>
            )}

            {/* ประวัติการรักษาก่อนหน้า */}
            <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: 'white', fontSize: '14px', margin: '0 0 16px' }}>ประวัติการรักษาก่อนหน้า</h3>
              {loading ? (
                <p style={{ color: '#555', fontSize: '13px' }}>กำลังโหลด...</p>
              ) : history.length === 0 ? (
                <p style={{ color: '#555', fontSize: '13px' }}>ยังไม่มีประวัติ</p>
              ) : (
                history.map((h, i) => (
                  <div key={h.id ?? i} style={{ borderBottom: i < history.length - 1 ? '1px solid #2a2a2a' : 'none', paddingBottom: '12px', marginBottom: '12px' }}>
                    <p style={{ color: '#888', fontSize: '11px', margin: '0 0 4px' }}>
                      {new Date(h.visit_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {' — '}{h.doctor_name}
                    </p>
                    <p style={{ color: 'white', fontSize: '13px', margin: '0 0 6px' }}>{h.diagnosis}</p>
                    {h.medicine?.length > 0 && (
                      <div style={{ paddingLeft: '8px', borderLeft: '2px solid #1D9E75' }}>
                        {h.medicine.map((m, j) => (
                          <p key={j} style={{ color: '#888', fontSize: '11px', margin: '2px 0' }}>
                            {m.medicine_name} — {m.dosage}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ขวา — ฟอร์มบันทึก */}
          <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ color: 'white', fontSize: '14px', margin: '0 0 16px' }}>บันทึกการรักษาครั้งนี้</h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>การวินิจฉัย *</label>
              <textarea
                value={form.diagnosis}
                onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))}
                placeholder='ระบุการวินิจฉัยโรค...'
                rows={3}
                style={{ width: '100%', marginTop: '6px', padding: '10px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>สัญญาณชีพ</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '6px' }}>
                <div>
                  <p style={{ color: '#555', fontSize: '10px', margin: '0 0 4px' }}>ความดัน (mmHg)</p>
                  <input
                    value={form.bloodPressure}
                    onChange={e => setForm(p => ({ ...p, bloodPressure: e.target.value }))}
                    placeholder='120/80'
                    style={{ width: '100%', padding: '8px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <p style={{ color: '#555', fontSize: '10px', margin: '0 0 4px' }}>ชีพจร (bpm)</p>
                  <input
                    type='number'
                    value={form.pulse}
                    onChange={e => setForm(p => ({ ...p, pulse: e.target.value }))}
                    placeholder='72'
                    min='0'
                    style={{ width: '100%', padding: '8px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <p style={{ color: '#555', fontSize: '10px', margin: '0 0 4px' }}>อุณหภูมิ (°C)</p>
                  <input
                    type='number'
                    step='0.1'
                    value={form.temperature}
                    onChange={e => setForm(p => ({ ...p, temperature: e.target.value }))}
                    placeholder='36.5'
                    min='30'
                    max='45'
                    style={{ width: '100%', padding: '8px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <p style={{ color: '#555', fontSize: '10px', margin: '0 0 4px' }}>น้ำหนัก (กก.)</p>
                  <input
                    type='number'
                    step='0.1'
                    value={form.weight}
                    onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
                    placeholder='65.0'
                    min='1'
                    style={{ width: '100%', padding: '8px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <p style={{ color: '#555', fontSize: '10px', margin: '0 0 4px' }}>ส่วนสูง (ซม.)</p>
                  <input
                    type='number'
                    step='0.1'
                    value={form.height}
                    onChange={e => setForm(p => ({ ...p, height: e.target.value }))}
                    placeholder='170.0'
                    min='1'
                    style={{ width: '100%', padding: '8px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>ใบสั่งยา</label>
              {form.medicines.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                  <input
                    value={m.name}
                    onChange={e => handleMedChange(i, 'name', e.target.value)}
                    placeholder='ชื่อยา'
                    style={{ flex: 2, padding: '8px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                  />
                  <input
                    value={m.dosage}
                    onChange={e => handleMedChange(i, 'dosage', e.target.value)}
                    placeholder='วิธีใช้'
                    style={{ flex: 2, padding: '8px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                  />
                  {form.medicines.length > 1 && (
                    <button onClick={() => removeMedicine(i)}
                      style={{ background: 'transparent', border: 'none', color: '#e57373', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>×</button>
                  )}
                </div>
              ))}
              <button onClick={addMedicine}
                style={{ marginTop: '8px', background: 'transparent', border: '1px dashed #333', borderRadius: '6px', color: '#555', fontSize: '12px', padding: '6px 12px', cursor: 'pointer', width: '100%' }}>
                + เพิ่มยา
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#888', fontSize: '12px' }}>นัดติดตามอาการ (ถ้ามี)</label>
              <input
                type='datetime-local'
                value={form.nextAppointment}
                onChange={e => setForm(p => ({ ...p, nextAppointment: e.target.value }))}
                style={{ width: '100%', marginTop: '6px', padding: '10px', background: '#252525', border: '1px solid #333', borderRadius: '8px', color: 'white', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {saved ? (
              <div style={{ background: '#0d3d2a', border: '1px solid #1D9E75', borderRadius: '8px', padding: '12px', textAlign: 'center', color: '#1D9E75', fontSize: '13px' }}>
                ✓ บันทึกสำเร็จแล้ว กำลังกลับ...
              </div>
            ) : (
              <button onClick={handleSave} disabled={saving}
                style={{ width: '100%', padding: '11px', background: saving ? '#0a5c43' : '#1D9E75', border: 'none', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'กำลังบันทึก...' : 'บันทึกผลการรักษา'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default PatientDetail
