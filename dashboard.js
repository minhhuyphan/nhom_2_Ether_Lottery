#!/usr/bin/env node

/**
 * 🎯 DASHBOARD - Tổng quan hệ thống thanh toán Lottery
 * Hiển thị trạng thái setup và hướng dẫn tiếp theo
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config();

console.clear();
console.log(`
╔════════════════════════════════════════════════════════╗
║        🎰 LOTTERY PAYMENT SYSTEM - SETUP DASHBOARD     ║
║          Tiền Vào Ví Admin - Tự động                  ║
╚════════════════════════════════════════════════════════╝
`);

// 1. Check Configuration Status
console.log("\n📋 === CẤU HÌNH === 📋\n");

const configStatus = {
  PRIVATE_KEY: !!process.env.PRIVATE_KEY,
  ADMIN_WALLET_ADDRESS: !!process.env.ADMIN_WALLET_ADDRESS,
  ADMIN_PRIVATE_KEY: !!process.env.ADMIN_PRIVATE_KEY,
  SEPOLIA_RPC_URL: !!process.env.SEPOLIA_RPC_URL,
  MONGODB_URI: !!process.env.MONGODB_URI,
  JWT_SECRET: !!process.env.JWT_SECRET,
  LOTTERY_CONTRACT_ADDRESS: !!process.env.LOTTERY_CONTRACT_ADDRESS,
};

let requiredCount = 0;
let optional = 0;

for (const [key, exists] of Object.entries(configStatus)) {
  const status = exists ? "✅" : "❌";
  const type = ["ADMIN_PRIVATE_KEY", "LOTTERY_CONTRACT_ADDRESS"].includes(key)
    ? "(Tuỳ chọn)"
    : "";

  if (exists) {
    if (type) optional++;
    else requiredCount++;
  }

  console.log(`  ${status} ${key} ${type}`);
}

console.log(
  `\n  📊 Status: ${requiredCount}/5 Bắt buộc, ${optional}/2 Tuỳ chọn`,
);

// 2. Files Status
console.log("\n📁 === FILES === 📁\n");

const requiredFiles = [
  "contracts/Lottery.sol",
  "frontend/js/lottery.js",
  "backend/controllers/lotteryController.js",
  "backend/models/Ticket.js",
  ".env",
  ".env.example",
];

let filesOk = 0;
requiredFiles.forEach((file) => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  const status = exists ? "✅" : "❌";
  console.log(`  ${status} ${file}`);
  if (exists) filesOk++;
});

console.log(`\n  📊 Status: ${filesOk}/${requiredFiles.length} files có sẵn`);

// 3. Next Steps
console.log("\n🚀 === BƯỚC TIẾP THEO === 🚀\n");

if (!process.env.PRIVATE_KEY || !process.env.ADMIN_WALLET_ADDRESS) {
  console.log("  ❌ Chưa cấu hình .env\n");
  console.log("  📝 Hướng dẫn:");
  console.log("     1. Mở file .env hoặc tạo từ .env.example");
  console.log("     2. Thêm PRIVATE_KEY:");
  console.log("        - Mở MetaMask");
  console.log("        - Account details → Show private key");
  console.log("        - Copy và paste vào .env");
  console.log("     3. Thêm ADMIN_WALLET_ADDRESS:");
  console.log("        - MetaMask → Account details → Account address");
  console.log("     4. Chạy lại: node dashboard.js\n");
} else if (!process.env.LOTTERY_CONTRACT_ADDRESS) {
  console.log("  ⚠️  Chưa deploy contract\n");
  console.log("  📝 Hướng dẫn:");
  console.log("     1. Chạy: node admin-setup.js deploy");
  console.log("     2. Copy Contract Address từ output");
  console.log("     3. Thêm vào .env: LOTTERY_CONTRACT_ADDRESS=0x...");
  console.log("     4. Cập nhật frontend/js/lottery.js (dòng 10)");
  console.log("     5. Chạy lại: node dashboard.js\n");
} else {
  console.log("  ✅ Tất cả cấu hình hoàn thiện!\n");
  console.log("  📝 Tiếp theo:");
  console.log(
    "     1. Kiểm tra backend: cd backend && node scripts/checkBackendConfig.js",
  );
  console.log("     2. Khởi động backend: cd backend && npm start");
  console.log(
    "     3. Mở frontend: file:///d:/nhom_2_Ether_Lottery/frontend/html/index.html",
  );
  console.log("     4. Test mua vé\n");
}

// 4. Useful Commands
console.log("\n💡 === LỆNH TIỆN ÍCH === 💡\n");

console.log("  Kiểm tra cấu hình:");
console.log("     node admin-setup.js check-config\n");

console.log("  Xem thông tin admin:");
console.log("     node admin-setup.js show-admin\n");

console.log("  Deploy contract:");
console.log("     node admin-setup.js deploy\n");

console.log("  Kiểm tra balance:");
console.log("     node admin-setup.js get-balance\n");

console.log("  Kiểm tra backend config:");
console.log("     cd backend && node scripts/checkBackendConfig.js\n");

// 5. Quick Links
console.log("\n📚 === TÀI LIỆU === 📚\n");

const docs = [
  ["QUICK_START.md", "5 phút setup"],
  ["DEPLOY_STEP_BY_STEP.md", "Hướng dẫn chi tiết"],
  ["ADMIN_WALLET_SETUP.md", "Cấu hình ví chi tiết"],
  ["ADMIN_SCRIPTS_GUIDE.md", "Hướng dẫn scripts"],
  ["IMPLEMENTATION_SUMMARY.md", "Tóm tắt triển khai"],
  ["README_PAYMENT.md", "Ghi chú thanh toán"],
];

docs.forEach(([file, desc]) => {
  console.log(`  📖 ${file}`);
  console.log(`     → ${desc}\n`);
});

// 6. Status Summary
console.log("\n🎯 === TÓM TẮT === 🎯\n");

const setupProgress = (requiredCount / 5) * 100;
const fileProgress = (filesOk / requiredFiles.length) * 100;

console.log(
  `  Cấu hình: [${"█".repeat(Math.floor(setupProgress / 10))}${"░".repeat(
    10 - Math.floor(setupProgress / 10),
  )}] ${Math.floor(setupProgress)}%`,
);
console.log(
  `  Files:    [${"█".repeat(Math.floor(fileProgress / 10))}${"░".repeat(
    10 - Math.floor(fileProgress / 10),
  )}] ${Math.floor(fileProgress)}%\n`,
);

if (
  setupProgress === 100 &&
  fileProgress === 100 &&
  process.env.LOTTERY_CONTRACT_ADDRESS
) {
  console.log("  🎉 ĐỌC XONG! ĐÃ SẴN SÀNG CHẠY!\n");
} else if (setupProgress >= 80) {
  console.log("  🔄 Gần xong, còn vài bước...\n");
} else {
  console.log("  ⏳ Còn một số bước cần cấu hình\n");
}

// 7. Payment Flow
console.log("💰 === LUỒNG THANH TOÁN === 💰\n");

console.log(`
  Người Chơi (0.001 ETH + Gas)
       ↓
  Smart Contract
       ↓ transfer(admin)
       ↓
  Admin Wallet ✅
       ↓ (Thấy trong MetaMask)
       ↓
  Block Explorer (xem giao dịch)
`);

// 8. Final Message
console.log("\n═══════════════════════════════════════════════════════════\n");

if (process.env.LOTTERY_CONTRACT_ADDRESS && requiredCount === 5) {
  console.log("  ✅ Hệ thống sẵn sàng sử dụng!");
  console.log("  💰 Tiền sẽ vào ví admin tự động");
  console.log("  📊 Vé được lưu trong database");
  console.log("  🔔 Thông báo tới người chơi tự động\n");
} else {
  console.log(
    "  📋 Bạn đang ở bước:",
    !process.env.PRIVATE_KEY
      ? "Cấu hình .env"
      : !process.env.ADMIN_WALLET_ADDRESS
      ? "Cấu hình admin wallet"
      : !process.env.LOTTERY_CONTRACT_ADDRESS
      ? "Deploy contract"
      : "Kiểm tra backend",
  );
  console.log("  📖 Xem hướng dẫn: QUICK_START.md\n");
}

console.log("═══════════════════════════════════════════════════════════\n");
