# VeriLedger – Self-Auditing Transaction Ledger

This project implements a full-stack, production-ready immutable transaction ledger. It prevents data tampering through SHA-256 hash chaining, supports internal audits, and anchors the latest ledger state onto the Ethereum Sepolia Testnet for external verification.

## Architecture

- **Backend**: Java 17, Spring Boot, Web3j, Lombok
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Axios
- **Blockchain**: Solidity, Ethereum Sepolia Testnet

## Quick Start Guide

### 1. Blockchain Setup (Remix IDE)

To anchor transactions to the blockchain, you must first deploy the smart contract.

1. Open [Remix IDE](https://remix.ethereum.org/).
2. Create a new file named `LedgerAnchor.sol` in the `contracts` folder.
3. Copy and paste the contents of `blockchain/LedgerAnchor.sol` into this file.
4. Go to the "Solidity Compiler" tab and compile the contract.
5. Go to the "Deploy & Run Transactions" tab.
   - **Environment**: Select `Injected Provider - MetaMask`.
   - Ensure MetaMask is connected to the **Sepolia Testnet** and you have test ETH.
   - Click **Deploy** and confirm the transaction in MetaMask.
6. Once deployed, copy the **Deployed Contract Address**.

### 2. Backend Setup (Spring Boot)

1. Open `backend/src/main/resources/application.properties`.
2. Update the configuration:
   - `blockchain.contract.address=0xYourDeployedContractAddress`
   - `blockchain.private.key=0xYourMetaMaskPrivateKey` *(Do not share this key!)*
3. Build and run the project:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   *(Or run `VeriLedgerApplication.java` from your favorite IDE like IntelliJ/Eclipse)*
4. The backend will start on `http://localhost:8080`.

### 3. Frontend Setup (React)

1. Open a new terminal.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

## Demonstration Steps (For Evaluation)

Here is how you can demonstrate the core engineering principles of this project:

### 1. Immutable Ledger & Realtime Analytics
- Add several transactions (e.g., $1000 Income, $200 Expense).
- Observe the **Hash Chain** actively updating in the Ledger Table view.
- Note the charts and aggregated sums in the Dashboard change in real-time.

### 2. Internal Auditing & Tamper Detection
- Click **"Re-run Audit"** in the Audit panel. It should show a green PASS.
- **Simulate Tampering:**
  - Open `backend/ledger.json`.
  - Look for an old transaction and secretly change its `"amount"` value (e.g., from 100 to 900).
  - Restart the backend to load the tampered data.
  - Click **"Re-run Audit"**. The system will flag the exact tampered transaction because the hash chain is broken, proving the ledger is secure.

### 3. Blockchain Anchoring
- By default, adding a transaction signals the backend to push the updated SHA-256 hash to Sepolia.
- Go to the **Ethereum Testnet Anchoring** module in the UI.
- Click **"Verify Chain"**. It connects to the Sepolia node to retrieve the exact hash stored on the blockchain and compares it to the local dataset.
- If it matches, the data is verified against the decentralized network!
