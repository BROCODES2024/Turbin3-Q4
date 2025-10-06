# Solana Rust Prerequisites Project

This repository contains the Rust program for the second part of the Turbin3 Solana prerequisites. It serves as a hands-on introduction to native, on-chain development and client interaction using Rust on the Solana blockchain.

The program's tests cover fundamental operations such as:

- Generating local keypairs (wallets).
- Airdropping devnet SOL.
- Transferring SOL and sweeping a wallet's entire balance.
- Manually constructing raw transactions to interact with a live on-chain program.
- Solving common development puzzles like fee calculation and key format conversion.

---

## 🛠️ Prerequisites & Installation

Before you begin, you will need the following tools installed on your system. (Note: For Windows users, it is highly recommended to work within WSL2).

1.  **Rust & Cargo**: The Rust compiler and package manager.

    ```bash
    # We recommend using rustup to install
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

2.  **Solana Tool Suite**: The command-line interface for interacting with the Solana network.

    ```bash
    sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
    # You may need to add the solana bin directory to your PATH
    ```

---

## ⚙️ Setup & Configuration

1.  **Clone the Repository**

    ```bash
    # Since I see your GitHub is BROCODES2024, you'd clone your fork
    git clone https://github.com/BROCODES2024/solana-rust-prereqs.git
    cd solana-rust-prereqs
    ```

2.  **Create Your Wallet**
    The tests in this project rely on a local wallet file named `dev-wallet.json`.

    - First, run the `keygen` test:
      ```bash
      cargo test keygen -- --nocapture
      ```
    - This will output your wallet's public key and, more importantly, a **keypair byte array**.
    - Create a new file in the root directory named **`dev-wallet.json`**.
    - **Copy the entire byte array** (including the `[` and `]`) from the terminal output and paste it into this new file.

3.  **Fund Your Wallet**
    Your newly created wallet needs devnet SOL to pay for transaction fees.

    - Run the `claim_airdrop` test:
      ```bash
      cargo test claim_airdrop -- --nocapture
      ```
    - Run this command a couple of times to ensure you have enough SOL (e.g., 2-4 SOL).

---

## 🚀 Running the Tests

All functionality is built into test functions, which can be run from the command line using Cargo. Use the `-- --nocapture` flags to see the `println!` outputs.

| Command                                          | Description                                                                                         |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `cargo test keygen -- --nocapture`               | Generates a new Solana keypair and logs the secret key bytes to the console.                        |
| `cargo test claim_airdrop -- --nocapture`        | Requests a 2 SOL airdrop from the devnet faucet to your `dev-wallet.json`.                          |
| `cargo test transfer_sol -- --nocapture`         | Transfers a fixed amount of SOL from your wallet to a hardcoded address (`FBXu8Fg...`).             |
| `cargo test empty_wallet -- --nocapture`         | Sweeps the _entire remaining balance_ from your wallet to a hardcoded address.                      |
| `cargo test base58_to_wallet -- --nocapture`     | An interactive utility to convert a base58 private key string into a wallet byte array.             |
| `cargo test wallet_to_base58 -- --nocapture`     | An interactive utility to convert a wallet byte array into a Phantom-compatible base58 private key. |
| `cargo test submit_prerequisites -- --nocapture` | **(Final Task)** Submits your on-chain proof of completion for the Rust prerequisites course.       |

---

## ⭐ Final Challenge: The Submission Test

The main goal of this project is to run the `submit_prerequisites` test successfully. This is the final on-chain submission that proves you have completed the Rust coursework.

**Before running, ensure you have:**

1.  Created and funded your `dev-wallet.json`.
2.  Completed the TypeScript prerequisites, as this Rust script interacts with the same on-chain account created in that step.

Then, execute the final test:

```bash
cargo test submit_prerequisites -- --nocapture
```

This test will manually build the instruction, derive the necessary PDAs, create the transaction, and send it to the Solana devnet to mint your completion NFT.

---
