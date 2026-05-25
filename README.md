# MiniDEX 🪙

MiniDEX is a premium, high-fidelity Web3 Decentralized Exchange (DEX) and Automated Market Maker (AMM) designed around the constant product formula ($x \cdot y = k$), reminiscent of Uniswap V2. The application integrates Solidity smart contracts, a comprehensive Hardhat testing harness, and a luxurious glassmorphism React + TypeScript Single Page Application (SPA).

---

## 🌟 Key Features

*   **AMM Core (Constant Product Formula)**: Swapping utility between Token A and Token B driven by the $x \cdot y = k$ invariant, executing custom mathematical equations directly on-chain with a $0.3\%$ trading fee returned to the pool to reward Liquidity Providers.
*   **Dual-Mode State Provider**:
    1.  **Web3 Local Node Mode**: Connects directly to MetaMask and local smart contracts running on a Hardhat testnet via Ethers.js v6.
    2.  **Sandbox Simulator Mode**: A built-in high-fidelity in-memory AMM execution engine. If a Web3 wallet is not connected or the blockchain node is offline, you can still swap, mint test coins, deposit liquidity, and experience the application seamlessly with state persistence in `localStorage`.
*   **Integrated Coin Faucet**: Instantly claim 100.0 units of test `TKA` (Token A) and `TKB` (Token B) for testing and pool initialization.
*   **Proportional Liquidity Mining**: Deposit dual-sided assets in perfect proportions (respecting the reserve pool ratio) to mint Liquidity Provider (`MDX-LP`) tokens, and burn LP tokens to withdraw assets along with accumulated fees.
*   **Luxurious UI/UX**: Stunning cyber dark theme with smooth glassmorphic card grids, subtle glow states, micro-animations, and a completely responsive custom SVG line chart mapping live exchange rates without external graphing libraries.

---

## ⚙️ Core Architecture & Math

### Constant Product Equation
The exchange rate and swap output values are derived using the constant product market maker invariant:

$$(x + \Delta x) \cdot (y - \Delta y) = k$$

Where:
*   $x$ & $y$ represent the current token reserves (`reserveA` & `reserveB`).
*   $\Delta x$ represents the input token amount.
*   $\Delta y$ represents the output token amount.

### Output Calculation with 0.3% Fee
A $0.3\%$ fee is deducted from the input amount before calculating the swap output. The contract effectively scales the input to $99.7\%$ of its value:

$$\Delta y = \frac{\Delta x \cdot 997 \cdot y}{(x \cdot 1000) + (\Delta x \cdot 997)}$$

This math is strictly implemented inside `DexPool.sol` and mirrored inside the frontend's local simulator context.

---

## 📂 Directory Structure

```
Mini_DEX/
├── contracts/               # Solidity Smart Contracts
│   ├── Token.sol            # ERC20 Token with public Mint faucet
│   └── DexPool.sol          # AMM Swap & Liquidity Pool Engine
├── scripts/                 # Hardhat Script Files
│   └── deploy.js            # Deploys, Approves, Seeds Reserves & Exports ABIs
├── test/                    # Mocha/Chai Unit Tests
│   └── DexPool.test.js      # 10 Contract tests for reserves, swaps & reverts
├── frontend/                # Vite + React + TS Frontend App
│   ├── src/
│   │   ├── components/      # Modular UI Layouts (Navbar, Swap, Liquidity, etc.)
│   │   ├── context/         # Dual-Mode Web3 & Simulator State Provider
│   │   ├── contracts/       # Auto-generated addresses & contract ABIs
│   │   ├── styles/          # HSL Color Design System, Glassmorphic CSS
│   │   ├── App.tsx          # Router and tab navigations
│   │   └── main.tsx         # Entrypoint loader
│   ├── index.html           # Viewports & SEO metadata
│   └── vite.config.ts       # Build and dev server properties
├── package.json             # Monorepo task script manager
└── hardhat.config.js        # Hardhat Localnet network configurations
```

---

## 🛠️ Technology Stack

*   **Smart Contracts**: Solidity `^0.8.20`, OpenZeppelin ERC20 interfaces.
*   **Local Blockchain Harness**: Hardhat, Ethers.js v6.
*   **Frontend SPA**: React 18, TypeScript, Vite.
*   **Design & Styling**: Custom Vanilla CSS with HSL variables (Cyber Dark Theme).

---

## 🚀 Getting Started & Installation

First, clone the repository and install dependencies at the root folder:

```bash
cd Mini_DEX
npm install
npm run frontend-install
```

### Option A: Instant Run (Interactive Sandbox Simulator)
To explore the entire application and AMM trading mechanics immediately in your browser without any MetaMask setup or running local nodes:

```bash
npm run frontend-dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The application will boot up in **Simulator Mode** automatically. You can mint test coins, deposit liquidity, perform trades, and watch the live neon chart update!

---

### Option B: Local Blockchain Execution (Web3 Node Mode)

1.  **Launch the local Hardhat Node**:
    ```bash
    npx hardhat node
    ```
    This spins up a local Ethereum network at `http://127.0.0.1:8545` and outputs several test private keys with $10,000$ mock ETH.

2.  **Compile & Deploy Contracts**:
    In a new terminal window, compile your smart contracts and deploy them to the local node:
    ```bash
    npm run deploy
    ```
    *This script deploys Token A, Token B, and the DexPool, automatically transfers initial token reserves, adds initial pool liquidity ($50,000$ TKA and $50,000$ TKB), and writes compilation ABIs directly into the frontend contracts directory.*

3.  **Setup MetaMask**:
    *   Open MetaMask, choose **Add Network manually**.
    *   **Network Name**: `Hardhat Localhost`
    *   **RPC URL**: `http://127.0.0.1:8545`
    *   **Chain ID**: `31337`
    *   **Currency Symbol**: `ETH`
    *   Save and select the network.
    *   Import one of the Hardhat private keys generated in step 1 to access your test account.

4.  **Run Dev Client**:
    ```bash
    npm run frontend-dev
    ```
    Open [http://localhost:3000](http://localhost:3000), connect your MetaMask wallet, and perform real-time, on-chain swaps, faucet claims, and liquidity deposits.

---

## 🔬 Running Automated Tests

A comprehensive suite of 10 automated unit tests is included to verify pool initializations, LP token reward issuances, swap fee mathematics, and transaction revert criteria.

To execute the Hardhat test suite:

```bash
npm run test
```

Expected output:
```bash
  DexPool Contract
    Initialization
      ✔ Should set correct token addresses
      ✔ Should start with 0 reserves
    Liquidity Operations
      ✔ Should allow initial liquidity addition
      ✔ Should mint proportional LP tokens for subsequent deposits
      ✔ Should allow removing liquidity and return proportional reserves
    Swap Logic (AMM)
      ✔ Should calculate correct output amount including 0.3% fee
      ✔ Should swap Token A for B and update reserves correctly
      ✔ Should swap Token B for A and update reserves correctly
      ✔ Should reject swaps with 0 input amount
      ✔ Should reject swaps of unsupported tokens

  10 passing (2s)
```
