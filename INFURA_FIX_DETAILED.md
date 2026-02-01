# 🔧 HƯỚNG DẪN DETAILED: FIX INFURA API KEY

## ⚠️ Vấn Đề Hiện Tại

Public RPC endpoints không ổn định. **Cần cấu hình Infura API key thực tế** để hoạt động ổn định.

---

## 📍 BƯỚC 1: Lấy INFURA API KEY

### **Bước 1.1: Đăng ký Infura**

1. Mở browser → https://infura.io/
2. Click **"Sign Up"** (góc phải trên)
3. Điền form:
   - Email: `your-email@example.com`
   - Password: `mật khẩu mạnh`
   - ✓ Đồng ý Terms
4. Click **"Create Account"**
5. **Kiểm tra email** → Xác minh tài khoản

### **Bước 1.2: Tạo Project**

1. Sau khi đăng nhập vào Infura dashboard
2. Click **"+ Create New Project"** (hoặc tương tự)
3. Chọn **"Web3 API"** hoặc **"Ethereum"**
4. Đặt tên project: `Ether Lottery`
5. Network: Chọn **"Sepolia"** (nếu được)
6. Click **"Create"**

### **Bước 1.3: Copy Project ID (= API Key)**

1. Vào dashboard → Mở project vừa tạo
2. Kéo xuống, tìm mục **"API KEY"** hoặc **"PROJECT ID"**
3. Bạn sẽ thấy:
   ```
   Endpoints
   PROJECT ID: 47a8c9b9d8e7f6g5h4i3j2k1l0m9n8o7
   ```
4. **Copy dòng PROJECT ID** (cái số dài sau dấu `:`)

### **Bước 1.4: Lấy RPC URL Sepolia**

1. Tìm mục **"Endpoints"** hoặc **"Networks"**
2. Chọn **"Sepolia"**
3. Bạn sẽ thấy URL:
   ```
   https://sepolia.infura.io/v3/47a8c9b9d8e7f6g5h4i3j2k1l0m9n8o7
   ```
4. Copy cái này - đây là RPC URL hoàn chỉnh

---

## ✅ BƯỚC 2: Cập nhật file `.env`

### **Mở file:**

```
d:\nhom_2_Ether_Lottery\backend\.env
```

### **Tìm dòng:**

```env
INFURA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo
```

### **Thay bằng:**

```env
INFURA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID_HERE
```

### **Ví dụ cụ thể:**

**Nếu Project ID của bạn là:** `47a8c9b9d8e7f6g5h4i3j2k1l0m9n8o7`

**Thì cập nhật thành:**

```env
INFURA_RPC_URL=https://sepolia.infura.io/v3/47a8c9b9d8e7f6g5h4i3j2k1l0m9n8o7
```

**Lưu file (Ctrl+S)**

---

## 🧪 BƯỚC 3: Test Kết Nối

Mở PowerShell → chạy lệnh:

```bash
cd d:\nhom_2_Ether_Lottery\backend

node -e "
const { Web3 } = require('web3');
require('dotenv').config();

console.log('Testing RPC:', process.env.INFURA_RPC_URL);
const web3 = new Web3(process.env.INFURA_RPC_URL);

web3.eth.getChainId().then(chainId => {
  console.log('✅ Connected successfully!');
  console.log('Chain ID:', Number(chainId), chainId === 11155111n ? '(Sepolia)' : '(Wrong!)');
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
"
```

### **Nếu thành công:**

```
Testing RPC: https://sepolia.infura.io/v3/47a8c...
✅ Connected successfully!
Chain ID: 11155111 (Sepolia)
```

### **Nếu thất bại:**

- Check Project ID có đúng không
- Check URL format có đúng không
- Thử lại từ đầu

---

## 🔄 BƯỚC 4: Restart Backend & Retry

### **Terminal 1: Start Backend**

```bash
cd d:\nhom_2_Ether_Lottery\backend
node server.js
```

**Đợi cho đến khi thấy:**

```
✅ MongoDB Connected
🎰 Server running on port 5000
```

### **Terminal 2: Run Retry Script**

```bash
cd d:\nhom_2_Ether_Lottery\backend
node ./scripts/retryFailedPrizes.js
```

### **Kết quả mong muốn:**

```
✅ MongoDB connected

🔍 Vé bị blockchain error: 4

📋 Danh sách vé bị lỗi:
  1. Vé 123123 | phuc | 0.001 ETH
  ...

🔄 Bắt đầu retry...

📤 [Attempt 1/3] Gửi 0.001 ETH...
✅ TX Success: 0x1234567890abcdef...
✅ Vé 123123 - Thành công

📤 [Attempt 1/3] Gửi 0.001 ETH...
✅ TX Success: 0xabcdef1234567890...
✅ Vé 123123 - Thành công

...

📊 KẾT QUẢ:
   ✅ Thành công: 4
   ❌ Thất bại: 0
   Tổng: 4
```

---

## 📝 Tóm Tắt: 4 Bước

| Bước                | Chi tiết                              |
| ------------------- | ------------------------------------- |
| **1. Lấy API Key**  | Đăng ký Infura → Copy Project ID      |
| **2. Update .env**  | `INFURA_RPC_URL=...YOUR_PROJECT_ID`   |
| **3. Test kết nối** | `node -e "..." ` → Check ✅           |
| **4. Retry**        | `node ./scripts/retryFailedPrizes.js` |

---

## 🎯 Lưu Ý Quan Trọng

✅ **Nhớ làm:**

- Copy đúng PROJECT ID từ Infura
- Update RPC URL theo format: `https://sepolia.infura.io/v3/YOUR_ID`
- Lưu file .env
- Restart backend

❌ **Không được:**

- Để placeholder `YOUR_PROJECT_ID_HERE`
- Dùng mainnet key cho testnet
- Share Project ID công khai

---

## 🆘 Troubleshooting

| Lỗi                     | Nguyên nhân       | Cách fix                     |
| ----------------------- | ----------------- | ---------------------------- |
| `invalid project id`    | Project ID sai    | Copy lại từ Infura dashboard |
| `Authentication failed` | Chưa verify email | Check email Infura           |
| `Connection refused`    | RPC URL sai       | Copy lại URL đầy đủ          |
| `Rate limit`            | Quá nhiều request | Chờ 1 phút, thử lại          |
| `Cannot connect`        | Network down      | Thử RPC khác                 |

---

## 📞 Cần Giúp?

1. **Kiểm tra RPC URL:**

   ```
   https://sepolia.infura.io/v3/[PROJECT_ID_CỦA_BẠN]
   ```

2. **Kiểm tra backend logs:**

   ```bash
   node server.js
   ```

3. **Xem Etherscan:** https://sepolia.etherscan.io/ (check transaction)

---

✅ **Sau khi fix, tiền sẽ gửi thành công!**
