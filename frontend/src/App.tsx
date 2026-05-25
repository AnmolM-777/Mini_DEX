import React, { useState } from "react";
import { Web3Provider } from "./context/Web3Context";
import { Navbar } from "./components/Navbar";
import { SwapPage } from "./components/SwapPage";
import { LiquidityPage } from "./components/LiquidityPage";
import { DashboardPage } from "./components/DashboardPage";
import { FaucetPage } from "./components/FaucetPage";

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("swap");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "swap":
        return <SwapPage />;
      case "liquidity":
        return <LiquidityPage />;
      case "dashboard":
        return <DashboardPage />;
      case "faucet":
        return <FaucetPage />;
      default:
        return <SwapPage />;
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* Decorative Blur Background Bubbles */}
      <div className="bg-bubble" style={{ top: "15%", left: "5%", width: "350px", height: "350px", background: "rgba(138, 43, 226, 0.12)" }} />
      <div className="bg-bubble" style={{ bottom: "15%", right: "5%", width: "450px", height: "450px", background: "rgba(0, 242, 254, 0.1)" }} />
      <div className="bg-bubble" style={{ top: "50%", left: "40%", width: "300px", height: "300px", background: "rgba(243, 85, 218, 0.04)" }} />

      {/* Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Active Tab Panel */}
      <main style={{ flex: 1, paddingBottom: "60px" }}>
        {renderActiveTab()}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        padding: "24px",
        fontSize: "14px",
        color: "var(--text-dark)",
        borderTop: "1px solid var(--border-glass)",
        background: "rgba(8, 10, 16, 0.5)",
        backdropFilter: "blur(8px)"
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "8px" }}>
          <a
            href="https://github.com/AnmolM-777/Mini_DEX"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--text-muted)", textDecoration: "none", transition: "var(--transition-smooth)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
          >
            GitHub Repository
          </a>
          <span>•</span>
          <span>Uniswap V2 AMM Model</span>
        </div>
        <div>© 2026 MiniDEX. Built with React, TypeScript, and Solidity.</div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Web3Provider>
      <MainApp />
    </Web3Provider>
  );
};

export default App;
