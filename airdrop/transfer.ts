import {
  address,
  appendTransactionMessageInstructions,
  assertIsTransactionWithinSizeLimit,
  compileTransaction,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  devnet,
  getSignatureFromTransaction,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type TransactionMessageBytesBase64,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";

import wallet from "./dev-wallet.json";

const DESTINATION_WALLET = address(
  "FBXu8FgtrpR5DXYdqhPD3Jp4Zar24fRLh5N2fEPTDwfH"
);

const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const rpcSubscriptions = createSolanaRpcSubscriptions(
  devnet("ws://api.devnet.solana.com")
);

// --- New Fee Calculation Logic ---

// 1. Get the wallet's balance
const { value: balance } = await rpc.getBalance(keypair.address).send();

// 2. Get the latest blockhash
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

// 3. Build a dummy transaction to calculate the fee
const dummyTransferInstruction = getTransferSolInstruction({
  source: keypair,
  destination: DESTINATION_WALLET,
  amount: lamports(0n), // Use 0 amount for fee calculation
});

const dummyTransactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([dummyTransferInstruction], tx)
);

// 4. Compile the dummy transaction and get the fee from the RPC
const compiledDummy = compileTransaction(dummyTransactionMessage);
const dummyMessageBase64 = Buffer.from(compiledDummy.messageBytes).toString(
  "base64"
) as TransactionMessageBytesBase64;
const { value: fee } = await rpc.getFeeForMessage(dummyMessageBase64).send();

if (fee === null) {
  throw new Error("Unable to calculate transaction fee");
}
if (balance < fee) {
  throw new Error(
    `Insufficient balance to cover transaction fee. Balance: ${balance}, Fee: ${fee}`
  );
}

// 5. Calculate the exact amount to send (balance - fee)
const sendAmount = balance - fee;

// --- End of New Logic ---

// Build the REAL transaction with the calculated amount
const transferInstruction = getTransferSolInstruction({
  source: keypair,
  destination: DESTINATION_WALLET,
  amount: lamports(sendAmount),
});

const transactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([transferInstruction], tx)
);

const signedTransaction = await signTransactionMessageWithSigners(
  transactionMessage
);

assertIsTransactionWithinSizeLimit(signedTransaction);
const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
  rpc,
  rpcSubscriptions,
});

try {
  await sendAndConfirmTransaction(signedTransaction, {
    commitment: "confirmed",
  });
  const signature = getSignatureFromTransaction(signedTransaction);
  console.log(
    `Success! Check out your TX here: https://explorer.solana.com/tx/${signature}?cluster=devnet`
  );
} catch (e) {
  console.error("Transfer failed:", e);
}
