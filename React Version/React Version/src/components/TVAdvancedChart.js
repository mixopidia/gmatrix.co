import React, { useEffect, useRef } from "react";

export default function TVAdvancedChart({
  pair = "BTC/USDT",
  theme = "light",
  height = 550,
  width = "100%",
}) {
  const idRef = useRef(`tv_${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const init = () => {
      if (!window.TradingView) return;
      new window.TradingView.widget({
        container_id: idRef.current,
        autosize: true,
        symbol: `BINANCE:${(pair || "BTC/USDT").replace("/", "")}`,
        interval: "60",
        theme,
        style: "1",
        locale: "en",
        toolbar_bg: "#000000",
        allow_symbol_change: true,
        withdateranges: true,
        hide_top_toolbar: false,
        hide_side_toolbar: false,
        details: true,
        calendar: true,
      });
    };

    const SCRIPT_ID = "tradingview-widget-script";
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = "https://s3.tradingview.com/tv.js";
      s.onload = init;
      document.head.appendChild(s);
    } else {
      init();
    }
  }, [pair, theme]);

  return <div id={idRef.current} style={{ height, width }} />;
}
