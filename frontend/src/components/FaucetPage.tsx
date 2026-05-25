import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";

export const FaucetPage: React.FC = () => {
  const {
    tokenABalance,
    tokenBBalance,
    mintTokens,
    loading,
    walletConnected,
    connectWallet
  } = useWeb3();

  const [mintStatus, setMintStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleMint = async (tokenType: "A" | "B") => {
    setMintStatus(null);
    const success = await mintTokens(tokenType, "100.0");
    if (success) {
      setMintStatus({
        type: "success",
        msg: `Successfully minted 100.0 TK${tokenType}! Check your balance above.`
      });
    } else {
      setMintStatus({
        type: "error",
        msg: `Failed to mint TK${tokenType}. Make sure your local node is running.`
      });
    }
  };

  return (
    <div className="fade-in" style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "500px", textAlign: "center" }}>
        
        <span style={{ fontSize: "56px", display: "block", marginBottom: "16px" }}>🚰</span>
        <h2 className="gradient-text" style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Test Token Faucet</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.5" }}>
          Need test coins to experiment with swapping and liquidity mining? 
          Claim 100.0 units of Token A and Token B for free instantly.
        </p>

        {/* Current Balances Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px"
        }}>
          <div style={{
            background: "rgba(0,0,0,0.2)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            padding: "16px"
          }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Token A Balance</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--success)" }}>
              🟢 {parseFloat(tokenABalance).toFixed(1)} TKA
            </div>
          </div>
          
          <div style={{
            background: "rgba(0,0,0,0.2)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            padding: "16px"
          }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Token B Balance</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--secondary)" }}>
              🔵 {parseFloat(tokenBBalance).toFixed(1)} TKB
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!walletConnected ? (
          <button className="btn-primary" onClick={connectWallet} style={{ width: "100%", padding: "16px" }}>
            Connect Wallet to Claim
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => handleMint("A")}
                disabled={loading}
                className="btn-primary"
                style={{ flex: 1, background: "var(--gradient-primary)" }}
              >
                {loading ? "Minting..." : "Mint 100 TKA 🟢"}
              </button>
              
              <button
                onClick={() => handleMint("B")}
                disabled={loading}
                className="btn-primary"
                style={{ flex: 1, background: "var(--gradient-secondary)" }}
              >
                {loading ? "Minting..." : "Mint 100 TKB 🔵"}
              </button>
            </div>
            
            {mintStatus && (
              <div className="fade-in" style={{
                background: mintStatus.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                border: mintStatus.type === "success" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
                color: mintStatus.type === "success" ? "var(--success)" : "var(--error)",
                padding: "12px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 500,
                marginTop: "8px"
              }}>
                {mintStatus.type === "success" ? "✅" : "⚠️"} {mintStatus.msg}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
