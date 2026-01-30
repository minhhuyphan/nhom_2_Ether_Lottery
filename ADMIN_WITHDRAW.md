# 💰 HƯỚNG DẪN RÚT TIỀN CHO ADMIN

## 📍 Thông Tin Contract

**Contract Address:** `0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc`  
**Admin Wallet:** `0x7f2A7abf8c5248e8768061553a21D65F263Cf0d2`  
**Network:** Sepolia Testnet

---

## 🔄 Luồng Tiền

```
👤 User mua vé (0.001 ETH)
         ↓
💼 Smart Contract (0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc)
         ↓
💰 Admin rút tiền
         ↓
👨‍💼 Admin Wallet (0x7f2A7abf8c5248e8768061553a21D65F263Cf0d2)
```

---

## 🚀 CÁCH RÚT TIỀN (3 BƯỚC)

### Bước 1: Mở Terminal
Mở PowerShell/CMD tại thư mục project

### Bước 2: Chạy Script
```bash
npx hardhat run scripts/withdraw.js --network sepolia
```

### Bước 3: Làm Theo Hướng Dẫn
Script sẽ hiển thị:
- Số dư admin wallet
- Số dư trong contract
- Tùy chọn: Rút một phần hoặc rút toàn bộ

---

## 📺 Demo

```bash
PS D:\...\nhom_2_Ether_Lottery> npx hardhat run scripts/withdraw.js --network sepolia

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 ADMIN WITHDRAWAL TOOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Admin Wallet: 0x7f2A7abf8c5248e8768061553a21D65F263Cf0d2
💼 Admin Balance: 0.0051 ETH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Contract Address: 0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc
💰 Contract Balance: 0.025 ETH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chọn hành động:
1. Rút một phần tiền
2. Rút toàn bộ tiền
3. Hủy

Nhập lựa chọn (1/2/3): 1
Nhập số ETH muốn rút: 0.01

⏳ Đang rút 0.01 ETH...
📤 Transaction Hash: 0xabc123...
⏳ Đợi xác nhận...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RÚT TIỀN THÀNH CÔNG!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💸 Số tiền đã rút: 0.01 ETH
🔗 Transaction: 0xabc123...
⛽ Gas Used: 29458
💵 Gas Cost: 0.0002 ETH

📊 SỐ DƯ MỚI:
💼 Contract Balance: 0.015 ETH
👨‍💼 Admin Balance: 0.0149 ETH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Xem trên Sepolia Etherscan:
https://sepolia.etherscan.io/tx/0xabc123...
```

---

## ⚡ TÓM TẮT NHANH

### Rút Toàn Bộ Tiền:
```bash
npx hardhat run scripts/withdraw.js --network sepolia
# Chọn option 2
```

### Kiểm Tra Số Dư Contract:
```bash
npx hardhat run scripts/check-balance.js --network sepolia
```

---

## ⚠️ LƯU Ý

1. **Chỉ admin wallet** (`0x7f2A7abf...`) mới rút được tiền
2. **Cần gas fee** (~0.0002-0.0005 ETH) cho mỗi lần rút
3. **Không thể rút quá số dư** trong contract
4. **Transaction không thể hoàn tác** - hãy cẩn thận!

---

## 🔐 Bảo Mật

- ✅ Chỉ admin có quyền rút
- ✅ Private key được lưu trong `.env` (không public)
- ✅ Contract đã verify trên Sepolia Etherscan
- ✅ Mọi transaction đều minh bạch trên blockchain

---

## 📞 Xem Transaction History

Vào Sepolia Etherscan:
```
https://sepolia.etherscan.io/address/0x7f2A7abf8c5248e8768061553a21D65F263Cf0d2
```

Hoặc xem contract:
```
https://sepolia.etherscan.io/address/0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc
```

---

## ❓ Troubleshooting

### Lỗi: "Chi manager moi co quyen"
→ Bạn đang dùng sai wallet. Đảm bảo `.env` có đúng `ADMIN_PRIVATE_KEY`

### Lỗi: "Khong du tien trong contract"
→ Contract chưa có tiền. Đợi users mua vé

### Lỗi: "Insufficient funds for gas"
→ Admin wallet không đủ ETH để trả gas. Cần ít nhất 0.001 ETH

---

## 📊 Monitoring

Để theo dõi số dư contract real-time, có thể thêm vào admin dashboard hoặc chạy:

```bash
# Check balance mỗi 30 giây
while ($true) { 
    npx hardhat run scripts/check-balance.js --network sepolia
    Start-Sleep -Seconds 30
}
```
