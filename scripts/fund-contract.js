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
  console.log("💰 FUND CONTRACT - Nạp Tiền Vào Contract");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const contractAddress =
    process.env.LOTTERY_CONTRACT_ADDRESS ||
    "0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc";

  const [admin] = await hre.ethers.getSigners();
  console.log("👤 Admin Wallet:", admin.address);

  const adminBalance = await hre.ethers.provider.getBalance(admin.address);
  console.log("💰 Admin Balance:", hre.ethers.formatEther(adminBalance), "ETH\n");

  console.log("📍 Contract Address:", contractAddress);
  const contractBalance = await hre.ethers.provider.getBalance(contractAddress);
  console.log("💼 Contract Balance:", hre.ethers.formatEther(contractBalance), "ETH\n");

  if (adminBalance < hre.ethers.parseEther("0.01")) {
    console.log("❌ Admin wallet không đủ ETH!");
    console.log("   Cần ít nhất 0.01 ETH để nạp tiền + gas\n");
    rl.close();
    return;
  }

  console.log("💡 TẠI SAO CẦN NẠP TIỀN?");
  console.log("   → Contract cần có tiền để trả thưởng cho người trúng");
  console.log("   → Nếu contract balance = 0, không thể gửi giải thưởng\n");

  const amount = await question("Nhập số ETH muốn nạp (ví dụ: 0.05): ");

  if (!amount || isNaN(parseFloat(amount))) {
    console.log("❌ Số tiền không hợp lệ!");
    rl.close();
    return;
  }

  const amountWei = hre.ethers.parseEther(amount);

  if (amountWei >= adminBalance) {
    console.log("❌ Không đủ ETH trong ví admin!");
    rl.close();
    return;
  }

  console.log(`\n⏳ Đang nạp ${amount} ETH vào contract...`);

  try {
    const tx = await admin.sendTransaction({
      to: contractAddress,
      value: amountWei,
    });

    console.log("📤 Transaction Hash:", tx.hash);
    console.log("⏳ Đợi xác nhận...\n");

    const receipt = await tx.wait();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ NẠP TIỀN THÀNH CÔNG!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💸 Số tiền đã nạp:", amount, "ETH");
    console.log("🔗 Transaction:", tx.hash);
    console.log("⛽ Gas Used:", receipt.gasUsed.toString());

    // Get new balances
    const newContractBalance = await hre.ethers.provider.getBalance(
      contractAddress
    );
    const newAdminBalance = await hre.ethers.provider.getBalance(admin.address);

    console.log("\n📊 SỐ DƯ MỚI:");
    console.log(
      "💼 Contract Balance:",
      hre.ethers.formatEther(newContractBalance),
      "ETH"
    );
    console.log(
      "👤 Admin Balance:",
      hre.ethers.formatEther(newAdminBalance),
      "ETH"
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🔍 Xem trên Sepolia Etherscan:");
    console.log(`https://sepolia.etherscan.io/tx/${tx.hash}\n`);

    console.log("✅ Giờ contract có thể trả thưởng cho người trúng!\n");
  } catch (error) {
    console.error("\n❌ LỖI:", error.message);
  }

  rl.close();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
