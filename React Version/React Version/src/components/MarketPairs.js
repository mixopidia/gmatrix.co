import React, { useEffect, useState } from "react";
import { getMarkets, setCurrentPair } from "../lib/api";
import { useCurrentPair } from "../hooks/useCurrentPair";

export default function MarketPairs() {
  const [pair] = useCurrentPair();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await getMarkets();
        if (!alive) return;
        if (!list.length) console.warn("getMarkets returned 0 rows");
        setRows(list);
      } catch (e) {
        console.error("MarketPairs load error:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ padding: "6px 10px" }}>Loading pairs…</div>;

  return (
    <ul className="list-unstyled" style={{ margin: 0 }}>
      {rows.map((r) => {
        const isActive = r.symbol === pair;
        return (
          <li
            key={r.symbol}
            onClick={() => setCurrentPair(r.symbol)}
            style={{
              cursor: "pointer",
              padding: "6px 10px",
              background: isActive ? "rgba(0,0,0,0.04)" : undefined,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span>{r.symbol}</span>
              <span>{r.lastPrice ?? "-"}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
