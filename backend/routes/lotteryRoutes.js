const express = require("express");
const router = express.Router();
const {
  buyTicket,
  getMyTickets,
  getMyStats,
  getAllTickets,
  getAdminStats,
  getPublicInfo,
  getLatestDraw,
  getRecentPlayers,
  drawLottery,
  getDrawResults,
  resetTickets,
  scheduleDraw,
  cancelScheduledDraw,
  getScheduledDraws,
  getFailedPrizes,
  retrySendPrize,
  retryAllFailedPrizes,
  getEnterTxData,
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
router.get("/admin/recent-players", protect, adminOnly, getRecentPlayers);
router.get("/draw-results", protect, adminOnly, getDrawResults);
router.post("/draw", protect, adminOnly, drawLottery);
router.post("/reset-tickets", protect, adminOnly, resetTickets);

// Schedule routes
router.post("/schedule-draw", protect, adminOnly, scheduleDraw);
router.post("/cancel-scheduled-draw", protect, adminOnly, cancelScheduledDraw);
router.get("/scheduled-draws", protect, adminOnly, getScheduledDraws);

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

module.exports = router;
