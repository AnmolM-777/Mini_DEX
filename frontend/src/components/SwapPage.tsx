import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";

export const SwapPage: React.FC = () => {
  const {
    tokenABalance,
    tokenBBalance,
    getAmountOut,
    swapTokens,
    loading,
    walletConnected,
    connectWallet
  } = useWeb3();

  const [tokenIn, setTokenIn] = useState<"A" | "B">("A");
  const [amountIn, setAmountIn] = useState<string>("");
  const [amountOut, setAmountOut] = useState<string>("0.0");
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);

  const tokenOut = tokenIn === "A" ? "B" : "A";
  const balanceIn = tokenIn === "A" ? tokenABalance : tokenBBalance;
  const balanceOut = tokenOut === "A" ? tokenABalance : tokenBBalance;

  // Recalculate output amount when inputs change
  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0) {
      const out = getAmountOut(tokenIn, amountIn);
      setAmountOut(out);
    } else {
      setAmountOut("0.0");
    }
  }, [amountIn, tokenIn, getAmountOut]);

  const handleMax = () => {
    // Leave a tiny sliver or just take 100% since there's no gas token inside ERC20 balances
    setAmountIn(balanceIn);
  };

  const handleSwitchTokens = () => {
    setTokenIn(tokenOut);
    setAmountIn(amountOut === "0.0" ? "" : amountOut);
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountIn || parseFloat(amountIn) <= 0) return;
    if (parseFloat(amountIn) > parseFloat(balanceIn)) {
      setSwapError("Insufficient balance for this swap!");
      return;
    }

    setSwapSuccess(null);
    setSwapError(null);

    const success = await swapTokens(tokenIn, amountIn);
    if (success) {
      setSwapSuccess(`Successfully swapped ${amountIn} TK${tokenIn} for ${amountOut} TK${tokenOut}!`);
      setAmountIn("");
      setAmountOut("0.0");
    } else {
      setSwapError("Transaction failed. Please make sure the pool has sufficient liquidity.");
    }
  };

  const rate = amountIn && amountOut && parseFloat(amountIn) > 0 
    ? (parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)
    : "1.000000";

  return (
    <div className="fade-in" style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "460px", position: "relative" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Swap Tokens</h2>
          <span style={{
            fontSize: "12px",
            color: "var(--primary)",
            background: "rgba(138, 43, 226, 0.1)",
            padding: "4px 8px",
            borderRadius: "8px",
            fontWeight: 600
          }}>
            Fee: 0.3%
          </span>
        </div>

        <form onSubmit={handleSwap} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          {/* Input Token Box */}
          <div className="glass-input-container">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>From</span>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Balance: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{parseFloat(balanceIn).toFixed(2)}</span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="number"
                step="any"
                placeholder="0.0"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="glass-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleMax}
                style={{
                  background: "rgba(138, 43, 226, 0.15)",
                  color: "var(--primary)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "4px 8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "var(--transition-smooth)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(138, 43, 226, 0.25)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(138, 43, 226, 0.15)"}
              >
                MAX
              </button>
              <div style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 600
              }}>
                <span style={{ fontSize: "16px" }}>{tokenIn === "A" ? "🟢" : "🔵"}</span>
                <span>TK{tokenIn}</span>
              </div>
            </div>
          </div>

          {/* Switch Button */}
          <div style={{ display: "flex", justifyContent: "center", margin: "-6px 0 -6px 0", zIndex: 2 }}>
            <button
              type="button"
              onClick={handleSwitchTokens}
              style={{
                background: "#161c30",
                border: "1px solid var(--border-glass)",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                transition: "var(--transition-bounce)",
                color: "var(--secondary)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "rotate(180deg) scale(1.1)";
                e.currentTarget.style.borderColor = "var(--secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "rotate(0deg) scale(1)";
                e.currentTarget.style.borderColor = "var(--border-glass)";
              }}
            >
              ⬇️
            </button>
          </div>

          {/* Output Token Box */}
          <div className="glass-input-container">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>To (Estimated)</span>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Balance: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{parseFloat(balanceOut).toFixed(2)}</span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="text"
                readOnly
                value={amountOut === "0.0" ? "" : parseFloat(amountOut).toFixed(5)}
                placeholder="0.0"
                className="glass-input"
                style={{ flex: 1, color: "var(--text-muted)" }}
              />
              <div style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 600
              }}>
                <span style={{ fontSize: "16px" }}>{tokenOut === "A" ? "🟢" : "🔵"}</span>
                <span>TK{tokenOut}</span>
              </div>
            </div>
          </div>

          {/* Rate and Details (Shown only when amountIn exists) */}
          {amountIn && parseFloat(amountIn) > 0 && (
            <div className="fade-in" style={{
              background: "rgba(0,0,0,0.15)",
              border: "1px solid var(--border-glass)",
              borderRadius: "12px",
              padding: "12px",
              fontSize: "13px",
              color: "var(--text-muted)",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Price Rate:</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  1 TK{tokenIn} = {rate} TK{tokenOut}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Price Impact:</span>
                <span style={{ color: parseFloat(amountIn) > 5000 ? "var(--error)" : "var(--success)", fontWeight: 600 }}>
                  {parseFloat(amountIn) > 5000 ? "High (>2.5%)" : "Negligible (<0.05%)"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Route:</span>
                <span style={{ color: "var(--secondary)", fontWeight: 500 }}>
                  TK{tokenIn} ➔ MiniDEX AMM ➔ TK{tokenOut}
                </span>
              </div>
            </div>
          )}

          {/* Action Toasts */}
          {swapSuccess && (
            <div className="fade-in" style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              color: "var(--success)",
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: 500
            }}>
              ✅ {swapSuccess}
            </div>
          )}

          {swapError && (
            <div className="fade-in" style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "var(--error)",
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: 500
            }}>
              ⚠️ {swapError}
            </div>
          )}

          {/* Submit Button */}
          {!walletConnected ? (
            <button
              type="button"
              onClick={connectWallet}
              className="btn-primary"
              style={{ width: "100%", marginTop: "8px" }}
            >
              Connect Wallet
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !amountIn || parseFloat(amountIn) <= 0}
              className="btn-primary"
              style={{ width: "100%", marginTop: "8px", position: "relative" }}
            >
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #fff",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "pulseGlow 1s linear infinite"
                  }} />
                  Processing Swap...
                </div>
              ) : (
                "Swap Tokens"
              )}
            </button>
          )}

        </form>
      </div>
    </div>
  );
};
