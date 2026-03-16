CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT,
    author TEXT,
    repository TEXT,
    license_text TEXT,
    source TEXT NOT NULL
);