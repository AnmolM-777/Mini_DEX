import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { SUPPORTED_CHAIN_ID, SUPPORTED_CHAIN_NAME } from "../contracts";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    isSimulator,
    setIsSimulator,
    walletConnected,
    walletAddress,
    chainId,
    connectWallet,
    disconnectWallet
  } = useWeb3();

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="glass-card" style={{
      borderRadius: "0 0 24px 24px",
      padding: "16px 40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(8, 10, 16, 0.8)",
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "28px" }}>🪙</span>
        <h1 className="gradient-text" style={{ fontSize: "24px", margin: 0 }}>MiniDEX</h1>
      </div>

      <nav style={{ display: "flex", gap: "8px" }}>
        {["swap", "liquidity", "dashboard", "faucet"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? "rgba(138, 43, 226, 0.15)" : "transparent",
              color: activeTab === tab ? "#fff" : "var(--text-muted)",
              border: "1px solid",
              borderColor: activeTab === tab ? "rgba(138, 43, 226, 0.3)" : "transparent",
              borderRadius: "12px",
              padding: "8px 16px",
              fontSize: "15px",
              fontWeight: 600,
              textTransform: "capitalize",
              cursor: "pointer",
              transition: "var(--transition-smooth)"
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Simulator mode toggle */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--border-glass)",
          borderRadius: "14px",
          padding: "6px 12px"
        }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>
            Simulator Mode
          </span>
          <label style={{
            position: "relative",
            display: "inline-block",
            width: "36px",
            height: "20px"
          }}>
            <input
              type="checkbox"
              checked={isSimulator}
              onChange={(e) => setIsSimulator(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: "absolute",
              cursor: "pointer",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isSimulator ? "var(--accent)" : "#2a3042",
              transition: "0.3s",
              borderRadius: "20px",
              boxShadow: isSimulator ? "0 0 8px rgba(243, 85, 218, 0.4)" : "none"
            }}>
              <span style={{
                position: "absolute",
                content: '""',
                height: "14px",
                width: "14px",
                left: isSimulator ? "18px" : "3px",
                bottom: "3px",
                backgroundColor: "#fff",
                transition: "0.3s",
                borderRadius: "50%"
              }} />
            </span>
          </label>
        </div>

        {/* Network Status Badge */}
        {isSimulator ? (
          <span className="glowing-badge simulator">
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }} />
            Sandbox
          </span>
        ) : walletConnected && chainId === SUPPORTED_CHAIN_ID ? (
          <span className="glowing-badge success">
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)" }} />
            {SUPPORTED_CHAIN_NAME === "securechain" ? "SCAI Mainnet" : "Hardhat Node"}
          </span>
        ) : walletConnected ? (
          <span className="glowing-badge warning">
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--warning)" }} />
            Wrong Network
          </span>
        ) : null}

        {/* Connect Button */}
        {walletConnected && walletAddress ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-glass)",
              borderRadius: "14px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#fff"
            }}>
              {shortenAddress(walletAddress)}
            </span>
            <button
              onClick={disconnectWallet}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "var(--error)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "14px",
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "var(--transition-smooth)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={connectWallet} style={{ padding: "10px 20px", borderRadius: "14px", fontSize: "14px" }}>
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};
