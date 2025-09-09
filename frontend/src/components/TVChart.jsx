import { AdvancedChart } from "react-tradingview-embed";

export default function TVChart({ symbol }) {
  const tvSymbol = (symbol || "").replace("/", "");
  return (
    <div style={{ height: 440 }}>
      <AdvancedChart
        widgetProps={{
          symbol: tvSymbol || "BNBUSDT",
          interval: "15",
          theme: "light",
          autosize: true,
          hide_side_toolbar: false,
        }}
      />
    </div>
  );
}
