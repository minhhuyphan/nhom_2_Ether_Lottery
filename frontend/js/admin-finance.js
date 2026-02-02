// Admin Finance Page
// API_BASE_URL is defined in lottery.js, no need to redeclare

async function loadFinanceData() {
  try {
    // First, display wallet address from localStorage
    const walletAddress = localStorage.getItem("walletAddress");
    if (walletAddress) {
      const addressEl = document.getElementById("admin-wallet-address");
      if (addressEl) {
        addressEl.textContent = walletAddress;
      }
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No auth token, loading from Web3 only");
      loadWeb3Finance();
      return;
    }

    // Fetch finance stats from backend
    const response = await fetch(
      `${API_BASE_URL}/lottery/admin/finance-stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      updateFinanceDisplay(data.data);
      loadWeb3Finance(); // Also get live balance from Web3
    } else {
      loadWeb3Finance();
    }
  } catch (error) {
    console.error("Error loading finance data:", error);
    loadWeb3Finance();
  }
}

async function loadWeb3Finance() {
  try {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const adminAddress = accounts[0];
        const addressEl = document.getElementById("admin-wallet-address");
        if (addressEl) {
          addressEl.textContent = adminAddress;
        }

        // Get balance
        const balance = await web3.eth.getBalance(adminAddress);
        const balanceInEth = web3.utils.fromWei(balance, "ether");
        const balanceText = parseFloat(balanceInEth).toFixed(4) + " ETH";
        const balanceEl = document.getElementById("admin-balance");
        if (balanceEl) {
          balanceEl.textContent = balanceText;
        }
      }
    }
  } catch (error) {
    console.error("Error loading Web3 finance data:", error);
  }
}

function updateFinanceDisplay(stats) {
  // Update total revenue/income
  if (stats.totalRevenue) {
    const revenue = parseFloat(stats.totalRevenue).toFixed(4);
    const totalIncomeEl = document.getElementById("total-income");
    if (totalIncomeEl) {
      totalIncomeEl.textContent = revenue + " ETH";
    }
  }

  // Update prize pool
  if (stats.prizePool) {
    const pool = parseFloat(stats.prizePool).toFixed(4);
    const prizePoolEl = document.getElementById("prize-pool");
    if (prizePoolEl) {
      prizePoolEl.textContent = pool + " ETH";
    }
  }

  // Update total distributed
  if (stats.totalPrizeDistributed) {
    const distributed = parseFloat(stats.totalPrizeDistributed).toFixed(4);
    const totalDistributedEl = document.getElementById("total-distributed");
    if (totalDistributedEl) {
      totalDistributedEl.textContent = distributed + " ETH";
    }
  }

  // Update transaction count
  if (stats.transactionCount) {
    const txCountEl = document.getElementById("transaction-count");
    if (txCountEl) {
      txCountEl.textContent = stats.transactionCount;
    }
  }

  // Update pending transactions
  if (stats.pendingTransactions) {
    const pendingEl = document.getElementById("pending-transactions");
    if (pendingEl) {
      pendingEl.textContent = stats.pendingTransactions;
    }
  }
}

async function loadTransactionHistory() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No auth token, cannot load transactions");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/lottery/admin/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.data) {
      displayTransactions(data.data);
    }
  } catch (error) {
    console.error("Error loading transactions:", error);
  }
}

function displayTransactions(transactions) {
  const container = document.getElementById("transactions-container");
  if (!container) return;

  container.innerHTML = transactions
    .map(
      (tx) => `
    <div class="transaction-item">
      <div class="tx-info">
        <div class="tx-type">${tx.type || "Transfer"}</div>
        <div class="tx-hash">${tx.hash?.substring(0, 10) || "Unknown"}...</div>
      </div>
      <div class="tx-amount">${parseFloat(tx.amount || 0).toFixed(4)} ETH</div>
      <div class="tx-date">${new Date(tx.timestamp).toLocaleDateString()}</div>
    </div>
  `,
    )
    .join("");
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadFinanceData();
  loadTransactionHistory();

  // Refresh data every 30 seconds
  setInterval(() => {
    loadFinanceData();
    loadTransactionHistory();
  }, 30000);
});
