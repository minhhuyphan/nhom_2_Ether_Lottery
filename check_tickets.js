const mongoose = require("mongoose");
const Ticket = require("./backend/models/Ticket");

async function check() {
  try {
    await mongoose.connect(
      "mongodb+srv://nguyentrivinhntv_db_user:2Swg8LWUcw91Mhce@cluster0.d7mbobc.mongodb.net/ether_lottery?retryWrites=true&w=majority",
    );

    const tickets = await Ticket.find().sort({ createdAt: -1 }).limit(5);
    console.log("\n📋 Tất cả vé gần đây:");

    if (tickets.length === 0) {
      console.log("❌ Không có vé nào");
    } else {
      tickets.forEach((t, i) => {
        console.log(
          `${i + 1}. Số: ${t.ticketNumber}, Amount: ${
            t.amount
          } ETH, isActive: ${t.isActive}, Status: ${t.status}`,
        );
      });
    }

    // Tính tổng
    const total = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);
    console.log(`\n💰 Tổng cộng: ${total} ETH\n`);

    mongoose.connection.close();
  } catch (e) {
    console.error("Error:", e.message);
  }
}

check();
