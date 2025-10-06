import bs58 from 'bs58';
import prompt from 'prompt-sync';
import fs from 'fs';

const wallet = JSON.parse(fs.readFileSync('./dev-wallet.json', 'utf-8'));

function walletToBase58() {
    const fullKeypairBytes = new Uint8Array(wallet);
    const base58PrivateKey = bs58.encode(fullKeypairBytes);
    console.log('Your Phantom-compatible private key:', base58PrivateKey);
}

function base58ToWallet() {
    const p = prompt();
    const base58PrivateKey = p('Enter your base58 private key:');
    if (!base58PrivateKey) {
        console.log('No key entered.');
        return;
    }
    const walletBytes = bs58.decode(base58PrivateKey);
    console.log('Your key in byte array format:', `[${walletBytes}]`);
}

const command = process.argv[2];
if (command === 'to-base58') {
    walletToBase58();
} else if (command === 'to-bytes') {
    base58ToWallet();
} else {
    console.log('Invalid command. Use "to-base58" or "to-bytes"');
}