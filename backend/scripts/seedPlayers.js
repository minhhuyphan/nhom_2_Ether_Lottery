// Script tạo dữ liệu test
// Chạy: node scripts/seedPlayers.js

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const seedPlayers = async () => {
  try {
    await connectDB();

    const players = [
      {
        username: "player1",
        email: "player1@email.com",
        password: "password123",
        role: "user",
        balance: 0.5,
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f3a9c",
        isActive: true,
      },
      {
        username: "player2",
        email: "player2@email.com",
        password: "password123",
        role: "user",
        balance: 1.2,
        walletAddress: "0x8f2dB8f9e7b1e5c4d3a2f1e0c9b8a7d6f5e4c3b",
        isActive: true,
      },
      {
        username: "player3",
        email: "player3@email.com",
        password: "password123",
        role: "user",
        balance: 0.75,
        walletAddress: "0x3c4a9d2f1e0b5a7c8d9e2f3a4b5c6d7e8f9a0b1",
        isActive: true,
      },
      {
        username: "player4",
        email: "player4@email.com",
        password: "password123",
        role: "user",
        balance: 2.1,
        walletAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
        isActive: true,
      },
      {
        username: "player5",
        email: "player5@email.com",
        password: "password123",
        role: "user",
        balance: 0.33,
        walletAddress: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0",
        isActive: true,
      },
    ];

    // Xóa người chơi cũ
    await User.deleteMany({ role: "user" });
    console.log("🗑️  Đã xóa người chơi cũ");

    // Tạo người chơi mới
    const createdPlayers = await User.insertMany(players);
    console.log(`✅ Tạo ${createdPlayers.length} người chơi thành công!`);

    // Đóng connection
    await mongoose.disconnect();
    console.log("✅ Đã đóng kết nối MongoDB");
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
};

seedPlayers();
