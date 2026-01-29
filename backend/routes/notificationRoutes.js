const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  broadcastNotification,
  notifyDrawResults,
  notifyUpcomingDraw,
  notifyAllPlayers,
} = require("../controllers/notificationController");
const { protect, adminOnly } = require("../middleware/auth");

// Tất cả routes đều cần authenticate
router.use(protect);

// User routes
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/delete-all", deleteAllNotifications);
router.delete("/:id", deleteNotification);

// Admin routes
router.post("/broadcast", adminOnly, broadcastNotification);
router.post("/notify-draw-results", adminOnly, notifyDrawResults);
router.post("/notify-upcoming-draw", adminOnly, notifyUpcomingDraw);
router.post("/notify-all", adminOnly, notifyAllPlayers);

module.exports = router;
