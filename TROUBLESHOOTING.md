# 🚨 TROUBLESHOOTING: Không Nhận Được Tiền Thưởng

## ❌ VẤN ĐỀ

Bạn trúng xổ số nhưng **KHÔNG thấy tiền** trong ví MetaMask.

---

## 🔍 NGUYÊN NHÂN CHÍNH (90% Trường Hợp)

### 1. CONTRACT KHÔNG CÓ TIỀN (Contract Balance = 0)

**Cách check:**
```bash
npx hardhat run scripts/check-contract-status.js --network sepolia
```

**Nếu thấy:**
```
💼 Contract Balance: 0.0 ETH
⚠️  WARNING: Contract balance is ZERO!
```

**Giải thích:**
- Contract cần có tiền từ users mua vé
- Nếu balance = 0 → Không thể gửi giải thưởng
- Smart contract chỉ nhận tiền qua `enter()` function (khi mua vé)

**Giải pháp:**
```
Đợi users mua vé → Contract tự động có tiền → Quay số lại
```

---

### 2. ĐỊA CHỈ CONTRACT SAI

**Check file này:**

**Backend: `backend/.env`**
```bash
LOTTERY_CONTRACT_ADDRESS=0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc
```

**Frontend: `frontend/js/lottery.js`**
```javascript
const CONTRACT_ADDRESS = "0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc";
```

**⚠️ PHẢI GIỐNG NHAU!**

Nếu khác nhau:
- User mua vé ở contract A
- Admin quay số ở contract B
- Contract B không có tiền → Không trả được thưởng

---

### 3. ADMIN WALLET KHÔNG CÓ GAS

**Backend gửi transaction cần gas!**

Check admin wallet:
```bash
npx hardhat run scripts/check-contract-status.js --network sepolia
```

Nếu thấy:
```
👤 Admin Wallet: 0x7f2A7abf...
💰 Admin Balance: 0.0001 ETH  ← QUÁ THẤP!
```

**Giải pháp:**
```
Lấy Sepolia ETH từ faucet:
https://sepoliafaucet.com
```

---

## 🔧 CÁCH FIX TỪNG BƯỚC

### Bước 1: Check Contract Balance

```bash
npx hardhat run scripts/check-contract-status.js --network sepolia
```

**Kết quả mong đợi:**
```
💼 Contract Balance: 0.003 ETH (hoặc > 0)
```

### Bước 2: Check Contract Address Matching

```bash
# Check backend
grep "LOTTERY_CONTRACT_ADDRESS" backend/.env

# Check frontend
grep "CONTRACT_ADDRESS" frontend/js/lottery.js

# Phải trả về CÙNG 1 địa chỉ!
```

### Bước 3: Check Admin Gas

```bash
npx hardhat run scripts/check-balance.js --network sepolia
```

**Cần ít nhất:** 0.005 ETH (cho gas)

### Bước 4: Test Gửi Tiền Thủ Công

Nếu vẫn lỗi, test function `sendPrizeToWinner` trực tiếp:

```bash
npx hardhat console --network sepolia

# Trong console:
const Lottery = await ethers.getContractFactory("Lottery");
const lottery = Lottery.attach("0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc");

// Gửi 0.001 ETH đến địa chỉ test
await lottery.sendPrizeToWinner(
  "0xYOUR_WALLET_ADDRESS", 
  ethers.parseEther("0.001")
);
```

---

## 📊 DEBUG LOG TRONG BACKEND

Khi admin quay số, check backend console:

**✅ Success:**
```
💸 Gửi tiền thưởng 0.001 ETH đến ví 0xABC...
✅ Gửi tiền thành công! TX: 0xTX123...
```

**❌ Error:**
```
❌ Lỗi gửi tiền blockchain: insufficient funds
```

**Có nghĩa là:**
- Contract không đủ tiền
- Hoặc admin wallet không đủ gas

---

## 🎯 CHECKLIST ĐẦY ĐỦ

- [ ] Contract có tiền (> 0 ETH)
- [ ] Contract address khớp (backend = frontend)
- [ ] Admin wallet có gas (> 0.005 ETH)
- [ ] Backend đang chạy và kết nối MongoDB
- [ ] Transaction hash được lưu vào database
- [ ] Không có error trong backend console

---

## 💡 HIỂU LOGIC HOẠT ĐỘNG

```
1. User mua vé
   → 0.001 ETH gửi đến Contract (0x354A56...)
   → Contract balance tăng lên

2. Contract giữ tiền
   → Balance = Tổng tiền từ vé đã bán
   → Ví dụ: 10 vé = 0.01 ETH

3. Admin quay số
   → Backend tìm vé trúng
   → Gọi contract.sendPrizeToWinner()
   → Admin wallet TRẢ GAS
   → Contract GỬI TIỀN đến winner

4. Winner nhận tiền
   → Tiền từ Contract → Ví winner
   → Tự động xuất hiện trong MetaMask
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### Contract KHÔNG THỂ Nhận Tiền Trực Tiếp

Không có `receive()` hoặc `fallback()` function nên:

❌ **KHÔNG THỂ:**
```solidity
admin.sendTransaction({to: contractAddress, value: ethers.parseEther("1")})
```

✅ **CHỈ CÓ THỂ:**
```solidity
contract.enter({value: ethers.parseEther("0.001")})  // Mua vé
```

---

## 🔍 XEM TRANSACTION ON-CHAIN

### Kiểm Tra User Có Nhận Tiền Không:

1. Vào MongoDB → Collection `tickets`
2. Tìm ticket với `status: "won"`
3. Check field `prizeTransactionHash`
4. Copy hash và vào:
   ```
   https://sepolia.etherscan.io/tx/[HASH]
   ```

**Nếu không có `prizeTransactionHash`:**
→ Backend chưa gửi được transaction
→ Check contract balance và admin gas

---

## 📞 CÁC TRƯỜNG HỢP ĐẶC BIỆT

### Case 1: Transaction Pending Mãi

**Nguyên nhân:** Gas price quá thấp

**Giải pháp:**
```javascript
// Trong sendPrizeToWinner function
const gasPrice = await web3.eth.getGasPrice();
const increasedGasPrice = (gasPrice * 120n) / 100n;  // +20%

const tx = {
  ...
  gasPrice: increasedGasPrice
};
```

### Case 2: Transaction Failed

**Nguyên nhân:**
- Contract out of gas
- Winner address invalid
- Contract balance insufficient

**Check logs:**
```bash
# Backend console
❌ Lỗi gửi tiền blockchain: [ERROR_MESSAGE]
```

### Case 3: Multiple Winners

**Contract gửi tiền tuần tự:**
```javascript
for (const ticket of winningTickets) {
  await sendPrizeToWinner(ticket.walletAddress, ticket.amount);
  // Đợi 5 giây giữa mỗi transaction (tránh nonce conflict)
  await sleep(5000);
}
```

---

## 🚀 KHUYẾN NGHỊ

### Trước Khi Quay Số:

1. **Check contract balance:**
   ```bash
   npx hardhat run scripts/check-contract-status.js --network sepolia
   ```

2. **Đảm bảo có ít nhất 1 vé đã bán:**
   ```javascript
   // MongoDB
   db.tickets.find({status: "active"}).count()
   // Phải > 0
   ```

3. **Admin wallet có đủ gas:**
   ```
   Cần: 0.01 ETH (an toàn)
   ```

### Sau Khi Quay Số:

1. **Check backend logs** xem có lỗi không
2. **Verify transactions** trên Etherscan
3. **Check MongoDB** xem `prizeTransactionHash` đã lưu chưa
4. **Notify winners** qua email/notification

---

## 📖 TÀI LIỆU THAM KHẢO

- [LOTTERY_FLOW.md](LOTTERY_FLOW.md) - Luồng xổ số chi tiết
- [WITHDRAW_GUIDE.md](WITHDRAW_GUIDE.md) - Hướng dẫn rút tiền admin
- [ADMIN_WITHDRAW.md](ADMIN_WITHDRAW.md) - Admin withdraw tool

---

## ✅ TÓM TẮT NHANH

**Không nhận được tiền?**

1. Check contract balance (phải > 0)
2. Check contract address (backend = frontend)
3. Check admin gas (phải > 0.005 ETH)
4. Check backend logs (có error không?)
5. Check Etherscan (transaction thành công chưa?)

**99% lỗi là do contract không có tiền!**
→ Đợi users mua vé hoặc mua thêm vé test
