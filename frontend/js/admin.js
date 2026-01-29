// Admin Dashboard JavaScript

let web3;
let contract;
let adminAccount = "0xAdmin...1234"; // Mock admin account
let dashboardRefreshInterval; // Auto-refresh interval
let serverTimeInterval; // Server time update interval

// Initialize (without MetaMask)
function initWeb3() {
  // Skip MetaMask connection
  // Just set network name
  const networkElement = document.getElementById("network-name");
  if (networkElement) {
    networkElement.textContent = "Sepolia Testnet";
  }

  loadDashboardData();
  updateServerTime();

  // Auto-refresh dashboard mỗi 5 giây
  if (dashboardRefreshInterval) clearInterval(dashboardRefreshInterval);
  dashboardRefreshInterval = setInterval(loadDashboardData, 5000);

  // Update server time mỗi giây
  if (serverTimeInterval) clearInterval(serverTimeInterval);
  serverTimeInterval = setInterval(updateServerTime, 1000);
}

// Update server time display
async function updateServerTime() {
  try {
    const response = await fetch("http://localhost:5000/api/server-time");
    const data = await response.json();

    console.log("⏰ Server time response:", data);

    const timeElement = document.getElementById("server-time");
    if (timeElement) {
      if (data.success && data.time) {
        timeElement.textContent = data.time;
      } else {
        // Fallback: show local time if API fails
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString("vi-VN");
      }
    }
  } catch (error) {
    console.error("Error fetching server time:", error);
    // Fallback: show local time
    const timeElement = document.getElementById("server-time");
    if (timeElement) {
      const now = new Date();
      timeElement.textContent = now.toLocaleTimeString("vi-VN");
    }
  }
}

// Load Dashboard Data
async function loadDashboardData() {
  try {
    const token = localStorage.getItem("authToken");
    console.log("📋 authToken:", token ? "✅ Có" : "❌ Không có");

    // Lấy thống kê từ API
    const statsResponse = await fetch(
      "http://localhost:5000/api/lottery/admin/stats",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("📊 Stats response:", statsResponse.status);
    if (!statsResponse.ok) throw new Error("Failed to fetch stats");
    const statsData = await statsResponse.json();
    console.log("📊 Stats data:", statsData);

    if (statsData.success) {
      updateStats(statsData.data);
    }

    // Lấy danh sách người chơi gần đây
    const playersResponse = await fetch(
      "http://localhost:5000/api/lottery/admin/recent-players?limit=10",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("👥 Players response:", playersResponse.status);
    if (playersResponse.ok) {
      const playersData = await playersResponse.json();
      console.log("👥 Players data:", playersData);
      if (playersData.success) {
        updateRecentPlayers(playersData.data);
      }
    } else {
      console.error("❌ Players API error:", playersResponse.status);
    }

    // Lấy lịch sử kết quả quay
    const drawResultsResponse = await fetch(
      "http://localhost:5000/api/lottery/draw-results?limit=20",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("📈 Draw results response:", drawResultsResponse.status);
    if (drawResultsResponse.ok) {
      const drawData = await drawResultsResponse.json();
      console.log("📈 Draw results:", drawData);
      if (drawData.success) {
        loadDrawResults(drawData.data);
      }
    } else {
      console.error("❌ Draw results API error:", drawResultsResponse.status);
    }

    // Lấy danh sách vé mới được mua
    const ticketsResponse = await fetch(
      "http://localhost:5000/api/lottery/all-tickets?limit=10&page=1",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("🎫 Tickets response:", ticketsResponse.status);
    if (ticketsResponse.ok) {
      const ticketsData = await ticketsResponse.json();
      console.log("🎫 Tickets data:", ticketsData);
      if (ticketsData.success) {
        loadRecentTickets(ticketsData.data.tickets);
      }
    } else {
      console.error("❌ Tickets API error:", ticketsResponse.status);
    }
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
    stats.totalRevenue + " ETH";
  document.getElementById("today-winners").textContent = stats.todayWinners;

  // Tổng giải thưởng = Tổng doanh thu (100% tiền vé đã bán)
  const prizeAmountElement = document.getElementById("prize-amount");
  if (prizeAmountElement) {
    prizeAmountElement.textContent = stats.totalRevenue + " ETH";
  }
}

// Draw Lottery

function setupDrawButton() {
  const btnDraw = document.getElementById("btn-draw");
  const btnRefreshTickets = document.getElementById("btn-refresh-tickets");

  if (btnRefreshTickets) {
    btnRefreshTickets.addEventListener("click", async () => {
      try {
        btnRefreshTickets.disabled = true;
        btnRefreshTickets.textContent = "Đang tải...";

        const token = localStorage.getItem("authToken");
        const ticketsResponse = await fetch(
          "http://localhost:5000/api/lottery/all-tickets?limit=10&page=1",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json();
          if (ticketsData.success) {
            loadRecentTickets(ticketsData.data.tickets);
            console.log("✅ Đã làm mới danh sách vé");
          }
        } else {
          alert("❌ Lỗi tải danh sách vé");
        }
      } catch (error) {
        console.error("Refresh tickets error:", error);
        alert("Có lỗi xảy ra!");
      } finally {
        btnRefreshTickets.disabled = false;
        btnRefreshTickets.textContent = "Làm mới";
      }
    });
  }

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
          Math.floor(Math.random() * 10),
        );

        // Stop spinning one by one with delay
        for (let i = 0; i < slots.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 400));

          // Stop this slot's interval
          clearInterval(intervals[i]);

          slots[i].classList.remove("spinning");
          slots[i].querySelector("span").textContent = winningNumbers[i];
        }

        // Wait a bit then submit to backend
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Gửi kết quả quay lên backend
        const token = localStorage.getItem("authToken");
        const drawResponse = await fetch(
          "http://localhost:5000/api/lottery/draw",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ winningNumbers }),
          },
        );

        const drawData = await drawResponse.json();
        console.log("Draw result:", drawData);

        if (drawData.success) {
          // Gửi thông báo cho tất cả người chơi
          try {
            console.log("📢 Gửi thông báo kết quả quay...");
            const notifyResponse = await fetch(
              "http://localhost:5000/api/notifications/notify-draw-results",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  winningNumber: winningNumbers.join(""),
                  prizeAmount: drawData.data.prizePool,
                }),
              },
            );

            const notifyData = await notifyResponse.json();
            console.log("📢 Notification response:", notifyData);
          } catch (notifyError) {
            console.error("❌ Error sending notifications:", notifyError);
          }

          // Hiển thị kết quả
          const resultMessage = `
🎉 Số trúng thưởng: ${winningNumbers.join(" ")}

👥 Người thắng: ${drawData.data.totalWinners}
🏆 Tổng giải: ${drawData.data.prizePool.toFixed(2)} ETH

${
  drawData.data.winners.length > 0
    ? "🎊 Danh sách người thắng:\n" +
      drawData.data.winners
        .map((w) => `• ${w.username}: ${w.ticketNumber} → ${w.prizeAmount} ETH`)
        .join("\n")
    : ""
}
          `;

          alert(resultMessage);

          // Hiển thị danh sách người thắng
          displayWinners(drawData.data.winners);

          // Cập nhật lịch sử
          addResultToHistory(winningNumbers);

          // Chờ 2 giây rồi reset vé
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Gọi API reset vé
          const resetResponse = await fetch(
            "http://localhost:5000/api/lottery/reset-tickets",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const resetData = await resetResponse.json();
          console.log("� Reset response:", resetData);

          if (resetData.success) {
            console.log(
              `✅ Ẩn vé thành công - Đã ẩn ${resetData.data.archivedCount} vé`,
            );
            console.log(
              `📊 Vé hoạt động: ${resetData.data.activeTickets}, Vé đã ẩn: ${resetData.data.archivedTickets}`,
            );
            alert(
              `✅ Đã ẩn vé!\n- Ẩn ${resetData.data.archivedCount} vé cũ\n- Vé hoạt động: ${resetData.data.activeTickets}\n- Sẵn sàng cho phiên quay tiếp theo`,
            );
          } else {
            console.error("❌ Lỗi ẩn vé:", resetData.message);
            alert("❌ Lỗi khi ẩn vé: " + resetData.message);
          }

          // Chờ một chút rồi cập nhật thống kê
          await new Promise((resolve) => setTimeout(resolve, 500));
          loadDashboardData();
        } else {
          alert("❌ Lỗi: " + drawData.message);
        }

        btnDraw.disabled = false;
        btnDraw.querySelector(".btn-text").classList.remove("hidden");
        btnDraw.querySelector(".btn-loading").classList.add("hidden");
      } catch (error) {
        console.error("Draw error:", error);
        alert("Có lỗi xảy ra khi quay số!");
        btnDraw.disabled = false;
        btnDraw.querySelector(".btn-text").classList.remove("hidden");
        btnDraw.querySelector(".btn-loading").classList.add("hidden");
      }
    });
  }
}

// Display Winners List
function displayWinners(winners) {
  if (winners.length === 0) return;

  const winnersContainer = document.querySelector(".results-list");
  const now = new Date();
  const timeString = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Thêm tiêu đề người thắng
  const winnersHeader = document.createElement("div");
  winnersHeader.className = "winners-section highlight";
  winnersHeader.innerHTML = `
    <div class="winners-title">🏆 NGƯỜI THẮNG (${winners.length})</div>
  `;
  winnersContainer.insertBefore(winnersHeader, winnersContainer.firstChild);

  // Thêm từng người thắng
  winners.forEach((winner, index) => {
    const winnerItem = document.createElement("div");
    winnerItem.className = "winner-item highlight";
    winnerItem.innerHTML = `
      <div class="winner-info">
        <span class="winner-rank">#${index + 1}</span>
        <span class="winner-name">${winner.username}</span>
        <span class="winner-ticket">${winner.ticketNumber}</span>
      </div>
      <div class="winner-prize">${winner.prizeAmount} ETH</div>
      <div class="winner-time">${timeString}</div>
    `;
    winnersContainer.insertBefore(winnerItem, winnersContainer.firstChild);
  });

  // Remove highlight after 5 seconds
  setTimeout(() => {
    document.querySelectorAll(".highlight").forEach((el) => {
      el.classList.remove("highlight");
    });
  }, 5000);
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
  resultItem.className = "result-item";
  resultItem.innerHTML = `
    <div class="result-numbers">${numbers.join(" ")}</div>
    <div class="result-time">${timeString}</div>
  `;

  resultsList.appendChild(resultItem);
}

// Load Draw Results from Database
function loadDrawResults(results) {
  const resultsList = document.querySelector(".results-list");
  if (!resultsList) return;

  // Xóa các hardcode items cũ (giữ lại cấu trúc)
  const existingItems = resultsList.querySelectorAll(".result-item");
  existingItems.forEach((item) => {
    // Chỉ xóa nếu không phải là winner-item
    if (!item.classList.contains("winner-item")) {
      item.remove();
    }
  });

  // Thêm kết quả thực tế từ database
  results.forEach((result) => {
    const drawDate = new Date(result.drawDate);
    const timeString = drawDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const resultItem = document.createElement("div");
    resultItem.className = "result-item";
    resultItem.innerHTML = `
      <div class="result-numbers">${result.winningNumber
        .split("")
        .join(" ")}</div>
      <div class="result-info">
        <span class="result-time">${timeString}</span>
        <span class="result-winners">👥 ${result.winnersCount} người</span>
        <span class="result-prize">💰 ${result.totalPrize.toFixed(2)} ETH</span>
      </div>
    `;
    resultsList.appendChild(resultItem);
  });
}

// Update Recent Players Table
function updateRecentPlayers(players) {
  const tbody = document.querySelector(".table-users tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  players.forEach((player, index) => {
    const row = document.createElement("tr");
    const joinDate = new Date(player.createdAt).toLocaleDateString("vi-VN");
    const lastLogin = player.lastLogin
      ? new Date(player.lastLogin).toLocaleDateString("vi-VN")
      : "Chưa đăng nhập";

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.username}</td>
      <td>${player.email}</td>
      <td>${
        player.walletAddress
          ? player.walletAddress.substring(0, 10) + "..."
          : "N/A"
      }</td>
      <td>${player.balance.toFixed(2)} ETH</td>
      <td>${joinDate}</td>
      <td>${lastLogin}</td>
      <td><span class="badge badge-active">Hoạt động</span></td>
    `;
    tbody.appendChild(row);
  });
}

// Load Recent Tickets
function loadRecentTickets(tickets) {
  const tbody = document.querySelector(".table-tickets tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!tickets || tickets.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="8" style="text-align: center; color: var(--text-muted);">Không có vé nào</td>`;
    tbody.appendChild(row);
    return;
  }

  tickets.forEach((ticket, index) => {
    const row = document.createElement("tr");
    const purchaseDate = new Date(ticket.purchaseDate).toLocaleDateString(
      "vi-VN",
    );

    // Xác định status text dựa trên ticket status
    let statusText = "❓ Không xác định";
    let badgeClass = "badge-info";

    if (ticket.status === "active") {
      statusText = "🎫 Chờ quay";
      badgeClass = "badge-warning";
    } else if (ticket.status === "won") {
      statusText = "🏆 Thắng";
      badgeClass = "badge-success";
    } else if (
      ticket.status === "lost" ||
      ticket.status === false ||
      ticket.status === "false"
    ) {
      statusText = "❌ Thua";
      badgeClass = "badge-danger";
    } else if (
      ticket.status === "pending" ||
      ticket.status === true ||
      ticket.status === "true"
    ) {
      statusText = "⏳ Chờ xử lý";
      badgeClass = "badge-info";
    }

    const truncatedTxHash = ticket.transactionHash.substring(0, 10) + "...";

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${ticket.user?.username || "N/A"}</td>
      <td><strong>${ticket.ticketNumber}</strong></td>
      <td>${ticket.walletAddress.substring(0, 10)}...</td>
      <td>${ticket.amount.toFixed(2)} ETH</td>
      <td title="${ticket.transactionHash}">${truncatedTxHash}</td>
      <td>${purchaseDate}</td>
      <td><span class="badge ${badgeClass}">${statusText}</span></td>
    `;
    tbody.appendChild(row);
  });
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
  const token = localStorage.getItem("authToken");
  if (token) {
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
