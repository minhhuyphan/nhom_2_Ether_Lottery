// Settings Page JavaScript

// Logout Button Handler
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      try {
        // Gọi API logout nếu có authApi
        if (typeof authApi !== 'undefined') {
          await authApi.logout();
        } else {
          // Fallback: xóa localStorage thủ công
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('username');
          localStorage.removeItem('userRole');
        }
        
        // Chuyển về trang đăng nhập
        window.location.href = "login.html";
      } catch (error) {
        console.error("Logout error:", error);
        // Vẫn xóa local storage và redirect
        localStorage.clear();
        window.location.href = "login.html";
      }
    }
  });
}

// Profile Dropdown Toggle
const profileBtn = document.getElementById("profile-btn");
const profileDropdown = document.getElementById("profile-dropdown");

if (profileBtn && profileDropdown) {
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
      profileDropdown.classList.add("hidden");
    }
  });

  const logoutBtn = document.querySelector(".profile-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
      }
    });
  }
}

// Tab Switching
const tabs = document.querySelectorAll(".settings-tab");
const panels = document.querySelectorAll(".settings-panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetPanel = tab.getAttribute("data-tab") + "-panel";

    // Remove active class from all tabs and panels
    tabs.forEach((t) => t.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));

    // Add active class to clicked tab and corresponding panel
    tab.classList.add("active");
    document.getElementById(targetPanel).classList.add("active");
  });
});

// Theme Selection
const themeOptions = document.querySelectorAll(".theme-option");

themeOptions.forEach((option) => {
  option.addEventListener("click", () => {
    themeOptions.forEach((o) => o.classList.remove("active"));
    option.classList.add("active");

    const theme = option.getAttribute("data-theme");
    settings.appearance.theme = theme;
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  });
});

// Apply Theme Function
function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === "light") {
    // Light theme colors
    root.style.setProperty("--bg-main", "#FFFFFF");
    root.style.setProperty("--bg-card", "#F9FAFB");
    root.style.setProperty("--bg-secondary", "#F3F4F6");
    root.style.setProperty("--border-color", "#E5E7EB");
    root.style.setProperty("--text-dark", "#111827");
    root.style.setProperty("--text-gray", "#6B7280");
    root.style.setProperty("--nav-bg", "#FFFFFF");
    root.style.setProperty("--nav-border", "#E5E7EB");
  } else if (theme === "dark") {
    // Dark theme colors (default)
    root.style.setProperty("--bg-main", "#0A0A0A");
    root.style.setProperty("--bg-card", "#1A1A1A");
    root.style.setProperty("--bg-secondary", "#212121");
    root.style.setProperty("--border-color", "#2A2A2A");
    root.style.setProperty("--text-dark", "#FFFFFF");
    root.style.setProperty("--text-gray", "#9CA3AF");
    root.style.setProperty("--nav-bg", "#000000");
    root.style.setProperty("--nav-border", "#FFD700");
  } else if (theme === "auto") {
    // Auto theme based on system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    applyTheme(prefersDark ? "dark" : "light");

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (settings.appearance.theme === "auto") {
          applyTheme(e.matches ? "dark" : "light");
        }
      });
    return; // Don't save 'auto' as actual theme
  }

  // Save to localStorage
  localStorage.setItem("theme", theme);
}

// Apply Font Size Function
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

  localStorage.setItem("fontSize", size);
}

// Font Size Selection
const fontSizeSelect = document.getElementById("font-size-select");
if (fontSizeSelect) {
  fontSizeSelect.addEventListener("change", (e) => {
    const fontSize = e.target.value;
    settings.appearance.fontSize = fontSize;
    applyFontSize(fontSize);
  });
}

// Language Selection
const languageSelect = document.getElementById("language-select");
if (languageSelect) {
  languageSelect.addEventListener("change", (e) => {
    const language = e.target.value;
    settings.appearance.language = language;
    localStorage.setItem("language", language);
    showToast("Đang thay đổi ngôn ngữ...", "success");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  });
}

// Settings Object to store all settings
const settings = {
  appearance: {
    theme: "dark",
    language: "vi",
    accentColor: "yellow",
    fontSize: "medium",
  },
  currency: {
    mainCurrency: "usd",
    numberFormat: "dot",
    timezone: "utc+7",
    dateFormat: "dmy",
  },
  notifications: {
    emailTransactions: true,
    emailNewLogin: true,
    emailSecurity: true,
    emailPriceAlerts: false,
    pushNotifications: false,
    smsNotifications: true,
    soundEnabled: true,
  },
  security: {
    transactionConfirm: "both",
    withdrawalLimit: "10000",
    autoWhitelist: false,
    autoLogout: "15",
  },
  display: {
    hideBalance: false,
    assetDisplay: "all",
    priceUnit: "usd",
    chartPeriod: "7d",
  },
  advanced: {
    network: "sepolia",
    gasFee: "medium",
    developerMode: false,
  },
};

// Load settings from localStorage
function loadSettings() {
  // Load individual settings from localStorage
  const savedLanguage = localStorage.getItem("language");
  if (savedLanguage) {
    settings.appearance.language = savedLanguage;
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    settings.appearance.theme = savedTheme;
  }

  const savedFontSize = localStorage.getItem("fontSize");
  if (savedFontSize) {
    settings.appearance.fontSize = savedFontSize;
  }

  const savedSettings = localStorage.getItem("walletSettings");
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings));
  }

  applySettings();
}

// Apply settings to UI
function applySettings() {
  // Appearance - Load language from localStorage first
  const currentLanguage =
    localStorage.getItem("language") || settings.appearance.language;
  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.value = currentLanguage;
  }

  const fontSizeSelect = document.getElementById("font-size-select");
  if (fontSizeSelect) {
    fontSizeSelect.value = settings.appearance.fontSize;
  }

  // Apply theme
  const savedTheme = localStorage.getItem("theme") || settings.appearance.theme;
  themeOptions.forEach((opt) => {
    if (opt.getAttribute("data-theme") === savedTheme) {
      opt.classList.add("active");
    } else {
      opt.classList.remove("active");
    }
  });
  applyTheme(savedTheme);

  // Apply saved font size
  const savedFontSize =
    localStorage.getItem("fontSize") || settings.appearance.fontSize;
  applyFontSize(savedFontSize);

  // Currency
  document.getElementById("currency-select").value =
    settings.currency.mainCurrency;
  document.getElementById("number-format-select").value =
    settings.currency.numberFormat;
  document.getElementById("timezone-select").value = settings.currency.timezone;
  document.getElementById("date-format-select").value =
    settings.currency.dateFormat;

  // Security
  document.getElementById("transaction-confirm-select").value =
    settings.security.transactionConfirm;
  document.getElementById("withdrawal-limit-select").value =
    settings.security.withdrawalLimit;
  document.getElementById("auto-logout-select").value =
    settings.security.autoLogout;

  // Display
  document.getElementById("hide-balance-toggle").checked =
    settings.display.hideBalance;
  document.getElementById("asset-display-select").value =
    settings.display.assetDisplay;
  document.getElementById("price-unit-select").value =
    settings.display.priceUnit;
  document.getElementById("chart-period-select").value =
    settings.display.chartPeriod;

  // Advanced
  document.getElementById("network-select").value = settings.advanced.network;
  document.getElementById("gas-fee-select").value = settings.advanced.gasFee;
}

// Auto-save other settings on change
function setupAutoSave() {
  // Currency settings
  document.getElementById("currency-select").addEventListener("change", (e) => {
    settings.currency.mainCurrency = e.target.value;
    localStorage.setItem("walletSettings", JSON.stringify(settings));
  });

  document
    .getElementById("number-format-select")
    .addEventListener("change", (e) => {
      settings.currency.numberFormat = e.target.value;
      localStorage.setItem("walletSettings", JSON.stringify(settings));
    });

  document.getElementById("timezone-select").addEventListener("change", (e) => {
    settings.currency.timezone = e.target.value;
    localStorage.setItem("walletSettings", JSON.stringify(settings));
  });

  document
    .getElementById("date-format-select")
    .addEventListener("change", (e) => {
      settings.currency.dateFormat = e.target.value;
      localStorage.setItem("walletSettings", JSON.stringify(settings));
    });

  // Security settings
  document
    .getElementById("transaction-confirm-select")
    .addEventListener("change", (e) => {
      settings.security.transactionConfirm = e.target.value;
      localStorage.setItem("walletSettings", JSON.stringify(settings));
    });

  document
    .getElementById("withdrawal-limit-select")
    .addEventListener("change", (e) => {
      settings.security.withdrawalLimit = e.target.value;
      localStorage.setItem("walletSettings", JSON.stringify(settings));
    });

  document
    .getElementById("auto-logout-select")
    .addEventListener("change", (e) => {
      settings.security.autoLogout = e.target.value;
      localStorage.setItem("walletSettings", JSON.stringify(settings));
    });

  // Display settings
  document
    .getElementById("hide-balance-toggle")
    .addEventListener("change", (e) => {
      settings.display.hideBalance = e.target.checked;
      localStorage.setItem("walletSettings", JSON.stringify(settings));
    });

  document
    .getElementById("asset-display-select")
    .addEventListener("change", (e) => {
      settings.display.assetDisplay = e.target.value;
      localStorage.setItem("walletSettings", JSON.stringify(settings));
    });

  document
    .getElementById("price-unit-select")
    .addEventListener("change", (e) => {
      settings.display.priceUnit = e.target.value;
      localStorage.setItem("walletSettings", JSON.stringify(settings));
    });

  document
    .getElementById("chart-period-select")
    .addEventListener("change", (e) => {
      settings.display.chartPeriod = e.target.value;
      localStorage.setItem("walletSettings", JSON.stringify(settings));
    });

  // Advanced settings
  document.getElementById("network-select").addEventListener("change", (e) => {
    settings.advanced.network = e.target.value;
    localStorage.setItem("walletSettings", JSON.stringify(settings));
  });

  document.getElementById("gas-fee-select").addEventListener("change", (e) => {
    settings.advanced.gasFee = e.target.value;
    localStorage.setItem("walletSettings", JSON.stringify(settings));
  });
}

// Clear Cache
document.getElementById("clear-cache-btn").addEventListener("click", () => {
  if (confirm("Xóa cache sẽ làm mất dữ liệu tạm thời. Tiếp tục?")) {
    // Clear cache (except settings)
    const savedSettings = localStorage.getItem("walletSettings");
    localStorage.clear();
    if (savedSettings) {
      localStorage.setItem("walletSettings", savedSettings);
    }
    sessionStorage.clear();
    showToast("Đã xóa cache thành công!", "success");
  }
});

// Export Data
document.getElementById("export-data-btn").addEventListener("click", () => {
  const data = {
    settings: settings,
    exportDate: new Date().toISOString(),
    version: "1.0",
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `mattien-wallet-data-${Date.now()}.json`;
  link.click();

  showToast("Đã xuất dữ liệu thành công!", "success");
});

// Reset All Settings
document.getElementById("reset-all-btn").addEventListener("click", () => {
  if (
    confirm(
      "⚠️ CẢNH BÁO: Hành động này sẽ xóa TẤT CẢ cài đặt và không thể hoàn tác!\n\nBạn có chắc chắn muốn tiếp tục?"
    )
  ) {
    if (confirm("Xác nhận lần cuối: Bạn THỰC SỰ muốn đặt lại tất cả?")) {
      localStorage.clear();
      sessionStorage.clear();
      showToast("Đã đặt lại tất cả cài đặt!", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }
});

// Toast Notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--bg-card);
    color: var(--text-dark);
    padding: 16px 24px;
    border-radius: 8px;
    border: 1px solid ${
      type === "success" ? "var(--green)" : "var(--border-color)"
    };
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  setupAutoSave();

  // Load theme from localStorage on page load
  const savedTheme = localStorage.getItem("theme") || "dark";
  settings.appearance.theme = savedTheme;
  applyTheme(savedTheme);

  // Load font size from localStorage
  const savedFontSize = localStorage.getItem("fontSize") || "medium";
  applyFontSize(savedFontSize);
});
