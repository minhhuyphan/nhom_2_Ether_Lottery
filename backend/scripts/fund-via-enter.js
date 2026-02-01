const { Web3 } = require("web3");
require("dotenv").config();

async function fundViaEnter() {
  try {
    const web3 = new Web3(process.env.INFURA_RPC_URL);
    const contractAddress = process.env.LOTTERY_CONTRACT_ADDRESS;
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    const adminWallet = process.env.ADMIN_WALLET_ADDRESS;

    console.log("💰 FUND CONTRACT VIA ENTER\n");
    console.log("Admin Wallet:", adminWallet);
    console.log("Contract Address:", contractAddress);

    // Check current balance
    const contractBalance = await web3.eth.getBalance(contractAddress);
    console.log(
      "Current Contract Balance:",
      web3.utils.fromWei(contractBalance, "ether"),
      "ETH\n",
    );

    // Call enter 4 times (0.001 ETH each = 0.004 ETH total)
    const enterCalls = 4;
    const entranceFee = "0.001";

    const contractABI = [
      {
        inputs: [],
        name: "enter",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ];

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    for (let i = 1; i <= enterCalls; i++) {
      console.log(`\n[${i}/${enterCalls}] Calling enter()...`);

      const nonce = await web3.eth.getTransactionCount(adminWallet);
      const gasPrice = await web3.eth.getGasPrice();
      const amountWei = String(web3.utils.toWei(entranceFee, "ether"));

      const gasEstimate = await contract.methods.enter().estimateGas({
        from: adminWallet,
        value: amountWei,
      });

      const tx = {
        from: adminWallet,
        to: contractAddress,
        data: contract.methods.enter().encodeABI(),
        value: amountWei,
        gas: Math.ceil(Number(gasEstimate) * 1.2),
        gasPrice: Math.floor(Number(gasPrice) * 1.5),
        nonce: Number(nonce),
        chainId: 11155111,
      };

      const signedTx = await web3.eth.accounts.signTransaction(
        tx,
        adminPrivateKey,
      );
      const receipt = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
      );

      console.log(
        "   ✅ TX:",
        receipt.transactionHash.substring(0, 20) + "...",
      );
      console.log("   📍 Block:", receipt.blockNumber);

      // Wait 2 seconds between calls
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Check new balance
    console.log("\n🔄 Checking new balance...");
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

fundViaEnter();
