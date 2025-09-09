import React, { useEffect, useMemo, useState } from 'react';
import { getMarkets, setCurrentPair } from '../lib/api';

const QUOTES = ['BTC', 'ETH', 'NEO', 'USDT', 'DAI'];

export default function MarketsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('BTC');
  const [q, setQ] = useState('');

  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const data = await getMarkets();
        const list = Array.isArray(data) ? data : data?.rows || [];
        if (!stop) setRows(list);
      } catch (_) {
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return rows.filter(r => {
      const sym = String(r.symbol || '');
      const [base, quote] = sym.includes('/') ? sym.split('/') : [sym, ''];
      const quoteMatch =
        !tab ||
        quote === tab ||
        sym.endsWith(`/${tab}`) ||
        sym.startsWith(`${tab}/`);
      const textMatch = !qLower || sym.toLowerCase().includes(qLower);
      return quoteMatch && textMatch;
    });
  }, [rows, tab, q]);

  return (
    <div className="market-pairs markets-list">
      {' '}
      {/* keep legacy class for styles */}
      <div className="d-flex gap-2 mb-2">
        {QUOTES.map(x => (
          <button
            key={x}
            className={`btn btn-sm ${tab === x ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setTab(x)}
          >
            {x}
          </button>
        ))}
        <input
          className="form-control form-control-sm ms-auto"
          placeholder="Search"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ maxWidth: 160 }}
        />
      </div>
      {loading && <div className="px-2 py-1">Loading…</div>}
      {!loading && filtered.length === 0 && (
        <div className="px-2 py-1">
          No pairs for tab <b>{tab}</b>.
        </div>
      )}
      <ul className="list-unstyled m-0">
        {filtered.map(r => (
          <li
            key={r.symbol}
            className="d-flex justify-content-between py-1 px-2"
            style={{ cursor: 'pointer' }}
            onClick={() => setCurrentPair(r.symbol)}
          >
            <span>{r.symbol}</span>
            <span>{r.lastPrice ?? '-'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
