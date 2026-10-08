// Fetches football odds from The Odds API (https://the-odds-api.com).
// Falls back to mock data if no key is configured or USE_MOCK_DATA=true.
//
// The Odds API endpoint we use:
//   GET https://api.the-odds-api.com/v4/sports/{sportKey}/odds
//   ?apiKey=...&regions=eu,uk&markets=h2h&oddsFormat=decimal
//
// We normalize its (verbose) response into our internal match shape:
//   { id, league, homeTeam, awayTeam, commenceTime, bookmakers: [...] }

const axios = require('axios');
const { buildMockMatches } = require('./mockOdds');

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

// Friendly names for the sport keys we support, used as "league" in the UI.
const LEAGUE_LABELS = {
  soccer_epl: 'English Premier League',
  soccer_spain_la_liga: 'Spanish La Liga',
  soccer_germany_bundesliga: 'German Bundesliga',
  soccer_italy_serie_a: 'Italian Serie A',
  soccer_france_ligue_one: 'French Ligue 1',
  soccer_uefa_champs_league: 'UEFA Champions League',
  soccer_uefa_europa_league: 'UEFA Europa League',
};

function shouldUseMock() {
  return !process.env.ODDS_API_KEY || process.env.USE_MOCK_DATA === 'true';
}

/**
 * Normalize one event from the Odds API response into our internal shape.
 * The API returns a market called "h2h" (head-to-head) which has exactly the
 * three outcomes we want for football: home team, away team, and "Draw".
 */
function normalizeEvent(event, sportKey) {
  const bookmakers = [];

  for (const bk of event.bookmakers || []) {
    const h2h = (bk.markets || []).find((m) => m.key === 'h2h');
    if (!h2h) continue;

    const outcomes = h2h.outcomes || [];
    const homeOutcome = outcomes.find((o) => o.name === event.home_team);
    const awayOutcome = outcomes.find((o) => o.name === event.away_team);
    const drawOutcome = outcomes.find((o) => o.name === 'Draw');

    // Skip bookmakers that don't price all three outcomes (e.g. 2-way markets).
    if (!homeOutcome || !awayOutcome || !drawOutcome) continue;

    bookmakers.push({
      key: bk.key,
      title: bk.title,
      odds: {
        home: homeOutcome.price,
        draw: drawOutcome.price,
        away: awayOutcome.price,
      },
    });
  }

  return {
    id: event.id,
    league: LEAGUE_LABELS[sportKey] || sportKey,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    commenceTime: event.commence_time,
    bookmakers,
  };
}

async function fetchSport(sportKey) {
  const url = `${ODDS_API_BASE}/sports/${sportKey}/odds`;
  const { data } = await axios.get(url, {
    params: {
      apiKey: process.env.ODDS_API_KEY,
      regions: 'eu,uk',
      markets: 'h2h',
      oddsFormat: 'decimal',
    },
    timeout: 15000,
  });
  return (data || []).map((e) => normalizeEvent(e, sportKey)).filter((m) => m.bookmakers.length > 0);
}

async function fetchAllOdds() {
  if (shouldUseMock()) {
    console.log('[odds] using mock data (no API key, or USE_MOCK_DATA=true)');
    return buildMockMatches();
  }

  const sports = (process.env.ODDS_API_SPORTS || 'soccer_epl')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const results = [];
  for (const sport of sports) {
    try {
      const matches = await fetchSport(sport);
      results.push(...matches);
      console.log(`[odds] fetched ${matches.length} matches from ${sport}`);
    } catch (err) {
      // Don't crash the loop just because one sport failed (e.g. rate limit).
      const status = err.response?.status;
      console.error(`[odds] failed to fetch ${sport}${status ? ` (HTTP ${status})` : ''}:`, err.message);
    }
  }

  // If every upstream call failed, gracefully fall back to mocks rather than
  // showing an empty dashboard.
  if (results.length === 0) {
    console.warn('[odds] no live data returned — falling back to mocks');
    return buildMockMatches();
  }

  return results;
}

module.exports = { fetchAllOdds };
