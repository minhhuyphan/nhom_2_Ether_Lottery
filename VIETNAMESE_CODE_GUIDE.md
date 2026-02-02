# 📚 HƯỚNG DẪN TIẾNG VIỆT - GIẢI THÍCH CODE DỰ ÁN

## ✅ Những File Đã Thêm Comments

Tôi đã thêm các giải thích bằng **tiếng Việt chi tiết** vào các file quan trọng nhất:

### 1. **Smart Contract** - `contracts/Lottery.sol`
✅ Giải thích tất cả các biến, hàm, modifier
- `manager`: Địa chỉ admin
- `players`: Danh sách người chơi
- `entranceFee`: Phí vào xổ số
- `enter()`: Hàm cho phép người chơi mua vé
- `pickWinner()`: Chọn người thắng
- `sendPrizeToWinner()`: Gửi tiền cho người trúng
- `withdraw()`: Rút tiền về ví admin

### 2. **Backend Server** - `backend/server.js`
✅ Giải thích cấu hình server
- Kết nối MongoDB
- Setup CORS (cho phép frontend gọi API)
- Các routes chính (auth, lottery, notifications)
- Health check endpoint
- Error handling

### 3. **Frontend Main** - `frontend/js/lottery.js`
✅ Giải thích khởi tạo dApp
- Biến toàn cục (web3, contract, userAccount)
- Cấu hình contract (ADDRESS, ABI)
- Cấu hình Sepolia Testnet
- Khởi động ứng dụng (DOMContentLoaded)
- Kết nối MetaMask
- Ensure Sepolia Network

### 4. **Backend Lottery Controller** - `backend/controllers/lotteryController.js`
✅ Giải thích các API chính
- `buyTicket()`: Mua vé số
- `getLatestDraw()`: Lấy kết quả quay gần nhất
- `getPublicInfo()`: Lấy thông tin công khai
- `getAdminStats()`: Lấy thống kê admin
- `getRecentPlayers()`: Lấy danh sách người chơi
- `getMyTickets()`: Lấy vé của user

---

## 📖 GIẢI THÍCH LUỒNG HOẠT ĐỘNG

### **🔄 LUỒNG MUA VÉ (5 bước)**

```
┌─────────────────────────────────────┐
│  USER MUA VÉ TRÊN FRONTEND          │
│  - Chọn 6 số (ví dụ: 123456)       │
│  - Click button "Mua Vé"           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  FRONTEND GỌI SMART CONTRACT        │
│  - Gửi 0.001 ETH                   │
│  - MetaMask confirm                │
│  - Lấy transactionHash             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  BLOCKCHAIN XỬ LÝ                   │
│  - Tiền được lock trong contract   │
│  - Event "PlayerEntered" phát ra   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  FRONTEND GỌI BACKEND API          │
│  POST /api/lottery/buy-ticket      │
│  - ticketNumber: "123456"          │
│  - walletAddress: "0xABC..."       │
│  - transactionHash: "0xTX123..."   │
│  - amount: 0.001                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  BACKEND GHI VÀO DATABASE          │
│  - Lưu vé vào MongoDB              │
│  - Status: "active"                │
│  - Gửi notification cho user       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  USER NHẬN THÔNG BÁO               │
│  - "Mua vé thành công"            │
│  - Hiển thị vé đã mua             │
└─────────────────────────────────────┘
```

### **🎲 LUỒNG QUAY SỐ (6 bước)**

```
┌─────────────────────────────────────┐
│  ADMIN QUAY SỐ                      │
│  - Admin chọn số trúng              │
│  - Ví dụ: 999456                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  ADMIN GỌI API DRAW                │
│  POST /api/lottery/draw            │
│  - winningNumbers: [9,9,9,4,5,6]  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  BACKEND SO SÁNH VÉ                │
│  - Lấy tất cả vé active            │
│  - So sánh 3 số cuối               │
│  - Ví 123456: 456 = 456 ✅ Trúng  │
│  - Ví 789012: 012 ≠ 456 ❌ Thua   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  CẬP NHẬT DATABASE                 │
│  - Vé trúng: status = "won"        │
│  - Vé thua: status = "lost"        │
│  - Cộng tiền vào balance           │
│  - Tạo thông báo cho người trúng   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  GỬI TIỀN TỬ CONTRACT              │
│  - Backend gọi: sendPrizeToWinner()│
│  - Smart contract transfer ETH     │
│  - Tiền về ví người trúng          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  HOÀN TẤT - USER NHẬN TIỀN ✅      │
│  - Hiển thị "Bạn trúng 0.003 ETH"  │
│  - Ví user cộng 0.003 ETH          │
└─────────────────────────────────────┘
```

---

## 🔑 CÁC KHÁI NIỆM QUAN TRỌNG

### **1. Web3 & Web3.js**
```javascript
// Web3 là thư viện giao tiếp với blockchain
const web3 = new Web3(window.ethereum);

// Dùng để:
// - Gọi hàm smart contract
// - Lấy dữ liệu blockchain
// - Gửi transaction
```

### **2. MetaMask**
```javascript
// MetaMask là ví phần mềm
if (typeof window.ethereum !== "undefined") {
  // MetaMask đã cài đặt
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });
}
```

### **3. Smart Contract**
```solidity
contract Lottery {
  // State variables - lưu trữ trên blockchain (bền vững)
  address public manager;
  uint256 public entranceFee;
  
  // Functions - các hành động
  function enter() public payable { ... }
  function sendPrizeToWinner(address winner, uint256 amount) { ... }
}
```

### **4. Backend API**
```javascript
// REST API - giao tiếp giữa Frontend và Backend
POST /api/lottery/buy-ticket
{
  "ticketNumber": "123456",
  "walletAddress": "0xABC...",
  "transactionHash": "0xTX123...",
  "amount": 0.001
}
```

### **5. MongoDB Database**
```json
// Lưu trữ dữ liệu (user, vé, thông báo)
// Collections:
// - Users
// - Tickets  
// - Notifications
```

---

## 📁 CẤU TRÚC THƯ MỤC

```
ether-lottery/
│
├── contracts/
│   └── Lottery.sol  ✅ Smart Contract với comments
│
├── backend/
│   ├── server.js  ✅ Server setup với comments
│   ├── controllers/
│   │   └── lotteryController.js  ✅ API logic với comments
│   ├── routes/
│   ├── models/
│   └── services/
│
├── frontend/
│   ├── js/
│   │   └── lottery.js  ✅ Frontend logic với comments
│   ├── html/
│   └── css/
│
└── scripts/
    └── deploy.js
```

---

## 💡 CÁC TỆPNÊN ĐỌC TIẾP

Nếu muốn hiểu sâu hơn, nên đọc các file sau (theo thứ tự):

### **Level 1 - Căn bản** (15 phút)
1. `contracts/Lottery.sol` - Hiểu smart contract
2. `backend/server.js` - Hiểu server setup
3. `frontend/js/lottery.js` (dòng 1-200) - Hiểu khởi tạo

### **Level 2 - Trung bình** (30 phút)
4. `backend/controllers/lotteryController.js` - Hiểu các API
5. `backend/models/Ticket.js` - Hiểu database schema
6. `frontend/js/lottery.js` (đầy đủ) - Hiểu toàn bộ frontend

### **Level 3 - Nâng cao** (1 giờ)
7. `backend/routes/lotteryRoutes.js` - Hiểu routing
8. `backend/services/scheduleService.js` - Hiểu scheduling
9. `backend/middleware/auth.js` - Hiểu authentication

---

## 🎯 CÁC HÀNG CHÍNH

### **Smart Contract Functions**
```solidity
// 1. Mua vé (người chơi gọi, gửi ETH)
enter() payable

// 2. Gửi tiền cho người trúng (admin gọi)
sendPrizeToWinner(address winner, uint256 amount)

// 3. Rút tiền (admin gọi)
withdraw(uint256 amount)
withdrawAll()
```

### **Backend API Endpoints**
```
POST   /api/lottery/buy-ticket         - Mua vé
GET    /api/lottery/latest-draw        - Lấy kết quả quay
GET    /api/lottery/public-info        - Lấy thông tin công khai
GET    /api/lottery/my-tickets         - Lấy vé của user
POST   /api/lottery/draw               - Quay số (admin)
POST   /api/lottery/claim-prize        - Rút tiền
```

---

## ⚠️ NHỮNG ĐIỂM QUAN TRỌNG CẦN NHỚ

### **1. Phí Giao Dịch**
```
0.001 ETH = 1,000,000 Wei = $2 (tại giá 2000 USD/ETH)
```

### **2. Status Vé**
```
active  → Chưa quay, tiền đang trong pool
won     → Trúng thưởng, chờ rút
lost    → Thua, không nhận tiền
claimed → Đã rút về ví
```

### **3. So Sánh Vé**
```
Quy tắc: Trùng 3 số cuối = Trúng thưởng

Ví dụ:
Số trúng: 999456
Vé 1:     123456 (456 = 456) ✅ Trúng
Vé 2:     789012 (012 ≠ 456) ❌ Thua
```

### **4. Giải Thưởng**
```
Nếu có 3 người trúng, mỗi người nhận:
Prize Pool ÷ 3

Ví dụ:
Prize Pool: 0.003 ETH (3 người chơi, mỗi 0.001)
Người trúng: 0.003 ÷ 1 = 0.003 ETH (nếu chỉ 1 người)
hoặc
0.003 ÷ 3 = 0.001 ETH (nếu 3 người)
```

---

## 🚀 CHẠY DỰ ÁN (TÓM TẮT)

```bash
# 1. Setup
npm install
node admin-setup.js deploy

# 2. Chạy Backend (Terminal 1)
cd backend
npm start

# 3. Chạy Frontend (Terminal 2)
npm run frontend

# 4. Mở browser
http://localhost:5500
```

---

## 📞 CẦN GIÚP?

Nếu có câu hỏi, hãy:
1. Xem comments trong code
2. Đọc tệp này
3. Kiểm tra các file `.md` trong project (LOTTERY_FLOW.md, README.md, v.v.)

**Chúc bạn học tập vui vẻ! 🎰✨**
