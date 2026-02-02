const { Web3 } = require("web3");
require("dotenv").config();

async function fundContract() {
  try {
    const web3 = new Web3(process.env.INFURA_RPC_URL);
    const contractAddress = process.env.LOTTERY_CONTRACT_ADDRESS;
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    const adminWallet = process.env.ADMIN_WALLET_ADDRESS;

    console.log("💰 FUND CONTRACT\n");
    console.log("Admin Wallet:", adminWallet);
    console.log("Contract Address:", contractAddress);

    // Check current balance
    const contractBalance = await web3.eth.getBalance(contractAddress);
    console.log(
      "Current Contract Balance:",
      web3.utils.fromWei(contractBalance, "ether"),
      "ETH\n",
    );

    const adminBalance = await web3.eth.getBalance(adminWallet);
    console.log(
      "Admin Balance:",
      web3.utils.fromWei(adminBalance, "ether"),
      "ETH",
    );

    // Fund amount
    const fundAmount = "0.02"; // 0.02 ETH
    const amountWei = String(web3.utils.toWei(fundAmount, "ether"));

    if (
      BigInt(adminBalance) <
      BigInt(amountWei) + BigInt("50000000000000000")
    ) {
      console.log("❌ Admin wallet không đủ tiền!");
      return;
    }

    console.log("\n🔄 Gửi", fundAmount, "ETH vào contract...");

    // Get nonce
    const nonce = await web3.eth.getTransactionCount(adminWallet);

    // Get gas price
    const gasPrice = await web3.eth.getGasPrice();

    // Build transaction
    const tx = {
      from: adminWallet,
      to: contractAddress,
      value: amountWei,
      gas: 100000, // Increase gas
      gasPrice: Math.floor(Number(gasPrice) * 2), // Double gas price
      nonce: Number(nonce),
      chainId: 11155111,
    };

    console.log("\n📋 Transaction Details:");
    console.log("   Value:", fundAmount, "ETH");
    console.log("   Gas:", tx.gas);
    console.log("   Gas Price:", web3.utils.fromWei(gasPrice, "gwei"), "Gwei");

    // Sign transaction
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      adminPrivateKey,
    );

    // Send transaction
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );

    console.log("\n✅ Transaction successful!");
    console.log("   TX Hash:", receipt.transactionHash);
    console.log("   Block:", receipt.blockNumber);

    // Check new balance
    const newBalance = await web3.eth.getBalance(contractAddress);
    console.log(
      "\n💼 New Contract Balance:",
      web3.utils.fromWei(newBalance, "ether"),
      "ETH",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fundContract();
