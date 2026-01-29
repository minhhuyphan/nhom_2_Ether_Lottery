const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const notificationService = require("../services/notificationService");
const User = require("../models/User");
const Notification = require("../models/Notification");

async function testNotifyUpcomingDraw() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ether_lottery",
    );
    console.log("✅ Connected to MongoDB");

    console.log("\n📢 Testing notifyUpcomingDraw('18:32')...");
    const result = await notificationService.notifyUpcomingDraw("18:32");
    console.log("✅ Result:", result);

    // Check notifications created
    console.log("\n📊 Checking notifications in DB...");
    const allNotifs = await Notification.find({ title: /quay số/ })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "username");

    console.log(`📬 Found ${allNotifs.length} notifications about "quay số":`);
    allNotifs.forEach((notif) => {
      console.log(`   - ${notif.title} for user ${notif.user?.username}`);
    });

    console.log("\n✅ Test complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testNotifyUpcomingDraw();
