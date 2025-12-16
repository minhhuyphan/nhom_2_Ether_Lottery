const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  getStats,
  updateWallet,
  updateAvatar,
} = require("../controllers/profileController");

// All routes require authentication
router.use(protect);

// Profile routes
router.get("/", getProfile);
router.put("/", updateProfile);

// Stats route
router.get("/stats", getStats);

// Wallet route
router.put("/wallet", updateWallet);

// Avatar route
router.put("/avatar", updateAvatar);

module.exports = router;
