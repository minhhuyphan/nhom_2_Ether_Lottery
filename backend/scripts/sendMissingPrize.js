const { Web3 } = require("web3");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const Ticket = require("../models/Ticket");
const Notification = require("../models/Notification");

const web3 = new Web3(process.env.INFURA_RPC_URL);
const contractAddress = process.env.LOTTERY_CONTRACT_ADDRESS;
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
const adminWallet = process.env.ADMIN_WALLET_ADDRESS;

async function sendPrizeToWinner(winnerAddress, amountETH) {
  try {
    const contractABI = [
      {
        inputs: [
          { internalType: "address", name: "winner", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "sendPrizeToWinner",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const nonce = await web3.eth.getTransactionCount(adminWallet);
    const baseGasPrice = await web3.eth.getGasPrice();
    const gasPrice = Math.floor(Number(baseGasPrice) * 1.2);

    const amountWei = String(web3.utils.toWei(amountETH.toString(), "ether"));

    const gasEstimate = await contract.methods
      .sendPrizeToWinner(winnerAddress, amountWei)
      .estimateGas({ from: adminWallet });

    const tx = {
      from: adminWallet,
      to: contractAddress,
      data: contract.methods
        .sendPrizeToWinner(winnerAddress, amountWei)
        .encodeABI(),
      gas: Math.ceil(Number(gasEstimate) * 1.2),
      gasPrice: gasPrice,
      nonce: Number(nonce),
      chainId: 11155111,
    };

    console.log(`💸 Sending ${amountETH} ETH to ${winnerAddress}...`);

    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      adminPrivateKey,
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );

    console.log(`✅ TX Success: ${receipt.transactionHash}`);
    return receipt.transactionHash;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    throw error;
  }
}

async function sendMissingPrize() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Lấy vé 398392
    const ticket = await Ticket.findOne({ ticketNumber: "398392" }).populate(
      "user",
    );

    if (!ticket) {
      console.log("❌ Ticket not found");
      process.exit(1);
    }

    console.log(`\n📋 Ticket: ${ticket.ticketNumber}`);
    console.log(`   User: ${ticket.user.username}`);
    console.log(`   Amount: ${ticket.amount} ETH`);
    console.log(`   Wallet: ${ticket.walletAddress}`);

    // Gửi tiền
    const txHash = await sendPrizeToWinner(ticket.walletAddress, ticket.amount);

    // Cập nhật vé
    ticket.prizeTransactionHash = txHash;
    ticket.blockchainError = null;
    await ticket.save();

    // Tạo notification
    try {
      await Notification.createPrizeReceivedNotification(
        ticket.user._id,
        ticket.ticketNumber,
        ticket.amount,
        ticket._id,
        txHash,
      );
      console.log(`✅ Notification created`);
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    console.log(`\n✅ Prize sent successfully!`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

sendMissingPrize();
