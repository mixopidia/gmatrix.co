import React, { useState, useEffect } from "react";
import { createOrder, getOpenOrders } from "../lib/api";

export default function DevOrdersTest() {
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [side, setSide] = useState("buy");
  const [type, setType] = useState("limit"); // limit | market | stop
  const [quantity, setQuantity] = useState("0.001");
  const [price, setPrice] = useState("100");
  const [stopPrice, setStopPrice] = useState("");
  const [msg, setMsg] = useState("");
  const [rows, setRows] = useState([]);

  const loadOpen = async () => setRows(await getOpenOrders());

  const submit = async (e) => {
    e.preventDefault();
    setMsg("Submitting...");
    try {
      const res = await createOrder({ symbol, side, type, quantity, price, stopPrice });
      setMsg(`OK: ${JSON.stringify(res?.order || res)}`);
      await loadOpen();
    } catch (err) {
      setMsg(`Error: ${err?.response?.data?.error || err.message}`);
    }
  };

  useEffect(() => { loadOpen(); }, []);

  return (
    <div style={{maxWidth: 520, margin: "24px auto", padding: 16, border: "1px solid #eee", borderRadius: 8}}>
      <h3>Dev Orders Test</h3>
      <form onSubmit={submit} style={{display:"grid", gap:8}}>
        <label>Symbol <input value={symbol} onChange={e=>setSymbol(e.target.value)} /></label>
        <label>Side
          <select value={side} onChange={e=>setSide(e.target.value)}>
            <option value="buy">buy</option>
            <option value="sell">sell</option>
          </select>
        </label>
        <label>Type
          <select value={type} onChange={e=>setType(e.target.value)}>
            <option value="limit">limit</option>
            <option value="market">market</option>
            <option value="stop">stop</option>
          </select>
        </label>
        <label>Quantity <input value={quantity} onChange={e=>setQuantity(e.target.value)} /></label>
        <label>Price (optional for market) <input value={price} onChange={e=>setPrice(e.target.value)} /></label>
        <label>Stop Price (for stop) <input value={stopPrice} onChange={e=>setStopPrice(e.target.value)} /></label>
        <button type="submit">Submit Order</button>
      </form>

      <div style={{marginTop:12, whiteSpace:"pre-wrap"}}>{msg}</div>

      <h4 style={{marginTop:16}}>Open Orders</h4>
      <ul>
        {rows.map((r,i)=>(
          <li key={r._id || i}>{r.symbol} {r.side} {r.type} qty={r.quantity} price={r.price}</li>
        ))}
      </ul>
    </div>
  );
}
