-- D1 Schema for OaaS Usage Events
-- Maps to "events" dimension in 6D ontology

CREATE TABLE IF NOT EXISTS usage_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  payer TEXT NOT NULL,
  userId TEXT,
  roles TEXT,
  layer TEXT NOT NULL,
  price REAL NOT NULL,
  status TEXT NOT NULL,  -- granted | denied | replay | underpay | pending_settlement | settled | settlement_failed
  observedAcc REAL,
  tokensSaved REAL,
  latencyMs INTEGER,
  txHash TEXT,
  updatedAt INTEGER,
  UNIQUE(txHash, payer)  -- Idempotency
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_usage_layer_ts ON usage_events(layer, ts);
CREATE INDEX IF NOT EXISTS idx_usage_payer ON usage_events(payer);
CREATE INDEX IF NOT EXISTS idx_usage_status ON usage_events(status);
CREATE INDEX IF NOT EXISTS idx_usage_txhash ON usage_events(txHash);

-- Example queries:
-- 1. Usage by layer (revenue, calls, agents)
-- SELECT layer, COUNT(*) as calls, SUM(price) as revenue, COUNT(DISTINCT payer) as agents
-- FROM usage_events
-- WHERE status = 'granted' AND ts > ?
-- GROUP BY layer;

-- 2. Revenue by agent (top paying agents)
-- SELECT payer, SUM(price) as total_spent, COUNT(*) as calls
-- FROM usage_events
-- WHERE status = 'granted'
-- GROUP BY payer
-- ORDER BY total_spent DESC
-- LIMIT 10;

-- 3. Observed metrics by pack
-- SELECT layer, AVG(observedAcc) as avg_accuracy, AVG(tokensSaved) as avg_tokens_saved
-- FROM usage_events
-- WHERE status = 'granted' AND ts > ?
-- GROUP BY layer;
