const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");
const Ticket = require("../models/Ticket");

async function findPendingTicket() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const pending = await Ticket.find({
      status: "won",
      prizeTransactionHash: null,
      blockchainError: null,
    }).populate("user", "username");

    console.log("⏳ Vé chưa gửi tiền: " + pending.length);

    for (const t of pending) {
      console.log("\n📋 Vé:", t.ticketNumber);
      console.log("   User:", t.user.username);
      console.log("   Amount:", t.amount, "ETH");
      console.log("   Wallet:", t.walletAddress);
    }
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

findPendingTicket();
