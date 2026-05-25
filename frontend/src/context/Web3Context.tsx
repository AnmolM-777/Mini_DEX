import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from "../contracts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface Transaction {
  id: string;
  type: "Mint" | "Swap" | "Add Liquidity" | "Remove Liquidity";
  tokenIn?: string;
  tokenOut?: string;
  amountIn: string;
  amountOut: string;
  timestamp: number;
  hash: string;
}

interface Web3ContextType {
  isSimulator: boolean;
  setIsSimulator: (val: boolean) => void;
  walletConnected: boolean;
  walletAddress: string | null;
  chainId: number | null;
  tokenABalance: string;
  tokenBBalance: string;
  lpBalance: string;
  reserveA: string;
  reserveB: string;
  loading: boolean;
  txHistory: Transaction[];
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  mintTokens: (tokenType: "A" | "B", amount: string) => Promise<boolean>;
  addLiquidity: (amountA: string, amountB: string) => Promise<boolean>;
  removeLiquidity: (lpAmount: string) => Promise<boolean>;
  swapTokens: (tokenInType: "A" | "B", amountIn: string) => Promise<boolean>;
  getAmountOut: (tokenInType: "A" | "B", amountIn: string) => string;
  refreshState: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Initial states for Sandbox Simulator (persisted in localStorage)
const SIM_STORAGE_KEY = "minidex_sim_state_v1";
const initialSimState = {
  tokenABalance: "500.0",
  tokenBBalance: "500.0",
  lpBalance: "0.0",
  reserveA: "50000.0",
  reserveB: "50000.0",
  txHistory: [
    {
      id: "tx-init",
      type: "Add Liquidity" as const,
      amountIn: "50000.0 TKA",
      amountOut: "50000.0 TKB",
      timestamp: Date.now() - 3600000 * 2, // 2 hours ago
      hash: "0xsimulatedtransactionhash000000000000000000000000000000000000001"
    }
  ] as Transaction[]
};

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mode toggle
  const [isSimulator, setIsSimulator] = useState<boolean>(true);

  // Web3 States
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Balances and Reserves
  const [tokenABalance, setTokenABalance] = useState("0.0");
  const [tokenBBalance, setTokenBBalance] = useState("0.0");
  const [lpBalance, setLpBalance] = useState("0.0");
  const [reserveA, setReserveA] = useState("0.0");
  const [reserveB, setReserveB] = useState("0.0");
  const [txHistory, setTxHistory] = useState<Transaction[]>([]);

  // ----------------------------------------------------
  // SIMULATOR HANDLERS (Local State Engine)
  // ----------------------------------------------------
  useEffect(() => {
    if (isSimulator) {
      const stored = localStorage.getItem(SIM_STORAGE_KEY);
      const state = stored ? JSON.parse(stored) : initialSimState;
      setTokenABalance(state.tokenABalance);
      setTokenBBalance(state.tokenBBalance);
      setLpBalance(state.lpBalance);
      setReserveA(state.reserveA);
      setReserveB(state.reserveB);
      setTxHistory(state.txHistory);
      setWalletAddress("0xSimulatorUserWalletAddress777");
      setWalletConnected(true);
      setChainId(31337); // Simulated local chain ID
    } else {
      // Switch back to Ethers Web3 logic
      setWalletConnected(false);
      setWalletAddress(null);
      setChainId(null);
      setTokenABalance("0.0");
      setTokenBBalance("0.0");
      setLpBalance("0.0");
      setReserveA("0.0");
      setReserveB("0.0");
      setTxHistory([]);
      checkWalletConnected();
    }
  }, [isSimulator]);

  const saveSimState = (updates: Partial<typeof initialSimState>) => {
    const current = {
      tokenABalance,
      tokenBBalance,
      lpBalance,
      reserveA,
      reserveB,
      txHistory
    };
    const updated = { ...current, ...updates };
    localStorage.setItem(SIM_STORAGE_KEY, JSON.stringify(updated));
  };

  // ----------------------------------------------------
  // REAL WEB3 INTERFACE (Ethers.js v6)
  // ----------------------------------------------------
  const checkWalletConnected = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
          setWalletAddress(accounts[0].address);
          setWalletConnected(true);
          setIsSimulator(false); // Turn off simulator if wallet already connected
          await fetchWeb3Data(accounts[0].address, provider);
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask is not installed. Please install it or use Simulator Mode!");
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const network = await provider.getNetwork();
      
      const cId = Number(network.chainId);
      setChainId(cId);
      setWalletAddress(accounts[0]);
      setWalletConnected(true);
      setIsSimulator(false); // Exit simulator mode

      if (cId !== 31337) {
        alert("Please switch your MetaMask network to Localhost 8545 (Chain ID: 31337) to interact with smart contracts!");
      }

      await fetchWeb3Data(accounts[0], provider);
    } catch (err) {
      console.error("Error connecting wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    setChainId(null);
    if (!isSimulator) {
      setIsSimulator(true); // Fallback to simulator on disconnect
    }
  };

  const fetchWeb3Data = async (userAddress: string, provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 31337) return;

      const signer = await provider.getSigner();

      // Contract instances
      const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.tokenA, CONTRACT_ABIS.tokenA, signer);
      const tokenB = new ethers.Contract(CONTRACT_ADDRESSES.tokenB, CONTRACT_ABIS.tokenB, signer);
      const dexPool = new ethers.Contract(CONTRACT_ADDRESSES.dexPool, CONTRACT_ABIS.dexPool, signer);

      // Fetch balances
      const balA = await tokenA.balanceOf(userAddress);
      const balB = await tokenB.balanceOf(userAddress);
      const balLP = await dexPool.balanceOf(userAddress);

      // Fetch reserves
      const [resA, resB] = await dexPool.getReserves();

      setTokenABalance(ethers.formatEther(balA));
      setTokenBBalance(ethers.formatEther(balB));
      setLpBalance(ethers.formatEther(balLP));
      setReserveA(ethers.formatEther(resA));
      setReserveB(ethers.formatEther(resB));

      // Fetch event logs to construct transaction history
      const filterSwap = dexPool.filters.Swap(userAddress);
      const filterAdd = dexPool.filters.LiquidityAdded(userAddress);
      const filterRemove = dexPool.filters.LiquidityRemoved(userAddress);

      const logsSwap = await dexPool.queryFilter(filterSwap, -1000);
      const logsAdd = await dexPool.queryFilter(filterAdd, -1000);
      const logsRemove = await dexPool.queryFilter(filterRemove, -1000);

      const parsedTx: Transaction[] = [];

      logsSwap.forEach((log: any) => {
        const tokenIn = log.args.tokenIn === CONTRACT_ADDRESSES.tokenA ? "TKA" : "TKB";
        const tokenOut = tokenIn === "TKA" ? "TKB" : "TKA";
        parsedTx.push({
          id: log.transactionHash + "-swap",
          type: "Swap",
          amountIn: `${ethers.formatEther(log.args.amountIn)} ${tokenIn}`,
          amountOut: `${ethers.formatEther(log.args.amountOut)} ${tokenOut}`,
          timestamp: Date.now(), // approximation, or we can fetch block
          hash: log.transactionHash
        });
      });

      logsAdd.forEach((log: any) => {
        parsedTx.push({
          id: log.transactionHash + "-add",
          type: "Add Liquidity",
          amountIn: `${ethers.formatEther(log.args.amountA)} TKA`,
          amountOut: `${ethers.formatEther(log.args.amountB)} TKB`,
          timestamp: Date.now(),
          hash: log.transactionHash
        });
      });

      logsRemove.forEach((log: any) => {
        parsedTx.push({
          id: log.transactionHash + "-remove",
          type: "Remove Liquidity",
          amountIn: `${ethers.formatEther(log.args.amountA)} TKA`,
          amountOut: `${ethers.formatEther(log.args.amountB)} TKB`,
          timestamp: Date.now(),
          hash: log.transactionHash
        });
      });

      // Sort transaction history (mock timestamps but unique transactions)
      setTxHistory(parsedTx.reverse().slice(0, 10));
    } catch (err) {
      console.error("Error fetching Web3 contract state:", err);
    }
  };

  const refreshState = async () => {
    if (isSimulator) return;
    if (typeof window.ethereum !== "undefined" && walletAddress) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await fetchWeb3Data(walletAddress, provider);
    }
  };

  useEffect(() => {
    if (!isSimulator && walletConnected) {
      const interval = setInterval(refreshState, 8000); // Poll local hardhat chain every 8s
      return () => clearInterval(interval);
    }
  }, [isSimulator, walletConnected, walletAddress]);

  // ----------------------------------------------------
  // MOCK CORE math & Web3 actions
  // ----------------------------------------------------
  const getAmountOut = (tokenInType: "A" | "B", amountIn: string): string => {
    const valIn = parseFloat(amountIn);
    if (isNaN(valIn) || valIn <= 0) return "0.0";

    const rIn = parseFloat(tokenInType === "A" ? reserveA : reserveB);
    const rOut = parseFloat(tokenInType === "A" ? reserveB : reserveA);

    if (rIn === 0 || rOut === 0) return "0.0";

    // 0.3% fee: amountInWithFee = amountIn * 0.997
    const amountInWithFee = valIn * 0.997;
    const numerator = amountInWithFee * rOut;
    const denominator = rIn + amountInWithFee;

    return (numerator / denominator).toFixed(6);
  };

  // Faucet Minting
  const mintTokens = async (tokenType: "A" | "B", amount: string): Promise<boolean> => {
    setLoading(true);
    const floatAmount = parseFloat(amount);
    
    if (isSimulator) {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newBalA = tokenType === "A" 
        ? (parseFloat(tokenABalance) + floatAmount).toFixed(1)
        : tokenABalance;
      const newBalB = tokenType === "B"
        ? (parseFloat(tokenBBalance) + floatAmount).toFixed(1)
        : tokenBBalance;

      const newTx: Transaction = {
        id: `tx-mint-${Date.now()}`,
        type: "Mint",
        amountIn: `${floatAmount.toFixed(1)} TK${tokenType}`,
        amountOut: "Success",
        timestamp: Date.now(),
        hash: "0xsimulatedmint" + Math.random().toString(16).substring(2, 8) + "0000000000000000"
      };

      setTokenABalance(newBalA);
      setTokenBBalance(newBalB);
      const newHistory = [newTx, ...txHistory].slice(0, 10);
      setTxHistory(newHistory);
      
      // Persist in localStorage
      saveSimState({
        tokenABalance: newBalA,
        tokenBBalance: newBalB,
        txHistory: newHistory
      });

      setLoading(false);
      return true;
    } else {
      // Web3 execution
      try {
        if (!walletAddress || chainId !== 31337) return false;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const tokenContractAddress = tokenType === "A" ? CONTRACT_ADDRESSES.tokenA : CONTRACT_ADDRESSES.tokenB;
        const tokenContract = new ethers.Contract(tokenContractAddress, CONTRACT_ABIS.tokenA, signer);

        const tx = await tokenContract.mint(walletAddress, ethers.parseEther(amount));
        await tx.wait();

        await refreshState();
        setLoading(false);
        return true;
      } catch (err) {
        console.error("Mint failed:", err);
        setLoading(false);
        return false;
      }
    }
  };

  // Add Liquidity
  const addLiquidity = async (amountA: string, amountB: string): Promise<boolean> => {
    setLoading(true);
    const valA = parseFloat(amountA);
    const valB = parseFloat(amountB);

    if (isSimulator) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const rA = parseFloat(reserveA);
      const rB = parseFloat(reserveB);
      const totalLP = parseFloat(lpBalance);
      
      let lpMinted = 0;
      if (rA === 0 || rB === 0 || totalLP === 0) {
        // Initial LP tokens
        lpMinted = Math.sqrt(valA * valB);
      } else {
        const shareA = (valA * totalLP) / rA;
        const shareB = (valB * totalLP) / rB;
        lpMinted = Math.min(shareA, shareB);
      }

      const newBalA = (parseFloat(tokenABalance) - valA).toFixed(1);
      const newBalB = (parseFloat(tokenBBalance) - valB).toFixed(1);
      const newLp = (parseFloat(lpBalance) + lpMinted).toFixed(2);
      const newReserveA = (rA + valA).toFixed(1);
      const newReserveB = (rB + valB).toFixed(1);

      const newTx: Transaction = {
        id: `tx-add-${Date.now()}`,
        type: "Add Liquidity",
        amountIn: `${valA.toFixed(1)} TKA`,
        amountOut: `${valB.toFixed(1)} TKB`,
        timestamp: Date.now(),
        hash: "0xsimulatedadd" + Math.random().toString(16).substring(2, 8) + "0000000000000000"
      };

      setTokenABalance(newBalA);
      setTokenBBalance(newBalB);
      setLpBalance(newLp);
      setReserveA(newReserveA);
      setReserveB(newReserveB);
      const newHistory = [newTx, ...txHistory].slice(0, 10);
      setTxHistory(newHistory);

      saveSimState({
        tokenABalance: newBalA,
        tokenBBalance: newBalB,
        lpBalance: newLp,
        reserveA: newReserveA,
        reserveB: newReserveB,
        txHistory: newHistory
      });

      setLoading(false);
      return true;
    } else {
      // Web3 execution
      try {
        if (!walletAddress || chainId !== 31337) return false;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const tokenA = new ethers.Contract(CONTRACT_ADDRESSES.tokenA, CONTRACT_ABIS.tokenA, signer);
        const tokenB = new ethers.Contract(CONTRACT_ADDRESSES.tokenB, CONTRACT_ABIS.tokenB, signer);
        const dexPool = new ethers.Contract(CONTRACT_ADDRESSES.dexPool, CONTRACT_ABIS.dexPool, signer);

        const parsedA = ethers.parseEther(amountA);
        const parsedB = ethers.parseEther(amountB);

        // Approve
        console.log("Approving token transfers...");
        await (await tokenA.approve(CONTRACT_ADDRESSES.dexPool, parsedA)).wait();
        await (await tokenB.approve(CONTRACT_ADDRESSES.dexPool, parsedB)).wait();

        // Add Liquidity
        console.log("Depositing reserves into pool...");
        const tx = await dexPool.addLiquidity(parsedA, parsedB);
        await tx.wait();

        await refreshState();
        setLoading(false);
        return true;
      } catch (err) {
        console.error("Add Liquidity failed:", err);
        setLoading(false);
        return false;
      }
    }
  };

  // Remove Liquidity
  const removeLiquidity = async (lpAmount: string): Promise<boolean> => {
    setLoading(true);
    const valLp = parseFloat(lpAmount);

    if (isSimulator) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const rA = parseFloat(reserveA);
      const rB = parseFloat(reserveB);
      const totalLp = 100000; // simulated pool global total supply of LP tokens

      const returnA = (valLp * rA) / totalLp;
      const returnB = (valLp * rB) / totalLp;

      const newBalA = (parseFloat(tokenABalance) + returnA).toFixed(1);
      const newBalB = (parseFloat(tokenBBalance) + returnB).toFixed(1);
      const newLp = (parseFloat(lpBalance) - valLp).toFixed(2);
      const newReserveA = (rA - returnA).toFixed(1);
      const newReserveB = (rB - returnB).toFixed(1);

      const newTx: Transaction = {
        id: `tx-remove-${Date.now()}`,
        type: "Remove Liquidity",
        amountIn: `${returnA.toFixed(1)} TKA`,
        amountOut: `${returnB.toFixed(1)} TKB`,
        timestamp: Date.now(),
        hash: "0xsimulatedremove" + Math.random().toString(16).substring(2, 8) + "0000000000000000"
      };

      setTokenABalance(newBalA);
      setTokenBBalance(newBalB);
      setLpBalance(newLp);
      setReserveA(newReserveA);
      setReserveB(newReserveB);
      const newHistory = [newTx, ...txHistory].slice(0, 10);
      setTxHistory(newHistory);

      saveSimState({
        tokenABalance: newBalA,
        tokenBBalance: newBalB,
        lpBalance: newLp,
        reserveA: newReserveA,
        reserveB: newReserveB,
        txHistory: newHistory
      });

      setLoading(false);
      return true;
    } else {
      // Web3 execution
      try {
        if (!walletAddress || chainId !== 31337) return false;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const dexPool = new ethers.Contract(CONTRACT_ADDRESSES.dexPool, CONTRACT_ABIS.dexPool, signer);
        const parsedLP = ethers.parseEther(lpAmount);

        // Approve LP
        await (await dexPool.approve(CONTRACT_ADDRESSES.dexPool, parsedLP)).wait();

        // Withdraw
        const tx = await dexPool.removeLiquidity(parsedLP);
        await tx.wait();

        await refreshState();
        setLoading(false);
        return true;
      } catch (err) {
        console.error("Remove liquidity failed:", err);
        setLoading(false);
        return false;
      }
    }
  };

  // Swap Tokens
  const swapTokens = async (tokenInType: "A" | "B", amountIn: string): Promise<boolean> => {
    setLoading(true);
    const valIn = parseFloat(amountIn);
    const valOut = parseFloat(getAmountOut(tokenInType, amountIn));

    if (isSimulator) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const isA = tokenInType === "A";
      const newBalA = isA 
        ? (parseFloat(tokenABalance) - valIn).toFixed(1)
        : (parseFloat(tokenABalance) + valOut).toFixed(1);
      const newBalB = isA
        ? (parseFloat(tokenBBalance) + valOut).toFixed(1)
        : (parseFloat(tokenBBalance) - valIn).toFixed(1);

      const rA = parseFloat(reserveA);
      const rB = parseFloat(reserveB);
      const newReserveA = isA ? (rA + valIn).toFixed(1) : (rA - valOut).toFixed(1);
      const newReserveB = isA ? (rB - valOut).toFixed(1) : (rB + valIn).toFixed(1);

      const newTx: Transaction = {
        id: `tx-swap-${Date.now()}`,
        type: "Swap",
        amountIn: `${valIn.toFixed(1)} TK${tokenInType}`,
        amountOut: `${valOut.toFixed(1)} TK${isA ? "B" : "A"}`,
        timestamp: Date.now(),
        hash: "0xsimulatedswap" + Math.random().toString(16).substring(2, 8) + "0000000000000000"
      };

      setTokenABalance(newBalA);
      setTokenBBalance(newBalB);
      setReserveA(newReserveA);
      setReserveB(newReserveB);
      const newHistory = [newTx, ...txHistory].slice(0, 10);
      setTxHistory(newHistory);

      saveSimState({
        tokenABalance: newBalA,
        tokenBBalance: newBalB,
        reserveA: newReserveA,
        reserveB: newReserveB,
        txHistory: newHistory
      });

      setLoading(false);
      return true;
    } else {
      // Web3 execution
      try {
        if (!walletAddress || chainId !== 31337) return false;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const tokenInAddress = tokenInType === "A" ? CONTRACT_ADDRESSES.tokenA : CONTRACT_ADDRESSES.tokenB;
        const tokenInContract = new ethers.Contract(tokenInAddress, CONTRACT_ABIS.tokenA, signer);
        const dexPool = new ethers.Contract(CONTRACT_ADDRESSES.dexPool, CONTRACT_ABIS.dexPool, signer);

        const parsedIn = ethers.parseEther(amountIn);

        // Approve input
        console.log("Approving token spend...");
        await (await tokenInContract.approve(CONTRACT_ADDRESSES.dexPool, parsedIn)).wait();

        // Swap
        console.log("Executing contract swap...");
        const tx = await dexPool.swap(tokenInAddress, parsedIn);
        await tx.wait();

        await refreshState();
        setLoading(false);
        return true;
      } catch (err) {
        console.error("Swap execution failed:", err);
        setLoading(false);
        return false;
      }
    }
  };

  return (
    <Web3Context.Provider
      value={{
        isSimulator,
        setIsSimulator,
        walletConnected,
        walletAddress,
        chainId,
        tokenABalance,
        tokenBBalance,
        lpBalance,
        reserveA,
        reserveB,
        loading,
        txHistory,
        connectWallet,
        disconnectWallet,
        mintTokens,
        addLiquidity,
        removeLiquidity,
        swapTokens,
        getAmountOut,
        refreshState
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
