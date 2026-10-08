// Bridges the raw match data and the arbitrage math.
// Given a list of matches (each with several bookmakers), this returns:
//   - all matches enriched with their best-odds-across-bookmakers
//   - the subset that are actual arbitrage opportunities
//   - per-arb stake distributions if a bankroll is provided

const { findBestOddsAndArb, calculateStakes } = require('../../../shared/arbitrage');

function enrichMatch(match, bankroll) {
  const arbInfo = findBestOddsAndArb(match);
  if (!arbInfo) return null;

  const enriched = {
    ...match,
    bestOdds: arbInfo.bestOdds,
    impliedProbability: round4(arbInfo.impliedProbability),
    arbPercentage: round2(arbInfo.arbPercentage),
    isArbitrage: arbInfo.isArbitrage,
  };

  if (arbInfo.isArbitrage && bankroll > 0) {
    const calc = calculateStakes(
      arbInfo.bestOdds.home.odds,
      arbInfo.bestOdds.draw.odds,
      arbInfo.bestOdds.away.odds,
      bankroll,
    );
    enriched.stakeDistribution = calc.stakes;
    enriched.guaranteedReturn = calc.guaranteedReturn;
    enriched.profit = calc.profit;
  }

  return enriched;
}

function enrichAll(matches, bankroll = 0) {
  return matches.map((m) => enrichMatch(m, bankroll)).filter(Boolean);
}

function onlyArbs(enriched) {
  return enriched.filter((m) => m.isArbitrage);
}

function round2(n) { return Math.round(n * 100) / 100; }
function round4(n) { return Math.round(n * 10000) / 10000; }

module.exports = { enrichMatch, enrichAll, onlyArbs };
