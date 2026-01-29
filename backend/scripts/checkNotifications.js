const mongoose = require("mongoose");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Import models
const Notification = require("../models/Notification");
const User = require("../models/User");

async function checkNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ether_lottery",
    );
    console.log("✅ Connected to MongoDB");

    // Get all notifications
    const totalNotifications = await Notification.countDocuments();
    console.log(`\n📊 Total Notifications in DB: ${totalNotifications}`);

    // Get recent notifications
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "username email");

    console.log("\n📬 Last 10 Notifications:");
    recentNotifications.forEach((notif, index) => {
      console.log(`\n${index + 1}. ${notif.title}`);
      console.log(`   User: ${notif.user?.username || "Unknown"}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Type: ${notif.type}`);
      console.log(`   Read: ${notif.isRead ? "✅" : "❌"}`);
      console.log(`   Created: ${notif.createdAt}`);
    });

    // Get unread count
    const unreadCount = await Notification.countDocuments({ isRead: false });
    console.log(`\n📌 Unread Notifications: ${unreadCount}`);

    // Get notifications with "upcoming draw" in title
    const upcomingDrawNotifs = await Notification.find({ title: /quay số/ })
      .sort({ createdAt: -1 })
      .populate("user", "username email");

    console.log(
      `\n🎯 Notifications about "Upcoming Draw": ${upcomingDrawNotifs.length}`,
    );
    upcomingDrawNotifs.forEach((notif) => {
      console.log(`   - ${notif.title} for user ${notif.user?.username}`);
    });

    console.log("\n✅ Check complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

checkNotifications();
