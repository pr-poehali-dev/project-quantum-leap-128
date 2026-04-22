CREATE TABLE IF NOT EXISTS tracks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration_sec INTEGER,
  file_url TEXT NOT NULL,
  cover_url TEXT,
  plays INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
