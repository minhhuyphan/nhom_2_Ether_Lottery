// Connect Wallet functionality

let web3;
let userAccount;

// MetaMask Connect
const metamaskBtn = document.getElementById("metamask-btn");
const walletconnectBtn = document.getElementById("walletconnect-btn");
const coinbaseBtn = document.getElementById("coinbase-btn");

// Check if MetaMask is installed
function isMetaMaskInstalled() {
  return typeof window.ethereum !== "undefined";
}

// Connect to MetaMask
async function connectMetaMask() {
  if (!isMetaMaskInstalled()) {
    showError("MetaMask chưa được cài đặt. Vui lòng tải tại metamask.io");
    return;
  }

  try {
    metamaskBtn.classList.add("loading");

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    userAccount = accounts[0];
    web3 = new Web3(window.ethereum);

    // Get network
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    console.log("Connected to network:", chainId);

    // Success
    metamaskBtn.classList.remove("loading");
    metamaskBtn.classList.add("connected");

    showSuccess("Kết nối thành công!");

    // Save to localStorage
    localStorage.setItem("walletConnected", "true");
    localStorage.setItem("walletAddress", userAccount);
    localStorage.setItem("walletType", "metamask");

    // Redirect after 1.5 seconds
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  } catch (error) {
    metamaskBtn.classList.remove("loading");
    console.error("Error connecting to MetaMask:", error);

    if (error.code === 4001) {
      showError("Bạn đã từ chối kết nối ví");
    } else {
      showError("Lỗi kết nối: " + error.message);
    }
  }
}

// WalletConnect (placeholder)
async function connectWalletConnect() {
  walletconnectBtn.classList.add("loading");
  showError("WalletConnect sẽ được hỗ trợ trong phiên bản tiếp theo");
  setTimeout(() => {
    walletconnectBtn.classList.remove("loading");
  }, 1500);
}

// Coinbase Wallet (placeholder)
async function connectCoinbase() {
  coinbaseBtn.classList.add("loading");
  showError("Coinbase Wallet sẽ được hỗ trợ trong phiên bản tiếp theo");
  setTimeout(() => {
    coinbaseBtn.classList.remove("loading");
  }, 1500);
}

// Event listeners
if (metamaskBtn) {
  metamaskBtn.addEventListener("click", connectMetaMask);
}

if (walletconnectBtn) {
  walletconnectBtn.addEventListener("click", connectWalletConnect);
}

if (coinbaseBtn) {
  coinbaseBtn.addEventListener("click", connectCoinbase);
}

// Show error message
function showError(message) {
  let errorDiv = document.querySelector(".error-message");

  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    const walletOptions = document.querySelector(".wallet-options");
    walletOptions.parentNode.insertBefore(errorDiv, walletOptions);
  }

  errorDiv.textContent = message;
  errorDiv.style.display = "block";

  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 4000);
}

// Show success message
function showSuccess(message) {
  let successDiv = document.querySelector(".success-message");

  if (!successDiv) {
    successDiv = document.createElement("div");
    successDiv.className = "error-message";
    successDiv.style.cssText = `
      padding: 12px 16px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.5);
      border-radius: 8px;
      color: #86efac;
      font-size: 14px;
      text-align: center;
      margin-bottom: 16px;
      animation: slideDown 0.3s ease;
    `;
    const walletOptions = document.querySelector(".wallet-options");
    walletOptions.parentNode.insertBefore(successDiv, walletOptions);
  }

  successDiv.textContent = message;
  successDiv.style.display = "block";
}

// Check if already connected
if (localStorage.getItem("walletConnected") === "true") {
  window.location.href = "index.html";
}

// Listen for account changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      localStorage.removeItem("walletConnected");
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("walletType");
    } else {
      userAccount = accounts[0];
      localStorage.setItem("walletAddress", userAccount);
    }
  });

  window.ethereum.on("chainChanged", () => {
    // Reload page when network changes
    window.location.reload();
  });
}

// Add animations
const style = document.createElement("style");
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
