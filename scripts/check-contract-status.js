const hre = require("hardhat");

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 CONTRACT STATUS CHECK");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const contractAddress = process.env.LOTTERY_CONTRACT_ADDRESS || "0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc";
  const [admin] = await hre.ethers.getSigners();

  console.log("👤 Admin Wallet:", admin.address);
  const adminBalance = await hre.ethers.provider.getBalance(admin.address);
  console.log("💰 Admin Balance:", hre.ethers.formatEther(adminBalance), "ETH\n");

  console.log("📍 Contract Address:", contractAddress);
  
  // Check contract balance
  const contractBalance = await hre.ethers.provider.getBalance(contractAddress);
  console.log("💼 Contract Balance:", hre.ethers.formatEther(contractBalance), "ETH");
  
  if (contractBalance === 0n) {
    console.log("\n⚠️  WARNING: Contract balance is ZERO!");
    console.log("   → Cannot send prizes to winners");
    console.log("   → Users can buy tickets but won't receive prizes\n");
    console.log("💡 SOLUTION:");
    console.log("   1. Users buy tickets → Money goes TO contract");
    console.log("   2. OR Admin sends ETH to contract manually\n");
  } else {
    console.log("✅ Contract has funds - Can send prizes\n");
  }

  // Try to connect to contract and get info
  try {
    const Lottery = await hre.ethers.getContractFactory("Lottery");
    const lottery = Lottery.attach(contractAddress);
    
    const entranceFee = await lottery.entranceFee();
    const manager = await lottery.manager();
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 Contract Info:");
    console.log("   Entrance Fee:", hre.ethers.formatEther(entranceFee), "ETH");
    console.log("   Manager:", manager);
    console.log("   Is Admin?:", manager.toLowerCase() === admin.address.toLowerCase() ? "✅ YES" : "❌ NO");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
  } catch (error) {
    console.log("\n⚠️  Cannot connect to contract");
    console.log("   Error:", error.message);
  }

  console.log("🔍 Check on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
