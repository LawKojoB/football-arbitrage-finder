// Realistic-looking mock data used when no ODDS_API_KEY is configured,
// or when USE_MOCK_DATA=true. Shape matches what the live odds service
// returns, so the rest of the app doesn't need to know the difference.
//
// A few matches contain real arbitrage opportunities (sum of inverse odds < 1)
// so users see green rows on first load. Others are normal "bookmaker-edge"
// markets so the dashboard looks honest.

function nowPlus(hoursFromNow) {
  return new Date(Date.now() + hoursFromNow * 3600 * 1000).toISOString();
}

// Tiny jitter so odds shift between refreshes (feels live).
function jitter(value, pct = 0.02) {
  const delta = value * pct * (Math.random() * 2 - 1);
  return Math.round((value + delta) * 100) / 100;
}

function buildMockMatches() {
  const matches = [
    {
      id: 'mock-epl-1',
      league: 'English Premier League',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      commenceTime: nowPlus(6),
      // ARB: 1/2.15 + 1/3.85 + 1/3.95 ≈ 0.978 — small but real
      bookmakers: [
        { key: 'bet365',    title: 'Bet365',    odds: { home: jitter(2.15), draw: jitter(3.60), away: jitter(3.40) } },
        { key: 'pinnacle',  title: 'Pinnacle',  odds: { home: jitter(2.05), draw: jitter(3.85), away: jitter(3.70) } },
        { key: 'williamh',  title: 'William Hill', odds: { home: jitter(2.00), draw: jitter(3.70), away: jitter(3.95) } },
        { key: 'unibet',    title: 'Unibet',    odds: { home: jitter(2.10), draw: jitter(3.75), away: jitter(3.80) } },
      ],
    },
    {
      id: 'mock-laliga-1',
      league: 'Spanish La Liga',
      homeTeam: 'Real Madrid',
      awayTeam: 'Atletico Madrid',
      commenceTime: nowPlus(8),
      // ARB: 1/1.95 + 1/3.90 + 1/4.60 ≈ 0.984
      bookmakers: [
        { key: 'bet365',    title: 'Bet365',    odds: { home: jitter(1.85), draw: jitter(3.70), away: jitter(4.40) } },
        { key: 'pinnacle',  title: 'Pinnacle',  odds: { home: jitter(1.95), draw: jitter(3.80), away: jitter(4.20) } },
        { key: 'williamh',  title: 'William Hill', odds: { home: jitter(1.90), draw: jitter(3.90), away: jitter(4.60) } },
      ],
    },
    {
      id: 'mock-epl-2',
      league: 'English Premier League',
      homeTeam: 'Manchester City',
      awayTeam: 'Liverpool',
      commenceTime: nowPlus(24),
      // No arb here — typical bookie edge market
      bookmakers: [
        { key: 'bet365',    title: 'Bet365',    odds: { home: jitter(2.30), draw: jitter(3.50), away: jitter(3.00) } },
        { key: 'pinnacle',  title: 'Pinnacle',  odds: { home: jitter(2.25), draw: jitter(3.45), away: jitter(3.10) } },
        { key: 'williamh',  title: 'William Hill', odds: { home: jitter(2.20), draw: jitter(3.55), away: jitter(3.05) } },
        { key: 'unibet',    title: 'Unibet',    odds: { home: jitter(2.28), draw: jitter(3.50), away: jitter(3.08) } },
      ],
    },
    {
      id: 'mock-bundes-1',
      league: 'German Bundesliga',
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      commenceTime: nowPlus(30),
      bookmakers: [
        { key: 'bet365',    title: 'Bet365',    odds: { home: jitter(1.75), draw: jitter(4.00), away: jitter(4.80) } },
        { key: 'pinnacle',  title: 'Pinnacle',  odds: { home: jitter(1.78), draw: jitter(3.95), away: jitter(4.70) } },
        { key: 'unibet',    title: 'Unibet',    odds: { home: jitter(1.72), draw: jitter(4.10), away: jitter(4.90) } },
      ],
    },
    {
      id: 'mock-seriea-1',
      league: 'Italian Serie A',
      homeTeam: 'Inter Milan',
      awayTeam: 'Juventus',
      commenceTime: nowPlus(48),
      // ARB: 1/2.40 + 1/3.40 + 1/3.50 ≈ 0.998 — razor-thin
      bookmakers: [
        { key: 'bet365',    title: 'Bet365',    odds: { home: jitter(2.30), draw: jitter(3.30), away: jitter(3.30) } },
        { key: 'pinnacle',  title: 'Pinnacle',  odds: { home: jitter(2.40), draw: jitter(3.25), away: jitter(3.20) } },
        { key: 'williamh',  title: 'William Hill', odds: { home: jitter(2.35), draw: jitter(3.40), away: jitter(3.50) } },
      ],
    },
    {
      id: 'mock-ligue-1',
      league: 'French Ligue 1',
      homeTeam: 'Paris Saint-Germain',
      awayTeam: 'Marseille',
      commenceTime: nowPlus(56),
      bookmakers: [
        { key: 'bet365',    title: 'Bet365',    odds: { home: jitter(1.50), draw: jitter(4.50), away: jitter(6.00) } },
        { key: 'pinnacle',  title: 'Pinnacle',  odds: { home: jitter(1.52), draw: jitter(4.40), away: jitter(5.80) } },
        { key: 'unibet',    title: 'Unibet',    odds: { home: jitter(1.48), draw: jitter(4.60), away: jitter(6.10) } },
      ],
    },
  ];

  return matches;
}

module.exports = { buildMockMatches };
