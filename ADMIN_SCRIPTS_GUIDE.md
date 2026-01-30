# 🛠️ Admin Helper Scripts - Hướng Dẫn Sử Dụng

## 📋 Giới Thiệu

Project có 2 script helper chính để quản lý Lottery Contract:

1. **admin-setup.js** - Quản lý smart contract
2. **backend/scripts/checkBackendConfig.js** - Kiểm tra backend

---

## 🔧 admin-setup.js

### Tổng Quan

```bash
node admin-setup.js [command]
```

### Các Lệnh

#### 1. `check-config` - Kiểm Tra Cấu Hình

```bash
node admin-setup.js check-config
```

**Chức năng:**

- Kiểm tra tất cả các biến .env có được cấu hình hay không
- Hiển thị trạng thái từng biến
- Gợi ý sửa nếu thiếu

**Kết quả mong đợi:**

```
📋 === KIỂM TRA CẤU HÌNH === 📋

✅ PRIVATE_KEY
✅ ADMIN_WALLET_ADDRESS
✅ ADMIN_PRIVATE_KEY
✅ SEPOLIA_RPC_URL
✅ LOTTERY_CONTRACT_ADDRESS

✅ Tất cả cấu hình đã hoàn thiện!
```

**Nếu thiếu:**

```
❌ LOTTERY_CONTRACT_ADDRESS

📝 === MẪU FILE .env ===
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://...
...
```

#### 2. `show-admin` - Hiển Thị Thông Tin Admin

```bash
node admin-setup.js show-admin
```

**Chức năng:**

- Hiển thị địa chỉ ví admin
- Kiểm tra xem private key có được cấu hình không
- Lấy balance hiện tại từ Sepolia

**Kết quả mong đợi:**

```
👨‍💼 === THÔNG TIN ADMIN === 👨‍💼

📍 Admin Wallet: 0x742d35Cc6634C0532925a3b844Bc892d7E67c30d
🔑 Admin Private Key: ✅ (Được cấu hình)
💰 Admin Balance: 0.5234 ETH
```

**Ý nghĩa:**

- Admin Wallet: Ví nhận tiền từ người chơi
- Balance ≥ 0.05 ETH: Đủ để gửi giao dịch

#### 3. `deploy` - Deploy Smart Contract

```bash
node admin-setup.js deploy
```

**Chức năng:**

- Deploy contract lên Sepolia Testnet
- Kiểm tra balance deployer
- Lưu thông tin deployment

**Quá trình:**

```
📝 Deploy với account: 0x...
💰 Account balance: 0.48 ETH

⏳ Đang deploy contract...

✅ Contract đã deploy thành công!
📍 Contract Address: 0x327F9548dC8599c634598f4a1b538C6351CfB22f
🎫 Entrance Fee: 0.001 ETH
👨‍💼 Manager (Admin): 0x742d35Cc6634C0532925a3b844Bc892d7E67c30d

📋 === TIẾP THEO ===
1. Cập nhật CONTRACT_ADDRESS trong frontend/js/lottery.js
2. Cập nhật LOTTERY_CONTRACT_ADDRESS trong .env
3. Deploy frontend lên server
4. Kiểm tra trên Block Explorer: https://sepolia.etherscan.io/address/0x327F...
```

**Lưu ý:**

- Lần đầu deploy sẽ mất 15-30 giây
- Cần đủ gas fee (~0.01-0.02 ETH)
- Contract được lưu trong `deployments/sepolia.json`

#### 4. `get-balance` - Kiểm Tra Balance

```bash
node admin-setup.js get-balance
```

**Chức năng:**

- Kiểm tra balance ví deployer (từ .env PRIVATE_KEY)
- Kiểm tra balance smart contract

**Kết quả mong đợi:**

```
💰 === KIỂM TRA BALANCE === 💰

📍 Account: 0x742d35Cc6634C0532925a3b844Bc892d7E67c30d
💰 Balance: 0.4823 ETH

📍 Contract: 0x327F9548dC8599c634598f4a1b538C6351CfB22f
💰 Balance: 0 ETH (tiền đã được chuyển cho admin)
```

**Ý nghĩa:**

- Account Balance: Ví dùng để deploy contract
- Contract Balance: Nên là 0 (vì tiền chuyển cho admin ngay)

---

## 📋 backend/scripts/checkBackendConfig.js

### Tổng Quan

```bash
cd backend
node scripts/checkBackendConfig.js
```

### Chức Năng

1. **Kiểm tra cấu hình .env**

   - MONGODB_URI
   - JWT_SECRET
   - PORT
   - ADMIN_WALLET_ADDRESS
   - CONTRACT_ADDRESS
   - RPC_URL

2. **Kiểm tra files quan trọng**

   - Models (User, Ticket, Notification)
   - Controllers (lotteryController)
   - Routes (lotteryRoutes)

3. **Kiểm tra cấu hình quan trọng**
   - Admin Wallet được cấu hình
   - Contract Address được cấu hình
   - MongoDB connection
   - JWT Secret

### Kết Quả Mong Đợi

```
🔍 === KIỂM TRA CẤU HÌNH BACKEND === 🔍

📋 CẤU HÌNH HIỆN TẠI:

  MONGODB_URI: ✅ (được cấu hình)
  JWT_SECRET: ✅ (được cấu hình)
  PORT: 5000
  FRONTEND_URL: http://localhost:3000
  LOTTERY_CONTRACT_ADDRESS: 0x327F9548dC8599c634598f4a1b538C6351CfB22f
  ADMIN_WALLET_ADDRESS: 0x742d35Cc6634C0532925a3b844Bc892d7E67c30d
  ADMIN_PRIVATE_KEY: ✅ (được cấu hình)
  SEPOLIA_RPC_URL: Mặc định

📁 KIỂM TRA CÁC FILE:

  ✅ backend/config/database.js
  ✅ backend/models/Ticket.js
  ✅ backend/models/User.js
  ✅ backend/controllers/lotteryController.js
  ✅ backend/routes/lotteryRoutes.js

⚠️  === KIỂM TRA QUAN TRỌNG ===

✅ Admin Wallet
✅ Contract Address
✅ MongoDB Connection
✅ JWT Secret

✅ Backend đã sẵn sàng!

Bạn có thể khởi động backend bằng:
  npm start (hoặc npm run dev)
```

---

## 📊 Workflow Hoàn Chỉnh

### 1️⃣ Lần Đầu Setup

```bash
# 1. Kiểm tra .env
node admin-setup.js check-config

# 2. Xem thông tin admin
node admin-setup.js show-admin

# 3. Deploy contract
node admin-setup.js deploy

# 4. Cập nhật CONTRACT_ADDRESS ở frontend/js/lottery.js

# 5. Kiểm tra backend config
cd backend
node scripts/checkBackendConfig.js

# 6. Khởi động backend
npm start
```

### 2️⃣ Kiểm Tra Hàng Ngày

```bash
# Kiểm tra admin balance
node admin-setup.js get-balance

# Kiểm tra cấu hình backend
cd backend
node scripts/checkBackendConfig.js
```

### 3️⃣ Nếu Có Vấn Đề

```bash
# Kiểm tra lại cấu hình
node admin-setup.js check-config

# Xem chi tiết admin
node admin-setup.js show-admin

# Kiểm tra contract balance
node admin-setup.js get-balance

# Kiểm tra backend
cd backend
node scripts/checkBackendConfig.js
```

---

## 🐛 Troubleshooting

### ❌ "Không thể kết nối RPC"

```bash
# Kiểm tra
node admin-setup.js check-config

# Giải pháp
# Cập nhật SEPOLIA_RPC_URL trong .env
```

### ❌ "Insufficient gas"

```bash
# Kiểm tra balance
node admin-setup.js get-balance

# Nếu < 0.05 ETH:
# Vào https://www.alchemy.com/faucets/ethereum-sepolia
# Lấy thêm ETH test
```

### ❌ "Contract not found"

```bash
# Kiểm tra
node admin-setup.js show-admin

# Deploy lại
node admin-setup.js deploy

# Cập nhật CONTRACT_ADDRESS
```

### ❌ "Backend connection error"

```bash
# Kiểm tra
cd backend
node scripts/checkBackendConfig.js

# Nếu MongoDB error:
# Kiểm tra MONGODB_URI trong .env
# Hoặc khởi động MongoDB local
```

---

## 📝 Cách Tạo Tệp .env

### Mẫu File

```env
# Blockchain Configuration
# ========================

# Private Key (Sepolia Testnet)
# Lấy từ: MetaMask → Account details → Show private key
PRIVATE_KEY=0xe9fef83cf48b6c1963ad78d5b86b1894fdf32b4f19ff6e3a767fdf86d8e37d01

# Sepolia RPC URL
# Dùng Alchemy hoặc Infura
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo

# Admin Wallet Address (nhận tiền từ người chơi)
# Lấy từ: MetaMask → Account details → Account address
ADMIN_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b844Bc892d7E67c30d

# Admin Private Key (tuỳ chọn)
ADMIN_PRIVATE_KEY=0x742d35cc6634c0532925a3b844bc892d7e67c30d

# Contract Address (sau khi deploy)
LOTTERY_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Backend Configuration
# ====================

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ether_lottery

# JWT
JWT_SECRET=your_secret_key_here

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# Hoodi Testnet (nếu muốn dùng Hoodi thay Sepolia)
HOODI_RPC_URL=https://rpc-testnet.hoodi.network
```

### Các Cách Tạo

**Cách 1: Copy từ template**

```bash
cp .env.example .env
# Rồi sửa các giá trị
```

**Cách 2: Tạo mới bằng editor**

```bash
# Mở VS Code
# Tạo file .env tại root project
# Paste mẫu ở trên
```

**Cách 3: Tạo bằng terminal**

```bash
# Windows PowerShell
notepad .env

# Hoặc
echo "PRIVATE_KEY=0x..." > .env
```

---

## 🎯 Checklist

- [ ] .env cấu hình đầy đủ
- [ ] `node admin-setup.js check-config` → ✅
- [ ] `node admin-setup.js show-admin` → Có balance
- [ ] `node admin-setup.js deploy` → Thành công
- [ ] Frontend cập nhật CONTRACT_ADDRESS
- [ ] Backend config kiểm tra ✅
- [ ] Backend khởi động được
- [ ] Frontend kết nối được
- [ ] Mua vé test thành công
- [ ] Admin nhận tiền ✅

---

## 📞 Liên Hệ

Có vấn đề? Kiểm tra:

1. Terminal output (xem lỗi chi tiết)
2. Browser console (F12)
3. File logs backend

---

**Cập nhật:** 2026-01-29
