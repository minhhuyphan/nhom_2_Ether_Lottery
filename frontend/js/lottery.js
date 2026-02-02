// Lottery dApp - Web3 Integration
let web3;
let contract;
let userAccount;
let isAdmin = false;

// API Configuration
const API_BASE_URL = "http://localhost:5000/api";

// Contract Configuration - DEPLOYED ON SEPOLIA
const CONTRACT_ADDRESS = "0x5071BEBdB4a86090E81A7e950A6370AF889512F8"; // Sepolia Testnet
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawAll",
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

  // Load public data FIRST (không cần MetaMask)
  await loadContractData();
  await loadLatestDrawResults(); // Load draw results

  // Auto refresh draw results every 30 seconds
  setInterval(async () => {
    await loadLatestDrawResults();
  }, 30000); // 30 giây

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
  console.log("🔄 loadContractData() CALLED - Loading public lottery info...");
  try {
    // Get prize pool from PUBLIC API (không cần token)
    const apiUrl = "http://localhost:5000/api/lottery/public-info";
    console.log("📡 Fetching:", apiUrl);

    const publicResponse = await fetch(apiUrl);
    console.log(
      "📥 Response status:",
      publicResponse.status,
      publicResponse.ok ? "OK" : "FAILED",
    );

    if (publicResponse.ok) {
      const publicData = await publicResponse.json();
      console.log("📊 Public lottery info:", publicData);

      if (publicData.success) {
        const prizePool = publicData.data.prizePool;
        const totalPlayers = publicData.data.totalPlayers;
        const totalTickets = publicData.data.totalTickets;
        const players = publicData.data.players || [];

        console.log("💰 Prize Pool:", prizePool, "ETH");
        console.log("👥 Total Players:", totalPlayers);
        console.log("🎫 Total Tickets:", totalTickets);
        console.log("🦊 Players:", players);

        // Cập nhật prize pool
        const prizePoolEth = document.getElementById("prize-pool-eth");
        const prizePoolUsd = document.getElementById("prize-pool-usd");

        console.log("🎯 DOM Elements found:", {
          prizePoolEth: !!prizePoolEth,
          prizePoolUsd: !!prizePoolUsd,
        });

        if (prizePoolEth) {
          prizePoolEth.textContent = parseFloat(prizePool).toFixed(4);
          console.log("✅ Updated prize-pool-eth:", prizePoolEth.textContent);
        } else {
          console.warn("⚠️ Element #prize-pool-eth NOT FOUND!");
        }

        if (prizePoolUsd) {
          prizePoolUsd.textContent = `~ $${(
            parseFloat(prizePool) * ethToUsd
          ).toFixed(2)} USD`;
          console.log("✅ Updated prize-pool-usd:", prizePoolUsd.textContent);
        } else {
          console.warn("⚠️ Element #prize-pool-usd NOT FOUND!");
        }

        // Cập nhật số người chơi
        const totalPlayersEl = document.getElementById("total-players");
        const winChanceEl = document.getElementById("win-chance");
        const playersCountEl = document.getElementById("players-count");

        if (totalPlayersEl) totalPlayersEl.textContent = totalTickets;
        if (playersCountEl) playersCountEl.textContent = totalTickets;
        if (winChanceEl) {
          winChanceEl.textContent =
            totalTickets > 0 ? `1/${totalTickets}` : "Be the first!";
        }

        // Hiển thị danh sách người chơi đang tham gia
        displayPlayers(players);

        console.log(
          `✅ ✅ ✅ SUCCESS! Loaded: ${prizePool} ETH, ${totalTickets} tickets, ${totalPlayers} players`,
        );
      } else {
        console.error("❌ API returned success=false:", publicData);
      }
    } else {
      console.error(
        "❌ API request failed with status:",
        publicResponse.status,
      );
    }

    // Get ticket price (hardcoded)
    const ticketPriceEl = document.getElementById("ticket-price");
    if (ticketPriceEl) {
      ticketPriceEl.textContent = "0.001 ETH";
    }
  } catch (error) {
    console.error("❌ ❌ ❌ CRITICAL ERROR in loadContractData:", error);
    showToast("Error loading lottery data", "error");
  }
}

// Load Latest Draw Results
async function loadLatestDrawResults() {
  console.log("🎯 Loading latest draw results...");

  try {
    const response = await fetch(`${API_BASE_URL}/lottery/latest-draw`);

    if (!response.ok) {
      console.log("⚠️ No draw results available yet");
      showNoDrawMessage();
      return;
    }

    const result = await response.json();
    console.log("📊 Draw results:", result);

    if (result.success && result.data) {
      const draw = result.data;

      // Hide "no draw" message
      const noDrawEl = document.getElementById("no-draw-yet");
      if (noDrawEl) {
        noDrawEl.style.display = "none";
      }

      // Check if this is a new result
      const lastDrawId = localStorage.getItem("lastDrawId");
      const isNewResult = lastDrawId !== String(draw._id);

      if (isNewResult && lastDrawId) {
        // Highlight the results container for new results
        const container = document.querySelector(".draw-results-container");
        if (container) {
          container.classList.add("new-result");
          setTimeout(() => {
            container.classList.remove("new-result");
          }, 1500);
        }
      }

      // Save current draw ID
      localStorage.setItem("lastDrawId", draw._id);

      // Display winning number (ALWAYS show if available)
      if (draw.winningNumber) {
        const digits = draw.winningNumber.toString().padStart(6, "0").split("");
        const digitElements = document.querySelectorAll(
          "#latest-winning-number .digit",
        );
        digitElements.forEach((el, idx) => {
          el.textContent = digits[idx] || "-";
          // Add animation effect
          el.style.animation = "none";
          setTimeout(() => {
            el.style.animation = "pulse 0.5s ease";
          }, idx * 100);
        });
      }

      // Display draw date
      const drawDateEl = document.getElementById("latest-draw-date");
      if (drawDateEl && draw.drawDate) {
        const date = new Date(draw.drawDate);
        drawDateEl.textContent = `Ngày quay: ${date.toLocaleString("vi-VN")}`;
        drawDateEl.style.display = "block";
      }

      // Display winners count (ALWAYS show, even if 0)
      const winnersCountEl = document.getElementById("latest-winners-count");
      if (winnersCountEl) {
        const count = draw.winnersCount || 0;
        winnersCountEl.textContent = count;
        winnersCountEl.style.color = count > 0 ? "#10B981" : "#EF4444";
      }

      // Display total prize (ALWAYS show)
      const totalPrizeEl = document.getElementById("latest-total-prize");
      if (totalPrizeEl) {
        const prize = draw.totalPrizeDistributed || 0;
        totalPrizeEl.textContent = `${prize} ETH`;
        totalPrizeEl.style.color = prize > 0 ? "#10B981" : "#9CA3AF";
      }

      // Display winners list if available
      const winnersContainer = document.getElementById("winners-container");
      if (winnersContainer) {
        if (draw.winners && draw.winners.length > 0) {
          winnersContainer.style.display = "block";
          const winnersList = document.getElementById("latest-winners-list");
          if (winnersList) {
            winnersList.innerHTML = draw.winners
              .map(
                (winner, idx) => `
              <li style="animation: slideIn 0.3s ease ${idx * 0.1}s both">
                <span class="winner-wallet">🏆 ${formatAddress(
                  winner.walletAddress,
                )}</span>
                <span class="winner-prize" style="color: #10B981; font-weight: bold;">${
                  winner.prizeAmount
                } ETH</span>
              </li>
            `,
              )
              .join("");
          }
        } else {
          // Show message when no winners
          winnersContainer.style.display = "block";
          const winnersList = document.getElementById("latest-winners-list");
          if (winnersList) {
            winnersList.innerHTML = `
              <li style="text-align: center; color: #9CA3AF; padding: 20px;">
                <span>❌ Không có người trúng thưởng trong kỳ này</span>
              </li>
            `;
          }
        }
      }

      console.log("✅ Draw results loaded successfully");
    } else {
      console.log("⚠️ No draw data in response");
      showNoDrawMessage();
    }
  } catch (error) {
    console.error("❌ Error loading draw results:", error);
    showNoDrawMessage();
  }
}

// Helper function to show no draw message
function showNoDrawMessage() {
  const noDrawEl = document.getElementById("no-draw-yet");
  const winnersContainer = document.getElementById("winners-container");
  const latestDrawDate = document.getElementById("latest-draw-date");

  if (noDrawEl) noDrawEl.style.display = "block";
  if (winnersContainer) winnersContainer.style.display = "none";
  if (latestDrawDate) latestDrawDate.style.display = "none";

  // Reset winning numbers
  const digitElements = document.querySelectorAll(
    "#latest-winning-number .digit",
  );
  digitElements.forEach((el) => (el.textContent = "-"));

  // Reset stats
  const winnersCountEl = document.getElementById("latest-winners-count");
  if (winnersCountEl) winnersCountEl.textContent = "0";

  const totalPrizeEl = document.getElementById("latest-total-prize");
  if (totalPrizeEl) totalPrizeEl.textContent = "0 ETH";
}

// Display Players
function displayPlayers(players) {
  console.log("🎯 displayPlayers() called with:", players);
  const playersList = document.getElementById("players-list");
  const noPlayers = document.getElementById("no-players");
  const playersCount = document.getElementById("players-count");

  console.log("📍 DOM Elements:", {
    playersList: !!playersList,
    noPlayers: !!noPlayers,
    playersCount: !!playersCount,
  });

  // Safety check: if elements don't exist, return early
  if (!playersList || !noPlayers) {
    console.warn("⚠️ displayPlayers: Required DOM elements not found!");
    return;
  }

  if (players.length === 0) {
    playersList.innerHTML = "";
    noPlayers.classList.remove("hidden");
    if (playersCount) playersCount.textContent = "0";
  } else {
    noPlayers.classList.add("hidden");
    if (playersCount) playersCount.textContent = players.length;

    playersList.innerHTML = players
      .map(
        (address, index) => `
      <li class="player-item ${
        address.toLowerCase() === userAccount?.toLowerCase() ? "is-you" : ""
      }">
        <span class="player-number">${index + 1}</span>
        <span class="player-icon">🦊</span>
        <span class="player-address" title="${address}">${address.substring(
          0,
          12,
        )}...${address.substring(address.length - 8)}</span>
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

  console.log(
    "✅ displayPlayers() finished, rendered:",
    players.length,
    "players",
  );
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

    // Reload data and refresh draw results
    await loadContractData();

    // Wait a bit for backend to process, then reload draw results
    setTimeout(async () => {
      await loadLatestDrawResults();
      showToast("✅ Kết quả xổ số đã được cập nhật!", "info");
    }, 2000);
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
