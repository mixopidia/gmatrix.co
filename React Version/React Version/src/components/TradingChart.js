import React from "react";
import TVAdvancedChart from "./TVAdvancedChart";
import { useCurrentPair } from "../hooks/useCurrentPair";

export default function TradingChart() {
  const [pair] = useCurrentPair(); // e.g., "BTC/USDT"
  return (
    <div className="main-chart mb15">
      <TVAdvancedChart theme="light" pair={pair} height={550} />
    </div>
  );
}
