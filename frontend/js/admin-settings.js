// Admin Settings JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Initialize variables first
  const fontBtns = document.querySelectorAll(".font-btn");
  const toggles = document.querySelectorAll('.switch input[type="checkbox"]');
  const numberInputs = document.querySelectorAll(
    'input[type="number"], input[type="time"]',
  );

  // Load saved settings from localStorage
  loadSettings();

  // Font size selector
  fontBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      fontBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      const size = this.getAttribute("data-size");
      applyFontSize(size);
      showToast("Đã lưu kích thước chữ", "success");
    });
  });

  // Apply font size
  function applyFontSize(size) {
    const root = document.documentElement;
    switch (size) {
      case "small":
        root.style.fontSize = "14px";
        break;
      case "large":
        root.style.fontSize = "18px";
        break;
      default:
        root.style.fontSize = "16px";
    }
    localStorage.setItem("fontSize", size);
  }

  // Toggle switches - Auto save on change
  toggles.forEach((toggle) => {
    toggle.addEventListener("change", function () {
      const settingId = this.id;
      const isChecked = this.checked;

      // Handle specific settings
      if (settingId === "animations-toggle") {
        toggleAnimations(isChecked);
        showToast("Đã lưu cài đặt hiệu ứng", "success");
      } else if (settingId === "auto-draw-toggle") {
        toggleAutoDraw(isChecked);
      } else {
        // Show toast for other toggles
        showToast("Đã lưu cài đặt", "success");
      }

      // Save to localStorage
      localStorage.setItem(settingId, isChecked);
    });
  });

  // Toggle animations
  function toggleAnimations(enabled) {
    if (enabled) {
      document.body.classList.remove("no-animations");
    } else {
      document.body.classList.add("no-animations");
    }
  }

  // Toggle auto draw
  function toggleAutoDraw(enabled) {
    const timeInput = document.getElementById("auto-draw-time");
    if (timeInput) {
      timeInput.disabled = !enabled;
    }

    if (enabled) {
      showToast("Đã bật quay số tự động", "success");
    } else {
      showToast("Đã tắt quay số tự động", "info");
    }
  }

  // Number inputs - Auto save on change
  numberInputs.forEach((input) => {
    input.addEventListener("change", function () {
      localStorage.setItem(this.id, this.value);
      showToast("Đã lưu cài đặt", "success");
    });
  });

  // Reset settings button
  const resetBtn = document.getElementById("reset-settings");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (confirm("Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định?")) {
        resetSettings();
        showToast("Đã đặt lại cài đặt mặc định", "success");
      }
    });
  }

  // Change password button
  const changePasswordBtn = document.getElementById("change-password-btn");
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", function () {
      showChangePasswordModal();
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Logout button clicked");

      if (confirm("Bạn có chắc muốn đăng xuất?")) {
        // Clear all auth data
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userProfile");

        console.log("Cleared localStorage, redirecting...");

        // Redirect to login page with absolute path
        window.location.href = "./login.html";
      }
    });
  } else {
    console.error("Logout button not found!");
  }

  // Load settings from localStorage
  function loadSettings() {
    // Font size
    const fontSize = localStorage.getItem("fontSize") || "medium";
    applyFontSize(fontSize);
    document
      .querySelector(`[data-size="${fontSize}"]`)
      ?.classList.add("active");

    // Toggle switches
    toggles.forEach((toggle) => {
      const saved = localStorage.getItem(toggle.id);
      if (saved !== null) {
        toggle.checked = saved === "true";
      }
    });

    // Number inputs
    numberInputs.forEach((input) => {
      const saved = localStorage.getItem(input.id);
      if (saved !== null) {
        input.value = saved;
      }
    });

    // Apply animations setting
    const animationsEnabled =
      localStorage.getItem("animations-toggle") !== "false";
    toggleAnimations(animationsEnabled);

    // Apply auto draw setting
    const autoDrawEnabled = localStorage.getItem("auto-draw-toggle") === "true";
    const timeInput = document.getElementById("auto-draw-time");
    if (timeInput) {
      timeInput.disabled = !autoDrawEnabled;
    }

    // Setup schedule draw if auto-draw is enabled
    if (autoDrawEnabled) {
      console.log("✅ Auto draw enabled, setting up schedule...");
      setupScheduleDraw();
    }
  }

  // Reset settings to default
  function resetSettings() {
    // Clear localStorage
    const keysToKeep = ["walletAddress", "userProfile"];
    Object.keys(localStorage).forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Reset UI to defaults
    document.querySelector('[data-size="medium"]')?.classList.add("active");
    applyFontSize("medium");

    // Reset toggles to default
    document.getElementById("animations-toggle").checked = true;
    document.getElementById("auto-draw-toggle").checked = false;
    document.getElementById("email-notify-toggle").checked = true;
    document.getElementById("system-notif-toggle").checked = true;
    document.getElementById("lottery-notif-toggle").checked = true;
    document.getElementById("player-notif-toggle").checked = true;
    document.getElementById("sound-toggle").checked = true;
    document.getElementById("2fa-toggle").checked = false;
    document.getElementById("activity-log-toggle").checked = true;

    // Reset number inputs
    document.getElementById("auto-draw-time").value = "20:00";
    document.getElementById("min-players").value = "3";
    document.getElementById("admin-fee").value = "5";
    document.getElementById("winning-numbers-count").value = "6";
    document.getElementById("ticket-price").value = "0.01";
    document.getElementById("draw-duration").value = "2";
    document.getElementById("auto-logout").value = "30";

    // Reload page to apply defaults
    setTimeout(() => {
      location.reload();
    }, 1000);
  }

  // Show change password modal
  function showChangePasswordModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>Đổi Mật Khẩu</h2>
          <button class="btn-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label>Mật khẩu hiện tại</label>
            <input type="password" id="current-password" class="form-input" placeholder="Nhập mật khẩu hiện tại" />
          </div>
          <div class="form-group">
            <label>Mật khẩu mới</label>
            <input type="password" id="new-password" class="form-input" placeholder="Nhập mật khẩu mới" />
          </div>
          <div class="form-group">
            <label>Xác nhận mật khẩu mới</label>
            <input type="password" id="confirm-password" class="form-input" placeholder="Nhập lại mật khẩu mới" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Hủy</button>
          <button class="btn-primary" id="confirm-change-password">Đổi mật khẩu</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listener for confirm button
    document
      .getElementById("confirm-change-password")
      .addEventListener("click", function () {
        const currentPass = document.getElementById("current-password").value;
        const newPass = document.getElementById("new-password").value;
        const confirmPass = document.getElementById("confirm-password").value;

        if (!currentPass || !newPass || !confirmPass) {
          showToast("Vui lòng điền đầy đủ thông tin", "error");
          return;
        }

        if (newPass !== confirmPass) {
          showToast("Mật khẩu xác nhận không khớp", "error");
          return;
        }

        if (newPass.length < 6) {
          showToast("Mật khẩu phải có ít nhất 6 ký tự", "error");
          return;
        }

        // TODO: Implement actual password change logic

        modal.remove();
        showToast("Đổi mật khẩu thành công!", "success");
      });
  }

  // Toast notification function
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const iconMap = {
      success: "tick",
      error: "canh_bao",
      info: "thong_bao",
    };

    toast.innerHTML = `
      <div class="toast-content">
        <img src="../icon/${iconMap[type]}.png" alt="${type}" class="toast-icon" />
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

  // Schedule Draw Functionality
  const autoDrawToggle = document.getElementById("auto-draw-toggle");
  const autoDrawTime = document.getElementById("auto-draw-time");

  // Setup schedule draw when toggle auto-draw or time changes
  if (autoDrawToggle) {
    autoDrawToggle.addEventListener("change", setupScheduleDraw);
  }

  if (autoDrawTime) {
    autoDrawTime.addEventListener("change", setupScheduleDraw);
  }

  async function setupScheduleDraw() {
    if (!autoDrawToggle || !autoDrawToggle.checked) {
      console.log("Auto draw is disabled");
      return;
    }

    const timeStr = autoDrawTime?.value;
    if (!timeStr) {
      showToast("Vui lòng chọn thời gian", "warning");
      return;
    }

    try {
      // Create a date for today with the selected time
      const now = new Date();
      const [hours, minutes] = timeStr.split(":");
      const scheduledDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0,
      );

      // If time has passed today, schedule for tomorrow
      if (scheduledDate < now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      // Generate random winning numbers
      const winningNumbers = [];
      for (let i = 0; i < 6; i++) {
        winningNumbers.push(Math.floor(Math.random() * 10));
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast("Bạn cần đăng nhập", "error");
        return;
      }

      console.log("Scheduling draw for:", scheduledDate.toISOString());

      const response = await fetch(
        "http://localhost:5000/api/lottery/schedule-draw",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            scheduledTime: scheduledDate.toISOString(),
            winningNumbers: winningNumbers,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        showToast(
          `✅ Đã đặt lịch quay ${timeStr} với số ${winningNumbers.join("")}`,
          "success",
        );
      } else {
        showToast("❌ Lỗi: " + data.message, "error");
      }
    } catch (error) {
      console.error("Schedule draw error:", error);
      showToast("Có lỗi xảy ra khi đặt lịch", "error");
    }
  }
});
