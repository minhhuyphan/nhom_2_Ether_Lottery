const mongoose = require("mongoose");
const Ticket = require("./models/Ticket");
require("dotenv").config();

async function checkFailed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to DB");

    const failed = await Ticket.find({
      status: "won",
      blockchainError: { $exists: true, $ne: null },
    });

    console.log(`\n🔍 Vé bị blockchain error: ${failed.length}`);

    if (failed.length > 0) {
      failed.forEach((t) => {
        console.log(
          `  - Vé ${t.ticketNumber}: ${t.blockchainError.substring(0, 60)}...`,
        );
      });
    } else {
      console.log("✅ Không có vé bị lỗi!");
    }

    process.exit(0);
  } catch (e) {
    console.error("❌ Error:", e.message);
    process.exit(1);
  }
}

checkFailed();
