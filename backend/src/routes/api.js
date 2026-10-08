const express = require('express');
const router = express.Router();

const {
  getAllMatches,
  getDistinctBookmakers,
  getDistinctLeagues,
  getArbHistory,
  addFavoriteLeague,
  removeFavoriteLeague,
  getFavoriteLeagues,
} = require('../db');
const { enrichAll, onlyArbs } = require('../services/arbService');
const { calculateStakes } = require('../../../shared/arbitrage');

// GET /matches — every cached match with best-odds info
router.get('/matches', (req, res) => {
  try {
    const bankroll = Number(req.query.bankroll) || 0;
    const matches = enrichAll(getAllMatches(), bankroll);
    res.json({ count: matches.length, matches });
  } catch (err) {
    console.error('[GET /matches]', err);
    res.status(500).json({ error: 'failed to load matches' });
  }
});

// GET /arbitrage — only the matches that are actual arbs
router.get('/arbitrage', (req, res) => {
  try {
    const bankroll = Number(req.query.bankroll) || 1000;
    const minProfitPct = Number(req.query.minProfit) || 0;

    const all = enrichAll(getAllMatches(), bankroll);
    let arbs = onlyArbs(all);

    if (minProfitPct > 0) {
      arbs = arbs.filter((a) => a.arbPercentage >= minProfitPct);
    }

    // Highest profit first
    arbs.sort((a, b) => b.arbPercentage - a.arbPercentage);
    res.json({ count: arbs.length, bankroll, arbitrages: arbs });
  } catch (err) {
    console.error('[GET /arbitrage]', err);
    res.status(500).json({ error: 'failed to compute arbitrage' });
  }
});

// GET /bookmakers — distinct bookmakers seen in the cache
router.get('/bookmakers', (req, res) => {
  try {
    res.json({ bookmakers: getDistinctBookmakers() });
  } catch (err) {
    console.error('[GET /bookmakers]', err);
    res.status(500).json({ error: 'failed to load bookmakers' });
  }
});

// GET /leagues — distinct leagues, for the filter dropdown
router.get('/leagues', (req, res) => {
  try {
    res.json({ leagues: getDistinctLeagues() });
  } catch (err) {
    console.error('[GET /leagues]', err);
    res.status(500).json({ error: 'failed to load leagues' });
  }
});

// GET /history — every arb we've ever logged
router.get('/history', (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    res.json({ history: getArbHistory(limit) });
  } catch (err) {
    console.error('[GET /history]', err);
    res.status(500).json({ error: 'failed to load history' });
  }
});

// Favorites
router.get('/favorites', (req, res) => {
  res.json({ favorites: getFavoriteLeagues() });
});

router.post('/favorites', (req, res) => {
  const { league } = req.body || {};
  if (!league || typeof league !== 'string') {
    return res.status(400).json({ error: 'league is required' });
  }
  addFavoriteLeague(league);
  res.json({ favorites: getFavoriteLeagues() });
});

router.delete('/favorites/:league', (req, res) => {
  removeFavoriteLeague(req.params.league);
  res.json({ favorites: getFavoriteLeagues() });
});

// POST /calculate — surebet calculator for arbitrary odds + bankroll.
// Useful for the bonus "surebet calculator page".
router.post('/calculate', (req, res) => {
  const { homeOdds, drawOdds, awayOdds, bankroll } = req.body || {};
  const h = Number(homeOdds);
  const d = Number(drawOdds);
  const a = Number(awayOdds);
  const b = Number(bankroll);

  if (![h, d, a, b].every((v) => Number.isFinite(v) && v > 0)) {
    return res.status(400).json({ error: 'homeOdds, drawOdds, awayOdds, bankroll must all be positive numbers' });
  }

  const result = calculateStakes(h, d, a, b);
  res.json({
    ...result,
    isArbitrage: result.implied < 1,
  });
});

module.exports = router;
