const express = require("express");
const router = express.Router();
const {
  buyTicket,
  getMyTickets,
  getMyStats,
  getAllTickets,
} = require("../controllers/lotteryController");
const { protect, adminOnly } = require("../middleware/auth");

// Protected routes (cần đăng nhập)
router.post("/buy-ticket", protect, buyTicket);
router.get("/my-tickets", protect, getMyTickets);
router.get("/my-stats", protect, getMyStats);

// Admin routes
router.get("/all-tickets", protect, adminOnly, getAllTickets);

module.exports = router;
