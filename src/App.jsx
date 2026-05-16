import React, { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import OrgChart from './pages/OrgChart'
import Kanban from './pages/Kanban'
import TeamChat from './pages/TeamChat'

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
  const [token] = useState(() => localStorage.getItem('occ_token') || 'dev-token')
  const [apiUrl] = useState(() => {
    const base = import.meta.env.VITE_API_URL || window.location.origin
    return base + '/api'
  })

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
          {page === 'dashboard' && <Dashboard apiUrl={apiUrl} token={token} />}
          {page === 'org' && <OrgChart apiUrl={apiUrl} token={token} />}
          {page === 'tickets' && <Kanban apiUrl={apiUrl} token={token} />}
          {page === 'chat' && <TeamChat apiUrl={apiUrl} token={token} />}
          {page === 'settings' && <div>Settings - loading...</div>}
          {page === 'costs' && <div>Costs - loading...</div>}
          {page === 'hiring' && <div>Hiring - loading...</div>}
          {page === 'projects' && <div>Projects - loading...</div>}
        </div>
      </main>
    </div>
  )
}