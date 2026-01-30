# 💰 Lottery - Admin Payment System

## 🎯 Mục Đích

Khi người chơi mua vé số, tiền sẽ được **chuyển trực tiếp vào ví MetaMask của admin** thay vì giữ trong smart contract.

## ✨ Tính Năng

### ✅ Được Triển Khai

1. **Chuyển Tiền Tự Động**
   - Người chơi mua vé → Tiền chuyển ngay cho admin
   - Không cần xử lý thủ công
   - Minh bạch trên blockchain

2. **Theo Dõi Tổng Tiền**
   - Hệ thống lưu tổng tiền thu được
   - Dùng cho tính toán tiền thưởng
   - Có thể kiểm tra bất cứ lúc nào

3. **Quản Lý Vé Trong Database**
   - Mỗi vé lưu: số, giá trị, transaction hash
   - Có thể xem lịch sử
   - Kết nối với user account

4. **Thông Báo Tự Động**
   - Người chơi nhận thông báo mua vé thành công
   - Hiển thị số tiền đã chuyển
   - Hiển thị transaction hash để xác minh

## 🚀 Nhanh Nhất - 5 Phút Setup

### Bước 1: Chuẩn Bị Ví

```
1. Mở MetaMask
2. Tạo hoặc chọn ví admin
3. Copy địa chỉ ví (Account address)
4. Copy private key (Account details → Show private key)
```

### Bước 2: Cấu Hình

Tạo/sửa file `.env` tại root project:

```env
PRIVATE_KEY=0x[PRIVATE_KEY_CỦA_BẠN]
ADMIN_WALLET_ADDRESS=0x[ADMIN_WALLET]
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo
```

### Bước 3: Deploy

```bash
node admin-setup.js deploy
```

Lưu lại **Contract Address** hiển thị.

### Bước 4: Cập Nhật Frontend

Mở `frontend/js/lottery.js` (dòng 10):

```javascript
const CONTRACT_ADDRESS = "0x[CONTRACT_ADDRESS_TỪ_DEPLOY]";
```

### Bước 5: Chạy

**Terminal 1:**
```bash
cd backend
npm start
```

**Terminal 2:** Mở browser
```
file:///d:/nhom_2_Ether_Lottery/frontend/html/index.html
```

**Done!** ✅ Tiền sẽ vào ví admin tự động.

---

## 📋 Chi Tiết Kỹ Thuật

### Luồng Tiền Khi Mua Vé

```
Người Chơi (0.001 ETH + Gas)
    ↓
Smart Contract
    ↓ transfer(admin, 0.001 ETH) ← ⭐ ĐIỂM CHÍNH
    ↓
Admin Wallet ✅
    ↓ (Thực tế nhìn thấy trong MetaMask)
    ↓
Block Explorer (xem giao dịch)
```

### Contract Functions

| Hàm | Chức Năng | Ai Gọi |
|-----|----------|--------|
| `enter()` | Mua vé, chuyển tiền cho admin | Người chơi |
| `getTotalCollected()` | Lấy tổng tiền | Ai cũng có thể |
| `pickWinner()` | Chọn người thắng, gửi thưởng | Admin |
| `getBalance()` | Kiểm tra balance (nên là 0) | Ai cũng có thể |

### Events

Mỗi lần mua vé, 2 events được emit:
1. `PlayerEntered` - Người mua vé + số tiền
2. `FundsTransferredToAdmin` - Admin nhận + số tiền

---

## 🛠️ Công Cụ Quản Lý

### Admin Scripts

```bash
# Kiểm tra cấu hình
node admin-setup.js check-config

# Xem thông tin admin
node admin-setup.js show-admin

# Kiểm tra balance (ví deployer + contract)
node admin-setup.js get-balance

# Deploy contract
node admin-setup.js deploy
```

### Backend Config Check

```bash
cd backend
node scripts/checkBackendConfig.js
```

---

## 📊 Kiểm Tra Hoạt Động

### 1. Trên Block Explorer

```
1. Vào https://sepolia.etherscan.io
2. Tìm contract address
3. Xem mục "Transactions"
4. Mỗi mua vé sẽ thấy transaction
```

### 2. Trên MetaMask (Admin Ví)

```
1. Mở MetaMask (chọn admin wallet)
2. Click "Activity"
3. Xem các transaction nhận tiền
4. Số tiền tích lũy ✅
```

### 3. Trong Database

```bash
# SSH vào MongoDB
use ether_lottery
db.tickets.find()

# Kết quả:
# {
#   "ticketNumber": "123456",
#   "walletAddress": "0x...",
#   "amount": 0.001,
#   "transactionHash": "0x...",
#   ...
# }
```

---

## 🔐 Bảo Mật

### ✅ Được Làm

- Smart contract lưu trữ toàn bộ luôn lịch sử (transparent)
- Mỗi transaction có hash duy nhất
- Không lưu private key trong code

### ⚠️ Cần Lưu Ý

- **Giữ bí mật private key** (trong .env)
- Không share file `.env` công khai
- Kiểm tra Contract Address trước khi update frontend

---

## 🌐 Testnet vs Mainnet

### Hiện Tại: Sepolia Testnet
- Dùng tiền ảo
- RPC: `https://eth-sepolia.g.alchemy.com/v2/demo`
- Block Explorer: `https://sepolia.etherscan.io`
- Faucet: [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

### Để Production: Ethereum Mainnet
- Dùng tiền thực (Ether)
- Cần cập nhật RPC URL
- Gas fee sẽ cao hơn
- Bảo mật cần chặt chẽ hơn

---

## 📚 Tài Liệu

| File | Nội Dung |
|------|----------|
| [QUICK_START.md](QUICK_START.md) | 5 phút setup |
| [DEPLOY_STEP_BY_STEP.md](DEPLOY_STEP_BY_STEP.md) | Hướng dẫn chi tiết 8 bước |
| [ADMIN_WALLET_SETUP.md](ADMIN_WALLET_SETUP.md) | Chi tiết cấu hình ví |
| [ADMIN_SCRIPTS_GUIDE.md](ADMIN_SCRIPTS_GUIDE.md) | Hướng dẫn scripts |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Tóm tắt triển khai |

---

## ❓ FAQ

### Q: Tiền đi đâu khi người chơi mua vé?
**A:** Trực tiếp vào ví admin trên blockchain.

### Q: Có cách nào để lấy lại tiền nếu mua nhầm?
**A:** Không thể, giao dịch blockchain là vĩnh viễn. Nhưng có thể gửi tiền thưởng cho người đó.

### Q: Mất bao lâu để tiền vào ví?
**A:** 1-2 phút (thời gian confirm block trên Sepolia). Trên Mainnet là 15 giây.

### Q: Contract address có thay đổi không?
**A:** Không. 1 lần deploy, địa chỉ cố định mãi.

### Q: Có cách nào để thay đổi admin wallet?
**A:** Phải deploy contract mới. Admin được set khi deploy.

### Q: Nếu quên contract address thì sao?
**A:** Kiểm tra file `deployments/sepolia.json` hoặc `admin-setup.js show-admin`

---

## 🆘 Troubleshooting

### ❌ "Insufficient funds"
→ Vào [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia) lấy 0.5 ETH test

### ❌ "Network error"
→ Kiểm tra RPC URL trong .env hoặc mạng internet

### ❌ "Invalid contract address"
→ Deploy lại: `node admin-setup.js deploy`

### ❌ "MetaMask won't connect"
→ Mở MetaMask → Chuyển sang Sepolia network

### ❌ "Backend error"
→ Chạy `cd backend && node scripts/checkBackendConfig.js`

---

## ✅ Checklist Hoàn Thành

- [ ] Lấy địa chỉ ví admin
- [ ] Lấy private key admin
- [ ] Tạo/cập nhật file `.env`
- [ ] Chạy `node admin-setup.js check-config` ✅
- [ ] Deploy contract: `node admin-setup.js deploy`
- [ ] Cập nhật CONTRACT_ADDRESS
- [ ] Backend khởi động được
- [ ] Frontend mở được
- [ ] Test mua vé (0.001 ETH + gas)
- [ ] Admin wallet nhận tiền ✅

---

## 🎉 Hoàn Thành Setup

Khi đã xong checklist trên → **Hệ thống sẵn sàng sử dụng!**

- ✅ Tiền vào ví admin tự động
- ✅ Vé lưu trong database
- ✅ Thông báo gửi tới người chơi
- ✅ Có thể xem giao dịch trên blockchain
- ✅ Có thể chọn người thắng và gửi thưởng

---

**Hỏi gì có thể xem:**
1. Smart contract: `contracts/Lottery.sol`
2. Frontend: `frontend/js/lottery.js`
3. Backend: `backend/controllers/lotteryController.js`
4. Tài liệu: Các file `.md` trong thư mục gốc

---

**Cập nhật:** 2026-01-29
**Version:** 1.0
