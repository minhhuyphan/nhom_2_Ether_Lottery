const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Notification = require("../models/Notification");

/**
 * Gửi thông báo kết quả xổ số cho tất cả người chơi
 * @param {String} winningNumber - Số trúng thưởng (6 chữ số)
 * @param {Number} totalPrize - Tổng tiền thưởng
 */
exports.notifyDrawResults = async (winningNumber, totalPrize) => {
  try {
    console.log(`📢 Gửi thông báo kết quả xổ số: ${winningNumber}`);

    // Tìm tất cả vé có winningNumber được set (có nghĩa là đã được quay)
    const winningTickets = await Ticket.find({
      winningNumber: winningNumber,
      status: "won",
    }).populate("user", "_id username");

    const losingTickets = await Ticket.find({
      winningNumber: winningNumber,
      status: "lost",
    }).populate("user", "_id username");

    console.log(`  - Người trúng: ${winningTickets.length}`);
    console.log(`  - Người không trúng: ${losingTickets.length}`);

    // Gửi thông báo cho người trúng
    for (const ticket of winningTickets) {
      try {
        await Notification.createWinNotification(
          ticket.user._id,
          ticket.ticketNumber,
          ticket.prizeAmount || ticket.amount,
          ticket._id,
        );
        console.log(
          `  ✅ Win notification sent to ${ticket.user.username} (${ticket.ticketNumber})`,
        );
      } catch (createError) {
        console.error(
          `  ❌ Error creating win notification for ${ticket.user.username}:`,
          createError.message,
        );
      }
    }

    // Gửi thông báo cho người không trúng
    for (const ticket of losingTickets) {
      try {
        await Notification.createLossNotification(
          ticket.user._id,
          ticket.ticketNumber,
          ticket._id,
        );
        console.log(`  ✅ Loss notification sent to ${ticket.user.username}`);
      } catch (createError) {
        console.error(
          `  ❌ Error creating loss notification for ${ticket.user.username}:`,
          createError.message,
        );
      }
    }

    console.log("✅ Gửi thông báo kết quả xổ số thành công");
    return {
      success: true,
      winningNumber,
      winners: winningTickets.length,
      losers: losingTickets.length,
      totalPrize,
    };
  } catch (error) {
    console.error("Error notifying draw results:", error);
    throw error;
  }
};

/**
 * Gửi thông báo sắp tới giờ quay số cho tất cả người chơi
 * @param {String} drawTime - Thời gian quay (format: "20:00")
 */
exports.notifyUpcomingDraw = async (drawTime) => {
  try {
    console.log(`📢 Gửi thông báo sắp tới giờ quay số lúc ${drawTime}`);

    // Lấy tất cả người dùng
    const users = await User.find({ role: "user" }).select("_id");
    console.log(`👥 Found ${users.length} users with role 'user'`);

    if (!users.length) {
      console.log("Không có người dùng để gửi thông báo");
      return { notified: 0 };
    }

    // Gửi thông báo cho tất cả người chơi
    const notifications = users.map((user) => {
      try {
        console.log(`🔔 Creating notification for user ${user._id}`);
        const notificationPromise = Notification.createSystemNotification(
          user._id,
          "⏰ Sắp tới giờ quay số",
          `Xổ số sẽ quay lúc ${drawTime}. Bạn hãy chắc chắn đã mua vé để tham gia!`,
          {
            drawTime,
            action: "upcoming_draw",
          },
        );
        return notificationPromise;
      } catch (mapError) {
        console.error(
          `❌ Error mapping notification for user ${user._id}:`,
          mapError,
        );
        throw mapError;
      }
    });

    console.log(
      `⏳ Waiting for ${notifications.length} notification promises...`,
    );
    const results = await Promise.all(notifications);
    console.log(`✅ Created ${results.length} notifications successfully`);

    console.log(
      `✅ Gửi thông báo sắp tới giờ quay cho ${users.length} người chơi`,
    );
    return {
      success: true,
      drawTime,
      notified: users.length,
    };
  } catch (error) {
    console.error("❌ Error notifying upcoming draw:", error.message);
    console.error(error.stack);
    throw error;
  }
};

/**
 * Gửi thông báo tổng quát cho tất cả người chơi
 * @param {String} title - Tiêu đề
 * @param {String} message - Nội dung
 * @param {Object} data - Dữ liệu bổ sung
 */
exports.notifyAllPlayers = async (title, message, data = {}) => {
  try {
    console.log(`📢 Gửi thông báo tổng quát: ${title}`);

    // Lấy tất cả người dùng
    const users = await User.find({ role: "user" }).select("_id");

    if (!users.length) {
      console.log("Không có người dùng để gửi thông báo");
      return { notified: 0 };
    }

    // Tạo thông báo cho tất cả người chơi
    const notifications = users.map((user) =>
      Notification.create({
        user: user._id,
        title,
        message,
        type: "system",
        data: { ...data, broadcast: true },
        isRead: false,
      }),
    );

    await Promise.all(notifications);

    console.log(`✅ Gửi thông báo tổng quát cho ${users.length} người chơi`);
    return {
      success: true,
      title,
      notified: users.length,
    };
  } catch (error) {
    console.error("Error notifying all players:", error);
    throw error;
  }
};
