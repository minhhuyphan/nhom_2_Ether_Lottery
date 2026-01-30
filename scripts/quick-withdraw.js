const hre = require("hardhat");

async function main() {
  const contractAddress = "0x327F9548dC8599c634598f4a1b538C6351CfB22f";
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💰 QUICK WITHDRAW");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  const [admin] = await hre.ethers.getSigners();
  console.log("👤 Your Wallet:", admin.address);
  
  // Get balances
  const adminBalanceBefore = await hre.ethers.provider.getBalance(admin.address);
  const contractBalance = await hre.ethers.provider.getBalance(contractAddress);
  
  console.log("💼 Your Balance:", hre.ethers.formatEther(adminBalanceBefore), "ETH");
  console.log("📍 Contract:", contractAddress);
  console.log("💰 Contract Balance:", hre.ethers.formatEther(contractBalance), "ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  if (contractBalance == 0n) {
    console.log("⚠️  Contract không có tiền!");
    return;
  }
  
  // Get contract
  const lottery = await hre.ethers.getContractAt("Lottery", contractAddress);
  
  try {
    console.log("⏳ Đang rút toàn bộ tiền...\n");
    
    const tx = await lottery.withdrawAll();
    console.log("📝 Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("📦 Block:", receipt.blockNumber);
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
    
    // Get new balances
    const adminBalanceAfter = await hre.ethers.provider.getBalance(admin.address);
    const contractBalanceAfter = await hre.ethers.provider.getBalance(contractAddress);
    
    const received = adminBalanceAfter - adminBalanceBefore;
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 KẾT QUẢ:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💰 Đã nhận:", hre.ethers.formatEther(received), "ETH");
    console.log("💼 Balance mới:", hre.ethers.formatEther(adminBalanceAfter), "ETH");
    console.log("📍 Contract balance:", hre.ethers.formatEther(contractBalanceAfter), "ETH");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
  } catch (error) {
    console.error("❌ LỖI:", error.message);
    
    if (error.message.includes("Chi manager moi co quyen")) {
      console.log("\n⚠️  Bạn không phải manager của contract này!");
      console.log("Chỉ manager mới có thể rút tiền.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
