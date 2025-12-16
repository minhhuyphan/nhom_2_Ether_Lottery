const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketNumber: {
      type: String,
      required: true,
      match: /^\d{6}$/, // Exactly 6 digits
      trim: true,
    },
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "won", "lost"],
      default: "active",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    drawDate: {
      type: Date,
    },
    winningNumber: {
      type: String,
    },
    prizeAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ticketSchema.index({ user: 1, purchaseDate: -1 });
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ transactionHash: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);
