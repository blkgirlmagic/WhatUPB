"use client";
import { useEffect, useRef } from "react";

export default function TvTicker() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BITSTAMP:BTCUSD",  title: "BTC"      },
        { proName: "BITSTAMP:ETHUSD",  title: "ETH"      },
        { proName: "COINBASE:SOLUSD",  title: "SOL"      },
        { proName: "COINBASE:ZECUSD",  title: "ZEC"      },
        { proName: "FOREXCOM:SPXUSD",  title: "S&P 500"  },
        { proName: "NASDAQ:QQQ",       title: "NASDAQ"   },
        { proName: "TVC:DXY",          title: "DXY"      },
        { proName: "TVC:GOLD",         title: "Gold"     },
        { proName: "TVC:US10Y",        title: "10Y Yield"},
      ],
      showSymbolLogo: false,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "en",
    });

    ref.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={ref}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}
