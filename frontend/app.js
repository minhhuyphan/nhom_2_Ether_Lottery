// MATTEN Wallet Dashboard - Cryptomus Style
const sampleState = {
  network: "Sepolia Testnet",
  address: "0xA1b2C3d4E5f678901234567890abcdef12345678",
  balanceUSD: 0.0,
  balancePrivate: 0.0,
  balanceBusiness: 0.0,
  balanceP2P: 0.0,
  balanceTrading: 0.0,
  wallets: [
    { name: "Main Wallet", address: "0xA1b2C3d4E5f67890", type: "Hot Wallet" },
  ],
  assets: [
    {
      symbol: "CRMS",
      name: "Chromia",
      balance: 0.0,
      balanceUSD: 0.0,
      price: 1.0,
      allocation: 0,
      icon: "⚫",
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      balance: 0.0,
      balanceUSD: 0.0,
      price: 86924.8,
      allocation: 0,
      icon: "🟠",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: 0.0,
      balanceUSD: 0.0,
      price: 2806.63,
      allocation: 0,
      icon: "🔷",
    },
    {
      symbol: "SOL",
      name: "Solana",
      balance: 0.0,
      balanceUSD: 0.0,
      price: 127.41,
      allocation: 0,
      icon: "🟣",
    },
    {
      symbol: "XMR",
      name: "Monero",
      balance: 0.0,
      balanceUSD: 0.0,
      price: 402.1,
      allocation: 0,
      icon: "🟧",
    },
  ],
};

function shortAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function updateBalance() {
  document.getElementById("balance-usd").textContent =
    sampleState.balanceUSD.toFixed(2);
  document.getElementById("balance-private").textContent =
    sampleState.balancePrivate.toFixed(2);
  document.getElementById("balance-business").textContent =
    sampleState.balanceBusiness.toFixed(2);
  document.getElementById("balance-p2p").textContent =
    sampleState.balanceP2P.toFixed(2);
  document.getElementById("balance-trading").textContent =
    sampleState.balanceTrading.toFixed(2);
}

function renderAssets() {
  const list = document.getElementById("asset-list");
  const noAssets = document.getElementById("no-assets");

  if (sampleState.assets.length === 0) {
    list.innerHTML = "";
    noAssets.classList.remove("hidden");
    return;
  }

  noAssets.classList.add("hidden");
  list.innerHTML = "";

  sampleState.assets.forEach((asset) => {
    const li = document.createElement("li");
    li.className = "asset-item";
    li.innerHTML = `
      <div class="asset-name">
        <div class="asset-icon">${asset.icon}</div>
        <div>
          <div class="asset-symbol">${asset.symbol}</div>
        </div>
      </div>
      <div class="asset-balance">
        ${asset.balance.toFixed(8)}<br>
        <span style="font-size:12px;color:#6B7280">$${asset.balanceUSD.toFixed(
          2
        )}</span>
      </div>
      <div class="asset-price">$${asset.price.toLocaleString()}</div>
      <div class="asset-allocation">
        <span>${asset.allocation}%</span>
        <div class="allocation-bar">
          <div class="allocation-fill" style="width:${asset.allocation}%"></div>
        </div>
      </div>
      <div>
        <button style="background:transparent;border:none;cursor:pointer;font-size:16px">⋯</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function setupActions() {
  // Copy address
  const copyBtn = document.getElementById("copy-address");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(sampleState.address);
        alert("Đã copy địa chỉ ví");
      } catch (e) {
        alert("Không thể copy: " + e);
      }
    });
  }

  // Action buttons
  const btnSendReceive = document.getElementById("btn-send-receive");
  const btnEarn = document.getElementById("btn-earn");
  const btnReport = document.getElementById("btn-report");
  const btnReceive = document.getElementById("btn-receive");
  const btnAddToken = document.getElementById("btn-add-token");

  if (btnSendReceive)
    btnSendReceive.addEventListener("click", () =>
      alert("Giới thiệu và kiếm tiền")
    );
  if (btnEarn) btnEarn.addEventListener("click", () => alert("Kiếm tiền"));
  if (btnReport)
    btnReport.addEventListener("click", () => alert("Báo cáo số dư"));
  if (btnReceive)
    btnReceive.addEventListener("click", () => alert("Nhận địa chỉ"));
  if (btnAddToken) {
    btnAddToken.addEventListener("click", () => {
      const symbol = prompt("Nhập symbol token mới (ví dụ: ABC)");
      const price = parseFloat(prompt("Nhập giá (USD)", "1.00")) || 1.0;
      if (symbol) {
        sampleState.assets.push({
          symbol,
          name: symbol,
          balance: 0,
          balanceUSD: 0,
          price,
          allocation: 0,
          icon: "⚪",
        });
        renderAssets();
      }
    });
  }

  // Modal handlers
  const modal = document.getElementById("modal");
  const modalClose = document.getElementById("modal-close");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const createBtn = document.getElementById("create-wallet");
  const importBtn = document.getElementById("import-wallet");

  if (modalClose) {
    modalClose.addEventListener("click", () => modal.classList.add("hidden"));
  }
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () =>
      modal.classList.add("hidden")
    );
  }

  if (createBtn) {
    createBtn.addEventListener("click", () => {
      const types = ["Hot Wallet", "Zen Card", "Hardware Wallet", "Watch-only"];
      const choice = prompt(
        "Chọn loại ví (gõ số):\n1. Hot Wallet\n2. Zen Card\n3. Hardware Wallet\n4. Watch-only",
        "1"
      );
      const idx = parseInt(choice) - 1;
      if (idx >= 0 && idx < types.length) {
        const name = prompt("Đặt tên cho ví mới", "My Wallet") || "My Wallet";
        const addr = "0x" + Math.random().toString(16).slice(2, 20);
        sampleState.wallets.push({ name, address: addr, type: types[idx] });
        alert("Đã tạo ví: " + name + " (" + types[idx] + ")");
        modal.classList.add("hidden");
        renderWallets();
      } else {
        alert("Không hợp lệ");
      }
    });
  }

  if (importBtn) {
    importBtn.addEventListener("click", () =>
      alert("Import wallet - chưa triển khai")
    );
  }
}

function renderWallets() {
  const walletList = document.getElementById("wallet-list");
  if (!walletList) return;

  walletList.innerHTML = "";
  sampleState.wallets.forEach((w) => {
    const li = document.createElement("li");
    li.className = "wallet-item";
    li.innerHTML = `
      <div><strong>${w.name}</strong></div>
      <div style="font-size:12px;color:#6B7280;font-family:monospace">${shortAddress(
        w.address
      )}</div>
      <div style="font-size:11px;color:#9CA3AF;margin-top:4px">${w.type}</div>
    `;
    walletList.appendChild(li);
  });
}

function init() {
  // Update address display
  const addressShort = document.getElementById("address-short");
  if (addressShort) {
    addressShort.textContent = shortAddress(sampleState.address);
  }

  updateBalance();
  renderAssets();
  renderWallets();
  setupActions();
}

document.addEventListener("DOMContentLoaded", init);
