import React, { useState } from 'react'

export default function Hiring({ apiUrl, token }) {
  const [requests, setRequests] = useState([
    { id: 'req_001', agent: 'Noah', role: 'Market Research Analyst', status: 'pending', submitted: '2026-05-16T10:00:00Z' },
    { id: 'req_002', agent: 'Kyle', role: 'Customer Relations Specialist', status: 'pending', submitted: '2026-05-16T09:30:00Z' }
  ])
  const [showForm, setShowForm] = useState(false)

  const approve = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    fetch(`${apiUrl}/hiring/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  const deny = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'denied' } : r))
  }

  const submit = () => {
    const agent = document.getElementById('hire-agent').value
    const role = document.getElementById('hire-role').value
    if (!agent || !role) return
    const newReq = { id: 'req_' + Date.now(), agent, role, status: 'pending', submitted: new Date().toISOString() }
    setRequests(prev => [...prev, newReq])
    setShowForm(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 0 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Hiring Requests</h2>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
        >+ Propose Hire</button>
      </div>

      {/* New Hire Form */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 20, border: '1px solid var(--cyan)30' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Propose New Agent</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input id="hire-agent" placeholder="Agent name" style={inputStyle} />
            <input id="hire-role" placeholder="Role / title" style={inputStyle} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={submit} style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>Submit</button>
              <button onClick={() => setShowForm(false)} style={{ background: 'var(--bg-raised)', color: 'var(--text)', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Pending Approval ({requests.filter(r => r.status === 'pending').length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {requests.filter(r => r.status === 'pending').length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No pending requests</div>}
          {requests.filter(r => r.status === 'pending').map(r => (
            <div key={r.id} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '16px 20px', border: '1px solid var(--amber)30', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.agent}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.role}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Requested {new Date(r.submitted).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => approve(r.id)} style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                <button onClick={() => deny(r.id)} style={{ background: 'var(--bg-raised)', color: 'var(--red)', border: '1px solid var(--red)30', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>Deny</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Processed */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Processed ({requests.filter(r => r.status !== 'pending').length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {requests.filter(r => r.status !== 'pending').map(r => (
            <div key={r.id} style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '12px 16px', opacity: 0.7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.status === 'approved' ? 'var(--green)' : 'var(--red)' }} />
                <span style={{ fontWeight: 500 }}>{r.agent}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.role}</span>
              </div>
              <span style={{ fontSize: 12, color: r.status === 'approved' ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase', fontWeight: 600 }}>{r.status}</span>
            </div>
          ))}
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
  outline: 'none',
  width: '100%'
}