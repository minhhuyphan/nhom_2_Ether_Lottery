# 🚀 Hướng Dẫn Deploy Lottery - Tiền Vào Ví Admin

## 📌 Yêu Cầu

- MetaMask cài đặt và có ví
- Node.js & npm cài đặt
- Sepolia testnet ETH (lấy từ [Faucet](https://www.alchemy.com/faucets/ethereum-sepolia))

---

## ✅ BƯỚC 1: Chuẩn Bị Ví Admin

### 1.1. Lấy Địa Chỉ Admin

```
1. Mở MetaMask
2. Chọn ví admin
3. Click "Account details"
4. Copy "Account address"
```

📝 **Lưu địa chỉ này lại!** VD: `0x742d35Cc6634C0532925a3b844Bc892d7E67c30d`

### 1.2. Lấy Private Key (Tùy Chọn Nhưng Cần Để Deploy)

```
1. Click avatar → Account details
2. Click "Show private key"
3. Nhập password MetaMask
4. Copy private key (bắt đầu bằng 0x)
```

⚠️ **CẢNH BÁO:** Giữ bí mật private key! Không chia sẻ cho ai.

---

## ✅ BƯỚC 2: Cấu Hình .env

### 2.1. Mở file `.env` (hoặc tạo từ `.env.example`)

```bash
# File: .env (tại thư mục gốc project)
```

### 2.2. Cập Nhật Các Giá Trị

```env
# 1. Private Key của ví deploy (admin hoặc deployer)
PRIVATE_KEY=0x[PRIVATE_KEY_CỦA_BẠN]

# 2. Sepolia RPC URL
# Có thể dùng:
# - Alchemy: https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
# - Infura: https://sepolia.infura.io/v3/YOUR_KEY
# - Hoặc dùng default
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo

# 3. Admin Wallet Address (ví nhận tiền)
ADMIN_WALLET_ADDRESS=0x[ADMIN_WALLET]

# 4. Admin Private Key (tuỳ chọn, để gửi giao dịch từ admin)
ADMIN_PRIVATE_KEY=0x[ADMIN_PRIVATE_KEY]

# 5. Sau khi deploy, cập nhật:
LOTTERY_CONTRACT_ADDRESS=0x[CONTRACT_ADDRESS]
```

**Ví dụ cấu hình hoàn thiện:**

```env
PRIVATE_KEY=0xe9fef83cf48b6c1963ad78d5b86b1894fdf32b4f19ff6e3a767fdf86d8e37d01
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo
ADMIN_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b844Bc892d7E67c30d
ADMIN_PRIVATE_KEY=0x742d35cc6634c0532925a3b844bc892d7e67c30d
LOTTERY_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

---

## ✅ BƯỚC 3: Kiểm Tra Cấu Hình

### 3.1. Chạy Script Kiểm Tra

```bash
# Di chuyển đến thư mục project
cd d:\nhom_2_Ether_Lottery

# Kiểm tra cấu hình
node admin-setup.js check-config
```

**Kết quả mong đợi:**

```
✅ PRIVATE_KEY
✅ ADMIN_WALLET_ADDRESS
✅ SEPOLIA_RPC_URL
✅ Tất cả cấu hình đã hoàn thiện!
```

### 3.2. Kiểm Tra Thông Tin Admin

```bash
node admin-setup.js show-admin
```

**Kết quả mong đợi:**

```
📍 Admin Wallet: 0x742d35Cc6634C0532925a3b844Bc892d7E67c30d
💰 Admin Balance: 0.5 ETH
```

---

## ✅ BƯỚC 4: Deploy Smart Contract

### 4.1. Install Dependencies

```bash
npm install
```

### 4.2. Deploy Contract

```bash
node admin-setup.js deploy
```

**Kết quả sẽ hiển thị:**

```
✅ Contract đã deploy thành công!
📍 Contract Address: 0x327F9548dC8599c634598f4a1b538C6351CfB22f
🎫 Entrance Fee: 0.001 ETH
👨‍💼 Manager (Admin): 0x742d35Cc6634C0532925a3b844Bc892d7E67c30d
```

**Lưu địa chỉ contract!** 📍

---

## ✅ BƯỚC 5: Cập Nhật Frontend

### 5.1. Cập Nhật địa chỉ trong `frontend/js/lottery.js`

**Tìm dòng 10:**

```javascript
const CONTRACT_ADDRESS = "0x327F9548dC8599c634598f4a1b538C6351CfB22f"; // Cập nhật
```

**Thay bằng địa chỉ mới:**

```javascript
const CONTRACT_ADDRESS = "0x[NEW_CONTRACT_ADDRESS]";
```

### 5.2. Cập Nhật .env

```env
LOTTERY_CONTRACT_ADDRESS=0x[NEW_CONTRACT_ADDRESS]
```

---

## ✅ BƯỚC 6: Cập Nhật Backend

### 6.1. Kiểm Tra Backend Config

```bash
node backend/scripts/checkBackendConfig.js
```

### 6.2. Cập Nhật .env Backend

Đảm bảo các giá trị này có trong `.env`:

```env
LOTTERY_CONTRACT_ADDRESS=0x[CONTRACT_ADDRESS]
ADMIN_WALLET_ADDRESS=0x[ADMIN_WALLET]
```

---

## ✅ BƯỚC 7: Khởi Động Ứng Dụng

### 7.1. Khởi Động Backend

```bash
cd backend
npm install
npm start
# Hoặc: npm run dev
```

**Kiểm tra:**

```
✅ Server running on http://localhost:5000
✅ Connected to MongoDB
```

### 7.2. Khởi Động Frontend (Ở tab/terminal khác)

```bash
# Hoặc mở index.html trực tiếp trong browser
# Vào: file:///d:/nhom_2_Ether_Lottery/frontend/html/index.html
```

---

## ✅ BƯỚC 8: Test Mua Vé

### 8.1. Trên Frontend

1. Mở app
2. Click "Kết Nối Ví"
3. Đăng nhập/Đăng ký
4. Chọn 6 số
5. Click "Mua Vé"
6. Xác nhận trong MetaMask

### 8.2. Kiểm Tra Kết Quả

**Trên MetaMask (Admin Ví):**

- Mở admin wallet
- Click "Activity"
- Nhìn thấy transaction nhận tiền

**Trên Block Explorer:**

- Vào https://sepolia.etherscan.io
- Tìm contract address
- Xem transactions

**Trong Database:**

```bash
# SSH vào MongoDB
use ether_lottery
db.tickets.find()
# Kết quả: {ticketNumber: "123456", amount: 0.001, ...}
```

---

## 📊 Luồng Dữ Liệu Khi Mua Vé

```
┌─────────────┐
│ Người chơi  │
│ (Web3)      │
└──────┬──────┘
       │ 0.001 ETH + Gas
       ↓
┌──────────────────────────┐
│ Smart Contract enter()    │
│ - Thêm vào players[]      │
│ - Cộng vào totalCollected │
└──────┬───────────────────┘
       │ transfer(admin, 0.001 ETH)
       ↓
┌─────────────────┐
│ Admin Wallet    │
│ Nhận tiền       │
└─────────────────┘

       SONG SONG:
       ↓
┌──────────────────────────┐
│ Frontend                 │
│ - Lưu transactionHash    │
│ - POST /api/lottery/...  │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│ Backend                  │
│ - Lưu vào MongoDB        │
│ - Gửi notification       │
└──────────────────────────┘
```

---

## 🔍 Troubleshooting

### ❌ "Insufficient funds"

**Giải pháp:**

1. Vào [Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
2. Nhập ví address
3. Lấy 0.5-1 ETH test

### ❌ "Invalid contract address"

**Giải pháp:**

1. Chạy `node admin-setup.js deploy` để deploy lại
2. Cập nhật địa chỉ trong frontend
3. Refresh browser

### ❌ "Contract function not found"

**Giải pháp:**

1. Kiểm tra ABI trong `frontend/js/lottery.js`
2. Kiểm tra contract address đúng không
3. Deploy lại contract

### ❌ "MetaMask network error"

**Giải pháp:**

1. Mở MetaMask
2. Xem network, chuyển sang Sepolia
3. Refresh page

### ❌ "Backend connection refused"

**Giải pháp:**

1. Kiểm tra backend đang chạy: `npm start`
2. Kiểm tra PORT = 5000
3. Kiểm tra MongoDB connection

---

## 📋 Checklist Deploy

- [ ] Lấy được địa chỉ admin & private key
- [ ] Cập nhật .env đầy đủ
- [ ] Chạy `node admin-setup.js check-config` ✅
- [ ] Có Sepolia ETH (>0.05)
- [ ] Deploy contract: `node admin-setup.js deploy`
- [ ] Cập nhật CONTRACT_ADDRESS ở frontend
- [ ] Cập nhật .env LOTTERY_CONTRACT_ADDRESS
- [ ] Backend chạy & kết nối MongoDB
- [ ] Frontend mở được
- [ ] Test mua vé thành công
- [ ] Admin wallet nhận tiền ✅

---

## 🎉 Hoàn Thành!

Khi tất cả hoạt động:

1. ✅ Người chơi mua vé
2. ✅ Tiền được chuyển cho admin
3. ✅ Vé được lưu trong database
4. ✅ Thông báo gửi tới người chơi

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:

1. File logs backend (stdout/stderr)
2. Browser console (F12)
3. Block Explorer (sepolia.etherscan.io)
4. MongoDB data

---

**Cập nhật:** 2026-01-29
