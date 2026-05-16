import React, { useState, useEffect } from 'react'

export default function Projects({ apiUrl, token }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${apiUrl}/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setProjects(d.projects || getDefaultProjects()); setLoading(false) })
      .catch(() => { setProjects(getDefaultProjects()); setLoading(false) })
  }, [apiUrl, token])

  const create = () => {
    const name = prompt('Project name:')
    if (!name) return
    const desc = prompt('Description:') || ''
    fetch(`${apiUrl}/projects`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc })
    }).then(r => r.json()).then(p => {
      setProjects(prev => [...prev, p])
    })
  }

  const STATUS_COLOR = { active: 'var(--green)', planning: 'var(--cyan)', on_hold: 'var(--amber)', completed: 'var(--text-muted)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 0 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Projects</h2>
        <button onClick={create} style={{ background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
          + New Project
        </button>
      </div>

      {loading && <div style={{ color: 'var(--text-muted)' }}>Loading...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {projects.map(p => (
          <div key={p.id} style={{
            background: 'var(--bg-card)',
            borderRadius: 12,
            padding: '20px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 10, padding: '3px 8px', borderRadius: 10, background: (STATUS_COLOR[p.status] || 'var(--text-muted)') + '20', color: STATUS_COLOR[p.status] || 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                {p.status}
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.description || 'No description'}</div>
            {p.progress !== undefined && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Progress</span>
                  <span>{p.progress}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-raised)', borderRadius: 3 }}>
                  <div style={{ width: p.progress + '%', height: '100%', background: STATUS_COLOR[p.status] || 'var(--cyan)', borderRadius: 3 }} />
                </div>
              </div>
            )}
            {p.due_date && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Due: {new Date(p.due_date).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function getDefaultProjects() {
  return [
    { id: 'proj_occ', name: 'OCC Build', description: 'Operations Control Center — new dashboard replacing Salty-OS', status: 'active', progress: 65 },
    { id: 'proj_leads', name: 'Lead Pipeline Overhaul', description: 'Rewrite lead enrichment and CRM sync process', status: 'planning', progress: 20 },
    { id: 'proj_brand', name: 'BKE Brand Refresh', description: 'Update branding across all channels (Postiz, LinkedIn, website)', status: 'planning', progress: 10 }
  ]
}