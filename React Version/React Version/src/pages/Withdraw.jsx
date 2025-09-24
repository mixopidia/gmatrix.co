import React, { useState } from "react";
import { api, authHeader } from "../lib/api";

export default function Withdraw() {
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("1.23");
  const [address, setAddress] = useState("0x000000000000000000000000000000000000dEaD");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const res = await api.post(
        "/api/wallet/withdraw",
        { asset, amount: Number(amount), address },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
      const id = res?.data?.id || res?.data?._id || JSON.stringify(res?.data);
      setMsg(`✅ Withdraw submitted (id ${id || "n/a"})`);
    } catch (err) {
      const server = err?.response?.data?.message || err?.response?.data || err?.message;
      setMsg(`❌ ${server}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <h2>Withdraw</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <label>Asset
          <select value={asset} onChange={e=>setAsset(e.target.value)}>
            <option>USDT</option>
            <option>BTC</option>
            <option>ETH</option>
            <option>BNB</option>
          </select>
        </label>

        <label>Amount
          <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" step="any" />
        </label>

        <label>Destination Address
          <input value={address} onChange={e=>setAddress(e.target.value)} />
        </label>

        <button type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit"}</button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      <p style={{ marginTop: 8, color: "#666" }}>
        (Dev) Make sure you have a token in <code>localStorage.token</code>
        — use <code>/api/admin/bootstrap-admin</code> once and paste the JWT.
      </p>
    </div>
  );
}
