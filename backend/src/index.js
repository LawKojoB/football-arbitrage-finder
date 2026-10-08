// Entry point. Boots Express, exposes /api/*, and runs a refresh loop
// that pulls fresh odds into SQLite every REFRESH_INTERVAL_SECONDS.

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const apiRoutes = require('./routes/api');
const { fetchAllOdds } = require('./services/oddsService');
const { saveMatchWithOdds, getAllMatches, logArbitrage } = require('./db');
const { enrichAll, onlyArbs } = require('./services/arbService');

const PORT = Number(process.env.PORT) || 4000;
const REFRESH_SECONDS = Math.max(Number(process.env.REFRESH_INTERVAL_SECONDS) || 30, 10);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'Football Arbitrage Finder API',
    endpoints: [
      'GET  /api/matches?bankroll=1000',
      'GET  /api/arbitrage?bankroll=1000&minProfit=0',
      'GET  /api/bookmakers',
      'GET  /api/leagues',
      'GET  /api/history',
      'GET  /api/favorites',
      'POST /api/favorites          { "league": "..." }',
      'DEL  /api/favorites/:league',
      'POST /api/calculate          { "homeOdds":..., "drawOdds":..., "awayOdds":..., "bankroll":... }',
    ],
  });
});

app.use('/api', apiRoutes);

// --------- Refresh loop ---------

// Track which arbs we've already logged so /history doesn't fill up with
// dupes of the same opportunity on every refresh. Key = match id + each
// bookmaker's odds rounded — anything changes, we treat it as a new arb.
const loggedArbKeys = new Set();

function arbKey(arb) {
  return [
    arb.id,
    arb.bestOdds.home.bookmaker, arb.bestOdds.home.odds,
    arb.bestOdds.draw.bookmaker, arb.bestOdds.draw.odds,
    arb.bestOdds.away.bookmaker, arb.bestOdds.away.odds,
  ].join('|');
}

async function refreshLoop() {
  try {
    const matches = await fetchAllOdds();
    for (const m of matches) saveMatchWithOdds(m);

    // Detect & log new arbs
    const arbs = onlyArbs(enrichAll(getAllMatches()));
    let newCount = 0;
    for (const arb of arbs) {
      const key = arbKey(arb);
      if (loggedArbKeys.has(key)) continue;
      loggedArbKeys.add(key);
      logArbitrage({
        match_id: arb.id,
        match_label: `${arb.homeTeam} vs ${arb.awayTeam}`,
        league: arb.league,
        arb_percentage: arb.arbPercentage,
        home_odds: arb.bestOdds.home.odds,
        draw_odds: arb.bestOdds.draw.odds,
        away_odds: arb.bestOdds.away.odds,
        home_bookmaker: arb.bestOdds.home.bookmaker,
        draw_bookmaker: arb.bestOdds.draw.bookmaker,
        away_bookmaker: arb.bestOdds.away.bookmaker,
        detected_at: new Date().toISOString(),
      });
      newCount += 1;
    }

    console.log(`[refresh] ${matches.length} matches, ${arbs.length} arbs (${newCount} new)`);
  } catch (err) {
    console.error('[refresh] failed:', err.message);
  }
}

app.listen(PORT, () => {
  console.log(`Arb finder API listening on http://localhost:${PORT}`);
  console.log(`Refresh interval: ${REFRESH_SECONDS}s`);

  // Run once on boot so the DB is populated before any UI hits it
  refreshLoop();
  setInterval(refreshLoop, REFRESH_SECONDS * 1000);
});
