import React, { useState } from 'react'

export default function Settings({ apiUrl, token }) {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    companyName: 'BKE Logistics',
    brandColor: '#00E5FF',
    logoUrl: ''
  })

  const save = () => {
    fetch(`${apiUrl}/settings`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'branding', value: form })
    }).then(() => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Settings</h2>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Branding</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Company Name</label>
              <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Brand Color</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="color" value={form.brandColor} onChange={e => setForm({ ...form, brandColor: e.target.value })} style={{ width: 50, height: 36, border: 'none', cursor: 'pointer' }} />
                <input value={form.brandColor} onChange={e => setForm({ ...form, brandColor: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Logo URL</label>
              <input value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." style={inputStyle} />
            </div>
          </div>
        </div>

        <button onClick={save} style={{ background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: 8, padding: '12px 24px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>System Info</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <div>OCC Version: <span style={{ color: 'var(--cyan)' }}>1.0.0</span></div>
          <div>Database: <span style={{ color: 'var(--green)' }}>connected</span></div>
          <div>Environment: <span style={{ color: 'var(--amber)' }}>production</span></div>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 14,
  color: 'var(--text)',
  width: '100%',
  outline: 'none'
}