import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

function Row({ p, q, side }) {
  return (
    <tr>
      <td className={side === "ask" ? "text-danger" : "text-success"}>{p}</td>
      <td>{q}</td>
    </tr>
  );
}

export default function OrderBook({ symbol }) {
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);

  useEffect(() => {
    let t;
    async function pull() {
      try {
        const data = await apiGet(`/api/market-data/depth?symbol=${encodeURIComponent(symbol)}&limit=50`);
        const b = (data.bids || []).map(([p,q]) => ({ p: Number(p), q: Number(q) })).sort((a,b) => b.p - a.p).slice(0,15);
        const a = (data.asks || []).map(([p,q]) => ({ p: Number(p), q: Number(q) })).sort((a,b) => a.p - b.p).slice(0,15);
        setBids(b);
        setAsks(a);
      } catch (e) { /* ignore */ }
    }
    pull();
    t = setInterval(pull, 3000);
    return () => clearInterval(t);
  }, [symbol]);

  return (
    <div className="row g-2">
      <div className="col-12 col-md-6">
        <h6>Bids</h6>
        <table className="table table-sm mb-0">
          <thead><tr><th>Price</th><th>Qty</th></tr></thead>
          <tbody>{bids.map((r,i) => <Row key={i} p={r.p} q={r.q} side="bid" />)}</tbody>
        </table>
      </div>
      <div className="col-12 col-md-6">
        <h6>Asks</h6>
        <table className="table table-sm mb-0">
          <thead><tr><th>Price</th><th>Qty</th></tr></thead>
          <tbody>{asks.map((r,i) => <Row key={i} p={r.p} q={r.q} side="ask" />)}</tbody>
        </table>
      </div>
    </div>
  );
}
