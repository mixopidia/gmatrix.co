import { useEffect, useRef, useState } from "react";
import { apiGet } from "../lib/api";

export default function TickerPrice({ symbol }) {
  const [price, setPrice] = useState(null);
  const prev = useRef(null);

  useEffect(() => {
    let timer;
    async function pull() {
      try {
        const data = await apiGet(`/api/market-data/ticker?symbol=${encodeURIComponent(symbol)}`);
        prev.current = price;
        setPrice(Number(data.price));
      } catch (e) {
        // ignore one-off errors
      }
    }
    pull();
    timer = setInterval(pull, 2000);
    return () => clearInterval(timer);
  }, [symbol]); // eslint-disable-line

  const delta = prev.current != null && price != null ? price - prev.current : 0;
  const cls = delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-muted";

  return (
    <div className="d-flex align-items-baseline gap-3">
      <h4 className="mb-0">{symbol}</h4>
      <h4 className={"mb-0 " + cls}>
        {price != null ? price : "--"}
      </h4>
    </div>
  );
}
