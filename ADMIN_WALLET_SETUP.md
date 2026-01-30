# Hướng Dẫn Thiết Lập Chuyển Tiền Vào Ví Admin

## 📋 Tổng Quan

Khi người chơi mua vé số, tiền sẽ được chuyển **trực tiếp** vào ví MetaMask của admin thay vì giữ trong smart contract.

## 🔧 Các Bước Thực Hiện

### 1. Cập Nhật File .env

Thêm địa chỉ ví admin vào file `.env`:

```env
# Admin Wallet Address (địa chỉ ví MetaMask của admin)
ADMIN_WALLET_ADDRESS=0x[YOUR_ADMIN_WALLET_ADDRESS]

# Admin Private Key (để gửi giao dịch từ ví admin nếu cần)
ADMIN_PRIVATE_KEY=0x[YOUR_ADMIN_PRIVATE_KEY]
```

**Lấy địa chỉ từ MetaMask:**
- Mở MetaMask
- Click vào avatar → Account details
- Copy "Account address"

### 2. Deploy Smart Contract

Chạy lệnh deploy trên Sepolia Testnet:

```bash
# Chuyển đến thư mục project
cd d:\nhom_2_Ether_Lottery

# Install dependencies nếu chưa có
npm install

# Deploy contract
npx hardhat run scripts/deploy.js --network sepolia
```

**Kết quả:** Sẽ hiển thị địa chỉ contract. Lưu lại!

### 3. Cập Nhật Địa Chỉ Contract

Sau khi deploy thành công:

1. Copy địa chỉ contract từ console output
2. Cập nhật trong file `frontend/js/lottery.js`:
   ```javascript
   const CONTRACT_ADDRESS = "0x[NEW_CONTRACT_ADDRESS]"; // Cập nhật tại dòng 10
   ```

3. Cập nhật trong file `.env`:
   ```env
   LOTTERY_CONTRACT_ADDRESS=0x[NEW_CONTRACT_ADDRESS]
   ```

### 4. Xác Minh Contract Trên Block Explorer (Tùy Chọn)

Để người chơi có thể xem source code:

```bash
# Cần hardhat-etherscan plugin
npm install --save-dev @nomicfoundation/hardhat-etherscan

# Verify
npx hardhat verify --network sepolia 0x[CONTRACT_ADDRESS]
```

## 💰 Quy Trình Thanh Toán

### Khi Người Chơi Mua Vé:

```
User Account (Người chơi)
    ↓ Gửi 0.001 ETH
    ↓
Smart Contract (tạm thời)
    ↓ Ngay lập tức chuyển tiền cho admin
    ↓
Admin Wallet (ví admin nhận tiền)
```

### Backend Lưu Thông Tin Vé:
- Lưu số vé vào database
- Lưu transaction hash
- Lưu số tiền
- Gửi thông báo cho người chơi

## 🎯 Chi Tiết Kỹ Thuật

### Smart Contract Functions:

#### 1. `enter()` - Tham gia xổ số
- Người chơi gọi hàm này với tiền
- Smart contract chuyển tiền cho admin ngay lập tức
- Thêm người chơi vào danh sách
- Emit event `FundsTransferredToAdmin`

```solidity
function enter() public payable {
    require(msg.value >= entranceFee, "Không đủ phí");
    players.push(msg.sender);
    totalCollected += msg.value;
    payable(manager).transfer(msg.value);  // Chuyển cho admin
    emit PlayerEntered(msg.sender, msg.value);
    emit FundsTransferredToAdmin(manager, msg.value);
}
```

#### 2. `getTotalCollected()` - Lấy tổng tiền thu được
- Dùng để theo dõi tổng tiền
- Backend dùng để xác nhận số tiền thưởng

```solidity
function getTotalCollected() public view returns (uint256) {
    return totalCollected;
}
```

#### 3. `pickWinner()` - Chọn người thắng
- Chỉ manager gọi được
- Gửi tiền thưởng từ `totalCollected`
- Reset lại xổ số

```solidity
function pickWinner() public restricted {
    require(players.length > 0, "Không có người chơi");
    uint index = random() % players.length;
    address winner = players[index];
    uint256 prize = totalCollected;
    payable(winner).transfer(prize);
    totalCollected = 0;
    players = new address[](0);
}
```

## ✅ Kiểm Tra

### 1. Trên Block Explorer (Sepolia):
- Vào https://sepolia.etherscan.io
- Tìm contract address
- Xem các transaction

### 2. Trên MetaMask:
- Mở admin wallet
- Xem "Activity"
- Kiểm tra các transaction nhận tiền

### 3. Trong Database:
```bash
# Kết nối MongoDB và kiểm tra
use ether_lottery
db.tickets.find()
```

## 🚨 Lưu Ý Quan Trọng

1. **Private Key**: Giữ bí mật private key của admin
2. **Testnet**: Hiện đang dùng Sepolia Testnet (tiền ảo)
3. **Gas Fee**: Mỗi transaction sẽ trừ một chút gas fee
4. **Thứ tự**: Deploy contract → Cập nhật frontend → Test

## 🔗 Tài Liệu Tham Khảo

- [Sepolia Testnet Faucet](https://www.alchemy.com/faucets/ethereum-sepolia) - Lấy tiền test
- [Etherscan Sepolia](https://sepolia.etherscan.io) - Block Explorer
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## 📞 Troubleshooting

### Lỗi: "Insufficient funds"
→ Dùng Sepolia Faucet lấy tiền test

### Lỗi: "Unknown network"
→ Kiểm tra RPC URL trong `.env` và `hardhat.config.js`

### Lỗi: "Transaction failed"
→ Kiểm tra gas price, network, private key

### Tiền không được chuyển cho admin
→ Kiểm tra `ADMIN_WALLET_ADDRESS` trong smart contract

---

**Cập nhật lần cuối:** 2026-01-29
