import React, { useState, useEffect } from 'react'

const PAGES = {
  dashboard: 'Dashboard',
  org: 'Org Chart',
  tickets: 'Tickets',
  projects: 'Projects',
  chat: 'Team Chat',
  costs: 'Costs',
  hiring: 'Hiring',
  settings: 'Settings'
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [apiUrl] = useState('/api')
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        padding: '20px 0'
      }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--cyan)' }}>BKE OCC</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Operations Control</div>
        </div>
        <nav>
          {Object.entries(PAGES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 20px',
                background: page === key ? 'var(--bg-input)' : 'transparent',
                color: page === key ? 'var(--cyan)' : 'var(--text-muted)',
                border: 'none',
                borderLeft: page === key ? '3px solid var(--cyan)' : '3px solid transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'var(--font)'
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
      
      {/* Main Content */}
      <main style={{ flex: 1, padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>{PAGES[page]}</h1>
        <div style={{ color: 'var(--text-muted)' }}>
          {page === 'dashboard' && <Dashboard apiUrl={apiUrl} />}
          {page === 'org' && <div>Org Chart - loading...</div>}
          {page === 'tickets' && <div>Tickets - loading...</div>}
          {page === 'chat' && <div>Team Chat - loading...</div>}
          {page === 'settings' && <div>Settings - loading...</div>}
          {page === 'costs' && <div>Costs - loading...</div>}
          {page === 'hiring' && <div>Hiring - loading...</div>}
          {page === 'projects' && <div>Projects - loading...</div>}
        </div>
      </main>
    </div>
  )
}

function Dashboard({ apiUrl }) {
  const [stats, setStats] = useState({ agents: 0, tickets: 0, spend: 0 })
  
  useEffect(() => {
    // Placeholder - will be filled in later
    setStats({ agents: 13, tickets: 0, spend: 0 })
  }, [])
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Active Agents</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--cyan)' }}>{stats.agents}</div>
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Open Tickets</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--amber)' }}>{stats.tickets}</div>
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Monthly Spend</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--green)' }}>${(stats.spend/100).toFixed(2)}</div>
      </div>
    </div>
  )
}