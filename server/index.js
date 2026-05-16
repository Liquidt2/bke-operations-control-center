import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db/pool.js';
import { authMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Public routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use('/api/auth', authRoutes);

// Auth middleware applied to all routes below
app.use('/api', authMiddleware);

// --- AGENTS ---
app.get('/api/agents', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, status, role, last_seen FROM occ_agents ORDER BY last_seen DESC'
    );
    res.json({ agents: result.rows });
  } catch (err) {
    console.error('GET /api/agents error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- TICKETS ---
app.get('/api/tickets', async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = 'SELECT * FROM occ_tickets WHERE 1=1';
    const params = [];
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (priority) { params.push(priority); query += ` AND priority = $${params.length}`; }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ tickets: result.rows });
  } catch (err) {
    console.error('GET /api/tickets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const { title, description, priority, assignee_id } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const result = await pool.query(
      `INSERT INTO occ_tickets (title, description, priority, assignee_id, status)
       VALUES ($1, $2, $3, $4, 'open') RETURNING *`,
      [title, description, priority || 'medium', assignee_id]
    );
    res.status(201).json({ ticket: result.rows[0] });
  } catch (err) {
    console.error('POST /api/tickets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignee_id } = req.body;
    const fields = [];
    const params = [];
    if (status) { params.push(status); fields.push(`status = $${params.length}`); }
    if (priority) { params.push(priority); fields.push(`priority = $${params.length}`); }
    if (assignee_id !== undefined) { params.push(assignee_id); fields.push(`assignee_id = $${params.length}`); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);
    const result = await pool.query(
      `UPDATE occ_tickets SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ ticket: result.rows[0] });
  } catch (err) {
    console.error('PATCH /api/tickets/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- PROJECTS ---
app.get('/api/projects', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM occ_projects ORDER BY created_at DESC'
    );
    res.json({ projects: result.rows });
  } catch (err) {
    console.error('GET /api/projects error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const result = await pool.query(
      `INSERT INTO occ_projects (name, description, status)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, status || 'planning']
    );
    res.status(201).json({ project: result.rows[0] });
  } catch (err) {
    console.error('POST /api/projects error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- ACTIVITY ---
app.get('/api/activity', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const result = await pool.query(
      'SELECT * FROM occ_activity ORDER BY created_at DESC LIMIT $1',
      [parseInt(limit)]
    );
    res.json({ activity: result.rows });
  } catch (err) {
    console.error('GET /api/activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- CHAT (SSE for real-time streaming) ---
const chatStreams = new Map(); // userId -> { controller, userId }

app.get('/api/chat/stream', (req, res) => {
  // SSE endpoint — client subscribes with ?userId=<id>
  const userId = req.query.userId || 'anonymous';
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const controller = res;
  chatStreams.set(userId, { controller });

  // Send heartbeat comment every 30s
  const heartbeat = setInterval(() => {
    controller.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    chatStreams.delete(userId);
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message, agentId } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    // Store message
    const result = await pool.query(
      `INSERT INTO occ_chat_messages (user_id, message, agent_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, message, agentId]
    );

    // Broadcast to SSE subscribers for the same user
    const stream = chatStreams.get(userId);
    if (stream) {
      stream.controller.write(`data: ${JSON.stringify(result.rows[0])}\n\n`);
    }

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    console.error('POST /api/chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/chat', async (req, res) => {
  try {
    const { userId, limit = 50 } = req.query;
    let query = 'SELECT * FROM occ_chat_messages';
    const params = [];
    if (userId) {
      params.push(userId);
      query += ` WHERE user_id = $1`;
    }
    params.push(parseInt(limit));
    query += ` ORDER BY created_at DESC LIMIT $${params.length}`;
    const result = await pool.query(query, params);
    res.json({ messages: result.rows });
  } catch (err) {
    console.error('GET /api/chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- SETTINGS ---
app.get('/api/settings', (req, res) => {
  // Return non-sensitive settings; real impl would pull from DB
  res.json({
    settings: {
      theme: 'dark',
      notifications: true,
      timezone: 'America/Chicago',
    }
  });
});

app.patch('/api/settings', (req, res) => {
  // Real impl would validate + store per-user settings
  res.json({ settings: req.body });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`BKE OCC server running on port ${PORT}`);
});

export default app;