#!/usr/bin/env node

/**
 * Script để retry gửi tiền cho những vé bị lỗi
 * Usage: node retryFailedPrizes.js
 */

const mongoose = require("mongoose");
const { Web3 } = require("web3");
require("dotenv").config();

// Models
const Ticket = require("../models/Ticket");
const User = require("../models/User");

// Web3 setup
const web3 = new Web3(
  process.env.INFURA_RPC_URL ||
    "https://sepolia.infura.io/v3/" + process.env.INFURA_API_KEY,
);
const contractAddress = process.env.LOTTERY_CONTRACT_ADDRESS;
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
const adminWallet = process.env.ADMIN_WALLET_ADDRESS;

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// Gửi tiền thưởng
async function sendPrizeToWinner(winnerAddress, amountETH, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!contractAddress || !adminPrivateKey || !adminWallet) {
        throw new Error("Missing blockchain configuration");
      }

      console.log(
        `📤 [Attempt ${attempt}/${maxRetries}] Gửi ${amountETH} ETH đến ${winnerAddress}...`,
      );

      const amountWei = String(web3.utils.toWei(amountETH.toString(), "ether"));

      const contractABI = [
        {
          inputs: [
            { internalType: "address", name: "winner", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
          ],
          name: "sendPrizeToWinner",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      const contract = new web3.eth.Contract(contractABI, contractAddress);

      const nonce = await web3.eth.getTransactionCount(adminWallet);
      const baseGasPrice = await web3.eth.getGasPrice();
      const multiplier = 1 + (attempt - 1) * 0.2;
      const gasPrice = Math.floor(Number(baseGasPrice) * multiplier);

      const gasEstimate = await contract.methods
        .sendPrizeToWinner(winnerAddress, amountWei)
        .estimateGas({ from: adminWallet });

      const tx = {
        from: adminWallet,
        to: contractAddress,
        data: contract.methods
          .sendPrizeToWinner(winnerAddress, amountWei)
          .encodeABI(),
        gas: Math.ceil(Number(gasEstimate) * 1.2),
        gasPrice: gasPrice,
        nonce: Number(nonce),
        chainId: 11155111,
      };

      const signedTx = await web3.eth.accounts.signTransaction(
        tx,
        adminPrivateKey,
      );

      const receipt = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
      );

      console.log(`✅ TX Success: ${receipt.transactionHash}`);
      return receipt.transactionHash;
    } catch (error) {
      lastError = error;
      console.error(`❌ [Attempt ${attempt}/${maxRetries}] ${error.message}`);

      if (
        error.message.includes("insufficient funds") ||
        error.message.includes("out of gas")
      ) {
        console.error("❌ Lỗi không thể retry");
        throw error;
      }

      if (attempt < maxRetries) {
        const waitTime = 3000 * attempt;
        console.log(`⏳ Chờ ${waitTime}ms trước khi retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

// Main function
async function main() {
  try {
    await connectDB();

    // Lấy tất cả vé bị lỗi
    const failedTickets = await Ticket.find({
      status: "won",
      blockchainError: { $exists: true, $ne: null },
    }).populate("user");

    console.log(`\n🔍 Tìm thấy ${failedTickets.length} vé bị lỗi\n`);

    if (failedTickets.length === 0) {
      console.log("✅ Không có vé bị lỗi");
      process.exit(0);
    }

    // Hiển thị danh sách
    console.log("📋 Danh sách vé bị lỗi:");
    failedTickets.forEach((t, i) => {
      console.log(
        `  ${i + 1}. Vé ${t.ticketNumber} | ${t.user.username} | ${
          t.prizeAmount
        } ETH | ${t.walletAddress}`,
      );
      console.log(`     Lỗi: ${t.blockchainError}`);
    });

    console.log("\n🔄 Bắt đầu retry...\n");

    let successful = 0;
    let failed = 0;

    for (const ticket of failedTickets) {
      try {
        const txHash = await sendPrizeToWinner(
          ticket.walletAddress,
          ticket.prizeAmount,
        );

        ticket.prizeTransactionHash = txHash;
        ticket.blockchainError = null;
        await ticket.save();
        successful++;

        console.log(`✅ Vé ${ticket.ticketNumber} - Thành công\n`);

        // Đợi 5 giây giữa mỗi transaction
        if (failedTickets.indexOf(ticket) < failedTickets.length - 1) {
          console.log("⏳ Chờ 5 giây...\n");
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch (error) {
        failed++;
        ticket.blockchainError = error.message;
        await ticket.save();

        console.log(
          `❌ Vé ${ticket.ticketNumber} - Thất bại: ${error.message}\n`,
        );
      }
    }

    console.log(`\n📊 KẾT QUẢ:`);
    console.log(`   ✅ Thành công: ${successful}`);
    console.log(`   ❌ Thất bại: ${failed}`);
    console.log(`   Tổng: ${failedTickets.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
