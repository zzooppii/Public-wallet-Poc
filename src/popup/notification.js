document.addEventListener('DOMContentLoaded', async () => {
    // Get transaction ID from URL params ?id=1
    const urlParams = new URLSearchParams(window.location.search);
    const txId = urlParams.get('id');

    if (!txId) {
        document.getElementById('tx-details').innerText = "Invalid Request";
        return;
    }

    // Fetch details from background
    const pendingTx = await chrome.runtime.sendMessage({ method: 'get_pending_tx', txId: txId });
    if (!pendingTx) {
        document.getElementById('tx-details').innerText = "Transaction not found or already processed.";
        return;
    }

    const { txParams, origin } = pendingTx;
    
    // Attempt to format value gracefully
    let valueEth = "0";
    try {
        if (txParams.value) {
            // value could be hex or decimal string
            let valNum;
            if (txParams.value.startsWith('0x')) {
                valNum = BigInt(txParams.value);
            } else {
                valNum = BigInt(txParams.value); // Usually ethers handles it
            }
            // For simple display, just use string parsing or roughly 1e18
            valueEth = (Number(valNum) / 1e18).toString();
        }
    } catch(e) { console.error(e); }

    document.getElementById('tx-details').innerHTML = `
        <p><strong>Origin:</strong> ${origin || 'Unknown UI'}</p>
        <p><strong>To:</strong> ${txParams.to}</p>
        <p><strong>Value:</strong> ${valueEth} ETH</p>
        <p><strong>Data:</strong> ${txParams.data ? txParams.data.slice(0, 15) + '...' : '0x'}</p>
    `;

    document.getElementById('btn-confirm').addEventListener('click', async () => {
        document.getElementById('btn-confirm').innerText = "Approving...";
        document.getElementById('btn-confirm').disabled = true;
        await chrome.runtime.sendMessage({ method: 'approve_tx', txId: txId });
        window.close();
    });

    document.getElementById('btn-reject').addEventListener('click', async () => {
        await chrome.runtime.sendMessage({ method: 'reject_tx', txId: txId });
        window.close();
    });
});
