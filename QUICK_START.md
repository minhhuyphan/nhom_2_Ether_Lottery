# ⚡ Quick Start - Tiền Vào Ví Admin

## 🚀 Chạy Nhanh (5 Phút)

### 1. Setup .env

```env
PRIVATE_KEY=0x[YOUR_PRIVATE_KEY]
ADMIN_WALLET_ADDRESS=0x[YOUR_ADMIN_WALLET]
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo
```

### 2. Deploy Contract

```bash
cd d:\nhom_2_Ether_Lottery
npm install
node admin-setup.js deploy
```

**Lưu lại Contract Address! 📍**

### 3. Cập Nhật Frontend

**File:** `frontend/js/lottery.js` (dòng 10)

```javascript
const CONTRACT_ADDRESS = "0x[CONTRACT_ADDRESS_TỪ_DEPLOY]";
```

### 4. Khởi Động

**Terminal 1:**

```bash
cd backend
npm start
```

**Terminal 2:** Mở browser

```
file:///d:/nhom_2_Ether_Lottery/frontend/html/index.html
```

### 5. Test

1. Kết nối ví
2. Chọn 6 số
3. Mua vé (click button)
4. Xác nhận MetaMask
5. ✅ Kiểm tra admin wallet nhận tiền

---

## 📋 Luồng Tiền

```
Người Chơi
   ↓
Mua Vé (0.001 ETH)
   ↓
Smart Contract
   ↓ transfer(admin, 0.001 ETH)
   ↓
Admin Wallet ✅
```

---

## 🔧 Lệnh Tiện Ích

```bash
# Kiểm tra cấu hình
node admin-setup.js check-config

# Xem admin info
node admin-setup.js show-admin

# Kiểm tra balance
node admin-setup.js get-balance

# Deploy contract
node admin-setup.js deploy

# Kiểm tra backend
cd backend && node scripts/checkBackendConfig.js
```

---

## ⚠️ Lưu Ý

- Cần Sepolia ETH (lấy từ [Faucet](https://www.alchemy.com/faucets/ethereum-sepolia))
- Private Key giữ bí mật!
- Contract chỉ deploy 1 lần, sau đó chỉ update address

---

## 🎉 Hoàn Thành

Khi tất cả hoạt động → Tiền sẽ vào ví admin tự động!

**Cần chi tiết?** Xem [DEPLOY_STEP_BY_STEP.md](DEPLOY_STEP_BY_STEP.md)
