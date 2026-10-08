import React, { useState } from 'react';
import { calculate } from '../utils/api.js';

export default function SurebetCalculator() {
  const [homeOdds, setHomeOdds] = useState(2.10);
  const [drawOdds, setDrawOdds] = useState(3.80);
  const [awayOdds, setAwayOdds] = useState(3.95);
  const [bankroll, setBankroll] = useState(1000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function compute(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await calculate(homeOdds, drawOdds, awayOdds, bankroll);
      setResult(r);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="card p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-white">Surebet calculator</h2>
        <p className="mt-1 text-sm text-slate-400">
          Enter the best decimal odds you can find for each outcome, plus the amount you want to risk.
          We'll tell you whether a guaranteed-profit split exists and how to size each bet.
        </p>

        <form onSubmit={compute} className="mt-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="Home odds" value={homeOdds} onChange={setHomeOdds} step="0.01" />
            <NumberField label="Draw odds" value={drawOdds} onChange={setDrawOdds} step="0.01" />
            <NumberField label="Away odds" value={awayOdds} onChange={setAwayOdds} step="0.01" />
          </div>
          <NumberField label="Bankroll ($)" value={bankroll} onChange={setBankroll} step="10" />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent-green px-4 py-2.5 font-medium text-ink-900 transition hover:bg-accent-green/90 disabled:opacity-50"
          >
            {loading ? 'Calculating…' : 'Calculate'}
          </button>
          {error && <div className="rounded-md border border-accent-red/40 bg-accent-red/10 px-3 py-2 text-sm text-accent-red">{error}</div>}
        </form>
      </div>

      <div className="card p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-white">Result</h3>
        {!result && <p className="mt-2 text-sm text-slate-400">Enter odds and a bankroll, then hit Calculate.</p>}

        {result && (
          <div className="mt-4 space-y-4">
            <div className={`rounded-lg border p-4 ${
              result.isArbitrage
                ? 'border-accent-green/40 bg-accent-green/5'
                : 'border-accent-amber/40 bg-accent-amber/5'
            }`}>
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">Verdict</div>
              <div className={`mt-1 font-display text-lg font-semibold ${
                result.isArbitrage ? 'text-accent-green' : 'text-accent-amber'
              }`}>
                {result.isArbitrage
                  ? `Surebet found — ${result.arbPercentage.toFixed(2)}% guaranteed profit`
                  : `No arbitrage — implied probability is ${(result.implied * 100).toFixed(2)}%`}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Implied probability sum = {result.implied.toFixed(4)} {result.isArbitrage ? '(< 1.0 ✓)' : '(must be < 1.0 for an arb)'}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-ink-500/60">
              <table className="w-full text-sm">
                <thead className="bg-ink-800/70 text-left font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Bet on</th>
                    <th className="px-3 py-2 text-right">Stake</th>
                    <th className="px-3 py-2 text-right">Return if wins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-500/60">
                  <Row label="Home" stake={result.stakes.home} odds={homeOdds} />
                  <Row label="Draw" stake={result.stakes.draw} odds={drawOdds} />
                  <Row label="Away" stake={result.stakes.away} odds={awayOdds} />
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric label="Total stake" value={`$${Number(bankroll).toFixed(2)}`} />
              <Metric label="Guaranteed return" value={`$${result.guaranteedReturn.toFixed(2)}`} accent={result.isArbitrage} />
              <Metric label="Profit" value={`$${result.profit.toFixed(2)}`} accent={result.isArbitrage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, step }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="rounded-md border border-ink-500 bg-ink-800 px-3 py-2 font-mono text-sm text-white outline-none focus:border-accent-green/60 focus:ring-1 focus:ring-accent-green/40"
      />
    </label>
  );
}

function Row({ label, stake, odds }) {
  return (
    <tr>
      <td className="px-3 py-2 text-white">{label}</td>
      <td className="stat-num px-3 py-2 text-right text-white">${stake.toFixed(2)}</td>
      <td className="stat-num px-3 py-2 text-right text-accent-green">${(stake * odds).toFixed(2)}</td>
    </tr>
  );
}

function Metric({ label, value, accent }) {
  return (
    <div className="rounded-md border border-ink-500/60 bg-ink-800/60 p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className={`mt-1 stat-num text-lg ${accent ? 'text-accent-green' : 'text-white'}`}>{value}</div>
    </div>
  );
}
