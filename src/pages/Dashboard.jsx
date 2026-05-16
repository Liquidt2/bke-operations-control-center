import React, { useState, useEffect } from 'react'

export default function Dashboard({ apiUrl, token }) {
  const [stats, setStats] = useState({ agents: 0, tickets: 0, openTickets: 0, projects: 0 })
  const [agents, setAgents] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch(`${apiUrl}/agents`, { headers }).then(r => r.json()),
      fetch(`${apiUrl}/tickets`, { headers }).then(r => r.json()),
      fetch(`${apiUrl}/projects`, { headers }).then(r => r.json()),
      fetch(`${apiUrl}/activity?limit=10`, { headers }).then(r => r.json()).catch(() => ({ activity: [] }))
    ]).then(([aData, tData, pData, actData]) => {
      const agentList = aData.agents || []
      setAgents(agentList)
      const ticketList = tData.tickets || []
      setStats({
        agents: agentList.length,
        tickets: ticketList.length,
        openTickets: ticketList.filter(t => t.status === 'open' || t.status === 'in_progress').length,
        projects: (pData.projects || []).length
      })
      setRecentActivity(actData.activity || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [apiUrl, token])

  const activeAgents = agents.filter(a => a.status === 'active').length
  const idleAgents = agents.filter(a => a.status === 'idle').length

  const statusColor = (s) => s === 'active' ? 'var(--green)' : 'var(--amber)'
  const statusBg = (s) => s === 'active' ? '#00ff8820' : '#ffaa0020'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 0 40px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Dashboard</h2>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Agents', value: stats.agents, color: 'var(--cyan)' },
          { label: 'Active Now', value: activeAgents, color: 'var(--green)' },
          { label: 'Idle', value: idleAgents, color: 'var(--amber)' },
          { label: 'Open Tickets', value: stats.openTickets, color: 'var(--purple)' },
          { label: 'Total Tickets', value: stats.tickets, color: 'var(--blue)' },
          { label: 'Projects', value: stats.projects, color: 'var(--red)' }
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)',
            border: `1px solid ${s.color}30`,
            borderRadius: 12,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{loading ? '—' : s.value}</div>
          </div>
        ))}
      </div>

      {/* Agent Status Grid */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Agent Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {agents.map(a => (
            <div key={a.id} style={{
              background: 'var(--bg-card)',
              border: `1px solid ${statusColor(a.status)}30`,
              borderRadius: 8,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(a.status), boxShadow: `0 0 6px ${statusColor(a.status)}` }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: a.color || 'var(--cyan)' }}>{a.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.role || a.title}</div>
              </div>
              <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: statusBg(a.status), color: statusColor(a.status), textTransform: 'uppercase' }}>{a.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {recentActivity.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent activity</div>}
          {recentActivity.map((a, i) => (
            <div key={i} style={{ fontSize: 12, padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 6, display: 'flex', gap: 10 }}>
              <span style={{ color: 'var(--text-muted)', minWidth: 80 }}>{a.agent}</span>
              <span style={{ color: 'var(--text)', flex: 1 }}>{a.action}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{a.created_at ? new Date(a.created_at).toLocaleTimeString() : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}