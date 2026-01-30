#!/usr/bin/env node

/**
 * Helper script để quản lý Lottery Contract
 * Các lệnh:
 * - node admin-setup.js check-config: Kiểm tra cấu hình
 * - node admin-setup.js show-admin: Hiển thị địa chỉ admin
 * - node admin-setup.js deploy: Deploy contract
 * - node admin-setup.js get-balance: Kiểm tra balance
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config();
const hre = require("hardhat");

const DEPLOYMENTS_DIR = path.join(__dirname, "deployments");

// Tạo folder deployments nếu chưa có
if (!fs.existsSync(DEPLOYMENTS_DIR)) {
  fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
}

async function checkConfig() {
  console.log("\n📋 === KIỂM TRA CẤU HÌNH === 📋\n");

  const checks = {
    PRIVATE_KEY: !!process.env.PRIVATE_KEY,
    ADMIN_WALLET_ADDRESS: !!process.env.ADMIN_WALLET_ADDRESS,
    ADMIN_PRIVATE_KEY: !!process.env.ADMIN_PRIVATE_KEY,
    SEPOLIA_RPC_URL: !!process.env.SEPOLIA_RPC_URL,
    LOTTERY_CONTRACT_ADDRESS: !!process.env.LOTTERY_CONTRACT_ADDRESS,
  };

  let allGood = true;
  for (const [key, exists] of Object.entries(checks)) {
    const status = exists ? "✅" : "❌";
    console.log(`${status} ${key}`);
    if (!exists) allGood = false;
  }

  console.log("\n");

  if (allGood) {
    console.log("✅ Tất cả cấu hình đã hoàn thiện!\n");
  } else {
    console.log("❌ Còn thiếu một số cấu hình. Vui lòng cập nhật .env\n");
    showEnvTemplate();
  }

  return allGood;
}

function showEnvTemplate() {
  console.log("📝 === MẪU FILE .env === 📝\n");
  console.log(`
# Private Key (Sepolia Testnet)
PRIVATE_KEY=0x...

# Sepolia RPC URL (từ Alchemy hoặc Infura)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Admin Wallet Address (địa chỉ ví nhận tiền)
ADMIN_WALLET_ADDRESS=0x...

# Admin Private Key (tuỳ chọn, để gửi giao dịch từ admin)
ADMIN_PRIVATE_KEY=0x...

# Contract Address (sau khi deploy)
LOTTERY_CONTRACT_ADDRESS=0x...
  `);
}

async function showAdmin() {
  console.log("\n👨‍💼 === THÔNG TIN ADMIN === 👨‍💼\n");

  if (!process.env.ADMIN_WALLET_ADDRESS) {
    console.log("❌ Chưa cấu hình ADMIN_WALLET_ADDRESS trong .env\n");
    return;
  }

  console.log(`📍 Admin Wallet: ${process.env.ADMIN_WALLET_ADDRESS}`);

  if (process.env.ADMIN_PRIVATE_KEY) {
    console.log("🔑 Admin Private Key: ✅ (Được cấu hình)\n");
  } else {
    console.log("🔑 Admin Private Key: ⚠️  (Chưa cấu hình)\n");
  }

  // Kiểm tra balance
  try {
    const provider = hre.ethers.getDefaultProvider("sepolia");
    const balance = await provider.getBalance(process.env.ADMIN_WALLET_ADDRESS);
    console.log(`💰 Admin Balance: ${hre.ethers.formatEther(balance)} ETH\n`);
  } catch (error) {
    console.log("⚠️  Không thể kiểm tra balance\n");
  }
}

async function deployContract() {
  console.log("\n🚀 === DEPLOY CONTRACT === 🚀\n");

  // Kiểm tra cấu hình
  if (!process.env.ADMIN_WALLET_ADDRESS) {
    console.log("❌ Thiếu ADMIN_WALLET_ADDRESS trong .env");
    return;
  }

  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log(`📝 Deploy với account: ${deployer.address}`);

    // Kiểm tra balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);

    if (parseFloat(hre.ethers.formatEther(balance)) < 0.01) {
      console.log("⚠️  Cảnh báo: Balance có thể không đủ!\n");
    }

    // Deploy
    console.log("⏳ Đang deploy contract...\n");
    const Lottery = await hre.ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy();
    await lottery.waitForDeployment();

    const contractAddress = await lottery.getAddress();
    const entranceFee = await lottery.entranceFee();

    console.log(`✅ Contract đã deploy thành công!`);
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🎫 Entrance Fee: ${hre.ethers.formatEther(entranceFee)} ETH`);
    console.log(`👨‍💼 Manager (Admin): ${process.env.ADMIN_WALLET_ADDRESS}\n`);

    // Lưu thông tin
    const deploymentInfo = {
      network: hre.network.name,
      contractAddress: contractAddress,
      deployer: deployer.address,
      adminWallet: process.env.ADMIN_WALLET_ADDRESS,
      timestamp: new Date().toISOString(),
      entranceFee: hre.ethers.formatEther(entranceFee),
      blockNumber: await hre.ethers.provider.getBlockNumber(),
    };

    const filePath = path.join(DEPLOYMENTS_DIR, `${hre.network.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Thông tin đã lưu: ${filePath}\n`);

    // Hướng dẫn tiếp theo
    console.log("📋 === TIẾP THEO === 📋\n");
    console.log(`1. Cập nhật CONTRACT_ADDRESS trong frontend/js/lottery.js:`);
    console.log(`   const CONTRACT_ADDRESS = "${contractAddress}";\n`);
    console.log(`2. Cập nhật LOTTERY_CONTRACT_ADDRESS trong .env\n`);
    console.log(`3. Deploy frontend lên server\n`);
    console.log(`4. Kiểm tra trên Block Explorer:`);
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}\n`);
  } catch (error) {
    console.error("❌ Lỗi deploy:", error.message);
    console.log("\nTroubleshooting:");
    console.log("- Kiểm tra PRIVATE_KEY trong .env");
    console.log("- Kiểm tra RPC URL");
    console.log("- Đảm bảo có đủ gas fee\n");
  }
}

async function getBalance() {
  console.log("\n💰 === KIỂM TRA BALANCE === 💰\n");

  try {
    const [signer] = await hre.ethers.getSigners();
    const balance = await signer.provider.getBalance(signer.address);

    console.log(`📍 Account: ${signer.address}`);
    console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

    // Kiểm tra contract
    if (process.env.LOTTERY_CONTRACT_ADDRESS) {
      const contractBalance = await signer.provider.getBalance(
        process.env.LOTTERY_CONTRACT_ADDRESS,
      );
      console.log(`📍 Contract: ${process.env.LOTTERY_CONTRACT_ADDRESS}`);
      console.log(
        `💰 Balance: ${hre.ethers.formatEther(contractBalance)} ETH\n`,
      );
    }
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  }
}

// Main
const command = process.argv[2];

switch (command) {
  case "check-config":
    checkConfig();
    break;
  case "show-admin":
    showAdmin();
    break;
  case "deploy":
    deployContract();
    break;
  case "get-balance":
    getBalance();
    break;
  default:
    console.log(`
🛠️  Admin Setup Helper

Các lệnh:
  node admin-setup.js check-config   - Kiểm tra cấu hình
  node admin-setup.js show-admin     - Hiển thị thông tin admin
  node admin-setup.js deploy         - Deploy contract
  node admin-setup.js get-balance    - Kiểm tra balance

Ví dụ:
  node admin-setup.js deploy --network sepolia
    `);
}
