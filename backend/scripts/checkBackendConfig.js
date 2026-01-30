#!/usr/bin/env node

/**
 * Script kiểm tra cấu hình backend cho Lottery
 * node backend/scripts/checkBackendConfig.js
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

console.log("\n🔍 === KIỂM TRA CẤU HÌNH BACKEND === 🔍\n");

const configs = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET ? "✅ (được cấu hình)" : "❌",
  PORT: process.env.PORT || "5000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  LOTTERY_CONTRACT_ADDRESS: process.env.LOTTERY_CONTRACT_ADDRESS,
  ADMIN_WALLET_ADDRESS: process.env.ADMIN_WALLET_ADDRESS,
  ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY
    ? "✅ (được cấu hình)"
    : "❌",
  SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL || "Mặc định",
};

console.log("📋 CẤU HÌNH HIỆN TẠI:\n");
for (const [key, value] of Object.entries(configs)) {
  if (typeof value === "string" && value.startsWith("0x")) {
    // Hiển thị địa chỉ rút gọn
    console.log(
      `  ${key}: ${value.substring(0, 10)}...${value.substring(
        value.length - 8,
      )}`,
    );
  } else if (value && value.includes("mongodb")) {
    console.log(`  ${key}: ✅ (được cấu hình)`);
  } else {
    console.log(`  ${key}: ${value}`);
  }
}

console.log("\n");

// Kiểm tra các file quan trọng
console.log("📁 KIỂM TRA CẤC FILE:\n");

const requiredFiles = [
  "backend/config/database.js",
  "backend/models/Ticket.js",
  "backend/models/User.js",
  "backend/controllers/lotteryController.js",
  "backend/routes/lotteryRoutes.js",
];

const backendDir = path.join(__dirname, "..");
requiredFiles.forEach((file) => {
  const fullPath = path.join(backendDir, "..", file);
  const exists = fs.existsSync(fullPath) ? "✅" : "❌";
  console.log(`  ${exists} ${file}`);
});

console.log("\n");

// Kiểm tra cấu hình quan trọng
console.log("⚠️  === KIỂM TRA QUAN TRỌNG === ⚠️\n");

const important = [
  {
    name: "Admin Wallet",
    check: !!process.env.ADMIN_WALLET_ADDRESS,
    fix: "Thêm ADMIN_WALLET_ADDRESS vào .env",
  },
  {
    name: "Contract Address",
    check: !!process.env.LOTTERY_CONTRACT_ADDRESS,
    fix: "Deploy contract trước hoặc thêm địa chỉ vào .env",
  },
  {
    name: "MongoDB Connection",
    check: !!process.env.MONGODB_URI,
    fix: "Cấu hình MONGODB_URI trong .env",
  },
  {
    name: "JWT Secret",
    check: !!process.env.JWT_SECRET,
    fix: "Cấu hình JWT_SECRET trong .env",
  },
];

let allGood = true;
important.forEach((item) => {
  const status = item.check ? "✅" : "❌";
  console.log(`${status} ${item.name}`);
  if (!item.check) {
    console.log(`   ℹ️  ${item.fix}`);
    allGood = false;
  }
});

console.log("\n");

if (allGood) {
  console.log("✅ Backend đã sẵn sàng!\n");
  console.log("Bạn có thể khởi động backend bằng:");
  console.log("  npm start (hoặc npm run dev)\n");
} else {
  console.log("❌ Còn thiếu cấu hình. Vui lòng hoàn thiện trước khi chạy.\n");
}

// Hiển thị thông tin để kiểm tra
console.log("💡 === THÔNG TIN KIỂM TRA === 💡\n");
console.log("1. Kiểm tra kết nối MongoDB:");
console.log("   POST http://localhost:5000/api/auth/login\n");
console.log("2. Kiểm tra contract:");
console.log("   GET http://localhost:5000/api/lottery/info\n");
console.log("3. Mua vé số (cần auth):");
console.log("   POST http://localhost:5000/api/lottery/buy-ticket\n");
