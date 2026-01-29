// Lottery dApp - Web3 Integration
let web3;
let contract;
let userAccount;
let isAdmin = false;

// Contract Configuration - DEPLOYED ON SEPOLIA
const CONTRACT_ADDRESS = "0x327F9548dC8599c634598f4a1b538C6351CfB22f"; // Sepolia Testnet
const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "PlayerEntered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "WinnerPicked",
    type: "event",
  },
  {
    inputs: [],
    name: "enter",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "entranceFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPlayers",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "manager",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pickWinner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256",
      },
    ],
    name: "setEntranceFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Sepolia Testnet Config (Ethereum)
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111
const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: "Sepolia Testnet",
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/demo"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

// ETH to USD conversion rate (update from API in production)
let ethToUsd = 2000;

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
  loadTheme();
  setupEventListeners();

  // Check if MetaMask is installed
  if (typeof window.ethereum !== "undefined") {
    web3 = new Web3(window.ethereum);

    // Check and switch to Sepolia network
    await ensureSepoliaNetwork();

    // Then check wallet connection
    await checkWalletConnection();
  } else {
    showToast("Vui lòng cài đặt MetaMask để sử dụng dApp", "error");
  }
});

// Ensure connected to Sepolia network
async function ensureSepoliaNetwork() {
  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    if (chainId !== SEPOLIA_CHAIN_ID) {
      console.log("Switching to Sepolia testnet...");
      await switchToSepoliaNetwork();
    } else {
      console.log("Already on Sepolia testnet");
      updateNetworkDisplay("Sepolia Testnet");
    }
  } catch (error) {
    console.error("Error checking network:", error);
  }
}

// Switch to Sepolia network
async function switchToSepoliaNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
    console.log("✅ Switched to Sepolia testnet");
    updateNetworkDisplay("Sepolia Testnet");
  } catch (error) {
    // If network not added, add it
    if (error.code === 4902) {
      await addSepoliaNetwork();
    } else {
      console.error("Error switching network:", error);
      showToast("Vui lòng chuyển sang Sepolia Testnet trong MetaMask", "error");
    }
  }
}

// Add Sepolia network to MetaMask
async function addSepoliaNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [SEPOLIA_NETWORK],
    });
    console.log("✅ Sepolia network added");
    updateNetworkDisplay("Sepolia Testnet");
  } catch (error) {
    console.error("Error adding network:", error);
    showToast("Không thể thêm Sepolia network", "error");
  }
}

// Update network display
function updateNetworkDisplay(networkName) {
  const networkElement = document.getElementById("network-name");
  if (networkElement) {
    networkElement.textContent = networkName;
  }
}

// Event Listeners
function setupEventListeners() {
  const connectBtn = document.getElementById("connect-wallet-btn");
  const enterBtn = document.getElementById("enter-lottery-btn");
  const pickWinnerBtn = document.getElementById("pick-winner-btn");
  const randomBtn = document.getElementById("random-number-btn");
  const numberInputs = document.querySelectorAll(".number-input");

  if (connectBtn) {
    connectBtn.addEventListener("click", connectWallet);
  }

  if (enterBtn) {
    enterBtn.addEventListener("click", enterLottery);
  }

  if (pickWinnerBtn) {
    pickWinnerBtn.addEventListener("click", pickWinner);
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", generateRandomNumber);
  }

  // Auto-focus next input
  numberInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;

      // Only allow numbers
      if (!/^\d$/.test(value) && value !== "") {
        e.target.value = "";
        return;
      }

      // Update selected number display
      updateSelectedNumber();

      // Auto focus next input
      if (value && index < numberInputs.length - 1) {
        numberInputs[index + 1].focus();
      }
    });

    // Handle backspace to go to previous input
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        numberInputs[index - 1].focus();
      }
    });
  });
}

// Generate Random Number
function generateRandomNumber() {
  const numberInputs = document.querySelectorAll(".number-input");
  numberInputs.forEach((input) => {
    input.value = Math.floor(Math.random() * 10);
  });
  updateSelectedNumber();
  showToast("Đã chọn số ngẫu nhiên!", "success");
}

// Update Selected Number Display
function updateSelectedNumber() {
  const numberInputs = document.querySelectorAll(".number-input");
  const selectedNumberDisplay = document.getElementById("selected-number");

  let number = "";
  numberInputs.forEach((input) => {
    number += input.value || "-";
  });

  if (selectedNumberDisplay) {
    selectedNumberDisplay.textContent = number;
  }

  return number.replace(/-/g, "");
}

// Get Selected Number
function getSelectedNumber() {
  const number = updateSelectedNumber();

  // Check if all 6 digits are filled
  if (number.length !== 6) {
    return null;
  }

  return number;
}

// Connect Wallet
async function connectWallet() {
  // Ensure on Sepolia network first
  await ensureSepoliaNetwork();

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
    const token = localStorage.getItem("authToken");

    // Get prize pool from API (from database)
    const statsResponse = await fetch(
      "http://localhost:5000/api/lottery/admin/stats",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      if (statsData.success) {
        const totalRevenue = statsData.data.totalRevenue;
        document.getElementById("prize-pool-eth").textContent =
          parseFloat(totalRevenue).toFixed(4);
        document.getElementById("prize-pool-usd").textContent = `~ $${(
          parseFloat(totalRevenue) * ethToUsd
        ).toFixed(2)} USD`;
      }
    }

    // Get players from API
    const playersResponse = await fetch(
      "http://localhost:5000/api/lottery/admin/recent-players?limit=20",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (playersResponse.ok) {
      const playersData = await playersResponse.json();
      if (playersData.success) {
        displayPlayers(playersData.data);
        document.getElementById("total-players").textContent =
          playersData.data.length;
        document.getElementById("win-chance").textContent =
          playersData.data.length > 0
            ? `1/${playersData.data.length}`
            : "Be the first!";
      }
    }

    // Get ticket price (could be from API or hardcoded)
    document.getElementById("ticket-price").textContent = "0.001 ETH";
  } catch (error) {
    console.error("Error loading lottery data:", error);
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
    `,
      )
      .join("");
  }
}

// Enter Lottery
async function enterLottery() {
  if (!userAccount) {
    showToast("Vui lòng kết nối ví trước", "error");
    return;
  }

  // Check if number is selected
  const selectedNumber = getSelectedNumber();
  if (!selectedNumber) {
    showToast("Vui lòng chọn đủ 6 chữ số!", "error");
    return;
  }

  try {
    const btn = document.getElementById("enter-lottery-btn");
    const btnText = btn.querySelector(".btn-text");
    const btnLoading = btn.querySelector(".btn-loading");

    btnText.classList.add("hidden");
    btnLoading.classList.remove("hidden");
    btn.disabled = true;

    showToast(
      "Đang xử lý giao dịch... Vui lòng xác nhận trong MetaMask",
      "pending",
    );

    const entranceFee = await contract.methods.entranceFee().call();

    // Fallback: nếu entranceFee là 0 hoặc không hợp lệ, set mặc định 0.001 ETH
    const actualFee =
      entranceFee && entranceFee > 0
        ? entranceFee
        : web3.utils.toWei("0.001", "ether");
    const amountInEther = web3.utils.fromWei(actualFee, "ether");

    // Send blockchain transaction
    const receipt = await contract.methods.enter().send({
      from: userAccount,
      value: actualFee,
      gas: 300000,
    });

    // Save ticket to backend
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const response = await fetch(
          "http://localhost:5000/api/lottery/buy-ticket",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ticketNumber: selectedNumber,
              walletAddress: userAccount,
              transactionHash: receipt.transactionHash,
              amount: parseFloat(amountInEther),
            }),
          },
        );

        const data = await response.json();
        if (!data.success) {
          console.error("Failed to save ticket:", data.message);
        }
      }
    } catch (saveError) {
      console.error("Error saving ticket to backend:", saveError);
      // Don't show error to user since blockchain transaction succeeded
    }

    showToast(`🎉 Mua vé thành công! Số của bạn: ${selectedNumber}`, "success");

    // Clear number inputs
    document
      .querySelectorAll(".number-input")
      .forEach((input) => (input.value = ""));
    updateSelectedNumber();

    // Reload data
    await loadContractData();
  } catch (error) {
    console.error("Enter lottery error:", error);
    if (error.code === 4001) {
      showToast("Giao dịch bị từ chối", "error");
    } else {
      showToast("Mua vé thất bại: " + error.message, "error");
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
      "Are you sure you want to pick a winner? This action cannot be undone.",
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
      "success",
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
      balanceInEth,
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
