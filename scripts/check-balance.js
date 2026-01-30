const hre = require("hardhat");

async function main() {
  // Kiểm tra contract hoặc wallet address
  const targetAddress =
    process.env.CHECK_ADDRESS || "0x327F9548dC8599c634598f4a1b538C6351CfB22f";

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 Network:", hre.network.name);
  console.log("🔍 Checking Address:", targetAddress);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(targetAddress);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH");

  // Check if it's a contract
  const code = await hre.ethers.provider.getCode(targetAddress);
  if (code === "0x") {
    console.log("📝 Type: Wallet Address");
  } else {
    console.log("📝 Type: Smart Contract");
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Also check deployer balance
  const [deployer] = await hre.ethers.getSigners();
  const deployerBalance = await hre.ethers.provider.getBalance(
    deployer.address,
  );
  console.log("\n👤 Your Wallet:", deployer.address);
  console.log(
    "💰 Your Balance:",
    hre.ethers.formatEther(deployerBalance),
    "ETH",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
