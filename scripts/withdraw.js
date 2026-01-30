const hre = require("hardhat");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💰 ADMIN WITHDRAWAL TOOL");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get contract address from environment or deployment file
  let contractAddress = process.env.LOTTERY_CONTRACT_ADDRESS;

  if (!contractAddress) {
    try {
      const deploymentPath = require("path").join(
        __dirname,
        "../deployments/sepolia.json",
      );
      const deployment = require(deploymentPath);
      contractAddress = deployment.contractAddress;
    } catch (error) {
      contractAddress = "0x327F9548dC8599c634598f4a1b538C6351CfB22f"; // fallback
    }
  }

  // Get admin wallet
  const [admin] = await hre.ethers.getSigners();
  console.log("👤 Admin Wallet:", admin.address);

  // Get admin balance
  const adminBalance = await hre.ethers.provider.getBalance(admin.address);
  console.log(
    "💼 Admin Balance:",
    hre.ethers.formatEther(adminBalance),
    "ETH\n",
  );

  // Connect to contract
  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = Lottery.attach(contractAddress);

  // Get contract balance
  const contractBalance = await lottery.getBalance();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 Contract Address:", contractAddress);
  console.log(
    "💰 Contract Balance:",
    hre.ethers.formatEther(contractBalance),
    "ETH",
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (contractBalance === 0n) {
    console.log("⚠️  Contract không có tiền để rút!");
    rl.close();
    return;
  }

  // Ask user what to do
  console.log("Chọn hành động:");
  console.log("1. Rút một phần tiền");
  console.log("2. Rút toàn bộ tiền");
  console.log("3. Hủy\n");

  const choice = await question("Nhập lựa chọn (1/2/3): ");

  if (choice === "3") {
    console.log("❌ Đã hủy");
    rl.close();
    return;
  }

  let tx;
  let amountToWithdraw;

  try {
    if (choice === "1") {
      // Withdraw specific amount
      const amountInput = await question("Nhập số ETH muốn rút: ");
      amountToWithdraw = hre.ethers.parseEther(amountInput);

      if (amountToWithdraw > contractBalance) {
        console.log("❌ Số tiền vượt quá số dư trong contract!");
        rl.close();
        return;
      }

      console.log(
        `\n⏳ Đang rút ${hre.ethers.formatEther(amountToWithdraw)} ETH...`,
      );
      tx = await lottery.withdraw(amountToWithdraw);
    } else if (choice === "2") {
      // Withdraw all
      amountToWithdraw = contractBalance;
      console.log(
        `\n⏳ Đang rút toàn bộ ${hre.ethers.formatEther(
          contractBalance,
        )} ETH...`,
      );
      tx = await lottery.withdrawAll();
    } else {
      console.log("❌ Lựa chọn không hợp lệ!");
      rl.close();
      return;
    }

    console.log("📤 Transaction Hash:", tx.hash);
    console.log("⏳ Đợi xác nhận...\n");

    const receipt = await tx.wait();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ RÚT TIỀN THÀNH CÔNG!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(
      "💸 Số tiền đã rút:",
      hre.ethers.formatEther(amountToWithdraw),
      "ETH",
    );
    console.log("🔗 Transaction:", tx.hash);
    console.log("⛽ Gas Used:", receipt.gasUsed.toString());
    console.log(
      "💵 Gas Cost:",
      hre.ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
      "ETH",
    );

    // Get new balances
    const newContractBalance = await lottery.getBalance();
    const newAdminBalance = await hre.ethers.provider.getBalance(admin.address);

    console.log("\n📊 SỐ DƯ MỚI:");
    console.log(
      "💼 Contract Balance:",
      hre.ethers.formatEther(newContractBalance),
      "ETH",
    );
    console.log(
      "👤 Admin Balance:",
      hre.ethers.formatEther(newAdminBalance),
      "ETH",
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Show Etherscan link
    console.log("🔍 Xem trên Sepolia Etherscan:");
    console.log(`https://sepolia.etherscan.io/tx/${tx.hash}\n`);
  } catch (error) {
    console.error("\n❌ LỖI:", error.message);
    if (error.message.includes("Chi manager moi co quyen")) {
      console.log("\n⚠️  Chỉ admin wallet mới có quyền rút tiền!");
    }
  }

  rl.close();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
