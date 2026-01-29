const Notification = require("../models/Notification");
const notificationService = require("../services/notificationService");

// @desc    Lấy danh sách thông báo của user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type; // Filter by type
    const unreadOnly = req.query.unread === "true";

    // Build query
    const query = { user: req.user._id };
    if (type) {
      query.type = type;
    }
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Lấy số lượng thông báo chưa đọc
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Đánh dấu thông báo đã đọc
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo",
      });
    }

    res.json({
      success: true,
      message: "Đã đánh dấu là đã đọc",
      data: notification,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Đánh dấu tất cả thông báo đã đọc
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true },
    );

    res.json({
      success: true,
      message: "Đã đánh dấu tất cả thông báo là đã đọc",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Xóa thông báo
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo",
      });
    }

    res.json({
      success: true,
      message: "Đã xóa thông báo",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Xóa tất cả thông báo
// @route   DELETE /api/notifications/delete-all
// @access  Private
exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: "Đã xóa tất cả thông báo",
    });
  } catch (error) {
    console.error("Delete all notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Gửi thông báo cho tất cả user (Admin only)
// @route   POST /api/notifications/broadcast
// @access  Private/Admin
exports.broadcastNotification = async (req, res) => {
  try {
    const { title, message, type = "system" } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tiêu đề và nội dung thông báo",
      });
    }

    // Lấy tất cả user
    const User = require("../models/User");
    const users = await User.find({ isActive: true }).select("_id");

    // Tạo thông báo cho tất cả user
    const notifications = users.map((user) => ({
      user: user._id,
      title,
      message,
      type,
      icon: "megaphone",
      data: { broadcast: true },
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Đã gửi thông báo đến ${users.length} người dùng`,
    });
  } catch (error) {
    console.error("Broadcast notification error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Gửi thông báo kết quả xổ số
// @route   POST /api/notifications/notify-draw-results
// @access  Private/Admin
exports.notifyDrawResults = async (req, res) => {
  try {
    const { winningNumber, prizeAmount } = req.body;

    if (!winningNumber || !prizeAmount) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp winningNumber và prizeAmount",
      });
    }

    const result = await notificationService.notifyDrawResults(
      winningNumber,
      prizeAmount,
    );

    res.json({
      success: true,
      message: "Gửi thông báo kết quả xổ số thành công",
      data: result,
    });
  } catch (error) {
    console.error("Notify draw results error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Gửi thông báo sắp tới giờ quay số
// @route   POST /api/notifications/notify-upcoming-draw
// @access  Private/Admin
exports.notifyUpcomingDraw = async (req, res) => {
  try {
    const { drawTime } = req.body;

    if (!drawTime) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp drawTime (format: HH:MM)",
      });
    }

    const result = await notificationService.notifyUpcomingDraw(drawTime);

    res.json({
      success: true,
      message: "Gửi thông báo sắp tới giờ quay thành công",
      data: result,
    });
  } catch (error) {
    console.error("Notify upcoming draw error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Gửi thông báo tổng quát cho tất cả người chơi
// @route   POST /api/notifications/notify-all
// @access  Private/Admin
exports.notifyAllPlayers = async (req, res) => {
  try {
    const { title, message, data } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp title và message",
      });
    }

    const result = await notificationService.notifyAllPlayers(
      title,
      message,
      data,
    );

    res.json({
      success: true,
      message: "Gửi thông báo cho tất cả người chơi thành công",
      data: result,
    });
  } catch (error) {
    console.error("Notify all players error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};
