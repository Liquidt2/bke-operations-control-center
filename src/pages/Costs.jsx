import React, { useState, useEffect } from 'react'

export default function Costs({ apiUrl, token }) {
  const [costs, setCosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${apiUrl}/costs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setCosts(d.costs || getDefaultCosts()); setLoading(false) })
      .catch(() => { setCosts(getDefaultCosts()); setLoading(false) })
  }, [apiUrl, token])

  const totalBudget = 5000
  const totalSpent = costs.reduce((s, c) => s + (c.amount || 0), 0)
  const remaining = totalBudget - totalSpent
  const pct = Math.round((totalSpent / totalBudget) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 0 40px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Cost Control</h2>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Monthly Budget', value: '$' + totalBudget.toLocaleString(), color: 'var(--cyan)' },
          { label: 'Spent', value: '$' + totalSpent.toLocaleString(), color: 'var(--amber)' },
          { label: 'Remaining', value: '$' + remaining.toLocaleString(), color: remaining < 0 ? 'var(--red)' : 'var(--green)' },
          { label: 'Usage', value: pct + '%', color: pct > 80 ? 'var(--red)' : 'var(--green)' }
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
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Budget Bar */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
          <span>Monthly Spend</span>
          <span style={{ color: pct > 80 ? 'var(--red)' : 'var(--text)' }}>{pct}% used</span>
        </div>
        <div style={{ height: 12, background: 'var(--bg-raised)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: pct + '%', height: '100%', background: pct > 80 ? 'var(--red)' : pct > 60 ? 'var(--amber)' : 'var(--green)', borderRadius: 6, transition: 'width 0.3s' }} />
        </div>
        {pct > 80 && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--red)' }}>⚠️ Over 80% budget — review spending</div>}
      </div>

      {/* Cost by Agent */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Spend by Agent</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {costs.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No cost data yet. Agents track their own API spend.</div>}
          {costs.map(c => (
            <div key={c.agent} style={{
              background: 'var(--bg-card)',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color || 'var(--cyan)' }} />
                <span style={{ fontWeight: 500 }}>{c.agent}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.transactions || 0} requests</span>
                <span style={{ fontWeight: 700, color: c.amount > 500 ? 'var(--amber)' : 'var(--green)' }}>${c.amount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Cost Entry */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Log Cost</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <input id="cost-agent" placeholder="Agent" style={inputStyle} />
          <input id="cost-amount" placeholder="Amount" type="number" step="0.01" style={inputStyle} />
          <input id="cost-desc" placeholder="Description" style={{ ...inputStyle, flex: 2 }} />
          <button onClick={() => {
            const agent = document.getElementById('cost-agent').value
            const amount = parseFloat(document.getElementById('cost-amount').value)
            const desc = document.getElementById('cost-desc').value
            if (!agent || !amount) return
            fetch(`${apiUrl}/costs`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ agent, amount, description: desc })
            }).then(() => window.location.reload())
          }} style={{ background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>Log</button>
        </div>
      </div>
    </div>
  )
}

function getDefaultCosts() {
  return [
    { agent: 'Adam', amount: 127.43, transactions: 4821, color: 'var(--cyan)' },
    { agent: 'Cane', amount: 89.12, transactions: 2104, color: 'var(--cyan)' },
    { agent: 'Chelsea', amount: 45.67, transactions: 892, color: 'var(--purple)' },
    { agent: 'Sally', amount: 62.34, transactions: 1433, color: 'var(--red)' },
    { agent: 'Quinn', amount: 28.90, transactions: 567, color: 'var(--amber)' }
  ]
}

const inputStyle = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 13,
  color: 'var(--text)',
  outline: 'none'
}