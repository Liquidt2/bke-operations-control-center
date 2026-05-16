import React, { useState, useEffect } from 'react'

const COLUMNS = [
  { id: 'open', label: 'Open', color: 'var(--blue)' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--amber)' },
  { id: 'blocked', label: 'Blocked', color: 'var(--red)' },
  { id: 'done', label: 'Done', color: 'var(--green)' }
]

const PRIORITY_COLOR = { P1: '#ef4444', P2: '#f97316', P3: '#eab308', P4: '#6b7280' }

export default function Kanban({ apiUrl, token }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [dragId, setDragId] = useState(null)

  const fetchTickets = () => {
    fetch(`${apiUrl}/tickets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setTickets(d.tickets || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchTickets() }, [apiUrl, token])

  const handleDragStart = (e, id) => { setDragId(id); e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }

  const handleDrop = (e, status) => {
    e.preventDefault()
    if (!dragId) return
    fetch(`${apiUrl}/tickets/${dragId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(r => r.json()).then(() => fetchTickets())
    setDragId(null)
  }

  const getColTickets = (status) => tickets.filter(t => t.status === status)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 0 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Tickets</h2>
        <button
          onClick={() => {
            const title = prompt('New ticket title:')
            if (!title) return
            fetch(`${apiUrl}/tickets`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, priority: 'P3' })
            }).then(r => r.json()).then(() => fetchTickets())
          }}
          style={{ background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
        >+ New Ticket</button>
      </div>

      {loading && <div style={{ color: 'var(--text-muted)' }}>Loading tickets...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`, gap: 16, alignItems: 'start' }}>
        {COLUMNS.map(col => (
          <div key={col.id} style={{ background: 'var(--bg-raised)', borderRadius: 12, padding: 12, minHeight: 400 }}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, col.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{col.label}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 10 }}>
                {getColTickets(col.id).length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {getColTickets(col.id).map(t => (
                <div key={t.id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid transparent',
                  borderRadius: 8,
                  padding: '12px',
                  cursor: 'grab',
                  opacity: dragId === t.id ? 0.5 : 1,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                }}
                  draggable
                  onDragStart={e => handleDragStart(e, t.id)}
                  onClick={() => {
                    const note = prompt('Add note:')
                    if (!note) return
                    const thread = t.thread || []
                    thread.push({ text: note, ts: new Date().toISOString() })
                    fetch(`${apiUrl}/tickets/${t.id}`, {
                      method: 'PATCH',
                      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify({ thread })
                    }).then(r => r.json()).then(() => fetchTickets())
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: (PRIORITY_COLOR[t.priority] || '#6b7280') + '20', color: PRIORITY_COLOR[t.priority] || '#6b7280', fontWeight: 700 }}>{t.priority || 'P3'}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>#{t.id.slice(0, 8)}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{t.title}</div>
                  {t.assignee_id && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Assigned: {t.assignee_id}</div>}
                  {t.thread?.length > 0 && <div style={{ fontSize: 10, color: 'var(--cyan)', marginTop: 4 }}>💬 {t.thread.length} notes</div>}
                </div>
              ))}
              {getColTickets(col.id).length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 20 }}>Drop here</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}