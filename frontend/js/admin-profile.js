// Admin Profile JavaScript
let adminProfile = null;

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
    window.location.href = "login.html";
    return;
  }

  // Load admin profile
  await loadAdminProfile();

  // Setup event listeners
  setupEventListeners();
});

// Load admin profile from API
async function loadAdminProfile() {
  try {
    const response = await apiCall("/api/profile", "GET");

    if (response.success) {
      adminProfile = response.data;
      displayAdminProfile(adminProfile);
    } else {
      console.error("Failed to load profile:", response.message);
    }
  } catch (error) {
    console.error("Error loading admin profile:", error);
  }
}

// Display admin profile information
function displayAdminProfile(profile) {
  // Update display name and username
  const displayNameEl = document.querySelector(".admin-display-name");
  const usernameEl = document.querySelector(".admin-username");

  if (displayNameEl)
    displayNameEl.textContent = profile.username || "Administrator";
  if (usernameEl) usernameEl.textContent = `@${profile.username || "admin"}`;

  // Update email
  const emailEl = document.getElementById("admin-email");
  if (emailEl) emailEl.textContent = profile.email || "admin@etherlottery.com";

  // Update joined date
  const joinedEl = document.getElementById("admin-joined");
  if (joinedEl && profile.createdAt) {
    const joinDate = new Date(profile.createdAt);
    joinedEl.textContent = joinDate.toLocaleDateString("vi-VN");
  }

  // Update avatar if available
  const avatarEls = document.querySelectorAll(
    ".admin-avatar-large img, .admin-avatar img"
  );
  if (profile.avatar && avatarEls.length > 0) {
    avatarEls.forEach((img) => {
      img.src = profile.avatar;
    });
  }

  // Update sidebar admin info
  const sidebarNameEl = document.querySelector(".sidebar-footer .admin-name");
  if (sidebarNameEl) sidebarNameEl.textContent = profile.username || "admin";
}

// Setup event listeners
function setupEventListeners() {
  // Edit profile button
  const editProfileBtn = document.getElementById("edit-profile-btn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", openEditModal);
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

  // Save profile button
  const saveProfileBtn = document.getElementById("save-profile");
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", handleProfileUpdate);
  }
}

// Open edit profile modal
function openEditModal() {
  if (!adminProfile) return;

  document.getElementById("edit-username").value = adminProfile.username;
  document.getElementById("edit-email").value = adminProfile.email;
  document.getElementById("edit-avatar").value = adminProfile.avatar || "";

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
    alert("Vui lòng điền đầy đủ thông tin");
    return;
  }

  try {
    const updateData = { username, email };
    if (avatar) {
      updateData.avatar = avatar;
    }

    const response = await apiCall("/api/profile", "PUT", updateData);

    if (response.success) {
      alert("Cập nhật profile thành công!");
      adminProfile = response.data;
      displayAdminProfile(adminProfile);
      closeEditProfileModal();
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert(error.message || "Không thể cập nhật profile");
  }
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
