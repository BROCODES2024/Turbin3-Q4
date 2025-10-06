# Solana TypeScript Prerequisites Project

This repository contains the completed scripts for the Turbin3 Solana TypeScript prerequisites program. It serves as a hands-on introduction to client-side development on the Solana blockchain.

The scripts cover fundamental operations such as:

- Generating local keypairs (wallets).
- Airdropping devnet SOL.
- Transferring SOL and sweeping a wallet's entire balance.
- Interacting with a live on-chain program using its IDL.
- Solving common development puzzles like PDA derivation and fee calculation.

---

## 🛠️ Prerequisites & Installation

Before running this project, you will need the following tools installed on your system. (Note: For Windows users, it is highly recommended to work within WSL2).

1.  **Node.js**: A JavaScript runtime. An LTS version (e.g., 20.x) is recommended.

    ```bash
    # We recommend using nvm (Node Version Manager) to install
    nvm install --lts
    ```

2.  **Yarn**: A package manager for Node.js.

    ```bash
    npm install --global yarn
    ```

3.  **Solana Tool Suite**: The command-line interface for interacting with the Solana network.

    ```bash
    sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
    # You may need to add the solana bin directory to your PATH
    ```

---

## ⚙️ Setup & Configuration

1.  **Clone the Repository**

    ```bash
    git clone <your-repository-url>
    cd airdrop
    ```

2.  **Install Dependencies**
    This will install all the necessary project-specific packages listed in `package.json`.

    ```bash
    yarn install
    ```

3.  **Create Your Wallet**
    The scripts rely on a local wallet file named `Turbin3-wallet.json`.

    - Run the `keygen` script:
      ```bash
      yarn keygen
      ```
    - This will output a wallet address and, more importantly, a **keypair byte array**.
    - Create a new file named **`Turbin3-wallet.json`**.
    - **Copy the entire byte array** (including the `[` and `]`) from the terminal output and paste it into this new file.

4.  **Fund Your Wallet**
    Your newly created wallet needs devnet SOL to pay for transaction fees.

    ```bash
    yarn airdrop
    ```

    Run this command a couple of times to ensure you have enough SOL (e.g., 2-4 SOL).

---

## 🚀 Running the Scripts

All scripts can be run from the command line using Yarn.

| Command                  | Description                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `yarn keygen`            | Generates a new Solana keypair and logs the secret key bytes to the console.                                |
| `yarn airdrop`           | Requests a 2 SOL airdrop from the devnet faucet to your `Turbin3-wallet.json`.                              |
| `yarn transfer`          | Sweeps the _entire remaining balance_ from your wallet to a hardcoded destination address.                  |
| `yarn convert to-base58` | A utility to convert your `Turbin3-wallet.json` into a Phantom-compatible base58 private key string.        |
| `yarn generate-client`   | Reads the program's IDL (`programs/Turbin3_prereq.json`) and generates a TS client in the `clients` folder. |
| `yarn enroll`            | **(Final Task)** Executes the on-chain enrollment by calling the `initialize` and `submit_ts` instructions. |

---

## ⭐ Final Challenge: The Enrollment Script

The main goal of this project is to run the `enroll.ts` script successfully. This is the final on-chain submission.

**Before running, ensure you have:**

1.  Created and funded your `Turbin3-wallet.json`.
2.  Successfully run `yarn generate-client` at least once to create the necessary program interface.

Then, execute the final script:

```bash
yarn enroll
```

This script will derive the necessary PDAs, build two transactions, and send them to the Solana devnet to record your completion of the prerequisites.

### Example of Successful Output

A successful run of the `enroll` script will look like this, providing you with the transaction links as on-chain proof of your work:

```bash
Initialize transaction result: undefined
✅ Initialize Success! TX: https://explorer.solana.com/tx/5kAZWUchXV7FLQ2GYR8L8uq1WEk6NYNffqdJEXdTYUviCSYKWN7J7BboB88YBEzbCr1uiLWDUTMCHH4dm4vQCvRb?cluster=devnet
=== Step 2: Submit TypeScript Completion ===
✅ Submit TypeScript Success! TX: https://explorer.solana.com/tx/3CwUwEMw6VRW5Zckk9tp3CT8Zadnbmg3svhGKFcCR8UTrLudbd8kYFSsC2CSUG2UU2s2pXyiADnv7hL8NAKTWNNi?cluster=devnet
🎉 Congratulations! You have completed the Turbin3 Solana Pre-requisite TypeScript coursework!
Your NFT was minted at: 434T7rN4EMyJWPVkeByigfGXT9jowQSy1dkesJwrRL4X
Done in 6.69s.
```

---

## 🧠 Part II: Conceptual Question

As the final part of this assessment, the following question was posed:

> **Why do you think Solana has chosen during most of its history to use Typescript for Client side development?**

Solana's choice of TypeScript was a strategic decision focused on **developer safety, accessibility, and productivity**—three crucial factors for building a robust ecosystem on a new, high-performance blockchain.

### 1\. Safety in a High-Stakes Environment 🛡️

Blockchain development is unforgiving; a single bug can lead to an irreversible loss of funds. TypeScript's **static typing** catches a whole class of bugs _before_ the code is ever run, preventing errors like sending the wrong data type in a transaction. For financial applications, this pre-emptive safety net is critical.

### 2\. Superior Developer Experience & Tooling 🧑‍💻

TypeScript enables powerful features in code editors like VS Code, including intelligent autocompletion and type-checking. As seen in this project, when you use a generated client, the editor knows exactly which instructions (`initialize`, `submitTs`) and accounts a program expects. This makes development faster, less error-prone, and easier to debug.

### 3\. Accessibility for the World's Largest Developer Pool 🌐

To grow a new blockchain, you need builders. JavaScript is the world's most popular programming language. Since TypeScript is a superset of JavaScript, millions of web developers can start building on Solana with a very gentle learning curve. This gave Solana a massive strategic advantage over ecosystems that required learning a niche language from scratch.

### 4\. Code Scalability and Maintainability 🏗️

As dApps grow from simple scripts to complex applications, a typed codebase is far easier to manage, read, and maintain. Types act as a form of documentation, making it easier for teams to collaborate and for new developers to understand the code. This is essential for building large-scale, long-lasting projects.
