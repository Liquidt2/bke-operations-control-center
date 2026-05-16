-- ============================================================
-- BKE Logistics OCC (Operations Control Center)
-- PostgreSQL Schema Migration
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Agents: source of truth for org chart + OpenClaw agent registry
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT DEFAULT '',
  role TEXT DEFAULT '',
  department TEXT DEFAULT '',
  status TEXT DEFAULT 'idle',
  avatar TEXT DEFAULT '',
  color TEXT DEFAULT '#00E5FF',
  responsibilities TEXT[] DEFAULT '{}',
  direct_reports TEXT[] DEFAULT '{}',
  reports_to TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (human OCC dashboard login)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets / Issues
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'P3',
  project_id TEXT,
  assignee_id TEXT,
  created_by TEXT,
  due_date DATE,
  thread JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#6366f1',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  agent TEXT DEFAULT 'system',
  action TEXT NOT NULL,
  detail TEXT DEFAULT '',
  category TEXT DEFAULT 'system',
  severity TEXT DEFAULT 'info',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings (branding, budgets, etc.)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost Events
CREATE TABLE IF NOT EXISTS cost_events (
  id SERIAL PRIMARY KEY,
  agent TEXT DEFAULT '',
  action TEXT DEFAULT '',
  cost_cents INTEGER DEFAULT 0,
  category TEXT DEFAULT 'agent',
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_limit_cents INTEGER DEFAULT 0,
  period TEXT DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliverables
CREATE TABLE IF NOT EXISTS deliverables (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  filename TEXT DEFAULT '',
  project_id TEXT,
  ticket_id TEXT,
  uploaded_by TEXT,
  file_path TEXT DEFAULT '',
  mime_type TEXT DEFAULT '',
  size_bytes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Heartbeats
CREATE TABLE IF NOT EXISTS agent_heartbeats (
  id SERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL,
  status TEXT DEFAULT 'idle',
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hiring Requests
CREATE TABLE IF NOT EXISTS hiring_requests (
  id TEXT PRIMARY KEY,
  agent_name TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  role TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  requested_by TEXT,
  decided_by TEXT,
  decision_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  decided_at TIMESTAMPTZ
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_type TEXT DEFAULT 'agent',
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_project ON tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_agent ON activity_logs(agent);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_heartbeats_agent ON agent_heartbeats(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_heartbeats_created ON agent_heartbeats(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- ============================================================
-- SEED DATA — BKE Agents
-- ============================================================

INSERT INTO agents (id, name, title, role, department, status, color, responsibilities, direct_reports, reports_to) VALUES
(
  'harvey',
  'Harvey',
  'Owner',
  'owner',
  'executive',
  'active',
  '#FF6B00',
  ARRAY['Business ownership','Strategic direction','Final authority','Revenue accountability'],
  ARRAY['adam','jack','cane','chelsea','sally','quinn','claire','devon','noah','kyle','audra','sharon'],
  ''
),
(
  'adam',
  'Adam',
  'CEO',
  'ceo',
  'executive',
  'active',
  '#FF4500',
  ARRAY['Revenue strategy','Sales pipeline','Overall operations oversight','Delegation authority'],
  ARRAY['jack','cane','chelsea','sally','quinn','claire','devon','noah','kyle','audra','sharon'],
  'harvey'
),
(
  'jack',
  'Jack',
  'Operations Manager',
  'operations_manager',
  'operations',
  'active',
  '#4CAF50',
  ARRAY['Load dispatching','Driver coordination','Route optimization','Fleet coordination'],
  ARRAY[]::TEXT[],
  'adam'
),
(
  'cane',
  'Cane',
  'CTO',
  'cto',
  'technology',
  'active',
  '#00E5FF',
  ARRAY['OpenClaw infrastructure','Gateway and agent runtime','Docker containers','All API integrations','Secrets management','Automation infrastructure','Nightly pipelines','Technical monitoring','Internal tooling','Incident response'],
  ARRAY[]::TEXT[],
  'adam'
),
(
  'chelsea',
  'Chelsea',
  'Content Lead',
  'content_lead',
  'content',
  'active',
  '#E040FB',
  ARRAY['Campaign copy','Brand content','Content strategy','Publication scheduling'],
  ARRAY[]::TEXT[],
  'adam'
),
(
  'sally',
  'Sally',
  'Pipeline Manager',
  'pipeline_manager',
  'sales',
  'active',
  '#FF9800',
  ARRAY['Lead pipeline management','Outreach execution','Pipeline reporting','CRM hygiene'],
  ARRAY[]::TEXT[],
  'adam'
),
(
  'quinn',
  'Quinn',
  'AI Workflow Designer',
  'ai_workflow_designer',
  'technology',
  'active',
  '#00BCD4',
  ARRAY['n8n workflow design','Automation architecture','AI pipeline integration','Workflow debugging'],
  ARRAY[]::TEXT[],
  'cane'
),
(
  'claire',
  'Claire',
  'Inbox Triage Agent',
  'inbox_triage',
  'operations',
  'active',
  '#9C27B0',
  ARRAY['Email triage','Intent routing','Reply prioritization','Escalation handling'],
  ARRAY[]::TEXT[],
  'jack'
),
(
  'devon',
  'Devon',
  'Campaign Specialist',
  'campaign_specialist',
  'content',
  'active',
  '#F44336',
  ARRAY['Campaign execution','A/B testing','Audience targeting','Campaign analytics'],
  ARRAY[]::TEXT[],
  'chelsea'
),
(
  'noah',
  'Noah',
  'Outreach Specialist',
  'outreach_specialist',
  'sales',
  'active',
  '#3F51B5',
  ARRAY['Cold email outreach','Follow-up sequences','Lead research','Contact enrichment'],
  ARRAY[]::TEXT[],
  'sally'
),
(
  'kyle',
  'Kyle',
  'Customer Replies Agent',
  'customer_replies',
  'customer_service',
  'active',
  '#009688',
  ARRAY['Customer email replies','Response templating','Escalation handling','Reply quality assurance'],
  ARRAY[]::TEXT[],
  'jack'
),
(
  'audra',
  'Audra',
  'Data Enrichment Lead',
  'data_enrichment',
  'data',
  'active',
  '#795548',
  ARRAY['Lead data enrichment','CRM data quality','Company research','Firmographic data updates'],
  ARRAY[]::TEXT[],
  'sally'
),
(
  'sharon',
  'Sharon',
  'CRM Administrator',
  'crm_admin',
  'operations',
  'active',
  '#607D8B',
  ARRAY['Zoho CRM management','CRM data hygiene','Pipeline configuration','User access management','Reporting and dashboards'],
  ARRAY[]::TEXT[],
  'jack'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA — Branding Settings
-- ============================================================

INSERT INTO settings (key, value) VALUES
  ('branding', '{"company_name":"BKE Logistics LLC","logo_url":"","favicon_url":"","primary_color":"#FF6B00","secondary_color":"#00E5FF","tagline":"Freight. Done Right."}'),
  ('company_info', '{"name":"BKE Logistics LLC","address":"19840 SR 124, Hector AR 72843","phone":"4793510390","mc_number":"MC-1588065","dot_number":"DOT-4141583-B"}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SEED DATA — Default Budget
-- ============================================================

INSERT INTO budgets (id, name, monthly_limit_cents, period) VALUES
  ('default', 'BKE Monthly Agent Budget', 0, 'monthly')
ON CONFLICT (id) DO NOTHING;