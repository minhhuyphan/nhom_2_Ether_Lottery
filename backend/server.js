const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// 📍 Import các thành phần chính
const connectDB = require("./config/database"); // Kết nối MongoDB
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const lotteryRoutes = require("./routes/lotteryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// 🔗 Kết nối MongoDB Database
connectDB();

// ⚙️ Middleware - Xử lý request trước khi đến route
app.use(
  cors({
    // Cho phép request từ các domain này
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
    ],
    credentials: true, // Cho phép gửi cookies
  }),
);
app.use(express.json()); // Parse JSON từ request body
app.use(express.urlencoded({ extended: true })); // Parse form data

// 📁 Phục vụ static files từ thư mục frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// 🛣️ API Routes - Kết nối các routes API
app.use("/api/auth", authRoutes); // /api/auth/* - Đăng nhập, đăng ký
app.use("/api/profile", profileRoutes); // /api/profile/* - Thông tin user
app.use("/api/lottery", lotteryRoutes); // /api/lottery/* - Mua vé, quay số
app.use("/api/notifications", notificationRoutes); // /api/notifications/* - Thông báo

// ❤️ Health Check - Kiểm tra server có chạy không
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// ⏰ API Lấy thời gian server (dùng để check schedule)
app.get("/api/server-time", (req, res) => {
  const now = new Date();
  res.json({
    success: true,
    timestamp: now.toISOString(),
    unix: Math.floor(now.getTime() / 1000),
    date: now.toLocaleDateString("vi-VN"),
    time: now.toLocaleTimeString("vi-VN"),
  });
});

// ⛔ Xử lý 404 cho các API endpoint không tồn tại
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint không tồn tại",
  });
});

// 🌐 Phục vụ frontend cho các route khác (SPA routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/html/index.html"));
});

// ⚠️ Error Handling Middleware - Bắt tất cả lỗi server
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Đã có lỗi xảy ra từ server",
  });
});

// 🚀 Khởi động server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔════════════════════════════════════════════╗
║     🎰 Ether Lottery Backend Server 🎰     ║
╠════════════════════════════════════════════╣
║  ✅ Server chạy trên port: ${PORT}              ║
║  📍 API URL: http://localhost:${PORT}/api        ║
║  ❤️  Health check: http://localhost:${PORT}/api/health  ║
║  ⏰ Server time: http://localhost:${PORT}/api/server-time ║
╚════════════════════════════════════════════╝
  `);
});
