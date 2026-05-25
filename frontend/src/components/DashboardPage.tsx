import React from "react";
import { useWeb3 } from "../context/Web3Context";

export const DashboardPage: React.FC = () => {
  const { reserveA, reserveB, txHistory } = useWeb3();

  const resA = parseFloat(reserveA);
  const resB = parseFloat(reserveB);

  // Price calculation
  const priceTKA = resA > 0 ? (resB / resA).toFixed(4) : "1.0000";
  const priceTKB = resB > 0 ? (resA / resB).toFixed(4) : "1.0000";

  // Total Value Locked (assuming TKA and TKB are roughly $1 each for display metrics)
  const tvl = resA + resB;

  // Render a beautiful neon SVG chart path
  // We'll create a curve based on historical pool reserves and the current live price ratio
  const chartPoints = [98, 102, 99, 105, 101, 107, parseFloat(priceTKA) * 100];
  const chartWidth = 500;
  const chartHeight = 120;
  const padding = 20;

  // Map points to SVG coordinates
  const minVal = Math.min(...chartPoints) * 0.98;
  const maxVal = Math.max(...chartPoints) * 1.02;
  const range = maxVal - minVal;

  const pointsString = chartPoints
    .map((val, index) => {
      const x = padding + (index * (chartWidth - 2 * padding)) / (chartPoints.length - 1);
      const y = chartHeight - padding - ((val - minVal) / range) * (chartHeight - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

  // Create an area string that closes the shape at the bottom for the gradient fill
  const areaPointsString = `${padding},${chartHeight - padding} ${pointsString} ${
    chartWidth - padding
  },${chartHeight - padding}`;

  const formatTimestamp = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "40px 40px" }}>
      
      {/* Overview Cards */}
      <div className="dashboard-grid">
        
        {/* Card 1: TVL */}
        <div className="glass-card stat-card" style={{ position: "relative", overflow: "hidden" }}>
          <span className="stat-label">Total Value Locked (TVL)</span>
          <span className="stat-val gradient-text">
            ${tvl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            50% TKA / 50% TKB pool reserves
          </span>
          {/* Subtle decoration gradient */}
          <div style={{
            position: "absolute",
            bottom: "-30px",
            right: "-30px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "var(--primary-glow)",
            filter: "blur(20px)",
            opacity: 0.5
          }} />
        </div>

        {/* Card 2: Price Ratio */}
        <div className="glass-card stat-card">
          <span className="stat-label">Exchange Rate</span>
          <span className="stat-val" style={{ color: "#fff" }}>
            1 TKA = {priceTKA} TKB
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Inverse: 1 TKB = {priceTKB} TKA
          </span>
        </div>

        {/* Card 3: Reserves */}
        <div className="glass-card stat-card">
          <span className="stat-label">Pool Reserves</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600 }}>
              <span>🟢 Token A:</span>
              <span>{resA.toLocaleString(undefined, { maximumFractionDigits: 2 })} TKA</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600 }}>
              <span>🔵 Token B:</span>
              <span>{resB.toLocaleString(undefined, { maximumFractionDigits: 2 })} TKB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700 }}>TKA / TKB Exchange Trend</h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>7-Day constant product relative index</span>
          </div>
          <span className="glowing-badge simulator">Live</span>
        </div>

        {/* SVG Neon Line Chart */}
        <div style={{ width: "100%", overflow: "hidden", background: "rgba(0,0,0,0.15)", borderRadius: "16px", padding: "10px" }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.00" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid Line */}
            <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.03)" strokeDasharray="4" />

            {/* Gradient Fill under the line */}
            <polygon points={areaPointsString} fill="url(#chartGradient)" />

            {/* Line Path */}
            <polyline
              fill="none"
              stroke="var(--secondary)"
              strokeWidth="3"
              points={pointsString}
              filter="url(#glow)"
            />

            {/* End Point Dot */}
            {pointsString && (() => {
              const coords = pointsString.split(" ");
              const lastCoords = coords[coords.length - 1].split(",");
              return (
                <circle
                  cx={lastCoords[0]}
                  cy={lastCoords[1]}
                  r="5"
                  fill="var(--secondary)"
                  stroke="#080a10"
                  strokeWidth="2"
                />
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Recent Transactions</h3>
        
        {txHistory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "15px" }}>
            No recent transactions found on this network.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-muted)", fontSize: "13px" }}>
                  <th style={{ padding: "12px 8px" }}>Type</th>
                  <th style={{ padding: "12px 8px" }}>Input</th>
                  <th style={{ padding: "12px 8px" }}>Output</th>
                  <th style={{ padding: "12px 8px" }}>Time</th>
                  <th style={{ padding: "12px 8px" }}>Transaction Hash</th>
                </tr>
              </thead>
              <tbody>
                {txHistory.map((tx) => (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.02)",
                      fontSize: "14px",
                      transition: "var(--transition-smooth)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.01)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <td style={{ padding: "16px 8px", fontWeight: 600 }}>
                      <span style={{
                        color:
                          tx.type === "Swap" ? "var(--secondary)" :
                          tx.type === "Mint" ? "var(--accent)" : "var(--success)"
                      }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ padding: "16px 8px", color: "var(--text-primary)" }}>{tx.amountIn}</td>
                    <td style={{ padding: "16px 8px", color: "var(--text-primary)" }}>{tx.amountOut}</td>
                    <td style={{ padding: "16px 8px", color: "var(--text-muted)" }}>{formatTimestamp(tx.timestamp)}</td>
                    <td style={{ padding: "16px 8px" }}>
                      <span
                        onClick={() => alert(`Simulated Transaction Explorer\nHash: ${tx.hash}\nStatus: Confirmed Successfully`)}
                        style={{
                          fontFamily: "monospace",
                          color: "var(--primary)",
                          cursor: "pointer",
                          textDecoration: "underline"
                        }}
                      >
                        {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
