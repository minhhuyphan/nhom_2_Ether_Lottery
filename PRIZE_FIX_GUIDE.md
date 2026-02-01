# 🚨 HƯỚNG DẪN FIX: KHÔNG GỬI ĐƯỢC TIỀN CHO NGƯỜI THẮNG

## 📌 VẤN ĐỀ

Khi quay số, backend cố gửi tiền thưởng cho người trúng nhưng không thành công. Vé được đánh dấu là "won" nhưng `blockchainError` có lỗi.

---

## 🔍 NGUYÊN NHÂN CHÍNH

1. **INFURA API Key sai hoặc missing** → Không thể connect đến Sepolia
2. **Admin Private Key không khớp với Wallet** → Transaction bị reject
3. **Contract không có tiền** → Insufficient balance
4. **Gas price quá thấp** → Transaction bị stuck
5. **Network lỗi tạm thời** → Retry sẽ fix được

---

## ✅ CÁCH FIX

### **Phương pháp 1: Kiểm tra Configuration (nhanh nhất)**

1. Mở `backend/.env`
2. Kiểm tra các trường này:

```env
# Bắt buộc phải có - không được placeholder!
LOTTERY_CONTRACT_ADDRESS=0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc
ADMIN_PRIVATE_KEY=45c1f7e8edfd7334c92090e5111cdf4a665f05953e5846b1710660e5fd5558e6
ADMIN_WALLET_ADDRESS=0x7f2a7abf8c5248e8768061553a21d65f263cf0d2

# INFURA - PHẢI CÓ KEY HỢP LỆ
INFURA_API_KEY=YOUR_ACTUAL_KEY_NOT_PLACEHOLDER
INFURA_RPC_URL=https://sepolia.infura.io/v3/YOUR_ACTUAL_KEY_NOT_PLACEHOLDER
```

3. Nếu `INFURA_API_KEY` là placeholder → Lấy key từ https://infura.io/
4. Nếu `ADMIN_PRIVATE_KEY` sai → Export từ MetaMask

**Sau khi fix:**
- Restart backend: `npm start`
- Quay số lại
- Tiền sẽ được gửi

---

### **Phương pháp 2: Retry từ Admin Panel**

Nếu không muốn cấu hình lại:

1. Đi vào **Admin Dashboard**
2. Tìm mục **"Vé Bị Lỗi"** → Xem danh sách vé không nhận được tiền
3. Click **"Retry"** cho từng vé → Backend sẽ cố gửi lại
4. Hoặc click **"Retry All"** → Gửi cho tất cả vé bị lỗi

**Ưu điểm:**
- Không cần khởi động lại
- Có thể retry từng vé hoặc hàng loạt
- Tự động tăng gas price nếu cần

---

### **Phương pháp 3: Retry từ Command Line (Script)**

Nếu Admin Panel không có:

```bash
cd backend
node scripts/retryFailedPrizes.js
```

**Quá trình:**
1. Script tìm tất cả vé bị lỗi
2. Retry gửi tiền cho mỗi vé (3 lần/vé)
3. Hiển thị kết quả thành công/thất bại
4. Tự động tăng gas price nếu cần

---

## 🔧 KIỂM TRA BLOCKCHAIN

### **Check Contract Balance**

```javascript
// Vào console (hardhat, ethers, etc)
const contract = new ethers.Contract(
  "0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc",
  ABI,
  provider
);

const balance = await contract.getBalance();
console.log("Contract ETH:", ethers.formatEther(balance));
```

Nếu balance = 0 → **Contract hết tiền!** → Admin phải gửi ETH vào contract

### **Check Admin Wallet**

```javascript
const balance = await provider.getBalance("0x7f2a7abf8c5248e8768061553a21d65f263cf0d2");
console.log("Admin ETH:", ethers.formatEther(balance));
```

Nếu balance rất thấp → Gửi ETH vào ví admin từ faucet hoặc ví khác

---

## 📋 RETRY LOGIC TÍCH HỢP

Code mới đã có:

```javascript
// Retry tự động 3 lần (0s, 3s, 6s)
// Nếu lỗi là network → sẽ retry và thành công
// Nếu lỗi là insufficient funds → báo lỗi ngay (không retry)
// Gas price tăng lên 20% mỗi lần retry (1x → 1.2x → 1.4x)
```

---

## 🎯 CÓ 3 API ENDPOINT ĐỂ RETRY

### 1. **Lấy danh sách vé bị lỗi**
```
GET /api/lottery/admin/failed-prizes
```
Response:
```json
{
  "success": true,
  "data": {
    "count": 5,
    "tickets": [
      {
        "_id": "...",
        "ticketNumber": "123456",
        "username": "user1",
        "walletAddress": "0xABC...",
        "prizeAmount": 0.001,
        "blockchainError": "network error..."
      }
    ]
  }
}
```

### 2. **Retry 1 vé**
```
POST /api/lottery/admin/retry-send-prize/{ticketId}
```
Response:
```json
{
  "success": true,
  "message": "Gửi tiền thành công",
  "data": {
    "transactionHash": "0xTX..."
  }
}
```

### 3. **Retry tất cả vé bị lỗi**
```
POST /api/lottery/admin/retry-all-failed-prizes
```
Response:
```json
{
  "success": true,
  "data": {
    "retried": 5,
    "successful": 5,
    "failed": 0,
    "results": [...]
  }
}
```

---

## 🆘 TROUBLESHOOTING

| Lỗi | Nguyên nhân | Cách fix |
|-----|-----------|---------|
| "Missing blockchain configuration" | Thiếu .env variables | Kiểm tra .env đủ chưa |
| "Insufficient balance" | Contract hết tiền | Admin gửi ETH vào contract |
| "Transaction failed" | Admin key sai | Export lại từ MetaMask |
| "nonce too low" | Nonce conflict | Retry lại sau 30s |
| "gas price too low" | Gas thấp quá | Retry (tự động tăng gas) |

---

## 📞 LIÊN HỆ

Nếu vẫn không fix được:

1. Kiểm tra logs backend: `npm start` → xem error cụ thể
2. Kiểm tra Etherscan: Xem transaction status trên testnet
3. Verify contract đã deploy hàm `sendPrizeToWinner` chưa

---

✅ **Sau khi fix, tiền sẽ tự động gửi đến ví MetaMask của người thắng!**
