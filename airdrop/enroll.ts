import {
    address,
    appendTransactionMessageInstructions,
    assertIsTransactionWithinSizeLimit,
    createKeyPairSignerFromBytes,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    createTransactionMessage,
    devnet,
    getSignatureFromTransaction,
    pipe,
    sendAndConfirmTransactionFactory,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners,
    addSignersToTransactionMessage,
    getProgramDerivedAddress,
    generateKeyPairSigner,
    getAddressEncoder
} from "@solana/kit";

import { getInitializeInstruction, getSubmitTsInstruction } from "./clients/js/src/generated/index";
import wallet from "./Turbin3-wallet.json";

// Program addresses
const MPL_CORE_PROGRAM = address("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");
const PROGRAM_ADDRESS = address("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM");
const SYSTEM_PROGRAM = address("11111111111111111111111111111111");

// The collection address (from section 5.4)
const COLLECTION = address("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2");

// Import keypair from the wallet file
const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
console.log(`Using Turbin3 wallet: ${keypair.address}`);

// Create a devnet connection
const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const rpcSubscriptions = createSolanaRpcSubscriptions(devnet('ws://api.devnet.solana.com'));

// Get address encoder for PDA creation
const addressEncoder = getAddressEncoder();

// Create the PDA for enrollment account
const accountSeeds = [
    Buffer.from("prereqs"),
    addressEncoder.encode(keypair.address)
];
const [account, _bump] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ADDRESS,
    seeds: accountSeeds
});
console.log(`Enrollment PDA account: ${account}`);

// THE MISSING PIECE: Create the authority PDA using collection address
// This is what was hinted at - we need to create another PDA for the authority
const authoritySeeds = [
    Buffer.from("collection"),
    addressEncoder.encode(COLLECTION)
];
const [authority, _authorityBump] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ADDRESS,
    seeds: authoritySeeds
});
console.log(`Authority PDA: ${authority}`);

// Generate mint keypair for the NFT
const mintKeyPair = await generateKeyPairSigner();
console.log(`Mint address: ${mintKeyPair.address}`);

// Setup transaction factory
const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ 
    rpc, 
    rpcSubscriptions 
});

// ============================================
// TRANSACTION 1: Initialize Account
// ============================================
console.log("\n=== Step 1: Initialize Account ===");

const initializeIx = getInitializeInstruction({
    github: "BROCODES2024", // Your GitHub handle
    user: keypair,
    account,
    systemProgram: SYSTEM_PROGRAM
});

// Fetch latest blockhash
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const transactionMessageInit = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayerSigner(keypair, tx),
    tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    tx => appendTransactionMessageInstructions([initializeIx], tx)
);

const signedTxInit = await signTransactionMessageWithSigners(transactionMessageInit);
assertIsTransactionWithinSizeLimit(signedTxInit);

try {
    const result = await sendAndConfirmTransaction(
        signedTxInit,
        { commitment: 'confirmed', skipPreflight: false }
    );
    console.log("Initialize transaction result:", result);
    const signatureInit = getSignatureFromTransaction(signedTxInit);
    console.log(`✅ Initialize Success! TX: https://explorer.solana.com/tx/${signatureInit}?cluster=devnet`);
} catch (e: any) {
    if (e.message?.includes("already in use") || e.message?.includes("custom program error: 0x0")) {
        console.log("⚠️ Account already initialized, continuing to submit...");
    } else {
        console.error(`❌ Initialize failed: ${e}`);
        throw e;
    }
}

// Wait a bit between transactions
await new Promise(resolve => setTimeout(resolve, 2000));

// ============================================
// TRANSACTION 2: Submit TypeScript Completion
// ============================================
console.log("\n=== Step 2: Submit TypeScript Completion ===");

// Get fresh blockhash for second transaction
const { value: latestBlockhash2 } = await rpc.getLatestBlockhash().send();

const submitIx = getSubmitTsInstruction({
    user: keypair,
    account,
    mint: mintKeyPair,
    collection: COLLECTION,
    authority, // The missing authority PDA we created above
    mplCoreProgram: MPL_CORE_PROGRAM,
    systemProgram: SYSTEM_PROGRAM
});

const transactionMessageSubmit = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayerSigner(keypair, tx),
    tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash2, tx),
    tx => appendTransactionMessageInstructions([submitIx], tx),
    tx => addSignersToTransactionMessage([mintKeyPair], tx) // Add mint as additional signer
);

const signedTxSubmit = await signTransactionMessageWithSigners(transactionMessageSubmit);
assertIsTransactionWithinSizeLimit(signedTxSubmit);

try {
    await sendAndConfirmTransaction(
        signedTxSubmit,
        { commitment: 'confirmed', skipPreflight: false }
    );
    const signatureSubmit = getSignatureFromTransaction(signedTxSubmit);
    console.log(`✅ Submit TypeScript Success! TX: https://explorer.solana.com/tx/${signatureSubmit}?cluster=devnet`);
    console.log("\n🎉 Congratulations! You have completed the Turbin3 Solana Pre-requisite TypeScript coursework!");
    console.log(`Your NFT was minted at: ${mintKeyPair.address}`);
} catch (e: any) {
    if (e.message?.includes("custom program error: 0x1771")) {
        console.log("⚠️ TypeScript submission already completed!");
    } else {
        console.error(`❌ Submit failed: ${e}`);
        throw e;
    }
}