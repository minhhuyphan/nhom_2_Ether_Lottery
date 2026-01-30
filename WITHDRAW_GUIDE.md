# 💰 Hướng Dẫn Rút Tiền Từ Smart Contract

## 📊 Luồng Tiền Trong Hệ Thống

### Hiện Tại:
```
User mua vé (0.001 ETH)
         ↓
    Smart Contract (0x327F9548...)
         ↓
    Giữ tiền cho đến khi quay số
         ↓
    Chuyển cho người trúng
```

### Sau Khi Cập Nhật (Có 2 Tùy Chọn):

#### Option 1: Giữ Nguyên (Lottery Minh Bạch)
```
User mua vé → Contract → Người trúng thưởng
```

#### Option 2: Rút Về Ví Admin
```
User mua vé → Contract → Admin rút về ví (0x7f2A7abf...)
```

---

## 🔧 Các Function Mới Đã Thêm

### 1. `withdraw(uint256 amount)` - Rút Một Phần
Rút một số tiền cụ thể từ contract về ví admin.

**Ví dụ:**
```javascript
// Rút 0.5 ETH
const amount = web3.utils.toWei("0.5", "ether");
await contract.methods.withdraw(amount).send({ from: adminAddress });
```

### 2. `withdrawAll()` - Rút Toàn Bộ
Rút tất cả tiền từ contract về ví admin.

**Ví dụ:**
```javascript
await contract.methods.withdrawAll().send({ from: adminAddress });
```

---

## 🚀 Cách Triển Khai

### Bước 1: Biên Dịch Contract Mới
```bash
cd D:\DAI_HOC_2022-2026\2026\KY2\blockchain\nhom_2_Ether_Lottery
npx hardhat compile
```

### Bước 2: Deploy Contract Mới Lên Sepolia
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Lưu ý:** Bạn sẽ nhận được địa chỉ contract MỚI. Cập nhật vào:
- `.env` → `LOTTERY_CONTRACT_ADDRESS`
- `frontend/js/lottery.js` → `CONTRACT_ADDRESS`

### Bước 3: Verify Contract (Optional)
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Bước 4: Test Withdraw Function
```bash
npx hardhat run scripts/test-withdraw.js --network sepolia
```

---

## 💻 Sử Dụng Trong Backend

Thêm function rút tiền trong admin controller:

```javascript
// backend/controllers/adminController.js

exports.withdrawFromContract = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in ETH
    
    // Validate
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền không hợp lệ"
      });
    }

    const amountWei = web3.utils.toWei(amount.toString(), "ether");
    
    // Get admin wallet
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    const account = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
    web3.eth.accounts.wallet.add(account);

    // Call contract
    const contractABI = [/* ABI with withdraw function */];
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    
    const receipt = await contract.methods
      .withdraw(amountWei)
      .send({ from: account.address, gas: 100000 });

    res.json({
      success: true,
      message: "Rút tiền thành công",
      data: {
        amount,
        transactionHash: receipt.transactionHash
      }
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(500).json({
      success: false,
      message: "Rút tiền thất bại"
    });
  }
};
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. **Bảo Mật**
- Chỉ admin (ví `0x7f2A7abf8c5248e8768061553a21D65F263Cf0d2`) mới có thể rút tiền
- Không bao giờ chia sẻ `ADMIN_PRIVATE_KEY`

### 2. **Gas Fee**
- Mỗi lần rút tiền cần trả gas fee (~0.001-0.003 ETH)
- Đảm bảo ví admin có đủ ETH để trả gas

### 3. **Minh Bạch**
- Nếu rút tiền về ví admin, hệ thống KHÔNG còn là lottery minh bạch 100%
- Người chơi sẽ KHÔNG thấy tiền trong contract (có thể mất niềm tin)

### 4. **Khuyến Nghị**
Có 2 mô hình:

#### Mô hình A: Lottery Minh Bạch (Khuyến Nghị)
- Tiền ở trong contract
- Người chơi thấy prize pool thật
- Quay số tự động chuyển cho winner
- ✅ **Xây dựng niềm tin**

#### Mô hình B: Admin Quản Lý
- Admin rút tiền về ví
- Admin tự chuyển tiền cho winner
- Prize pool hiển thị từ database (không phải blockchain)
- ⚠️ **Cần minh bạch cao hơn**

---

## 🧪 Test Trên Sepolia

### Kiểm Tra Balance:
```bash
npx hardhat run scripts/check-balance.js --network sepolia
```

### Test Withdraw 50%:
```bash
npx hardhat run scripts/test-withdraw.js --network sepolia
```

### Xem Transaction:
Vào Sepolia Etherscan:
```
https://sepolia.etherscan.io/address/0x7f2A7abf8c5248e8768061553a21D65F263Cf0d2
```

---

## 📞 Hỗ Trợ

Nếu gặp lỗi:
1. Kiểm tra `.env` có đủ thông tin
2. Xem gas fee trong ví admin
3. Verify contract đã deploy đúng
4. Check logs: `console.log` trong contract call

---

## ✅ Checklist Deploy

- [ ] Compile contract mới
- [ ] Deploy lên Sepolia
- [ ] Cập nhật CONTRACT_ADDRESS mới
- [ ] Update ABI trong frontend
- [ ] Test withdraw function
- [ ] Verify contract
- [ ] Update backend .env
- [ ] Test end-to-end
