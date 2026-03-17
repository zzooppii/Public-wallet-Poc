document.addEventListener('DOMContentLoaded', async () => {
    const setupView = document.getElementById('setup-view');
    const mainView = document.getElementById('main-view');
    const addressDisplay = document.getElementById('address-display');
    const balanceDisplay = document.getElementById('balance-display');

    // Initial check
    const response = await chrome.runtime.sendMessage({ method: 'eth_accounts' });
    if (response && response.result && response.result.length > 0) {
        showMainView(response.result[0]);
    } else {
        setupView.classList.remove('hidden');
    }

    // Import Logic
    document.getElementById('import-btn').addEventListener('click', async () => {
        const privateKey = document.getElementById('private-key-input').value.trim();
        if (!privateKey) {
            alert("Please enter a private key or mnemonic phrase.");
            return;
        }
        
        const res = await chrome.runtime.sendMessage({ 
            method: 'import_wallet', 
            privateKey: privateKey,
            password: 'demo-password' // Simplified for PoC
        });

        if (res.success) {
            showMainView(res.address);
        } else {
            alert("Import failed: " + res.error);
        }
    });

    document.getElementById('create-btn').addEventListener('click', async () => {
        const res = await chrome.runtime.sendMessage({ method: 'generate_wallet' });
        if (res.success) {
            document.getElementById('mnemonic-display').classList.remove('hidden');
            document.getElementById('mnemonic-text').innerText = res.mnemonic;
            
            // Wait 5 seconds to let them copy before redirecting to main view for PoC sake
            const btn = document.getElementById('create-btn');
            btn.innerText = "Wallet Created!";
            btn.disabled = true;
            
            setTimeout(() => {
                showMainView(res.address);
            }, 8000);
        } else {
            alert("Creation failed: " + res.error);
        }
    });

    // Send Logic
    document.getElementById('submit-send-btn').addEventListener('click', async () => {
        const to = document.getElementById('to-input').value;
        const value = document.getElementById('amount-input').value;
        const maxFeePerGas = document.getElementById('max-fee-input').value;
        const maxPriorityFeePerGas = document.getElementById('priority-fee-input').value;

        if (!to || !value) {
            alert("Fill in all fields");
            return;
        }

        const res = await chrome.runtime.sendMessage({
            method: 'eth_sendTransaction',
            params: [{
                to,
                value,
                maxFeePerGas,
                maxPriorityFeePerGas
            }]
        });

        if (res.error) {
            alert("Transaction failed: " + res.error);
        } else {
            alert("Transaction sent! Hash: " + res.result);
        }
    });

    async function showMainView(address) {
        setupView.classList.add('hidden');
        mainView.classList.remove('hidden');
        addressDisplay.innerText = address;
        
        // Load balance
        const balRes = await chrome.runtime.sendMessage({ method: 'get_balance' });
        if (balRes.result) {
            balanceDisplay.innerText = `${parseFloat(balRes.result).toFixed(4)} ETH`;
        }
    }
});
