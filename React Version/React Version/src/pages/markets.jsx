import React from "react";
import * as MQ from "../components/MarketsQulabs";

// Prefer default export; fall back to common named exports
const MarketsQ =
  MQ.default ??
  MQ.MarketsQulabs ??
  MQ.MarketsList ??
  MQ.MarketQulabs ??
  (() => <div style={{padding:16}}>Markets component not found in <code>components/MarketsQulabs.js</code></div>);

export default function MarketsPage() {
  return (
    <div style={{ padding: 16 }}>
      <MarketsQ />
    </div>
  );
}
