const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");

async function checkUsers() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ether_lottery",
    );
    console.log("✅ Connected to MongoDB");

    // Get all users
    const allUsers = await User.find().select("username email role");
    console.log(`\n👥 All Users (${allUsers.length}):`);
    allUsers.forEach((user) => {
      console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
    });

    // Get regular users only
    const regularUsers = await User.find({ role: "user" }).select(
      "_id username",
    );
    console.log(`\n👤 Regular Players (role=user): ${regularUsers.length}`);
    regularUsers.forEach((user) => {
      console.log(`   - ${user._id}: ${user.username}`);
    });

    console.log("\n✅ Check complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

checkUsers();
