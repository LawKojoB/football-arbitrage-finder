import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import FiltersBar from './components/FiltersBar.jsx';
import StatCards from './components/StatCards.jsx';
import ArbitrageTable from './components/ArbitrageTable.jsx';
import SurebetCalculator from './components/SurebetCalculator.jsx';
import HistoryView from './components/HistoryView.jsx';

import { usePolling } from './hooks/usePolling.js';
import { getArbitrages, getMatches, getBookmakers, getLeagues } from './utils/api.js';
import { playArbAlert } from './utils/sound.js';

// 30 seconds per the spec
const REFRESH_MS = 30_000;

export default function App() {
  const [view, setView] = useState('dashboard');

  // Filter state
  const [bankroll, setBankroll]   = useState(1000);
  const [minProfit, setMinProfit] = useState(0);
  const [league, setLeague]       = useState('');
  const [bookmaker, setBookmaker] = useState('');
  const [soundOn, setSoundOn]     = useState(false);

  // Data
  const arbsQuery     = usePolling(() => getArbitrages(bankroll, minProfit), REFRESH_MS, [bankroll, minProfit]);
  const matchesQuery  = usePolling(() => getMatches(bankroll),                REFRESH_MS, [bankroll]);
  const leaguesQuery  = usePolling(() => getLeagues(),                        60_000);
  const booksQuery    = usePolling(() => getBookmakers(),                     60_000);

  const arbs    = arbsQuery.data?.arbitrages || [];
  const matches = matchesQuery.data?.matches || [];

  // Client-side filtering on top of the server-side minProfit filter.
  // Server already applies bankroll/minProfit; here we additionally filter
  // by league and bookmaker because those don't affect arbitrage math —
  // they're just a way to narrow what's shown.
  const filteredArbs = useMemo(() => {
    return arbs.filter((a) => {
      if (league && a.league !== league) return false;
      if (bookmaker) {
        const usedBooks = [a.bestOdds.home.bookmaker, a.bestOdds.draw.bookmaker, a.bestOdds.away.bookmaker];
        if (!usedBooks.includes(bookmaker)) return false;
      }
      return true;
    });
  }, [arbs, league, bookmaker]);

  // Sound notification when a new arb appears (we compare match IDs across
  // refreshes; if a new ID shows up we ping).
  const previousIds = useRef(new Set());
  useEffect(() => {
    const currentIds = new Set(filteredArbs.map((a) => a.id));
    const isNewArb = [...currentIds].some((id) => !previousIds.current.has(id));
    // Don't beep on first load — only when something genuinely new appears later
    if (soundOn && previousIds.current.size > 0 && isNewArb) {
      playArbAlert();
    }
    previousIds.current = currentIds;
  }, [filteredArbs, soundOn]);

  const lastUpdated = arbsQuery.data ? new Date() : null;

  return (
    <div className="min-h-screen">
      <Header
        liveCount={filteredArbs.length}
        lastUpdated={lastUpdated}
        view={view}
        setView={setView}
      />

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
        {view === 'dashboard' && (
          <>
            <Hero arbsCount={filteredArbs.length} />

            <FiltersBar
              bankroll={bankroll}     setBankroll={setBankroll}
              minProfit={minProfit}   setMinProfit={setMinProfit}
              league={league}         setLeague={setLeague}
              bookmaker={bookmaker}   setBookmaker={setBookmaker}
              leagues={leaguesQuery.data?.leagues || []}
              bookmakers={booksQuery.data?.bookmakers || []}
              soundOn={soundOn}       setSoundOn={setSoundOn}
            />

            <StatCards arbs={filteredArbs} matches={matches} bankroll={bankroll} />

            {arbsQuery.error && (
              <div className="card border-accent-red/40 bg-accent-red/10 p-4 text-sm text-accent-red">
                {arbsQuery.error}
              </div>
            )}

            <ArbitrageTable
              arbs={filteredArbs}
              bankroll={bankroll}
              loading={arbsQuery.loading}
            />

            <Footer />
          </>
        )}

        {view === 'calculator' && <SurebetCalculator />}
        {view === 'history' && <HistoryView />}
      </main>
    </div>
  );
}

function Hero({ arbsCount }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-ink-500/60 bg-gradient-to-br from-ink-700/80 via-ink-700/40 to-ink-800/80 p-6 sm:p-8">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-green/10 blur-3xl" />
      <div className="relative max-w-2xl">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-green">Three-way football arbitrage</div>
        <h1 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
          Spot the gaps between bookmakers.
          <span className="text-slate-400"> Lock in guaranteed profit.</span>
        </h1>
        <p className="mt-3 text-sm text-slate-400 sm:text-base">
          We compare home / draw / away odds across every connected bookmaker and surface markets where the sum of inverse odds drops below 1.00.
          {arbsCount > 0 ? (
            <> Right now there {arbsCount === 1 ? 'is' : 'are'} <span className="font-semibold text-accent-green">{arbsCount} live opportunit{arbsCount === 1 ? 'y' : 'ies'}</span>.</>
          ) : (
            <> No surebets right now — markets often re-open within minutes.</>
          )}
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <div className="mt-8 border-t border-ink-500/60 pt-5 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-slate-600">
      Odds refresh every 30s · Arbitrage = (1/H + 1/D + 1/A) &lt; 1 · For educational use
    </div>
  );
}
