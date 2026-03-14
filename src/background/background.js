import { ethers } from 'ethers';

// RPC URL - Sepolia (Safety first for development)
const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const provider = new ethers.JsonRpcProvider(RPC_URL);

let wallet = null;

/**
 * Securely store the private key (simulated encryption for PoC)
 * @param {string} privateKey - The raw private key string
 * @param {string} password - The user's wallet password
 * @returns {Promise<{success: boolean, address?: string, error?: string}>}
 */
async function saveWallet(privateKey, password) {
    try {
        // In a real app, use a proper KDF (like Scrypt) to derive a key from the password
        // and encrypt the private key. For this PoC, we'll store it simply but mark for improvement.
        const newWallet = new ethers.Wallet(privateKey, provider);
        await chrome.storage.local.set({ 
            encryptedVault: privateKey, // PLACEHOLDER: Should be encrypted
            address: newWallet.address 
        });
        wallet = newWallet;
        return { success: true, address: newWallet.address };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

async function loadWallet() {
    const data = await chrome.storage.local.get(['encryptedVault']);
    if (data.encryptedVault) {
        wallet = new ethers.Wallet(data.encryptedVault, provider);
        return wallet.address;
    }
    return null;
}

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background received request:", request.method);

    if (request.method === 'eth_requestAccounts' || request.method === 'eth_accounts') {
        loadWallet().then(address => {
            sendResponse({ result: address ? [address] : [] });
        });
        return true;
    }

    if (request.method === 'eth_sendTransaction') {
        const txParams = request.params[0];
        handleTransaction(txParams).then(sendResponse);
        return true;
    }

    if (request.method === 'import_wallet') {
        saveWallet(request.privateKey, request.password).then(sendResponse);
        return true;
    }
    
    if (request.method === 'get_balance') {
        getWalletBalance().then(sendResponse);
        return true;
    }
});

async function getWalletBalance() {
    const address = await loadWallet();
    if (!address) return { error: "No wallet imported" };
    const balance = await provider.getBalance(address);
    return { result: ethers.formatEther(balance) };
}

async function handleTransaction(txParams) {
    if (!wallet) return { error: "Wallet not unlocked" };

    try {
        // User provided Gwei from popup
        const maxFeePerGas = ethers.parseUnits(txParams.maxFeePerGas || "2", "gwei");
        const maxPriorityFeePerGas = ethers.parseUnits(txParams.maxPriorityFeePerGas || "1", "gwei");

        const tx = {
            to: txParams.to,
            value: ethers.parseEther(txParams.value || "0"),
            maxFeePerGas,
            maxPriorityFeePerGas,
            type: 2, // EIP-1559
        };

        const response = await wallet.sendTransaction(tx);
        console.log("Transaction sent:", response.hash);
        return { result: response.hash };
    } catch (e) {
        console.error("Transaction failed:", e);
        return { error: e.message };
    }
}
