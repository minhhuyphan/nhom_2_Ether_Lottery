// Profile page functionality
let userProfile = null;
let web3;
let userAccount;

// Helper function to make API calls
async function apiCall(endpoint, method = "GET", data = null) {
  const token = localStorage.getItem("authToken");
  const url = `http://localhost:5000${endpoint}`;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  return await response.json();
}

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication
  const token = localStorage.getItem("authToken");
  if (!token) {
    showNotification("Vui lòng đăng nhập để xem profile", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  // Load profile data
  await loadProfile();

  // Initialize Web3 if MetaMask is available
  if (typeof window.ethereum !== "undefined") {
    web3 = new Web3(window.ethereum);
    await checkWalletConnection();
  }

  // Setup event listeners
  setupEventListeners();
});

// Load user profile from API
async function loadProfile() {
  try {
    const response = await apiCall("/api/profile", "GET");

    if (response.success) {
      userProfile = response.data;
      displayProfile(userProfile);
      await loadStats();
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    showNotification("Không thể tải thông tin profile", "error");
  }
}

// Display profile information
function displayProfile(profile) {
  // Avatar and main info
  if (profile.avatar) {
    document.getElementById("user-avatar").src = profile.avatar;
  }
  document.getElementById("user-username").textContent = profile.username;
  document.getElementById("user-email").textContent = profile.email;
  document.getElementById("user-role").textContent =
    profile.role === "admin" ? "Admin" : "User";
  document.getElementById(
    "user-role"
  ).className = `user-role-badge ${profile.role}`;

  // Account info
  document.getElementById("account-username").textContent = profile.username;
  document.getElementById("account-email").textContent = profile.email;
  document.getElementById("account-balance").textContent = `${
    profile.balance || 0
  } ETH`;

  // Format dates
  const createdDate = new Date(profile.createdAt);
  document.getElementById("account-created").textContent =
    createdDate.toLocaleDateString("vi-VN");

  if (profile.lastLogin) {
    const lastLoginDate = new Date(profile.lastLogin);
    document.getElementById("last-login").textContent =
      lastLoginDate.toLocaleString("vi-VN");
  } else {
    document.getElementById("last-login").textContent = "Chưa có";
  }

  // Wallet address
  if (profile.walletAddress) {
    const shortAddress = `${profile.walletAddress.substring(
      0,
      6
    )}...${profile.walletAddress.substring(38)}`;
    document.getElementById("wallet-address").textContent = shortAddress;
    document.getElementById("wallet-address").title = profile.walletAddress;
  }
}

// Load user statistics
async function loadStats() {
  try {
    const response = await apiCall("/api/profile/stats", "GET");

    if (response.success) {
      const stats = response.data;
      document.getElementById("total-entries").textContent =
        stats.totalEntries || 0;
      document.getElementById("total-wins").textContent = stats.totalWins || 0;
      document.getElementById("total-spent").textContent = (
        stats.totalSpent || 0
      ).toFixed(4);
      document.getElementById("total-won").textContent = (
        stats.totalWon || 0
      ).toFixed(4);
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }

  // Load tickets
  await loadMyTickets();
}

// Load my tickets
async function loadMyTickets(page = 1) {
  try {
    const response = await apiCall(
      `/api/lottery/my-tickets?page=${page}&limit=6`,
      "GET"
    );

    if (response.success) {
      displayTickets(response.data.tickets);
      displayPagination(response.data.pagination);
    }
  } catch (error) {
    console.error("Error loading tickets:", error);
    document.getElementById("tickets-list").innerHTML = `
      <div class="no-tickets">
        <div class="no-tickets-icon">🎫</div>
        <p>Chưa có vé nào</p>
      </div>
    `;
  }
}

// Display tickets
function displayTickets(tickets) {
  const container = document.getElementById("tickets-list");

  if (!tickets || tickets.length === 0) {
    container.innerHTML = `
      <div class="no-tickets">
        <div class="no-tickets-icon">🎫</div>
        <p>Bạn chưa mua vé nào</p>
        <p style="margin-top: 10px; opacity: 0.7;">Hãy tham gia ngay để có cơ hội trúng thưởng!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tickets
    .map((ticket) => {
      const date = new Date(ticket.purchaseDate).toLocaleString("vi-VN");
      const statusClass = ticket.status;
      const statusText =
        {
          active: "Đang chờ",
          won: "Trúng thưởng",
          lost: "Không trúng",
          pending: "Chờ xử lý",
        }[ticket.status] || ticket.status;

      return `
      <div class="ticket-card">
        <div class="ticket-header">
          <div class="ticket-number-display">${ticket.ticketNumber}</div>
          <span class="ticket-status ${statusClass}">${statusText}</span>
        </div>
        <div class="ticket-info">
          <div class="ticket-info-row">
            <span class="ticket-info-label">Số tiền:</span>
            <span class="ticket-info-value ticket-amount">${
              ticket.amount
            } ETH</span>
          </div>
          <div class="ticket-info-row">
            <span class="ticket-info-label">Ví:</span>
            <span class="ticket-info-value">${ticket.walletAddress.slice(
              0,
              6
            )}...${ticket.walletAddress.slice(-4)}</span>
          </div>
          ${
            ticket.prizeAmount > 0
              ? `
            <div class="ticket-info-row">
              <span class="ticket-info-label">Giải thưởng:</span>
              <span class="ticket-info-value ticket-amount">${ticket.prizeAmount} ETH</span>
            </div>
          `
              : ""
          }
        </div>
        <div class="ticket-date">
          📅 ${date}
        </div>
      </div>
    `;
    })
    .join("");
}

// Display pagination
function displayPagination(pagination) {
  const container = document.getElementById("tickets-pagination");

  if (pagination.pages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = "";

  // Previous button
  html += `
    <button class="pagination-btn" ${pagination.page === 1 ? "disabled" : ""} 
            onclick="loadMyTickets(${pagination.page - 1})">
      ← Trước
    </button>
  `;

  // Page numbers
  for (let i = 1; i <= pagination.pages; i++) {
    if (
      i === 1 ||
      i === pagination.pages ||
      (i >= pagination.page - 1 && i <= pagination.page + 1)
    ) {
      html += `
        <button class="pagination-btn ${i === pagination.page ? "active" : ""}" 
                onclick="loadMyTickets(${i})">
          ${i}
        </button>
      `;
    } else if (i === pagination.page - 2 || i === pagination.page + 2) {
      html += `<span style="color: rgba(255,255,255,0.5); padding: 8px;">...</span>`;
    }
  }

  // Next button
  html += `
    <button class="pagination-btn" ${
      pagination.page === pagination.pages ? "disabled" : ""
    } 
            onclick="loadMyTickets(${pagination.page + 1})">
      Sau →
    </button>
  `;

  container.innerHTML = html;
}

// Check wallet connection
async function checkWalletConnection() {
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length > 0) {
      userAccount = accounts[0];
      await updateWalletInfo(userAccount);
    }
  } catch (error) {
    console.error("Error checking wallet:", error);
  }
}

// Update wallet information
async function updateWalletInfo(address) {
  try {
    const shortAddress = `${address.substring(0, 6)}...${address.substring(
      38
    )}`;
    document.getElementById("wallet-address").textContent = shortAddress;
    document.getElementById("wallet-address").title = address;

    // Get balance
    const balance = await web3.eth.getBalance(address);
    const balanceInEth = web3.utils.fromWei(balance, "ether");
    document.getElementById("wallet-balance").textContent =
      parseFloat(balanceInEth).toFixed(4) + " ETH";

    // Get network
    const networkId = await web3.eth.net.getId();
    const networkName = getNetworkName(networkId);
    document.getElementById("network-name").textContent = networkName;

    // Update button text
    document.getElementById("connect-wallet-btn").textContent = "Ví đã kết nối";
    document.getElementById("connect-wallet-btn").classList.add("connected");
  } catch (error) {
    console.error("Error updating wallet info:", error);
  }
}

// Get network name
function getNetworkName(networkId) {
  const networks = {
    1: "Ethereum Mainnet",
    11155111: "Sepolia Testnet",
    5: "Goerli Testnet",
    137: "Polygon Mainnet",
  };
  return networks[networkId] || `Network ID: ${networkId}`;
}

// Connect wallet
async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    showNotification("Vui lòng cài đặt MetaMask!", "error");
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length > 0) {
      userAccount = accounts[0];
      await updateWalletInfo(userAccount);

      // Update wallet address in database
      await updateWalletAddress(userAccount);

      showNotification("Kết nối ví thành công!", "success");
    }
  } catch (error) {
    console.error("Error connecting wallet:", error);
    showNotification("Không thể kết nối ví", "error");
  }
}

// Update wallet address in database
async function updateWalletAddress(address) {
  try {
    const response = await apiCall("/api/profile/wallet", "PUT", {
      walletAddress: address,
    });

    if (response.success) {
      userProfile.walletAddress = address;
    }
  } catch (error) {
    console.error("Error updating wallet address:", error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Connect wallet button
  const connectWalletBtn = document.getElementById("connect-wallet-btn");
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener("click", connectWallet);
  }

  // Edit profile button
  const editProfileBtn = document.getElementById("edit-profile-btn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", openEditModal);
  }

  // Edit avatar button
  const editAvatarBtn = document.getElementById("edit-avatar-btn");
  if (editAvatarBtn) {
    editAvatarBtn.addEventListener("click", openAvatarEdit);
  }

  // Close modal buttons
  const closeEditModal = document.getElementById("close-edit-modal");
  const cancelEdit = document.getElementById("cancel-edit");
  if (closeEditModal) {
    closeEditModal.addEventListener("click", closeEditProfileModal);
  }
  if (cancelEdit) {
    cancelEdit.addEventListener("click", closeEditProfileModal);
  }

  // Edit profile form
  const editForm = document.getElementById("edit-profile-form");
  if (editForm) {
    editForm.addEventListener("submit", handleProfileUpdate);
  }

  // MetaMask account change
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", () => window.location.reload());
  }
}

// Open edit profile modal
function openEditModal() {
  if (!userProfile) return;

  document.getElementById("edit-username").value = userProfile.username;
  document.getElementById("edit-email").value = userProfile.email;
  document.getElementById("edit-avatar").value = userProfile.avatar || "";

  const modal = document.getElementById("edit-profile-modal");
  modal.style.display = "flex";
}

// Close edit profile modal
function closeEditProfileModal() {
  const modal = document.getElementById("edit-profile-modal");
  modal.style.display = "none";
}

// Handle profile update
async function handleProfileUpdate(e) {
  e.preventDefault();

  const username = document.getElementById("edit-username").value.trim();
  const email = document.getElementById("edit-email").value.trim();
  const avatar = document.getElementById("edit-avatar").value.trim();

  if (!username || !email) {
    showNotification("Vui lòng điền đầy đủ thông tin", "error");
    return;
  }

  try {
    const updateData = { username, email };
    if (avatar) {
      updateData.avatar = avatar;
    }

    const response = await apiCall("/api/profile", "PUT", updateData);

    if (response.success) {
      showNotification("Cập nhật profile thành công!", "success");
      userProfile = response.data;
      displayProfile(userProfile);
      closeEditProfileModal();
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    showNotification(error.message || "Không thể cập nhật profile", "error");
  }
}

// Open avatar edit (simple prompt for now)
function openAvatarEdit() {
  const newAvatar = prompt("Nhập URL avatar mới:", userProfile.avatar || "");

  if (newAvatar !== null && newAvatar.trim() !== "") {
    updateAvatar(newAvatar.trim());
  }
}

// Update avatar
async function updateAvatar(avatarUrl) {
  try {
    const response = await apiCall("/api/profile/avatar", "PUT", {
      avatar: avatarUrl,
    });

    if (response.success) {
      showNotification("Cập nhật avatar thành công!", "success");
      userProfile.avatar = avatarUrl;
      document.getElementById("user-avatar").src = avatarUrl;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error updating avatar:", error);
    showNotification(error.message || "Không thể cập nhật avatar", "error");
  }
}

// Handle MetaMask account change
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected wallet
    document.getElementById("wallet-address").textContent = "Chưa kết nối";
    document.getElementById("wallet-balance").textContent = "0.0000 ETH";
    document.getElementById("connect-wallet-btn").textContent =
      "Kết nối ví MetaMask";
    document.getElementById("connect-wallet-btn").classList.remove("connected");
    userAccount = null;
  } else if (accounts[0] !== userAccount) {
    // User switched account
    userAccount = accounts[0];
    updateWalletInfo(userAccount);
    updateWalletAddress(userAccount);
  }
}

// Show notification
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add to body
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
