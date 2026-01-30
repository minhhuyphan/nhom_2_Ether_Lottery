const hre = require("hardhat");

async function main() {
  const contractAddress = "0x327F9548dC8599c634598f4a1b538C6351CfB22f";

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔍 THỬ TẤT CẢ CÁCH RÚT TIỀN");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [admin] = await hre.ethers.getSigners();
  console.log("👤 Your Wallet:", admin.address);

  const contractBalance = await hre.ethers.provider.getBalance(contractAddress);
  console.log("📍 Contract:", contractAddress);
  console.log(
    "💰 Contract Balance:",
    hre.ethers.formatEther(contractBalance),
    "ETH\n",
  );

  if (contractBalance == 0n) {
    console.log("⚠️  Contract không có tiền!");
    return;
  }

  const lottery = await hre.ethers.getContractAt("Lottery", contractAddress);

  // Method 1: withdrawAll()
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔄 Method 1: withdrawAll()");
  try {
    const tx = await lottery.withdrawAll();
    console.log("✅ SUCCESS! Tx:", tx.hash);
    await tx.wait();
    console.log("✅ Confirmed!");

    const newBalance = await hre.ethers.provider.getBalance(contractAddress);
    console.log(
      "💰 New contract balance:",
      hre.ethers.formatEther(newBalance),
      "ETH",
    );
    return;
  } catch (error) {
    console.log("❌ Failed:", error.message.split("\n")[0]);
  }

  // Method 2: withdraw(amount)
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔄 Method 2: withdraw(amount)");
  try {
    const tx = await lottery.withdraw(contractBalance);
    console.log("✅ SUCCESS! Tx:", tx.hash);
    await tx.wait();
    console.log("✅ Confirmed!");

    const newBalance = await hre.ethers.provider.getBalance(contractAddress);
    console.log(
      "💰 New contract balance:",
      hre.ethers.formatEther(newBalance),
      "ETH",
    );
    return;
  } catch (error) {
    console.log("❌ Failed:", error.message.split("\n")[0]);
  }

  // Method 3: Check manager
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔄 Method 3: Kiểm tra manager");
  try {
    const manager = await lottery.manager();
    console.log("👑 Manager:", manager);
    console.log("👤 Your wallet:", admin.address);

    if (manager.toLowerCase() === admin.address.toLowerCase()) {
      console.log("✅ Bạn là manager!");
    } else {
      console.log("❌ Bạn KHÔNG phải manager!");
      console.log("\n⚠️  CHỈ manager mới có thể rút tiền từ contract này!");
      console.log("Bạn không có quyền rút tiền.");
    }
  } catch (error) {
    console.log("❌ Không thể kiểm tra manager:", error.message.split("\n")[0]);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("❌ KHÔNG THỂ RÚT TIỀN TỪ CONTRACT NÀY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
