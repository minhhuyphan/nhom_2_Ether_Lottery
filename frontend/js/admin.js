// Admin Dashboard JavaScript

let web3;
let contract;
let adminAccount = "0xAdmin...1234"; // Mock admin account

// Initialize (without MetaMask)
function initWeb3() {
  // Skip MetaMask connection
  // Just set network name
  const networkElement = document.getElementById("network-name");
  if (networkElement) {
    networkElement.textContent = "Sepolia Testnet";
  }

  loadDashboardData();
}

// Load Dashboard Data
async function loadDashboardData() {
  try {
    // Mock data for now
    updateStats({
      totalPlayers: 1234,
      totalTickets: 5678,
      totalRevenue: 125.5,
      todayWinners: 23,
    });

    updateRecentPlayers();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

// Update Statistics
function updateStats(stats) {
  document.getElementById("total-players").textContent =
    stats.totalPlayers.toLocaleString();
  document.getElementById("total-tickets").textContent =
    stats.totalTickets.toLocaleString();
  document.getElementById("total-revenue").textContent =
    stats.totalRevenue.toFixed(1) + " ETH";
  document.getElementById("today-winners").textContent = stats.todayWinners;
}

// Draw Lottery
function setupDrawButton() {
  const btnDraw = document.getElementById("btn-draw");

  if (btnDraw) {
    btnDraw.addEventListener("click", async () => {
      try {
        btnDraw.disabled = true;
        btnDraw.querySelector(".btn-text").classList.add("hidden");
        btnDraw.querySelector(".btn-loading").classList.remove("hidden");

        // Get all number slots (6 slots at the top)
        const slots = document.querySelectorAll(".number-slot");

        // Start spinning animation with random numbers
        const intervals = [];
        slots.forEach((slot) => {
          slot.classList.add("spinning");
          const interval = setInterval(() => {
            const randomNum = Math.floor(Math.random() * 10);
            slot.querySelector("span").textContent = randomNum;
          }, 100);
          intervals.push(interval);
        });

        // Spin for 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Generate random winning numbers (0-9 for each of 6 slots)
        const winningNumbers = Array.from({ length: 6 }, () =>
          Math.floor(Math.random() * 10)
        );

        // Stop spinning one by one with delay
        for (let i = 0; i < slots.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 400));

          // Stop this slot's interval
          clearInterval(intervals[i]);

          slots[i].classList.remove("spinning");
          slots[i].querySelector("span").textContent = winningNumbers[i];
        }

        // Wait a bit then show result
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Show success message
        alert(`🎉 Số trúng thưởng: ${winningNumbers.join(" ")}`);

        addResultToHistory(winningNumbers);

        btnDraw.disabled = false;
        btnDraw.querySelector(".btn-text").classList.remove("hidden");
        btnDraw.querySelector(".btn-loading").classList.add("hidden");
      } catch (error) {
        alert("Có lỗi xảy ra khi quay số!");
        btnDraw.disabled = false;
        btnDraw.querySelector(".btn-text").classList.remove("hidden");
        btnDraw.querySelector(".btn-loading").classList.add("hidden");
      }
    });
  }
}

// Add Result to History
function addResultToHistory(numbers) {
  const resultsList = document.querySelector(".results-list");
  const now = new Date();
  const timeString = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const resultItem = document.createElement("div");
  resultItem.className = "result-item highlight";
  resultItem.innerHTML = `
    <div class="result-numbers">${numbers.join(" ")}</div>
    <div class="result-time">${timeString}</div>
  `;

  resultsList.insertBefore(resultItem, resultsList.firstChild);

  // Remove highlight after 5 seconds
  setTimeout(() => {
    resultItem.classList.remove("highlight");
  }, 5000);

  // Update winner count
  const winnerCountEl = document.getElementById("winner-count");
  const currentCount = parseInt(winnerCountEl.textContent);
  winnerCountEl.textContent = currentCount + 1;
}

// Update Recent Players Table
function updateRecentPlayers() {
  // Mock data - replace with actual contract data
  const mockPlayers = [
    {
      address: "0x742d...3a9c",
      tickets: 3,
      amount: 0.033,
      time: "2 phút trước",
      status: "pending",
    },
    {
      address: "0x8f2d...7b1e",
      tickets: 1,
      amount: 0.011,
      time: "5 phút trước",
      status: "pending",
    },
    {
      address: "0x3c4a...9d2f",
      tickets: 5,
      amount: 0.055,
      time: "12 phút trước",
      status: "win",
    },
    {
      address: "0x1a2b...4e5f",
      tickets: 2,
      amount: 0.022,
      time: "18 phút trước",
      status: "lose",
    },
    {
      address: "0x9e8d...6c7b",
      tickets: 4,
      amount: 0.044,
      time: "25 phút trước",
      status: "lose",
    },
  ];

  const tbody = document.getElementById("players-table");
  tbody.innerHTML = mockPlayers
    .map(
      (player) => `
    <tr>
      <td class="address">${player.address}</td>
      <td>${player.tickets}</td>
      <td class="amount">${player.amount.toFixed(3)} ETH</td>
      <td>${player.time}</td>
      <td><span class="status-badge ${player.status}">${getStatusText(
        player.status
      )}</span></td>
    </tr>
  `
    )
    .join("");
}

function getStatusText(status) {
  switch (status) {
    case "pending":
      return "Chờ quay";
    case "win":
      return "Thắng";
    case "lose":
      return "Thua";
    default:
      return status;
  }
}

// Auto-refresh data every 30 seconds
setInterval(() => {
  if (adminAccount) {
    loadDashboardData();
  }
}, 30000);

// Sidebar toggle for mobile
const sidebarToggle = document.createElement("button");
sidebarToggle.className = "sidebar-toggle";
sidebarToggle.innerHTML = "☰";
sidebarToggle.style.cssText = `
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 101;
  display: none;
  width: 40px;
  height: 40px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
`;

document.body.appendChild(sidebarToggle);

sidebarToggle.addEventListener("click", () => {
  document.querySelector(".admin-sidebar").classList.toggle("open");
});

// Show toggle button on mobile
function handleResize() {
  if (window.innerWidth <= 1024) {
    sidebarToggle.style.display = "block";
  } else {
    sidebarToggle.style.display = "none";
    document.querySelector(".admin-sidebar").classList.remove("open");
  }
}

window.addEventListener("resize", handleResize);
handleResize();

// Apply saved font size
const savedFontSize = localStorage.getItem("fontSize") || "medium";
applyFontSize(savedFontSize);

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

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initWeb3();
  setupDrawButton();
});
