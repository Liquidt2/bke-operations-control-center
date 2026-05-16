import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'
import OrgChart from './pages/OrgChart'
import Kanban from './pages/Kanban'
import TeamChat from './pages/TeamChat'
import Costs from './pages/Costs'
import Hiring from './pages/Hiring'
import Projects from './pages/Projects'
import Settings from './pages/Settings'

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
        padding: '20px 0',
        flexShrink: 0
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
                fontFamily: 'inherit'
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto', maxHeight: '100vh' }}>
        {page === 'dashboard' && <Dashboard apiUrl={apiUrl} token={token} />}
        {page === 'org' && <OrgChart apiUrl={apiUrl} token={token} />}
        {page === 'tickets' && <Kanban apiUrl={apiUrl} token={token} />}
        {page === 'chat' && <TeamChat apiUrl={apiUrl} token={token} />}
        {page === 'costs' && <Costs apiUrl={apiUrl} token={token} />}
        {page === 'hiring' && <Hiring apiUrl={apiUrl} token={token} />}
        {page === 'projects' && <Projects apiUrl={apiUrl} token={token} />}
        {page === 'settings' && <Settings apiUrl={apiUrl} token={token} />}
      </main>
    </div>
  )
}