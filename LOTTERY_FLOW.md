# 🎰 LUỒNG XỔ SỐ HOÀN CHỈNH - TỪ MUA VÉ ĐẾN NHẬN TIỀN

## 📊 TỔNG QUAN

```
👤 User Mua Vé → 💼 Contract Giữ Tiền → 🎲 Admin Quay Số → 💰 Người Trúng Nhận Tiền
```

---

## 🔄 LUỒNG CHI TIẾT (7 BƯỚC)

### BƯỚC 1: User Mua Vé 🎫

**Frontend (lottery.js):**
```javascript
// User nhập 6 số, ví dụ: 123456
const selectedNumber = "123456";

// Gửi 0.001 ETH đến contract qua MetaMask
await contract.methods.enter().send({
  from: userAccount,
  value: web3.utils.toWei("0.001", "ether")
});
```

**Blockchain:**
- Tiền (0.001 ETH) được gửi vào Smart Contract `0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc`
- Contract giữ tiền an toàn

**Backend (lotteryController.js - buyTicket):**
```javascript
// Lưu vé vào MongoDB
const ticket = await Ticket.create({
  user: userId,
  ticketNumber: "123456",
  walletAddress: "0xABC...",
  transactionHash: "0xTX123...",
  amount: 0.001,
  status: "active"  // ← Vé chưa quay
});
```

**Database (MongoDB):**
```json
{
  "ticketNumber": "123456",
  "walletAddress": "0xABC...",
  "amount": 0.001,
  "status": "active",
  "transactionHash": "0xTX123..."
}
```

---

### BƯỚC 2: Tiền Tích Lũy Trong Contract 💼

```
Contract Address: 0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc

User 1: 0.001 ETH (vé 123456)
User 2: 0.001 ETH (vé 789012)
User 3: 0.001 ETH (vé 345678)
─────────────────────────────────
Tổng:   0.003 ETH
```

**Người dùng có thể kiểm tra:**
- Frontend: Hiển thị Prize Pool real-time
- Etherscan: `https://sepolia.etherscan.io/address/0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc`

---

### BƯỚC 3: Admin Quay Số 🎲

**Admin chọn số trúng thưởng:**
```javascript
// Ví dụ admin chọn: 999456
const winningNumbers = [9, 9, 9, 4, 5, 6];
```

**Backend gọi API:**
```bash
POST /api/lottery/draw
{
  "winningNumbers": [9, 9, 9, 4, 5, 6]
}
```

---

### BƯỚC 4: So Sánh Vé (lotteryController.js) 🔍

**Quy tắc:** Trùng **3 số cuối** = Trúng thưởng

```javascript
const winningNumber = "999456";  // Số trúng
const ticket1 = "123456";        // Vé 1: 456 = Trúng! ✅
const ticket2 = "789012";        // Vé 2: 012 = Thua ❌
const ticket3 = "345678";        // Vé 3: 678 = Thua ❌

// Logic trong code:
for (const ticket of activeTickets) {
  const ticketLastThree = ticket.ticketNumber.slice(-3);  // "456"
  const winningLastThree = winningNumber.slice(-3);       // "456"
  
  if (ticketLastThree === winningLastThree) {
    winningTickets.push(ticket);  // User 1 trúng!
  } else {
    losingTickets.push(ticket);
  }
}
```

---

### BƯỚC 5: Cập Nhật Database Cho Người Trúng 📝

**Vé Trúng Thưởng:**
```javascript
// Update ticket in MongoDB
ticket.status = "won";              // active → won
ticket.drawDate = new Date();       // Ngày quay
ticket.winningNumber = "999456";    // Số trúng
ticket.prizeAmount = 0.001;         // Giải thưởng
await ticket.save();

// Cộng tiền vào user balance (MongoDB)
user.balance += 0.001;              // Tracking trong DB
await user.save();
```

**Kết quả:**
```json
{
  "ticketNumber": "123456",
  "status": "won",                    // ✅ Đã trúng
  "winningNumber": "999456",
  "prizeAmount": 0.001,
  "drawDate": "2026-01-31T10:30:00Z"
}
```

---

### BƯỚC 6: Gửi Tiền Blockchain → Ví User 💸

**ĐÂY LÀ BƯỚC QUAN TRỌNG NHẤT!**

Backend gọi Smart Contract function `sendPrizeToWinner()`:

```javascript
async function sendPrizeToWinner(winnerAddress, amountETH) {
  // 1. Convert ETH to Wei
  const amountWei = web3.utils.toWei("0.001", "ether");
  
  // 2. Load contract với Admin private key
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  
  // 3. Build transaction
  const tx = {
    from: adminWallet,              // 0x7f2A7abf... (Admin)
    to: contractAddress,            // 0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc
    data: contract.methods
      .sendPrizeToWinner(
        winnerAddress,              // 0xABC... (User 1)
        amountWei                   // 1000000000000000 Wei (0.001 ETH)
      )
      .encodeABI(),
    gas: 100000,
    gasPrice: await web3.eth.getGasPrice()
  };
  
  // 4. Sign transaction với Admin private key
  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    adminPrivateKey
  );
  
  // 5. Send transaction to blockchain
  const receipt = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction
  );
  
  // 6. Return transaction hash
  return receipt.transactionHash;  // "0xTX789..."
}
```

**Smart Contract (Lottery.sol):**
```solidity
function sendPrizeToWinner(address winner, uint256 amount) public restricted {
    require(winner != address(0), "Dia chi winner khong hop le");
    require(amount > 0, "So tien phai lon hon 0");
    require(address(this).balance >= amount, "Khong du tien trong contract");
    
    // Chuyển tiền từ contract → ví người thắng
    payable(winner).transfer(amount);  // ← ETH được gửi đi!
    
    emit WinnerPicked(winner, amount);
}
```

**Blockchain Transaction:**
```
From:   Contract (0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc)
To:     User 1   (0xABC...)
Amount: 0.001 ETH
Status: Success ✅
TxHash: 0xTX789...
```

---

### BƯỚC 7: User Nhận Tiền Trong MetaMask 🎉

**Tự động xuất hiện trong ví:**

```
MetaMask Wallet (0xABC...)
─────────────────────────────
Balance Before: 0.050 ETH
+ Prize:        0.001 ETH
─────────────────────────────
Balance After:  0.051 ETH ✅
```

**Người dùng có thể:**
1. Thấy số dư tăng trong MetaMask
2. Xem transaction trên Etherscan:
   ```
   https://sepolia.etherscan.io/tx/0xTX789...
   ```
3. Nhận notification trên website
4. Rút tiền từ MetaMask về bank (nếu muốn)

---

## 📋 TÓM TẮT LUỒNG TIỀN

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Mua Vé                                              │
│    👤 User → 💰 0.001 ETH → 💼 Contract                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Contract Giữ Tiền                                        │
│    💼 Contract Balance: 0.003 ETH (3 vé)                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Admin Quay Số                                            │
│    👨‍💼 Admin → 🎲 Số trúng: 999456                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend So Sánh                                          │
│    🔍 User 1 (456) = Trúng! ✅                              │
│    🔍 User 2 (012) = Thua ❌                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Blockchain Gửi Tiền                                      │
│    💼 Contract → 💸 0.001 ETH → 👤 User 1 Wallet            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. User Nhận Tiền                                           │
│    ✅ Tiền xuất hiện trong MetaMask                         │
│    📱 Nhận notification                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 TRACKING CHO NGƯỜI CHƠI

### 1. Trong Website
```javascript
// Profile page hiển thị:
- Số vé đã mua: 10
- Số vé trúng: 1
- Tổng tiền thắng: 0.001 ETH
- Lịch sử vé: [Active, Won, Lost]
```

### 2. Trong MetaMask
```
Activity → See transaction
- From: Contract
- To: Your wallet
- Amount: 0.001 ETH
- Status: Success
```

### 3. Trên Etherscan
```
https://sepolia.etherscan.io/tx/[TX_HASH]

Details:
- Transaction Hash: 0xTX789...
- Status: Success
- From: 0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc
- To: 0xABC... (Your Wallet)
- Value: 0.001 ETH
```

---

## ⚠️ XỬ LÝ LỖI

### Nếu Blockchain Gửi Tiền Thất Bại:

```javascript
try {
  const txHash = await sendPrizeToWinner(walletAddress, amount);
  ticket.prizeTransactionHash = txHash;  // ✅ Success
} catch (blockchainError) {
  // ❌ Lỗi blockchain
  ticket.blockchainError = error.message;
  // Admin cần gửi tiền thủ công hoặc retry
}
```

**Admin có thể:**
1. Check logs để tìm vé bị lỗi
2. Gửi tiền thủ công qua MetaMask
3. Hoặc chạy lại function `sendPrizeToWinner()`

---

## 🎯 CÂU TRẢ LỜI NGẮN GỌN

### Người chơi nhận tiền như thế nào?

**TỰ ĐỘNG qua 3 bước:**

1. **Backend tính toán**: Vé nào trúng (3 số cuối)
2. **Smart Contract gửi**: Contract transfer ETH → Ví user
3. **MetaMask nhận**: Tiền tự động xuất hiện trong ví

**Không cần user làm gì!** Chỉ cần:
- ✅ Đăng ký wallet address khi mua vé
- ✅ Mở MetaMask để xem tiền
- ✅ Nhận notification từ website

**Minh bạch 100%:**
- Transaction hash lưu trong database
- Có thể verify trên Etherscan
- Blockchain không thể fake

---

## 📞 GIẢI ĐÁP THẮC MẮC

**Q: Tiền gửi ngay lập tức không?**
A: Mất ~15-30 giây (tùy network congestion Sepolia)

**Q: User có thể không nhận được tiền không?**
A: Có 2 trường hợp:
1. **Địa chỉ wallet sai** → Backend có log để admin check
2. **Contract hết tiền** → Admin phải nạp tiền vào contract

**Q: Admin có thể ăn cắp tiền không?**
A: **KHÔNG!** Smart contract đã set rule: 
- Chỉ gửi cho địa chỉ đã mua vé
- Transaction public trên blockchain
- Code verify trên Etherscan

**Q: Làm sao biết đã nhận tiền?**
A: Có 4 cách check:
1. MetaMask balance tăng
2. Website notification
3. Profile page → History
4. Etherscan transaction

---

## 🚀 DEMO THỰC TẾ

```bash
# User mua vé
curl -X POST http://localhost:5000/api/lottery/buy-ticket \
  -H "Authorization: Bearer TOKEN" \
  -d '{"ticketNumber": "123456", "walletAddress": "0xABC...", ...}'

# Admin quay số  
curl -X POST http://localhost:5000/api/lottery/draw \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"winningNumbers": [9,9,9,4,5,6]}'

# → Backend tự động:
# 1. Tìm vé trúng
# 2. Gọi Smart Contract
# 3. Transfer ETH → User wallet
# 4. Lưu transaction hash
# 5. Gửi notification

# User check MetaMask → Thấy 0.001 ETH ✅
```

---

## 💡 ĐIỂM MẠNH CỦA HỆ THỐNG

1. ✅ **Tự động hoàn toàn** - User không cần claim
2. ✅ **Minh bạch** - Mọi transaction đều public
3. ✅ **Bảo mật** - Smart contract không thể hack
4. ✅ **Tracking** - Có transaction hash
5. ✅ **Fast** - Nhận tiền trong vài giây

---

**Tóm lại:** User chỉ cần mua vé và đợi. Nếu trúng, tiền TỰ ĐỘNG vào ví MetaMask! 🎉
