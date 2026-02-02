const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const Ticket = require("../models/Ticket");
const Notification = require("../models/Notification");

async function createMissingNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Tìm tất cả vé won có TX hash
    const wonTickets = await Ticket.find({
      status: "won",
      prizeTransactionHash: { $exists: true, $ne: null },
    }).populate("user");

    console.log(`\n🎫 Tìm thấy ${wonTickets.length} vé won với TX hash\n`);

    let created = 0;
    let skipped = 0;

    for (const ticket of wonTickets) {
      // Kiểm tra xem đã có notification công tiền chưa
      const existingNotif = await Notification.findOne({
        user: ticket.user._id,
        data: {
          transactionHash: ticket.prizeTransactionHash,
        },
      });

      if (existingNotif) {
        console.log(`⏭️  Vé ${ticket.ticketNumber} - Đã có notification`);
        skipped++;
        continue;
      }

      // Tạo notification
      try {
        await Notification.createPrizeReceivedNotification(
          ticket.user._id,
          ticket.ticketNumber,
          ticket.amount,
          ticket._id,
          ticket.prizeTransactionHash,
        );
        console.log(
          `✅ Vé ${ticket.ticketNumber} - Notification created for ${ticket.user.username}`,
        );
        created++;
      } catch (notifError) {
        console.error(
          `❌ Vé ${ticket.ticketNumber} - Lỗi tạo notification:`,
          notifError.message,
        );
      }
    }

    console.log(`\n📊 Kết quả:`);
    console.log(`   ✅ Tạo: ${created}`);
    console.log(`   ⏭️  Bỏ qua: ${skipped}`);
    console.log(`   Tổng: ${wonTickets.length}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createMissingNotifications();
