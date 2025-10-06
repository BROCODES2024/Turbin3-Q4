use bs58;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    hash::Hash,
    instruction::{AccountMeta, Instruction},
    message::Message,
    pubkey::Pubkey,
    signature::{read_keypair_file, Keypair, Signer},
    transaction::Transaction,
};
use solana_system_interface::{instruction::transfer, program as system_program};
use std::io::{self, BufRead};
use std::str::FromStr;

const RPC_URL: &str = "https://api.devnet.solana.com";

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keygen() {
        let kp = Keypair::new();
        println!("You've generated a new Solana wallet: {}\n", kp.pubkey());
        println!("To save your wallet, copy and paste the following into a JSON file:");
        println!("{:?}", kp.to_bytes());
    }

    #[test]
    fn claim_airdrop() {
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");
        let client = RpcClient::new(RPC_URL);
        match client.request_airdrop(&keypair.pubkey(), 2_000_000_000u64) {
            Ok(sig) => {
                println!("Success! Check your TX here:");
                println!("https://explorer.solana.com/tx/{}?cluster=devnet", sig);
            }
            Err(err) => {
                println!("Airdrop failed: {}", err);
            }
        }
    }

    #[test]
    fn transfer_sol() {
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");
        let to_pubkey = Pubkey::from_str("FBXu8FgtrpR5DXYdqhPD3Jp4Zar24fRLh5N2fEPTDwfH").unwrap();
        let rpc_client = RpcClient::new(RPC_URL);
        let recent_blockhash = rpc_client
            .get_latest_blockhash()
            .expect("Failed to get recent blockhash");
        
        // Because we imported `transfer` directly, we can call it without a prefix
        let transaction = Transaction::new_signed_with_payer(
            &[transfer(&keypair.pubkey(), &to_pubkey, 100_000_000)],
            Some(&keypair.pubkey()),
            &vec![&keypair],
            recent_blockhash,
        );

        let signature = rpc_client
            .send_and_confirm_transaction(&transaction)
            .expect("Failed to send transaction");

        println!(
            "Success! Check out your TX here: https://explorer.solana.com/tx/{}/?cluster=devnet",
            signature
        );
    }

    #[test]
    fn empty_wallet() {
        // Setup: Load wallets and connect to client
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");
        let to_pubkey = Pubkey::from_str("FBXu8FgtrpR5DXYdqhPD3Jp4Zar24fRLh5N2fEPTDwfH").unwrap();
        let rpc_client = RpcClient::new(RPC_URL);

        // 1. Get the current balance
        let balance = rpc_client
            .get_balance(&keypair.pubkey())
            .expect("Failed to get balance");

        // 2. Get the recent blockhash
        let recent_blockhash = rpc_client
            .get_latest_blockhash()
            .expect("Failed to get recent blockhash");

        // 3. Build a mock message to calculate the transaction fee
        let message = Message::new_with_blockhash(
            &[transfer(&keypair.pubkey(), &to_pubkey, balance)],
            Some(&keypair.pubkey()),
            &recent_blockhash,
        );

        // 4. Get the fee for the message
        let fee = rpc_client
            .get_fee_for_message(&message)
            .expect("Failed to get fee calculator");

        // 5. Create the final transaction with the exact amount (balance - fee)
        let transaction = Transaction::new_signed_with_payer(
            &[transfer(&keypair.pubkey(), &to_pubkey, balance - fee)],
            Some(&keypair.pubkey()),
            &vec![&keypair],
            recent_blockhash,
        );

        // 6. Send and confirm the transaction
        let signature = rpc_client
            .send_and_confirm_transaction(&transaction)
            .expect("Failed to send final transaction");
        
        println!(
            "Success! Entire balance transferred: https://explorer.solana.com/tx/{}/?cluster=devnet",
            signature
        );
    }

    #[test]
    fn base58_to_wallet() {
        println!("Input your private key as a base58 string:");
        let stdin = io::stdin();
        let base58 = stdin.lock().lines().next().unwrap().unwrap();
        println!("Your wallet file format is:");
        let wallet = bs58::decode(base58).into_vec().unwrap();
        println!("{:?}", wallet);
    }

    #[test]
    fn wallet_to_base58() {
        println!("Input your private key as a JSON byte array (e.g. [12,34,...]):");
        let stdin = io::stdin();
        let wallet = stdin.lock().lines().next().unwrap().unwrap().trim_start_matches('[').trim_end_matches(']').split(',').map(|s| s.trim().parse::<u8>().unwrap()).collect::<Vec<u8>>();
        println!("Your Base58-encoded private key is:");
        let base58 = bs58::encode(wallet).into_string();
        println!("{:?}", base58);
    }
    #[test]
    fn submit_prerequisites() {
        let rpc_client = RpcClient::new(RPC_URL);
        let signer = read_keypair_file("turbin3-wallet.json").expect("Couldn't find Turbin3 wallet file");
        
        let mint = Keypair::new();
        let turbin3_prereq_program = Pubkey::from_str("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM").unwrap();
        let collection = Pubkey::from_str("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2").unwrap();
        let mpl_core_program = Pubkey::from_str("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d").unwrap();
        
        // --- CORRECTED LOGIC STARTS HERE ---

        // 1. Derive the user's personal PDA (same as before)
        let signer_pubkey = signer.pubkey();
        let seeds = &[b"prereqs", signer_pubkey.as_ref()];
        let (prereq_pda, _bump) = Pubkey::find_program_address(seeds, &turbin3_prereq_program);

        // 2. Derive the separate Authority PDA (the missing piece from the TypeScript file)
        let authority_seeds = &[b"collection", collection.as_ref()];
        let (authority_pda, _authority_bump) = Pubkey::find_program_address(authority_seeds, &turbin3_prereq_program);

        let data = vec![77, 124, 82, 163, 21, 133, 181, 206];
        
        // 3. Define the accounts with the CORRECT authority_pda
        let accounts = vec![
            AccountMeta::new(signer.pubkey(), true),            // Your wallet (user)
            AccountMeta::new(prereq_pda, false),               // Your PDA account (account)
            AccountMeta::new(mint.pubkey(), true),             // The new NFT mint
            AccountMeta::new(collection, false),               // Collection address (mutable)
            AccountMeta::new_readonly(authority_pda, false),   // The correct Authority PDA
            AccountMeta::new_readonly(mpl_core_program, false), // Metaplex Core program
            AccountMeta::new_readonly(system_program::id(), false), // System program
        ];
        
        // --- CORRECTED LOGIC ENDS HERE ---
        
        let blockhash = rpc_client.get_latest_blockhash().expect("Failed to get recent blockhash");
        
        let instruction = Instruction {
            program_id: turbin3_prereq_program,
            accounts,
            data,
        };

        let transaction = Transaction::new_signed_with_payer(
            &[instruction],
            Some(&signer.pubkey()),
            &[&signer, &mint],
            blockhash,
        );
        
        let signature = rpc_client.send_and_confirm_transaction(&transaction).expect("Failed to send transaction");

        println!(
            "Success! You've submitted your completion and minted the NFT!\nCheck out your TX here: https://explorer.solana.com/tx/{}/?cluster=devnet",
            signature
        );
    }
}