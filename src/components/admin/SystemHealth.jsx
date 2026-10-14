'use client';

import { useState } from 'react';

export default function SystemHealth() {
  const [checks, setChecks] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function check() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/health', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error('Could not check settings. Sign in again or retry.');
      setChecks(data.checks);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return (
    <aside className="container" style={{ paddingBlock: '1rem' }}>
      <details>
        <summary>Store setup checks</summary>
        <p>Check database, storage and notification setup without changing your products or orders.</p>
        <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={check}>
          {busy ? 'Checking…' : 'Check store setup'}
        </button>
        {error && <p role="alert">{error}</p>}
        {checks && <ul aria-live="polite">{checks.map((item) => <li key={item.name}>{item.ok ? '✓' : 'Needs attention:'} {item.name}</li>)}</ul>}
        {checks?.some((item) => !item.ok) && <p>Send a screenshot of these results to your developer. Do not share passwords or API keys.</p>}
      </details>
    </aside>
  );
}
