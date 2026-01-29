const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["lottery", "system", "prize", "transaction", "info"],
      default: "system",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    data: {
      // Dữ liệu bổ sung (ticketId, amount, etc.)
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    icon: {
      type: String,
      default: "info",
    },
  },
  {
    timestamps: true,
  }
);

// Index để query nhanh hơn
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

// Static method để tạo thông báo mua vé
notificationSchema.statics.createTicketPurchaseNotification = async function (
  userId,
  ticketNumber,
  amount,
  ticketId
) {
  return await this.create({
    user: userId,
    title: "Mua vé thành công",
    message: `Bạn đã mua vé số ${ticketNumber} với giá ${amount} ETH. Chúc bạn may mắn!`,
    type: "lottery",
    icon: "ticket",
    data: {
      ticketId,
      ticketNumber,
      amount,
      action: "purchase",
    },
  });
};

// Static method để tạo thông báo trúng thưởng
notificationSchema.statics.createWinNotification = async function (
  userId,
  ticketNumber,
  prizeAmount,
  ticketId
) {
  return await this.create({
    user: userId,
    title: "🎉 Chúc mừng bạn trúng thưởng!",
    message: `Vé số ${ticketNumber} của bạn đã trúng thưởng ${prizeAmount} ETH!`,
    type: "prize",
    icon: "trophy",
    data: {
      ticketId,
      ticketNumber,
      prizeAmount,
      action: "win",
    },
  });
};

// Static method để tạo thông báo không trúng
notificationSchema.statics.createLossNotification = async function (
  userId,
  ticketNumber,
  ticketId
) {
  return await this.create({
    user: userId,
    title: "Kết quả xổ số",
    message: `Vé số ${ticketNumber} của bạn không trúng thưởng. Chúc bạn may mắn lần sau!`,
    type: "lottery",
    icon: "ticket",
    data: {
      ticketId,
      ticketNumber,
      action: "loss",
    },
  });
};

// Static method để tạo thông báo hệ thống
notificationSchema.statics.createSystemNotification = async function (
  userId,
  title,
  message,
  data = {}
) {
  return await this.create({
    user: userId,
    title,
    message,
    type: "system",
    icon: "info",
    data,
  });
};

module.exports = mongoose.model("Notification", notificationSchema);
