import React from "react";
import TVAdvancedChart from "./TVAdvancedChart";
import { useCurrentPair } from "../hooks/useCurrentPair";

export default function TradingChartDark() {
  const [pair] = useCurrentPair();
  return (
    <div className="main-chart mb15">
      <TVAdvancedChart theme="dark" pair={pair} height={550} />
    </div>
  );
}
