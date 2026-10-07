import React, { useEffect, useState } from "react";

const Marquee = () => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,dogecoin,cardano,polkadot,avalanche-2"
        );
        const data = await res.json();
        setCoins(data);
      } catch (error) {
        console.error("Marquee api:", error);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        background: "#ffffff",
        padding: "12px 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        borderBottom: "1px solid #eef2f6",
      }}
    >
      <div
        style={{
          display: "flex",
          animation: "scroll 30s linear infinite",
          width: "max-content",
        }}
      >
        {[...coins, ...coins, ...coins].map((coin, index) => {
          const change = coin.price_change_percentage_24h || 0;
          const isPositive = change >= 0;

          return (
            <div
              key={`${coin.id}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "48px",
                gap: "10px",
                fontSize: "14px",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
            >
              {/* Coin Logo */}
              <img
                src={coin.image}
                alt={coin.symbol}
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />

              {/* Coin Symbol */}
              <span
                style={{
                  fontWeight: "700",
                  color: "#171717",
                  fontSize: "14px",
                }}
              >
                {coin.symbol.toUpperCase()}
              </span>

              {/* Coin Price */}
              <span
                style={{
                  color: "#3d3d3d",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                ${coin.current_price?.toLocaleString()}
              </span>

              {/* Price Change Badge */}
              <span
                style={{
                  fontWeight: "600",
                  fontSize: "13px",
                  padding: "2px 12px",
                  borderRadius: "20px",
                  color: isPositive ? "#16c784" : "#ea3943",
                  background: isPositive
                    ? "rgba(22, 199, 132, 0.12)"
                    : "rgba(234, 57, 67, 0.12)",
                }}
              >
                {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
        `}
      </style>
    </div>
  );
};

export default Marquee; 