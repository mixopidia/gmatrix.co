import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function SymbolPicker({ value, onChange }) {
  const [markets, setMarkets] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    apiGet("/api/markets").then(setMarkets).catch(console.error);
  }, []);

  const filtered = markets.filter(m =>
    m.symbol.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <div className="mb-2">
        <input
          className="form-control"
          placeholder="Search pair..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
      <ul className="list-group" style={{ maxHeight: 420, overflowY: "auto" }}>
        {filtered.map(m => {
          const active = m.symbol === value;
          return (
            <li
              key={m.symbol}
              className={"list-group-item d-flex justify-content-between align-items-center " + (active ? "active" : "")}
              role="button"
              onClick={() => onChange(m.symbol)}
            >
              <span>{m.symbol}</span>
              <small className="text-muted">
                p{m.pricePrecision} / q{m.quantityPrecision}
              </small>
            </li>
          );
        })}
        {!filtered.length && <li className="list-group-item">No results</li>}
      </ul>
    </div>
  );
}
