import React from 'react';

export default function Header({ liveCount, lastUpdated, view, setView }) {
  const tabs = [
    { id: 'dashboard',  label: 'Dashboard' },
    { id: 'calculator', label: 'Surebet Calculator' },
    { id: 'history',    label: 'History' },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-ink-500/60 bg-ink-900/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-green/15 text-accent-green ring-1 ring-accent-green/30">
            {/* Simple inline logo: stacked bars suggesting odds */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <rect x="3"  y="11" width="4" height="10" rx="1" />
              <rect x="10" y="6"  width="4" height="15" rx="1" />
              <rect x="17" y="2"  width="4" height="19" rx="1" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tracking-tight text-white">SureBet</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Football Arbitrage Finder</div>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-1 rounded-full border border-ink-500 bg-ink-700/60 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                view === t.id
                  ? 'bg-ink-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <div className="pill">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-green" />
            </span>
            <span className="text-slate-300">Live</span>
            {typeof liveCount === 'number' && (
              <span className="text-slate-500"> · {liveCount} arb{liveCount === 1 ? '' : 's'}</span>
            )}
          </div>
          {lastUpdated && (
            <span className="hidden font-mono text-[11px] text-slate-500 sm:inline">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
