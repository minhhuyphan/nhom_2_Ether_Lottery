// Admin History Page
// API_BASE_URL is defined in lottery.js, no need to redeclare

async function loadHistoryData() {
  try {
    // First, display wallet address from localStorage
    const walletAddress = localStorage.getItem("walletAddress");
    if (walletAddress) {
      const addressEl = document.getElementById("admin-wallet-address");
      if (addressEl) {
        addressEl.textContent = walletAddress;
      }
    }

    // Get balance from Web3
    loadWeb3Balance();

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No auth token, using default data from localStorage");
      loadLocalStorageData();
      return;
    }

    // Fetch admin stats from backend
    const response = await fetch(`${API_BASE_URL}/lottery/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      updateHistoryDisplay(data.data);
    } else {
      loadLocalStorageData();
    }
  } catch (error) {
    console.error("Error loading history data:", error);
    loadLocalStorageData();
  }
}

async function loadWeb3Balance() {
  try {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const balance = await web3.eth.getBalance(accounts[0]);
        const balanceInEth = web3.utils.fromWei(balance, "ether");
        const balanceText = parseFloat(balanceInEth).toFixed(4) + " ETH";
        const balanceEl = document.getElementById("admin-balance");
        if (balanceEl) {
          balanceEl.textContent = balanceText;
        }
      }
    }
  } catch (error) {
    console.error("Error loading Web3 balance:", error);
  }
}

function loadLocalStorageData() {
  const historyStats = JSON.parse(
    localStorage.getItem("historyStats") ||
      '{"winnersPicked":42,"newPlayers":156,"lotteriesCreated":43,"ticketsSold":987}',
  );

  document.getElementById("total-winners-picked").textContent =
    historyStats.winnersPicked || 0;
  document.getElementById("total-new-players").textContent =
    historyStats.newPlayers || 0;
  document.getElementById("total-lotteries-created").textContent =
    historyStats.lotteriesCreated || 0;
  document.getElementById("total-tickets-sold").textContent =
    historyStats.ticketsSold || 0;
}

function updateHistoryDisplay(stats) {
  document.getElementById("total-winners-picked").textContent =
    stats.winnersCount || 0;
  document.getElementById("total-new-players").textContent =
    stats.totalPlayers || 0;
  document.getElementById("total-lotteries-created").textContent =
    stats.totalDraws || 0;
  document.getElementById("total-tickets-sold").textContent =
    stats.totalTickets || 0;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadHistoryData();
  // Refresh data every 30 seconds
  setInterval(loadHistoryData, 30000);
});
