import React, { useState } from 'react';

export default function ArbitrageTable({ arbs, bankroll, loading }) {
  if (loading) {
    return (
      <div className="card p-10 text-center">
        <Spinner />
        <p className="mt-3 text-sm text-slate-400">Loading opportunities…</p>
      </div>
    );
  }

  if (!arbs.length) {
    return (
      <div className="card flex flex-col items-center justify-center p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-500 text-slate-500">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M9 12h6" />
          </svg>
        </div>
        <h3 className="mt-3 font-display text-lg text-white">No arbitrages match your filters</h3>
        <p className="mt-1 max-w-md text-sm text-slate-400">
          Try lowering the minimum profit %, switching to all leagues, or wait for the next refresh.
          Odds move fast — surebets often appear and vanish within minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-ink-800/70 text-left font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">League</th>
              <th className="px-4 py-3 text-right">Home</th>
              <th className="px-4 py-3 text-right">Draw</th>
              <th className="px-4 py-3 text-right">Away</th>
              <th className="px-4 py-3 text-right">Arb %</th>
              <th className="px-4 py-3 text-right">Profit</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-500/60">
            {arbs.map((arb) => (
              <ArbRow key={arb.id} arb={arb} bankroll={bankroll} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArbRow({ arb, bankroll }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="arb-row-highlight cursor-pointer transition hover:bg-ink-500/30"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-4 py-3">
          <div className="font-medium text-white">{arb.homeTeam} <span className="text-slate-500">vs</span> {arb.awayTeam}</div>
          <div className="font-mono text-[11px] text-slate-500">{formatDate(arb.commenceTime)}</div>
        </td>
        <td className="px-4 py-3 text-slate-300">{arb.league}</td>
        <OddsCell value={arb.bestOdds.home.odds} bookmaker={arb.bestOdds.home.bookmaker} />
        <OddsCell value={arb.bestOdds.draw.odds} bookmaker={arb.bestOdds.draw.bookmaker} />
        <OddsCell value={arb.bestOdds.away.odds} bookmaker={arb.bestOdds.away.bookmaker} />
        <td className="px-4 py-3 text-right">
          <span className="rounded-md bg-accent-green/15 px-2 py-0.5 font-mono font-semibold text-accent-green tabular-nums">
            +{arb.arbPercentage.toFixed(2)}%
          </span>
        </td>
        <td className="stat-num px-4 py-3 text-right text-accent-green">${(arb.profit || 0).toFixed(2)}</td>
        <td className="px-4 py-3 text-right">
          <Chevron open={open} />
        </td>
      </tr>
      {open && (
        <tr className="bg-ink-800/60">
          <td colSpan={8} className="px-4 py-5">
            <StakeBreakdown arb={arb} bankroll={bankroll} />
          </td>
        </tr>
      )}
    </>
  );
}

function OddsCell({ value, bookmaker }) {
  return (
    <td className="px-4 py-3 text-right">
      <div className="stat-num text-white">{value.toFixed(2)}</div>
      <div className="font-mono text-[11px] text-slate-500">{bookmaker}</div>
    </td>
  );
}

function StakeBreakdown({ arb, bankroll }) {
  const sd = arb.stakeDistribution || {};
  const rows = [
    { label: 'Home', team: arb.homeTeam, stake: sd.home, odds: arb.bestOdds.home.odds, book: arb.bestOdds.home.bookmaker },
    { label: 'Draw', team: 'Draw',          stake: sd.draw, odds: arb.bestOdds.draw.odds, book: arb.bestOdds.draw.bookmaker },
    { label: 'Away', team: arb.awayTeam, stake: sd.away, odds: arb.bestOdds.away.odds, book: arb.bestOdds.away.bookmaker },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
      <div>
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
          Stake distribution for ${bankroll.toLocaleString()} bankroll
        </div>
        <div className="overflow-hidden rounded-lg border border-ink-500/60">
          <table className="w-full text-sm">
            <thead className="bg-ink-800/70 text-left font-mono text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Bet on</th>
                <th className="px-3 py-2">Bookmaker</th>
                <th className="px-3 py-2 text-right">Odds</th>
                <th className="px-3 py-2 text-right">Stake</th>
                <th className="px-3 py-2 text-right">If wins, return</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-500/60">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="px-3 py-2">
                    <div className="text-white">{r.team}</div>
                    <div className="font-mono text-[11px] text-slate-500">{r.label}</div>
                  </td>
                  <td className="px-3 py-2 text-slate-300">{r.book}</td>
                  <td className="stat-num px-3 py-2 text-right text-white">{r.odds.toFixed(2)}</td>
                  <td className="stat-num px-3 py-2 text-right text-white">${(r.stake || 0).toFixed(2)}</td>
                  <td className="stat-num px-3 py-2 text-right text-accent-green">${((r.stake || 0) * r.odds).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-2 rounded-lg border border-accent-green/30 bg-accent-green/5 p-4">
        <Metric label="Total stake"          value={`$${bankroll.toLocaleString()}`} />
        <Metric label="Guaranteed return"    value={`$${(arb.guaranteedReturn || 0).toFixed(2)}`} highlight />
        <Metric label="Guaranteed profit"    value={`$${(arb.profit || 0).toFixed(2)}`} highlight />
        <Metric label="Arbitrage %"          value={`${arb.arbPercentage.toFixed(2)}%`} />
      </div>
    </div>
  );
}

function Metric({ label, value, highlight }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <span className={`stat-num ${highlight ? 'text-accent-green' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`ml-auto h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-ink-500 border-t-accent-green" />
  );
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}
