# Setup Blockchain Prize Transfer (Gửi tiền thưởng vào MetaMask)

## Yêu cầu

Để gửi tiền thưởng trực tiếp vào ví MetaMask khi người chơi thắng, cần:

1. **Smart Contract được deploy trên Sepolia Testnet**
2. **Admin Wallet (MetaMask) với ETH để trả tiền thưởng**
3. **Infura API Key để kết nối RPC**
4. **Environment Variables được cấu hình**

## Các bước setup

### 1. Deploy Smart Contract (nếu chưa)

```bash
# Sử dụng Hardhat để deploy
cd d:\nhom_2_Ether_Lottery
npx hardhat run scripts/deploy.js --network sepolia
```

Lưu contract address từ output.

### 2. Lấy Infura API Key

1. Truy cập https://infura.io
2. Tạo account (hoặc login)
3. Tạo project cho Sepolia
4. Copy Project ID (API Key)

### 3. Setup Environment Variables

Cập nhật `.env` file:

```env
# Blockchain Configuration
ADMIN_PRIVATE_KEY=your_admin_wallet_private_key_here
ADMIN_WALLET_ADDRESS=0xYourAdminWalletAddress
LOTTERY_CONTRACT_ADDRESS=0xYourDeployedContractAddress
INFURA_API_KEY=your_infura_project_id
INFURA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id
```

**⚠️ CẢNH BÁO BẢOMAT:**
- Không share private key trên GitHub
- Giữ .env file bí mật
- Chỉ dùng testnet cho development

### 4. Lấy Private Key từ MetaMask

1. Mở MetaMask
2. Click vào avatar → Settings → Security & Privacy
3. Scroll xuống "Show Private Key"
4. Copy và paste vào .env (ADMIN_PRIVATE_KEY)
5. Copy wallet address vào .env (ADMIN_WALLET_ADDRESS)

### 5. Test Prize Transfer

Khi quay số và có người thắng, hệ thống sẽ:

```
✅ Cập nhật database (balance + trạng thái "won")
✅ Gửi transaction lên Sepolia blockchain
✅ Người thắng nhận tiền thực trong ví MetaMask
✅ Lưu transaction hash vào ticket
```

### 6. Kiểm tra Transaction

Sau khi quay số, check ticket để xem `prizeTransactionHash`:

```javascript
// Backend log sẽ in ra:
💸 Gửi tiền thưởng 0.001 ETH đến ví 0x...
✅ Gửi tiền thành công! TX: 0x...
```

Truy cập Sepolia explorer:
```
https://sepolia.etherscan.io/tx/TRANSACTION_HASH
```

## Troubleshooting

### Lỗi: "Missing blockchain configuration"
→ Kiểm tra .env có đầy đủ: ADMIN_PRIVATE_KEY, ADMIN_WALLET_ADDRESS, LOTTERY_CONTRACT_ADDRESS, INFURA_API_KEY

### Lỗi: "Insufficient balance"
→ Admin wallet không đủ ETH trên Sepolia. Request testnet ETH từ:
- https://sepolia-faucet.pk910.de/
- https://www.alchemy.com/faucets/ethereum-sepolia

### Lỗi: "Contract method not found"
→ Kiểm tra contract đã deploy hàm `sendPrizeToWinner` chưa

### Transaction không đi qua
→ Kiểm tra gas price, check transaction hash trên etherscan

## Production Deploy

Khi deploy production:
- Dùng mainnet thay vì Sepolia
- Setup wallet với real ETH
- Kiểm tra kỹ contract logic trước deploy
- Thêm transaction queuing nếu có nhiều transaction đồng thời
