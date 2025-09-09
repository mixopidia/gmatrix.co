import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function RecentTrades({ symbol }) {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    let t;
    async function pull() {
      try {
        const data = await apiGet(`/api/market-data/trades?symbol=${encodeURIComponent(symbol)}&limit=50`);
        setTrades(data || []);
      } catch (e) { /* ignore */ }
    }
    pull();
    t = setInterval(pull, 3000);
    return () => clearInterval(t);
  }, [symbol]);

  return (
    <div style={{ maxHeight: 260, overflowY: "auto" }}>
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Time</th><th>Price</th><th>Qty</th><th>Side</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id || t.time}>
              <td>{t.time ? new Date(t.time).toLocaleTimeString() : "-"}</td>
              <td>{t.price}</td>
              <td>{t.qty}</td>
              <td className={t.isBuyerMaker ? "text-danger" : "text-success"}>
                {t.isBuyerMaker ? "SELL" : "BUY"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
