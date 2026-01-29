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
} = require("../controllers/lotteryController");
const { protect, adminOnly } = require("../middleware/auth");

// Public routes (không cần đăng nhập)
router.get("/public-info", getPublicInfo);
router.get("/latest-draw", getLatestDraw);

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

module.exports = router;
