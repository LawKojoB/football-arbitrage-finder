-- Football arbitrage finder — SQLite schema
-- All tables are created by db/index.js on first boot, but this file
-- exists as a single source of truth and for manual inspection.

CREATE TABLE IF NOT EXISTS matches (
  id            TEXT PRIMARY KEY,             -- upstream API id
  league        TEXT NOT NULL,
  home_team     TEXT NOT NULL,
  away_team     TEXT NOT NULL,
  commence_time TEXT NOT NULL,                -- ISO-8601
  updated_at    TEXT NOT NULL                 -- ISO-8601
);

CREATE TABLE IF NOT EXISTS odds (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id       TEXT NOT NULL,
  bookmaker_key  TEXT NOT NULL,
  bookmaker_name TEXT NOT NULL,
  home_odds      REAL NOT NULL,
  draw_odds      REAL NOT NULL,
  away_odds      REAL NOT NULL,
  fetched_at     TEXT NOT NULL,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  UNIQUE (match_id, bookmaker_key)
);

-- A simple log of every arb we've found, so users can browse history.
CREATE TABLE IF NOT EXISTS arb_history (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id        TEXT NOT NULL,
  match_label     TEXT NOT NULL,               -- "Arsenal vs Chelsea"
  league          TEXT NOT NULL,
  arb_percentage  REAL NOT NULL,
  home_odds       REAL NOT NULL,
  draw_odds       REAL NOT NULL,
  away_odds       REAL NOT NULL,
  home_bookmaker  TEXT NOT NULL,
  draw_bookmaker  TEXT NOT NULL,
  away_bookmaker  TEXT NOT NULL,
  detected_at     TEXT NOT NULL
);

-- Favorite leagues saved by the user.
CREATE TABLE IF NOT EXISTS favorite_leagues (
  league TEXT PRIMARY KEY,
  added_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_odds_match ON odds(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league);
CREATE INDEX IF NOT EXISTS idx_arb_history_detected ON arb_history(detected_at);
