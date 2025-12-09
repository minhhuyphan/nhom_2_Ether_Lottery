// Lottery dApp - Web3 Integration
let web3;
let contract;
let userAccount;
let isAdmin = false;

// Contract Configuration
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE"; // Replace with deployed contract
const CONTRACT_ABI = [
  // Add your contract ABI here after deployment
];

// ETH to USD conversion rate (update from API in production)
let ethToUsd = 2000;

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
  loadTheme();
  setupEventListeners();
  checkWalletConnection();

  // Check if MetaMask is installed
  if (typeof window.ethereum !== "undefined") {
    web3 = new Web3(window.ethereum);
    console.log("MetaMask detected!");
  } else {
    showToast("Please install MetaMask to use this dApp", "error");
  }
});

// Event Listeners
function setupEventListeners() {
  const connectBtn = document.getElementById("connect-wallet-btn");
  const enterBtn = document.getElementById("enter-lottery-btn");
  const pickWinnerBtn = document.getElementById("pick-winner-btn");

  if (connectBtn) {
    connectBtn.addEventListener("click", connectWallet);
  }

  if (enterBtn) {
    enterBtn.addEventListener("click", enterLottery);
  }

  if (pickWinnerBtn) {
    pickWinnerBtn.addEventListener("click", pickWinner);
  }
}

// Connect Wallet
async function connectWallet() {
  // Redirect to connect page
  window.location.href = "../html/connect.html";
}

// Handle Account Change
function handleAccountChange(accounts) {
  if (accounts.length === 0) {
    showToast("Please connect to MetaMask", "error");
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletAddress");
    window.location.reload();
  } else if (accounts[0] !== userAccount) {
    userAccount = accounts[0];
    localStorage.setItem("walletAddress", userAccount);
    window.location.reload();
  }
}

// Check Wallet Connection
async function checkWalletConnection() {
  const walletConnected = localStorage.getItem("walletConnected");
  const walletAddress = localStorage.getItem("walletAddress");

  if (walletConnected === "true" && walletAddress) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0 && accounts[0] === walletAddress) {
        userAccount = walletAddress;

        // Update UI
        const walletStatus = document.getElementById("wallet-status");
        if (walletStatus) {
          walletStatus.innerHTML = `
            <span>${formatAddress(userAccount)}</span>
            <span id="user-balance">0.00 ETH</span>
          `;
        }

        // Initialize contract
        if (CONTRACT_ADDRESS !== "YOUR_CONTRACT_ADDRESS_HERE") {
          contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
          await loadContractData();
        }

        // Get user balance
        getUserBalance();

        // Listen for changes
        window.ethereum.on("accountsChanged", handleAccountChange);
        window.ethereum.on("chainChanged", () => window.location.reload());
      } else {
        localStorage.removeItem("walletConnected");
        localStorage.removeItem("walletAddress");
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  }
}

// Load Contract Data
async function loadContractData() {
  try {
    // Get prize pool
    const balance = await web3.eth.getBalance(CONTRACT_ADDRESS);
    const balanceInEth = web3.utils.fromWei(balance, "ether");

    document.getElementById("prize-pool-eth").textContent =
      parseFloat(balanceInEth).toFixed(4);
    document.getElementById("prize-pool-usd").textContent = `~ $${(
      parseFloat(balanceInEth) * ethToUsd
    ).toFixed(2)} USD`;

    // Get players
    const players = await contract.methods.getPlayers().call();
    displayPlayers(players);

    // Get entrance fee
    const entranceFee = await contract.methods.entranceFee().call();
    const feeInEth = web3.utils.fromWei(entranceFee, "ether");
    document.getElementById("ticket-price").textContent = `${feeInEth} ETH`;

    // Calculate win chance
    const playerCount = players.length;
    document.getElementById("total-players").textContent = playerCount;
    document.getElementById("win-chance").textContent =
      playerCount > 0 ? `1/${playerCount}` : "Be the first!";
  } catch (error) {
    console.error("Error loading contract data:", error);
    showToast("Error loading lottery data", "error");
  }
}

// Display Players
function displayPlayers(players) {
  const playersList = document.getElementById("players-list");
  const noPlayers = document.getElementById("no-players");
  const playersCount = document.getElementById("players-count");

  playersCount.textContent = players.length;

  if (players.length === 0) {
    playersList.innerHTML = "";
    noPlayers.classList.remove("hidden");
  } else {
    noPlayers.classList.add("hidden");
    playersList.innerHTML = players
      .map(
        (address, index) => `
      <li class="player-item ${
        address.toLowerCase() === userAccount?.toLowerCase() ? "is-you" : ""
      }">
        <span class="player-icon">🦊</span>
        <span class="player-address">${formatAddress(address)}</span>
        ${
          address.toLowerCase() === userAccount?.toLowerCase()
            ? '<span class="you-badge">You</span>'
            : ""
        }
        ${
          index === players.length - 1
            ? '<span class="new-badge">New</span>'
            : ""
        }
      </li>
    `
      )
      .join("");
  }
}

// Enter Lottery
async function enterLottery() {
  if (!userAccount) {
    showToast("Please connect your wallet first", "error");
    return;
  }

  try {
    const btn = document.getElementById("enter-lottery-btn");
    const btnText = btn.querySelector(".btn-text");
    const btnLoading = btn.querySelector(".btn-loading");

    btnText.classList.add("hidden");
    btnLoading.classList.remove("hidden");
    btn.disabled = true;

    showToast("Transaction pending... Please confirm in MetaMask", "pending");

    const entranceFee = await contract.methods.entranceFee().call();

    await contract.methods.enter().send({
      from: userAccount,
      value: entranceFee,
      gas: 300000,
    });

    showToast("🎉 You entered the lottery successfully!", "success");

    // Reload data
    await loadContractData();
  } catch (error) {
    console.error("Enter lottery error:", error);
    if (error.code === 4001) {
      showToast("Transaction rejected by user", "error");
    } else {
      showToast("Failed to enter lottery: " + error.message, "error");
    }
  } finally {
    const btn = document.getElementById("enter-lottery-btn");
    const btnText = btn.querySelector(".btn-text");
    const btnLoading = btn.querySelector(".btn-loading");

    btnText.classList.remove("hidden");
    btnLoading.classList.add("hidden");
    btn.disabled = false;
  }
}

// Check if Admin
async function checkIfAdmin() {
  try {
    const manager = await contract.methods.manager().call();
    isAdmin = manager.toLowerCase() === userAccount.toLowerCase();

    if (isAdmin) {
      document.getElementById("admin-panel").classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error checking admin:", error);
  }
}

// Pick Winner (Admin only)
async function pickWinner() {
  if (!isAdmin) {
    showToast("Only contract owner can pick winner", "error");
    return;
  }

  if (
    !confirm(
      "Are you sure you want to pick a winner? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const btn = document.getElementById("pick-winner-btn");
    const btnText = btn.querySelector(".btn-text");
    const btnLoading = btn.querySelector(".btn-loading");

    btnText.classList.add("hidden");
    btnLoading.classList.remove("hidden");
    btn.disabled = true;

    showToast("Picking winner... Please wait", "pending");

    const receipt = await contract.methods.pickWinner().send({
      from: userAccount,
      gas: 500000,
    });

    // Get winner from event logs
    const winnerEvent = receipt.events.WinnerPicked;
    const winner = winnerEvent.returnValues.winner;
    const amount = web3.utils.fromWei(winnerEvent.returnValues.amount, "ether");

    showToast(
      `🏆 Winner: ${formatAddress(winner)} won ${amount} ETH!`,
      "success"
    );

    // Reload data
    await loadContractData();
  } catch (error) {
    console.error("Pick winner error:", error);
    showToast("Failed to pick winner: " + error.message, "error");
  } finally {
    const btn = document.getElementById("pick-winner-btn");
    const btnText = btn.querySelector(".btn-text");
    const btnLoading = btn.querySelector(".btn-loading");

    btnText.classList.remove("hidden");
    btnLoading.classList.add("hidden");
    btn.disabled = false;
  }
}

// Get User Balance
async function getUserBalance() {
  try {
    const balance = await web3.eth.getBalance(userAccount);
    const balanceInEth = web3.utils.fromWei(balance, "ether");
    document.getElementById("user-balance").textContent = `${parseFloat(
      balanceInEth
    ).toFixed(4)} ETH`;
  } catch (error) {
    console.error("Error getting balance:", error);
  }
}

// Utility Functions
function formatAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(38)}`;
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");

  const icons = {
    success: "✅",
    error: "❌",
    pending: "⏳",
    info: "ℹ️",
  };

  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 5000);
}

// Theme Management
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);

  const savedFontSize = localStorage.getItem("fontSize") || "medium";
  applyFontSize(savedFontSize);
}

function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === "light") {
    root.style.setProperty("--bg-main", "#FFFFFF");
    root.style.setProperty("--bg-card", "#F9FAFB");
    root.style.setProperty("--text-dark", "#111827");
    root.style.setProperty("--text-gray", "#6B7280");
  } else {
    root.style.setProperty("--bg-main", "#0A0A0A");
    root.style.setProperty("--bg-card", "#1A1A1A");
    root.style.setProperty("--text-dark", "#FFFFFF");
    root.style.setProperty("--text-gray", "#9CA3AF");
  }
}

function applyFontSize(size) {
  const root = document.documentElement;
  const body = document.body;

  switch (size) {
    case "small":
      root.style.fontSize = "14px";
      body.style.transform = "scale(0.875)";
      body.style.transformOrigin = "top center";
      break;
    case "medium":
      root.style.fontSize = "16px";
      body.style.transform = "scale(1)";
      body.style.transformOrigin = "top center";
      break;
    case "large":
      root.style.fontSize = "18px";
      body.style.transform = "scale(1.125)";
      body.style.transformOrigin = "top center";
      break;
    default:
      root.style.fontSize = "16px";
      body.style.transform = "scale(1)";
      body.style.transformOrigin = "top center";
  }
}
