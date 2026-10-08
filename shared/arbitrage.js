/**
 * Arbitrage math for 3-way football markets (Home / Draw / Away).
 *
 * Core idea:
 *   If you find three decimal odds (one per outcome) such that
 *     1/home + 1/draw + 1/away < 1
 *   then you can split a stake across all three outcomes and guarantee
 *   a profit no matter which one wins.
 *
 *   The sum (1/home + 1/draw + 1/away) is called the "implied probability".
 *   - = 1.00  -> fair market, no edge
 *   - > 1.00  -> the bookmakers have an edge (the usual case)
 *   - < 1.00  -> arbitrage exists; the smaller it is, the bigger your edge
 *
 *   Arbitrage % (profit margin on bankroll) = (1 / implied) - 1
 */

function impliedProbability(homeOdds, drawOdds, awayOdds) {
  return 1 / homeOdds + 1 / drawOdds + 1 / awayOdds;
}

function isArbitrage(homeOdds, drawOdds, awayOdds) {
  return impliedProbability(homeOdds, drawOdds, awayOdds) < 1;
}

/**
 * Given a bankroll and three odds, return how much to stake on each outcome
 * so that the return is identical regardless of which outcome wins.
 *
 *   stake_i = bankroll * (1/odds_i) / implied
 *
 * The guaranteed return per outcome equals stake_i * odds_i, which works out
 * the same for every i (that's the whole point).
 */
function calculateStakes(homeOdds, drawOdds, awayOdds, bankroll) {
  const implied = impliedProbability(homeOdds, drawOdds, awayOdds);

  const homeStake = (bankroll * (1 / homeOdds)) / implied;
  const drawStake = (bankroll * (1 / drawOdds)) / implied;
  const awayStake = (bankroll * (1 / awayOdds)) / implied;

  // Guaranteed return — same regardless of which leg wins
  const guaranteedReturn = homeStake * homeOdds;
  const profit = guaranteedReturn - bankroll;
  const arbPercentage = (profit / bankroll) * 100;

  return {
    implied,
    arbPercentage,
    stakes: {
      home: round2(homeStake),
      draw: round2(drawStake),
      away: round2(awayStake),
    },
    guaranteedReturn: round2(guaranteedReturn),
    profit: round2(profit),
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Given a match with odds from several bookmakers, find the best (highest)
 * odds for each outcome — possibly from different bookmakers — and check if
 * combining them creates an arbitrage opportunity.
 *
 * Input shape:
 *   {
 *     id, league, homeTeam, awayTeam, commenceTime,
 *     bookmakers: [
 *       { key, title, odds: { home, draw, away } },
 *       ...
 *     ]
 *   }
 */
function findBestOddsAndArb(match) {
  let best = {
    home: { odds: 0, bookmaker: null },
    draw: { odds: 0, bookmaker: null },
    away: { odds: 0, bookmaker: null },
  };

  for (const bk of match.bookmakers) {
    if (bk.odds.home > best.home.odds) best.home = { odds: bk.odds.home, bookmaker: bk.title };
    if (bk.odds.draw > best.draw.odds) best.draw = { odds: bk.odds.draw, bookmaker: bk.title };
    if (bk.odds.away > best.away.odds) best.away = { odds: bk.odds.away, bookmaker: bk.title };
  }

  // If any leg is missing odds, we can't compute an arb
  if (!best.home.odds || !best.draw.odds || !best.away.odds) return null;

  const implied = impliedProbability(best.home.odds, best.draw.odds, best.away.odds);
  const arbPercentage = (1 / implied - 1) * 100;

  return {
    bestOdds: best,
    impliedProbability: implied,
    arbPercentage,
    isArbitrage: implied < 1,
  };
}

module.exports = {
  impliedProbability,
  isArbitrage,
  calculateStakes,
  findBestOddsAndArb,
};
