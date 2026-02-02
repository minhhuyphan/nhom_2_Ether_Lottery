require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Ticket = require("../backend/models/Ticket");

const userId = "69402ce98e6f8323effc45f1";

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("📊 Checking tickets for user:", userId);
    console.log("=".repeat(80));

    const tickets = await Ticket.find({ user: userId }).sort({
      purchaseDate: -1,
    });

    console.log(`\n✅ Total Tickets: ${tickets.length}\n`);

    let total = 0;
    let suspiciousTickets = [];

    tickets.forEach((ticket, index) => {
      const amount = parseFloat(ticket.amount);
      total += amount;

      // Flag if amount > 1 ETH (suspicious)
      if (amount > 1) {
        suspiciousTickets.push({
          index: index + 1,
          ticketNumber: ticket.ticketNumber,
          amount,
          transactionHash: ticket.transactionHash?.slice(0, 20) + "...",
          purchaseDate: ticket.purchaseDate,
          status: ticket.status,
        });
      }

      console.log(
        `${index + 1}. Ticket: ${
          ticket.ticketNumber
        } | Amount: ${amount} ETH | Status: ${ticket.status}`,
      );
    });

    console.log("\n" + "=".repeat(80));
    console.log(`\n💰 TOTAL SPENT: ${total.toFixed(6)} ETH`);
    console.log(
      `📈 AVERAGE PER TICKET: ${(total / tickets.length).toFixed(6)} ETH`,
    );

    if (suspiciousTickets.length > 0) {
      console.log(
        `\n⚠️  SUSPICIOUS TICKETS (Amount > 1 ETH): ${suspiciousTickets.length}`,
      );
      suspiciousTickets.forEach((t) => {
        console.log(
          `  - Ticket #${t.index}: ${t.ticketNumber} = ${t.amount} ETH`,
        );
      });
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
