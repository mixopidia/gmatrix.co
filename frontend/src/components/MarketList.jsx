import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function MarketList() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    apiGet("/api/markets")
      .then(setMarkets)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-3">Loading markets...</div>;
  if (err) return <div className="p-3 text-danger">Error: {err}</div>;
  if (!markets.length) return <div className="p-3">No markets</div>;

  return (
    <div className="p-3">
      <h3>Markets</h3>
      <ul>
        {markets.map(m => (
          <li key={m.symbol}>
            {m.symbol} (pricePrecision {m.pricePrecision}, qtyPrecision {m.quantityPrecision})
          </li>
        ))}
      </ul>
    </div>
  );
}
