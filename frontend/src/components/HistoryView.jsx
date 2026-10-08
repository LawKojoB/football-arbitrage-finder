import React from 'react';
import { usePolling } from '../hooks/usePolling.js';
import { getHistory } from '../utils/api.js';

export default function HistoryView() {
  const { data, error, loading } = usePolling(() => getHistory(200), 15000);
  const rows = data?.history || [];

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-ink-500/60 px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-white">Arbitrage history</h2>
        <p className="text-sm text-slate-400">Every unique opportunity the watcher has detected, newest first.</p>
      </div>

      {loading && <div className="p-10 text-center text-sm text-slate-400">Loading…</div>}
      {error && <div className="p-6 text-sm text-accent-red">{error}</div>}

      {!loading && rows.length === 0 && (
        <div className="p-10 text-center text-sm text-slate-400">No history yet. Once arbitrages appear, they'll be logged here.</div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-ink-800/70 text-left font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Detected</th>
                <th className="px-4 py-3">Match</th>
                <th className="px-4 py-3">League</th>
                <th className="px-4 py-3 text-right">Home</th>
                <th className="px-4 py-3 text-right">Draw</th>
                <th className="px-4 py-3 text-right">Away</th>
                <th className="px-4 py-3 text-right">Arb %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-500/60">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-ink-500/20">
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{new Date(r.detected_at).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-white">{r.match_label}</td>
                  <td className="px-4 py-2.5 text-slate-300">{r.league}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="stat-num text-white">{r.home_odds.toFixed(2)}</div>
                    <div className="font-mono text-[11px] text-slate-500">{r.home_bookmaker}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="stat-num text-white">{r.draw_odds.toFixed(2)}</div>
                    <div className="font-mono text-[11px] text-slate-500">{r.draw_bookmaker}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="stat-num text-white">{r.away_odds.toFixed(2)}</div>
                    <div className="font-mono text-[11px] text-slate-500">{r.away_bookmaker}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="rounded-md bg-accent-green/15 px-2 py-0.5 font-mono font-semibold text-accent-green tabular-nums">
                      +{r.arb_percentage.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
