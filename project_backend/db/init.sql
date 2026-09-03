CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    browser_id TEXT NOT NULL,
    file_code TEXT NOT NULL UNIQUE,
    file_status TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_extension TEXT,
    sender_id TEXT,
    receiver_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);