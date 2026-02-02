const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

// Tất cả routes đều cần authenticate
router.use(protect);

// User routes - Giữ lại
router.get("/", getNotifications);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
