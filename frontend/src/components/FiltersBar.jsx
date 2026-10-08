import React from 'react';

export default function FiltersBar({
  bankroll, setBankroll,
  minProfit, setMinProfit,
  league, setLeague,
  bookmaker, setBookmaker,
  leagues, bookmakers,
  soundOn, setSoundOn,
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <Field label="Bankroll ($)">
          <input
            type="number"
            min="1"
            step="50"
            value={bankroll}
            onChange={(e) => setBankroll(Number(e.target.value) || 0)}
            className="w-full rounded-md border border-ink-500 bg-ink-800 px-3 py-2 font-mono text-sm tabular-nums text-white outline-none focus:border-accent-green/60 focus:ring-1 focus:ring-accent-green/40"
          />
        </Field>

        <Field label="Min profit (%)">
          <input
            type="number"
            min="0"
            step="0.1"
            value={minProfit}
            onChange={(e) => setMinProfit(Number(e.target.value) || 0)}
            className="w-full rounded-md border border-ink-500 bg-ink-800 px-3 py-2 font-mono text-sm tabular-nums text-white outline-none focus:border-accent-green/60 focus:ring-1 focus:ring-accent-green/40"
          />
        </Field>

        <Field label="League">
          <select
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            className="w-full rounded-md border border-ink-500 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-accent-green/60 focus:ring-1 focus:ring-accent-green/40"
          >
            <option value="">All leagues</option>
            {leagues.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </Field>

        <Field label="Bookmaker">
          <select
            value={bookmaker}
            onChange={(e) => setBookmaker(e.target.value)}
            className="w-full rounded-md border border-ink-500 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-accent-green/60 focus:ring-1 focus:ring-accent-green/40"
          >
            <option value="">All bookmakers</option>
            {bookmakers.map((b) => (
              <option key={b.key} value={b.title}>{b.title}</option>
            ))}
          </select>
        </Field>

        <Field label="Notifications">
          <button
            onClick={() => setSoundOn((s) => !s)}
            className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition ${
              soundOn
                ? 'border-accent-green/60 bg-accent-green/10 text-accent-green'
                : 'border-ink-500 bg-ink-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Sound</span>
            <span className="font-mono text-[11px] uppercase tracking-wider">{soundOn ? 'On' : 'Off'}</span>
          </button>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}
