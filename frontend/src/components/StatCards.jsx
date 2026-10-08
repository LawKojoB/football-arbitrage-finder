import React from 'react';

export default function StatCards({ arbs, matches, bankroll }) {
  const totalProfit = arbs.reduce((s, a) => s + (a.profit || 0), 0);
  const bestArb = arbs[0]; // already sorted by arbPercentage desc
  const avgPct = arbs.length ? arbs.reduce((s, a) => s + a.arbPercentage, 0) / arbs.length : 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat
        label="Live arbitrages"
        value={arbs.length}
        accent={arbs.length > 0 ? 'green' : 'neutral'}
      />
      <Stat
        label="Matches tracked"
        value={matches.length}
      />
      <Stat
        label={`Total profit @ $${formatNum(bankroll)} each`}
        value={`$${formatNum(totalProfit, 2)}`}
        accent={totalProfit > 0 ? 'green' : 'neutral'}
      />
      <Stat
        label="Best opportunity"
        value={bestArb ? `${bestArb.arbPercentage.toFixed(2)}%` : '—'}
        sub={bestArb ? `${bestArb.homeTeam} vs ${bestArb.awayTeam}` : 'Waiting for a market gap'}
        accent={bestArb ? 'green' : 'neutral'}
      />
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  const accentBar = accent === 'green' ? 'bg-accent-green' : 'bg-ink-500';
  return (
    <div className="card relative overflow-hidden p-4 sm:p-5">
      <div className={`absolute left-0 top-0 h-full w-1 ${accentBar}`} />
      <div className="ml-2">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
        <div className="mt-1.5 font-display text-2xl font-semibold text-white tabular-nums sm:text-3xl">{value}</div>
        {sub && <div className="mt-0.5 truncate text-xs text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}

function formatNum(n, decimals = 0) {
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
