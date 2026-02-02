const express = require("express");
const router = express.Router();
const {
  buyTicket,
  getMyTickets,
  getMyStats,
  getPublicInfo,
  getLatestDraw,
  getEnterTxData,
  getAllTickets,
  getAdminStats,
  drawLottery,
  scheduleDraw,
  getFailedPrizes,
  retrySendPrize,
  retryAllFailedPrizes,
  getFinanceStats,
  getTransactions,
} = require("../controllers/lotteryController");
const { protect, adminOnly } = require("../middleware/auth");

// Public routes (không cần đăng nhập)
router.get("/public-info", getPublicInfo);
router.get("/latest-draw", getLatestDraw);
router.get("/enter-tx-data/:amount/:playerAddress", getEnterTxData);

// Protected routes (cần đăng nhập)
router.post("/buy-ticket", protect, buyTicket);
router.get("/my-tickets", protect, getMyTickets);
router.get("/my-stats", protect, getMyStats);

// Admin routes
router.get("/all-tickets", protect, adminOnly, getAllTickets);
router.get("/admin/stats", protect, adminOnly, getAdminStats);
router.get("/draw-results", protect, adminOnly, getLatestDraw);
router.post("/draw", protect, adminOnly, drawLottery);

// Schedule routes
router.post("/schedule-draw", protect, adminOnly, scheduleDraw);

// Prize retry routes (Admin - để fix lỗi gửi tiền)
router.get("/admin/failed-prizes", protect, adminOnly, getFailedPrizes);
router.post(
  "/admin/retry-send-prize/:ticketId",
  protect,
  adminOnly,
  retrySendPrize,
);
router.post(
  "/admin/retry-all-failed-prizes",
  protect,
  adminOnly,
  retryAllFailedPrizes,
);

// Finance routes (Admin - Thống kê tài chính)
router.get("/admin/finance-stats", protect, adminOnly, getFinanceStats);
router.get("/admin/transactions", protect, adminOnly, getTransactions);

module.exports = router;
