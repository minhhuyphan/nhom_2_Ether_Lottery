# 🔧 HƯỚNG DẪN FIX INFURA API KEY

## 📍 BƯỚC 1: Lấy INFURA API KEY

### Cách 1: Sử dụng Public RPC (Nhanh - Không cần tài khoản)

```env
# Dùng public RPC endpoint (không cần key)
INFURA_RPC_URL=https://sepolia-rpc.publicnode.com
# Hoặc:
INFURA_RPC_URL=https://rpc.sepolia.org
# Hoặc:
INFURA_RPC_URL=https://1rpc.io/sepolia
```

**Ưu điểm:**

- Nhanh nhất, không cần đăng ký
- Public, miễn phí sử dụng

**Nhược điểm:**

- Rate limit có thể thấp
- Không ổn định lắm

---

### Cách 2: Tạo tài khoản Infura (Khuyến nghị)

#### **Bước 2.1: Đăng ký Infura**

1. Truy cập: https://infura.io/
2. Click **"Sign Up"**
3. Điền email + password
4. Xác minh email

#### **Bước 2.2: Tạo Project**

1. Login vào Infura dashboard
2. Click **"Create New Project"**
3. Chọn **"Web3 API"** (hoặc **"Ethereum"**)
4. Đặt tên: `Ether Lottery` (hoặc gì cũng được)
5. Click **"Create"**

#### **Bước 2.3: Lấy API Key**

1. Mở project vừa tạo
2. Kéo xuống, bạn sẽ thấy:
   ```
   PROJECT ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Copy **PROJECT ID** (đây là API key)

#### **Bước 2.4: Lấy RPC URL**

1. Trên dashboard, tìm mục **"Endpoints"**
2. Chọn **"Sepolia"** network
3. Copy URL:
   ```
   https://sepolia.infura.io/v3/{PROJECT_ID}
   ```

---

## ✅ BƯỚC 2: Cập nhật file `.env`

Mở file `backend/.env`:

```bash
# Trước (sai):
INFURA_API_KEY=YOUR_INFURA_API_KEY
INFURA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY

# Sau (đúng) - Cách 1 (Public RPC):
INFURA_RPC_URL=https://sepolia-rpc.publicnode.com

# Hoặc Cách 2 (Infura Project):
INFURA_API_KEY=47a8c...xxxxx (copy từ Infura)
INFURA_RPC_URL=https://sepolia.infura.io/v3/47a8c...xxxxx
```

**Ví dụ hoàn chỉnh:**

```env
# Backend Environment Variables
MONGODB_URI=mongodb+srv://...

PORT=5000
NODE_ENV=development

# Blockchain Configuration
LOTTERY_CONTRACT_ADDRESS=0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc
ADMIN_PRIVATE_KEY=45c1f7e8edfd7334c92090e5111cdf4a665f05953e5846b1710660e5fd5558e6
ADMIN_WALLET_ADDRESS=0x7f2a7abf8c5248e8768061553a21d65f263cf0d2

# INFURA - Chọn 1 trong 2 cách dưới
# Cách 1: Public RPC (nhanh nhất)
INFURA_RPC_URL=https://sepolia-rpc.publicnode.com

# Cách 2: Infura Project (ổn định hơn)
# INFURA_API_KEY=YOUR_ACTUAL_PROJECT_ID_FROM_INFURA
# INFURA_RPC_URL=https://sepolia.infura.io/v3/YOUR_ACTUAL_PROJECT_ID_FROM_INFURA
```

---

## 🧪 BƯỚC 3: Test Kết Nối

Chạy lệnh test:

```bash
cd backend
node -e "
const { Web3 } = require('web3');
require('dotenv').config();

const web3 = new Web3(process.env.INFURA_RPC_URL);

web3.eth.getChainId().then(chainId => {
  console.log('✅ RPC connected successfully!');
  console.log('Chain ID:', chainId, '(Sepolia = 11155111)');
  process.exit(0);
}).catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
"
```

**Kết quả mong muốn:**

```
✅ RPC connected successfully!
Chain ID: 11155111 (Sepolia = 11155111)
```

---

## 🔄 BƯỚC 4: Retry Gửi Tiền

Sau khi fix, chạy:

```bash
cd backend
node ./scripts/retryFailedPrizes.js
```

**Nếu thành công:**

```
🔍 Tìm thấy 4 vé bị lỗi

📤 [Attempt 1/3] Gửi 0.001 ETH đến 0xca279da15e963d2617099b5a7d71d6472eb01e07...
✅ TX Success: 0x1234567890abcdef...
✅ Vé 123123 - Thành công
...

📊 KẾT QUẢ:
   ✅ Thành công: 4
   ❌ Thất bại: 0
   Tổng: 4
```

---

## 🚨 Nếu Vẫn Lỗi

| Lỗi                    | Nguyên nhân               | Cách fix                           |
| ---------------------- | ------------------------- | ---------------------------------- |
| `Can't connect to RPC` | URL sai hoặc network down | Check RPC URL đúng chưa            |
| `Invalid API key`      | Key sai                   | Copy lại từ Infura                 |
| `Rate limit exceeded`  | Request quá nhiều         | Dùng Infura Project (không public) |
| `Connection timeout`   | Network chậm              | Retry lại hoặc dùng RPC khác       |

**RPC URLs khác có thể dùng:**

- `https://sepolia-rpc.publicnode.com` ✅
- `https://rpc.sepolia.org` ✅
- `https://1rpc.io/sepolia` ✅
- `https://endpoints.omnirpc.io/sepolia` ✅

---

## ⏱️ NHANH NHẤT (3 BƯỚC):

1. **Copy RPC public:**

   ```
   https://sepolia-rpc.publicnode.com
   ```

2. **Update `.env`:**

   ```env
   INFURA_RPC_URL=https://sepolia-rpc.publicnode.com
   ```

3. **Restart backend + retry:**
   ```bash
   cd backend
   node server.js
   node ./scripts/retryFailedPrizes.js
   ```

**Done! ✅**

---

## 📞 Nếu Cần Help

1. Check logs: `npm start` (backend) → Xem error cụ thể
2. Check RPC: Dùng `curl` test
3. Check Etherscan: Xem transaction status

---

✅ **Sau khi fix, tiền sẽ tự động gửi đến ví MetaMask!**
