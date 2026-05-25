import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";

export const LiquidityPage: React.FC = () => {
  const {
    tokenABalance,
    tokenBBalance,
    lpBalance,
    reserveA,
    reserveB,
    addLiquidity,
    removeLiquidity,
    loading,
    walletConnected,
    connectWallet
  } = useWeb3();

  const [activeSubTab, setActiveSubTab] = useState<"add" | "remove">("add");
  
  // Add Liquidity states
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  
  // Remove Liquidity states
  const [removePercent, setRemovePercent] = useState<number>(50); // Slider percent 0-100
  
  // Notifications
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const resA = parseFloat(reserveA);
  const resB = parseFloat(reserveB);
  const isPoolEmpty = resA === 0 || resB === 0;

  // Auto-proportion logic: amountB = amountA * (reserveB / reserveA)
  const handleAmountAChange = (val: string) => {
    setAmountA(val);
    if (!val || isNaN(parseFloat(val))) {
      setAmountB("");
      return;
    }

    if (!isPoolEmpty) {
      const calculatedB = (parseFloat(val) * resB) / resA;
      setAmountB(calculatedB.toFixed(5));
    }
  };

  const handleAmountBChange = (val: string) => {
    setAmountB(val);
    if (!val || isNaN(parseFloat(val))) {
      setAmountA("");
      return;
    }

    if (!isPoolEmpty) {
      const calculatedA = (parseFloat(val) * resA) / resB;
      setAmountA(calculatedA.toFixed(5));
    }
  };

  const handleAddLiquidity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountA || !amountB) return;
    if (parseFloat(amountA) > parseFloat(tokenABalance) || parseFloat(amountB) > parseFloat(tokenBBalance)) {
      setTxError("Insufficient balance in Token A or Token B!");
      return;
    }

    setTxSuccess(null);
    setTxError(null);

    const success = await addLiquidity(amountA, amountB);
    if (success) {
      setTxSuccess(`Successfully added ${amountA} TKA & ${amountB} TKB into the liquidity pool!`);
      setAmountA("");
      setAmountB("");
    } else {
      setTxError("Transaction failed. Make sure you approved both token spends.");
    }
  };

  const handleRemoveLiquidity = async (e: React.FormEvent) => {
    e.preventDefault();
    const lpToBurn = (parseFloat(lpBalance) * removePercent) / 100;
    if (lpToBurn <= 0) return;

    setTxSuccess(null);
    setTxError(null);

    const success = await removeLiquidity(lpToBurn.toFixed(6));
    if (success) {
      setTxSuccess(`Successfully removed ${removePercent}% of your liquidity! Returned TKA and TKB.`);
      setRemovePercent(50);
    } else {
      setTxError("Transaction failed. Check your MetaMask or local wallet balances.");
    }
  };

  // Calculate return estimates for removing liquidity
  const totalLp = 100000; // simulated constant global LP supply, or we can fetch/simulate
  const lpToBurn = (parseFloat(lpBalance) * removePercent) / 100;
  const estReturnA = (lpToBurn * resA) / totalLp;
  const estReturnB = (lpToBurn * resB) / totalLp;

  return (
    <div className="fade-in" style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "480px" }}>
        
        {/* Toggle subtabs */}
        <div style={{
          display: "flex",
          background: "rgba(0,0,0,0.2)",
          borderRadius: "14px",
          padding: "4px",
          marginBottom: "24px"
        }}>
          <button
            onClick={() => { setActiveSubTab("add"); setTxSuccess(null); setTxError(null); }}
            style={{
              flex: 1,
              background: activeSubTab === "add" ? "var(--gradient-primary)" : "transparent",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "10px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "var(--transition-smooth)"
            }}
          >
            Add Liquidity
          </button>
          <button
            onClick={() => { setActiveSubTab("remove"); setTxSuccess(null); setTxError(null); }}
            style={{
              flex: 1,
              background: activeSubTab === "remove" ? "var(--gradient-primary)" : "transparent",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "10px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "var(--transition-smooth)"
            }}
          >
            Remove Liquidity
          </button>
        </div>

        {activeSubTab === "add" ? (
          /* ADD LIQUIDITY FORM */
          <form onSubmit={handleAddLiquidity} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Add Reserves</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "-10px" }}>
              Provide capital to earn swap trading fees. Keep both tokens in ratio.
            </p>

            {/* Token A Input */}
            <div className="glass-input-container">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>Token A (TKA)</span>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  Balance: <span style={{ color: "#fff", fontWeight: 600 }}>{parseFloat(tokenABalance).toFixed(2)}</span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="number"
                  step="any"
                  placeholder="0.0"
                  value={amountA}
                  onChange={(e) => handleAmountAChange(e.target.value)}
                  className="glass-input"
                  style={{ flex: 1 }}
                />
                <span style={{ fontWeight: 600 }}>🟢 TKA</span>
              </div>
            </div>

            {/* Plus Indicator */}
            <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0 -8px 0" }}>
              <span style={{ fontSize: "20px" }}>➕</span>
            </div>

            {/* Token B Input */}
            <div className="glass-input-container">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>Token B (TKB)</span>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  Balance: <span style={{ color: "#fff", fontWeight: 600 }}>{parseFloat(tokenBBalance).toFixed(2)}</span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="number"
                  step="any"
                  placeholder="0.0"
                  value={amountB}
                  onChange={(e) => handleAmountBChange(e.target.value)}
                  className="glass-input"
                  style={{ flex: 1 }}
                />
                <span style={{ fontWeight: 600 }}>🔵 TKB</span>
              </div>
            </div>

            {/* Ratio information boxes */}
            {!isPoolEmpty && (
              <div style={{
                background: "rgba(0,0,0,0.15)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "12px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                fontSize: "13px",
                color: "var(--text-muted)",
                textAlign: "center"
              }}>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600 }}>{(resB / resA).toFixed(4)}</div>
                  <div>TKB per TKA</div>
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600 }}>{(resA / resB).toFixed(4)}</div>
                  <div>TKA per TKB</div>
                </div>
              </div>
            )}

            {isPoolEmpty && (
              <div style={{
                background: "rgba(243, 85, 218, 0.05)",
                border: "1px solid rgba(243, 85, 218, 0.15)",
                color: "var(--accent)",
                borderRadius: "12px",
                padding: "12px",
                fontSize: "13px",
                fontWeight: 500
              }}>
                ℹ️ You are the first liquidity provider! You define the initial token reserves ratio.
              </div>
            )}

            {/* Messages */}
            {txSuccess && <div className="glowing-badge success" style={{ padding: "10px", width: "100%" }}>✅ {txSuccess}</div>}
            {txError && <div style={{ color: "var(--error)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: "10px", borderRadius: "12px", fontSize: "13px" }}>⚠️ {txError}</div>}

            {/* Action Button */}
            {!walletConnected ? (
              <button type="button" onClick={connectWallet} className="btn-primary" style={{ width: "100%" }}>Connect Wallet</button>
            ) : (
              <button
                type="submit"
                disabled={loading || !amountA || !amountB}
                className="btn-primary"
                style={{ width: "100%" }}
              >
                {loading ? "Approving & Depositing..." : "Deposit Liquidity"}
              </button>
            )}
          </form>
        ) : (
          /* REMOVE LIQUIDITY FORM */
          <form onSubmit={handleRemoveLiquidity} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Withdraw Reserves</h3>
            
            <div style={{
              background: "rgba(0,0,0,0.15)",
              border: "1px solid var(--border-glass)",
              borderRadius: "16px",
              padding: "16px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "4px" }}>Your LP Token Balance</div>
              <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--secondary)" }}>
                {parseFloat(lpBalance).toFixed(2)} <span style={{ fontSize: "18px" }}>MDX-LP</span>
              </div>
            </div>

            {/* Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: 600 }}>
                <span>Amount to Remove</span>
                <span className="gradient-text" style={{ fontSize: "18px" }}>{removePercent}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={removePercent}
                onChange={(e) => setRemovePercent(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  height: "6px",
                  borderRadius: "3px",
                  background: "#1e293b",
                  outline: "none",
                  cursor: "pointer"
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Estimated Returns */}
            <div style={{
              background: "rgba(0,0,0,0.25)",
              border: "1px solid var(--border-glass)",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>Estimated Return Tokens:</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Token A (TKA):</span>
                <span style={{ fontWeight: 600 }}>🟢 {isNaN(estReturnA) ? "0.0" : estReturnA.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Token B (TKB):</span>
                <span style={{ fontWeight: 600 }}>🔵 {isNaN(estReturnB) ? "0.0" : estReturnB.toFixed(2)}</span>
              </div>
            </div>

            {/* Messages */}
            {txSuccess && <div className="glowing-badge success" style={{ padding: "10px", width: "100%" }}>✅ {txSuccess}</div>}
            {txError && <div style={{ color: "var(--error)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: "10px", borderRadius: "12px", fontSize: "13px" }}>⚠️ {txError}</div>}

            {/* Button */}
            {!walletConnected ? (
              <button type="button" onClick={connectWallet} className="btn-primary" style={{ width: "100%" }}>Connect Wallet</button>
            ) : (
              <button
                type="submit"
                disabled={loading || parseFloat(lpBalance) === 0}
                className="btn-primary"
                style={{ width: "100%" }}
              >
                {loading ? "Withdrawing..." : `Withdraw ${removePercent}% Liquidity`}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
