import React, { useState, useEffect, useRef } from 'react'

export default function TeamChat({ apiUrl, token }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Load initial messages
    fetch(`${apiUrl}/chat`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setMessages(d.messages || []); scrollToBottom() })
      .catch(() => {})

    // SSE connection for live messages
    let es
    try {
      es = new EventSource(`${apiUrl.replace('/api','')}/api/chat/stream`, { withCredentials: false })
      es.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          setMessages(prev => [...prev, msg])
          scrollToBottom()
        } catch {}
      }
      es.onopen = () => setConnected(true)
      es.onerror = () => setConnected(false)
    } catch {}

    return () => { if (es) es.close() }
  }, [apiUrl, token])

  const scrollToBottom = () => {
    setTimeout(() => { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' }) }, 50)
  }

  const send = () => {
    if (!input.trim() || sending) return
    setSending(true)
    fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input.trim() })
    })
      .then(r => r.json())
      .then(msg => {
        setMessages(prev => [...prev, msg])
        setInput('')
        scrollToBottom()
        setSending(false)
      })
      .catch(() => setSending(false))
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Team Chat</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: connected ? 'var(--green)' : 'var(--text-muted)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? 'var(--green)' : 'var(--amber)' }} />
          {connected ? 'Live' : 'Connecting...'}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
        {messages.length === 0 && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40, fontSize: 13 }}>
            No messages yet. Say hello!
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender === 'Adam'
          return (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMe ? 'flex-end' : 'flex-start',
              gap: 2
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                {!isMe && <span style={{ color: msg.color || 'var(--cyan)', fontWeight: 600 }}>{msg.sender}</span>}
                <span style={{ color: 'var(--text-muted)' }}>{formatTime(msg.created_at)}</span>
                {isMe && <span style={{ color: 'var(--green)', fontWeight: 600 }}>You</span>}
              </div>
              <div style={{
                background: isMe ? 'var(--cyan)' : 'var(--bg-card)',
                color: isMe ? '#000' : 'var(--text)',
                borderRadius: 12,
                padding: '8px 14px',
                maxWidth: '70%',
                fontSize: 13,
                lineHeight: 1.4
              }}>
                {msg.text}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message the team..."
          style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-raised)',
            borderRadius: 20,
            padding: '10px 16px',
            fontSize: 13,
            color: 'var(--text)',
            outline: 'none'
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          style={{
            background: input.trim() && !sending ? 'var(--cyan)' : 'var(--bg-raised)',
            color: input.trim() && !sending ? '#000' : 'var(--text-muted)',
            border: 'none',
            borderRadius: 20,
            padding: '10px 20px',
            fontWeight: 600,
            fontSize: 13,
            cursor: input.trim() && !sending ? 'pointer' : 'default'
          }}
        >Send</button>
      </div>
    </div>
  )
}