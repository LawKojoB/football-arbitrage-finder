// Thin wrapper around better-sqlite3.
// We use better-sqlite3 because it's synchronous (no callback/await spaghetti)
// and ships with a single file — easy to reason about for an MVP.

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run schema on every boot — every statement is idempotent ("IF NOT EXISTS").
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

// Replace a match's odds atomically: clear out the old rows, insert the new ones.
// This avoids stale odds lingering when a bookmaker stops offering a market.
const upsertMatch = db.prepare(`
  INSERT INTO matches (id, league, home_team, away_team, commence_time, updated_at)
  VALUES (@id, @league, @home_team, @away_team, @commence_time, @updated_at)
  ON CONFLICT(id) DO UPDATE SET
    league        = excluded.league,
    home_team     = excluded.home_team,
    away_team     = excluded.away_team,
    commence_time = excluded.commence_time,
    updated_at    = excluded.updated_at
`);

const deleteOddsForMatch = db.prepare(`DELETE FROM odds WHERE match_id = ?`);

const insertOdds = db.prepare(`
  INSERT INTO odds (match_id, bookmaker_key, bookmaker_name, home_odds, draw_odds, away_odds, fetched_at)
  VALUES (@match_id, @bookmaker_key, @bookmaker_name, @home_odds, @draw_odds, @away_odds, @fetched_at)
`);

const saveMatchWithOdds = db.transaction((match) => {
  upsertMatch.run({
    id: match.id,
    league: match.league,
    home_team: match.homeTeam,
    away_team: match.awayTeam,
    commence_time: match.commenceTime,
    updated_at: new Date().toISOString(),
  });

  deleteOddsForMatch.run(match.id);

  for (const bk of match.bookmakers) {
    insertOdds.run({
      match_id: match.id,
      bookmaker_key: bk.key,
      bookmaker_name: bk.title,
      home_odds: bk.odds.home,
      draw_odds: bk.odds.draw,
      away_odds: bk.odds.away,
      fetched_at: new Date().toISOString(),
    });
  }
});

// Pull every match plus its bookmaker odds, shaped to mirror what the
// odds-service produces (id, league, homeTeam, awayTeam, bookmakers[]).
function getAllMatches() {
  const matchRows = db.prepare(`SELECT * FROM matches ORDER BY commence_time ASC`).all();
  const oddsByMatch = db
    .prepare(`SELECT * FROM odds`)
    .all()
    .reduce((acc, row) => {
      (acc[row.match_id] ||= []).push({
        key: row.bookmaker_key,
        title: row.bookmaker_name,
        odds: {
          home: row.home_odds,
          draw: row.draw_odds,
          away: row.away_odds,
        },
      });
      return acc;
    }, {});

  return matchRows.map((m) => ({
    id: m.id,
    league: m.league,
    homeTeam: m.home_team,
    awayTeam: m.away_team,
    commenceTime: m.commence_time,
    bookmakers: oddsByMatch[m.id] || [],
  }));
}

function getDistinctBookmakers() {
  return db
    .prepare(`SELECT DISTINCT bookmaker_key AS key, bookmaker_name AS title FROM odds ORDER BY bookmaker_name`)
    .all();
}

function getDistinctLeagues() {
  return db.prepare(`SELECT DISTINCT league FROM matches ORDER BY league`).all().map((r) => r.league);
}

// Arb history
const insertArb = db.prepare(`
  INSERT INTO arb_history
    (match_id, match_label, league, arb_percentage,
     home_odds, draw_odds, away_odds,
     home_bookmaker, draw_bookmaker, away_bookmaker, detected_at)
  VALUES
    (@match_id, @match_label, @league, @arb_percentage,
     @home_odds, @draw_odds, @away_odds,
     @home_bookmaker, @draw_bookmaker, @away_bookmaker, @detected_at)
`);

function logArbitrage(entry) {
  insertArb.run(entry);
}

function getArbHistory(limit = 100) {
  return db.prepare(`SELECT * FROM arb_history ORDER BY detected_at DESC LIMIT ?`).all(limit);
}

// Favorite leagues
function addFavoriteLeague(league) {
  db.prepare(`INSERT OR IGNORE INTO favorite_leagues (league, added_at) VALUES (?, ?)`).run(
    league,
    new Date().toISOString(),
  );
}

function removeFavoriteLeague(league) {
  db.prepare(`DELETE FROM favorite_leagues WHERE league = ?`).run(league);
}

function getFavoriteLeagues() {
  return db.prepare(`SELECT league FROM favorite_leagues ORDER BY league`).all().map((r) => r.league);
}

module.exports = {
  db,
  saveMatchWithOdds,
  getAllMatches,
  getDistinctBookmakers,
  getDistinctLeagues,
  logArbitrage,
  getArbHistory,
  addFavoriteLeague,
  removeFavoriteLeague,
  getFavoriteLeagues,
};
