# 💰 HƯỚNG DẪN NHANH - RÚT TIỀN CHO ADMIN

## 🎯 MỤC ĐÍCH
Admin rút tiền từ Smart Contract về ví cá nhân

---

## ⚡ CÁCH NHANH NHẤT (3 BƯỚC)

### 1️⃣ Mở Terminal
```bash
cd D:\DAI_HOC_2022-2026\2026\KY2\blockchain\nhom_2_Ether_Lottery
```

### 2️⃣ Chạy Lệnh Rút Tiền
```bash
npx hardhat run scripts/withdraw.js --network sepolia
```

### 3️⃣ Chọn Option
- **Option 1**: Rút một phần (ví dụ: 0.01 ETH)
- **Option 2**: Rút toàn bộ
- **Option 3**: Hủy

---

## 📊 LUỒNG TIỀN ĐƠN GIẢN

```
User mua vé
    ↓ (0.001 ETH)
Contract (0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc)
    ↓ (Admin rút)
Ví Admin (0x7f2A7abf8c5248e8768061553a21D65F263Cf0d2)
```

---

## ✅ THÀNH CÔNG KHI NÀO?

Bạn sẽ thấy:
```
✅ RÚT TIỀN THÀNH CÔNG!
💸 Số tiền đã rút: X.XX ETH
```

Và tiền sẽ xuất hiện trong ví MetaMask của bạn!

---

## 🔍 KIỂM TRA SỐ DƯ

Trước khi rút, check xem contract có bao nhiêu tiền:
```bash
npx hardhat run scripts/check-balance.js --network sepolia
```

---

## ⚠️ CHÚ Ý

1. Cần **gas fee** (~0.0003 ETH)
2. Đảm bảo file `.env` có `ADMIN_PRIVATE_KEY` đúng
3. Chỉ admin wallet mới rút được

---

## 📱 LIÊN HỆ NẾU GẶP LỖI

- Check file: `ADMIN_WITHDRAW.md` (chi tiết hơn)
- Hoặc xem: `WITHDRAW_GUIDE.md` (technical)
