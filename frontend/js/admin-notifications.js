// Admin Notifications JavaScript
let allNotifications = [];
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra đăng nhập
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "../html/login.html";
    return;
  }

  // Load thông báo từ API
  loadNotifications();

  // Filter tabs
  const filterTabs = document.querySelectorAll(".tab");

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs
      filterTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      currentFilter = this.getAttribute("data-filter");

      // Filter và render notifications
      renderNotifications();
    });
  });

  // Mark all as read
  const markAllReadBtn = document.getElementById("mark-all-read");
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", markAllAsRead);
  }
});

// Load notifications từ API
async function loadNotifications() {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch("http://localhost:5000/api/notifications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("📢 Admin notifications loaded:", data);

    if (data.success) {
      allNotifications = data.data.notifications;
      updateNotificationBadge(data.data.unreadCount);
      renderNotifications();
    }
  } catch (error) {
    console.error("Error loading notifications:", error);
  }
}

// Render notifications
function renderNotifications() {
  const container = document.querySelector(".notifications-list");
  if (!container) return;

  let filteredNotifications = allNotifications;

  if (currentFilter !== "all") {
    filteredNotifications = allNotifications.filter((n) => {
      if (currentFilter === "system") {
        return n.type === "system" || n.type === "info";
      } else if (currentFilter === "lottery") {
        return n.type === "lottery" || n.type === "prize";
      } else if (currentFilter === "player") {
        return n.type === "transaction";
      }
      return true;
    });
  }

  // Clear container
  container.innerHTML = "";

  if (filteredNotifications.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
        <p>Không có thông báo nào</p>
      </div>
    `;
    return;
  }

  filteredNotifications.forEach((notif) => {
    const element = createNotificationElement(notif);
    container.appendChild(element);
  });
}

// Create notification element
function createNotificationElement(notif) {
  const div = document.createElement("div");
  div.className = `notification-item ${notif.isRead ? "" : "unread"}`;
  div.dataset.id = notif._id;
  div.dataset.type = notif.type;

  const iconMap = {
    system: "../icon/canh_bao.png",
    lottery: "../icon/tro_choi.png",
    prize: "../icon/cup.png",
    transaction: "../icon/tui_tien.png",
    info: "../icon/loa.png",
  };

  const iconClass = {
    system: "system-icon",
    lottery: "lottery-icon",
    prize: "prize-icon",
    transaction: "transaction-icon",
    info: "info-icon",
  };

  const icon = iconMap[notif.type] || "../icon/canh_bao.png";
  const cls = iconClass[notif.type] || "system-icon";

  div.innerHTML = `
    <div class="notification-icon ${cls}">
      <img src="${icon}" alt="${notif.type}" />
    </div>
    <div class="notification-content">
      <div class="notification-header">
        <h3>${escapeHtml(notif.title)}</h3>
        <span class="notification-time">${formatTime(notif.createdAt)}</span>
      </div>
      <p class="notification-message">${escapeHtml(notif.message)}</p>
    </div>
    <button class="btn-mark-read" title="Đánh dấu đã đọc">
      <img src="../icon/tick.png" alt="Mark read" />
    </button>
  `;

  div.querySelector(".btn-mark-read").addEventListener("click", (e) => {
    e.stopPropagation();
    markAsRead(notif._id);
  });

  return div;
}

// Mark as read
async function markAsRead(notifId) {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `http://localhost:5000/api/notifications/${notifId}/read`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    if (data.success) {
      loadNotifications();
    }
  } catch (error) {
    console.error("Error marking as read:", error);
  }
}

// Mark all as read
async function markAllAsRead() {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      "http://localhost:5000/api/notifications/read-all",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    if (data.success) {
      loadNotifications();
      showToast("Đã đánh dấu tất cả thông báo là đã đọc", "success");
    }
  } catch (error) {
    console.error("Error marking all as read:", error);
  }
}

// Update notification badge
function updateNotificationBadge(count) {
  const badge = document.querySelector(".notification-badge");
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "block";
    } else {
      badge.style.display = "none";
    }
  }
}

// Format time
function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Show toast
function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
      notifItem.classList.remove("unread");

      // Update badge count
      updateBadgeCount();
    });
  });

  // Update notification badge count
  function updateBadgeCount() {
    const unreadCount = document.querySelectorAll(
      ".notification-item.unread"
    ).length;
    const badge = document.querySelector(".notification-badge");

    if (badge) {
      if (unreadCount === 0) {
        badge.style.display = "none";
      } else {
        badge.textContent = unreadCount;
        badge.style.display = "flex";
      }
    }
  }

  // Toast notification function
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <img src="../icon/${
          type === "success" ? "tick" : "canh_bao"
        }.png" alt="${type}" class="toast-icon" />
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    // Hide and remove toast
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Initialize badge count
  updateBadgeCount();
});
