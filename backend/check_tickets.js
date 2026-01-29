const mongoose = require("mongoose");
const Ticket = require("./models/Ticket");

async function check() {
  try {
    await mongoose.connect(
      "mongodb+srv://nguyentrivinhntv_db_user:2Swg8LWUcw91Mhce@cluster0.d7mbobc.mongodb.net/ether_lottery?retryWrites=true&w=majority",
    );

    const allTickets = await Ticket.find();

    console.log("\n📊 PHÂN TÍCH VÉ:");
    console.log(`Total: ${allTickets.length} vé`);

    // Phân loại theo status
    const byStatus = {};
    allTickets.forEach((t) => {
      if (!byStatus[t.status]) byStatus[t.status] = [];
      byStatus[t.status].push(t);
    });

    for (const [status, tickets] of Object.entries(byStatus)) {
      const total = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);
      console.log(`\n${status.toUpperCase()}: ${tickets.length} vé - ${total.toFixed(6)} ETH`);
    }

    // Chỉ tính vé active
    const activeTickets = allTickets.filter((t) => t.status === "active");
    const activeTotal = activeTickets.reduce((sum, t) => sum + (t.amount || 0), 0);
    console.log(`\n💰 GIẢI THƯỞNG HIỆN TẠI (chỉ vé active): ${activeTotal.toFixed(6)} ETH\n`);

    mongoose.connection.close();
  } catch (e) {
    console.error("Error:", e.message);
  }
}

check();
