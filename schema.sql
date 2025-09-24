DROP TABLE IF EXISTS reports;
CREATE TABLE reports (
	id TEXT PRIMARY KEY,
	json TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reports_updated_at ON reports(updated_at DESC);


