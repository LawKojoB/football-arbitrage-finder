import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic polling hook.
 *   const { data, error, loading, refresh } = usePolling(fetcher, 30000);
 *
 * - Runs `fetcher` immediately on mount.
 * - Re-runs it every `intervalMs`.
 * - `refresh()` triggers an out-of-band fetch.
 * - Survives StrictMode double-invocation in dev (single setInterval).
 * - `loading` is only true on the *first* load; subsequent polls are silent
 *   so the UI doesn't flicker every 30s.
 */
export function usePolling(fetcher, intervalMs, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    setLoading(true);
    run();
    const id = setInterval(run, intervalMs);
    return () => clearInterval(id);
  }, [run, intervalMs]);

  return { data, error, loading, refresh: run };
}
