import React, { useState, useEffect } from 'react'

export default function OrgChart({ apiUrl, token }) {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${apiUrl}/agents`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setAgents(d.agents || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [apiUrl, token])

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading org chart...</div>
  if (!agents.length) return <div style={{ color: 'var(--text-muted)' }}>No agents found</div>

  const getStatusColor = (status) => status === 'active' ? 'var(--green)' : 'var(--amber)'

  function getRoleColor(role) {
    if (role?.includes('COO') || role?.includes('Operations')) return 'var(--green)'
    if (role?.includes('CTO') || role?.includes('Technology')) return 'var(--cyan)'
    if (role?.includes('CMO') || role?.includes('Marketing')) return 'var(--purple)'
    if (role?.includes('CRO') || role?.includes('Revenue')) return 'var(--red)'
    return 'var(--amber)'
  }

  function AgentCard({ name, role, color, status }) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: `1px solid ${color}40`,
        borderRadius: 12,
        padding: '14px 16px',
        minWidth: 140,
        textAlign: 'center',
        boxShadow: `0 0 16px ${color}20`
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: status === 'active' ? 'var(--green)' : 'var(--amber)', margin: '0 auto 8px' }} />
        <div style={{ fontSize: 14, fontWeight: 700, color }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{role}</div>
      </div>
    )
  }

  const cSuiteCards = [
    { name: 'Jack', role: 'COO', color: 'var(--green)' },
    { name: 'Cane', role: 'CTO', color: 'var(--cyan)' },
    { name: 'Chelsea', role: 'CMO', color: 'var(--purple)' },
    { name: 'Sally', role: 'CRO', color: 'var(--red)' },
    { name: 'Quinn', role: 'QC', color: 'var(--amber)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Organization Chart</h2>
      {/* CEO Row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <AgentCard name="Harvey Roberts" role="CEO / Owner" color="var(--cyan)" status="active" />
      </div>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 20 }}>↓</div>
      {/* AI CEO */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <AgentCard name="Adam" role="AI CEO" color="var(--cyan)" status="active" />
      </div>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 20 }}>↓</div>
      {/* C-Suite */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {cSuiteCards.map(card => {
          const agent = agents.find(a => a.name.toLowerCase().includes(card.name.toLowerCase()))
          return <AgentCard key={card.name} name={card.name} role={card.role} color={card.color} status={agent?.status || 'idle'} />
        })}
      </div>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 20 }}>↓</div>
      {/* Reports */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {agents.filter(a => {
          const n = a.name.toLowerCase()
          return ['claire', 'devon', 'sharon', 'noah', 'kyle', 'audra'].some(x => n.includes(x))
        }).map(a => <AgentCard key={a.id} name={a.name} role={a.role} color={getRoleColor(a.role)} status={a.status} />)}
      </div>
    </div>
  )
}
