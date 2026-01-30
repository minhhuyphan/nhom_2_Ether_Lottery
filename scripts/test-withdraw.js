// Test withdraw function
const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Withdraw Functions...\n");

  // Get contract address from .env or hardhat config
  const CONTRACT_ADDRESS = process.env.LOTTERY_CONTRACT_ADDRESS || "0x327F9548dC8599c634598f4a1b538C6351CfB22f";
  
  // Get the contract instance
  const Lottery = await ethers.getContractFactory("Lottery");
  const lottery = await Lottery.attach(CONTRACT_ADDRESS);

  // Get signer (admin wallet)
  const [admin] = await ethers.getSigners();
  console.log("👤 Admin Address:", admin.address);
  console.log("💰 Admin Balance:", ethers.formatEther(await ethers.provider.getBalance(admin.address)), "ETH\n");

  // Get contract balance
  const contractBalance = await lottery.getBalance();
  console.log("💼 Contract Balance:", ethers.formatEther(contractBalance), "ETH\n");

  if (contractBalance > 0) {
    console.log("📤 Withdrawing 50% of contract balance...");
    const withdrawAmount = contractBalance / 2n;
    
    const tx = await lottery.withdraw(withdrawAmount);
    console.log("⏳ Transaction sent:", tx.hash);
    
    await tx.wait();
    console.log("✅ Withdrawal successful!\n");

    // Check new balances
    const newContractBalance = await lottery.getBalance();
    const newAdminBalance = await ethers.provider.getBalance(admin.address);
    
    console.log("📊 New Balances:");
    console.log("💼 Contract:", ethers.formatEther(newContractBalance), "ETH");
    console.log("👤 Admin:", ethers.formatEther(newAdminBalance), "ETH");
  } else {
    console.log("⚠️  Contract has no balance to withdraw");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
