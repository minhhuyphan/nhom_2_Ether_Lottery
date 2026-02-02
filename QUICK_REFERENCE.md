# 🎯 QUICK REFERENCE - BẠN CẦN BIẾT GÌ?

## 📖 Bắt Đầu Từ ĐÂY

### **Bước 1: Hiểu Dự Án (5 phút)**

Đọc: [VIETNAMESE_CODE_GUIDE.md](VIETNAMESE_CODE_GUIDE.md) - Phần "TỔNG QUAN" & "GIẢI THÍCH LUỒNG"

### **Bước 2: Hiểu Smart Contract (10 phút)**

Đọc: [contracts/Lottery.sol](contracts/Lottery.sol) - Tất cả đều có comments Việt

### **Bước 3: Hiểu Backend (15 phút)**

1. Đọc: [backend/server.js](backend/server.js)
2. Đọc: [backend/controllers/lotteryController.js](backend/controllers/lotteryController.js)

### **Bước 4: Hiểu Frontend (20 phút)**

Đọc: [frontend/js/lottery.js](frontend/js/lottery.js)

**Tổng cộng: ~50 phút để hiểu toàn bộ dự án!**

---

## 🔑 Các Khái Niệm Chính

### **1. Blockchain (Blockchain)**

- 🔗 Mạng lưới máy tính phân tán
- 💾 Lưu trữ dữ liệu bền vững
- ✅ Giao dịch không thể giả mạo

### **2. Smart Contract (Hợp đồng thông minh)**

- 📜 Mã chạy trên blockchain
- ⚙️ Tự động thực hiện logic
- 💰 Quản lý tiền người chơi

### **3. Web3 (Web3.js)**

- 🌐 Thư viện kết nối blockchain
- 📞 Gọi hàm smart contract
- 💳 Gửi transaction

### **4. MetaMask (Ví điện tử)**

- 🔐 Quản lý ví người dùng
- ✍️ Ký giao dịch
- 🛡️ Bảo vệ private key

### **5. Backend (Server)**

- 🖥️ Xử lý logic phức tạp
- 💾 Lưu trữ dữ liệu MongoDB
- 📱 Cung cấp API cho frontend

### **6. Frontend (Giao diện)**

- 🎨 Hiển thị cho người dùng
- 🖱️ Nhận input từ người dùng
- 📞 Gọi API & smart contract

---

## 🎰 LUỒNG XỔ SỐ (Đơn Giản)

```
👤 User
   ↓
   ├─→ Chọn 6 số (ví dụ: 123456)
   ├─→ Click "Mua Vé"
   ├─→ MetaMask confirm
   ↓
💼 Smart Contract
   ├─→ Nhận 0.001 ETH
   ├─→ Tiền được lock
   ↓
📝 Backend Database
   ├─→ Ghi vé vào MongoDB
   ├─→ Status: active
   ↓
🎲 Admin Quay Số
   ├─→ Admin chọn số trúng (999456)
   ├─→ Backend so sánh: 456 = 456 ✅
   ├─→ Cập nhật: status = won
   ↓
💰 Phát Tiền
   ├─→ Backend gọi contract.sendPrize()
   ├─→ Tiền từ contract → ví user
   ↓
✅ Hoàn Thành
   └─→ User nhận 0.001 ETH (hoặc giải thưởng)
```

---

## 📁 Cấu Trúc File Quan Trọng

```
ether-lottery/
│
├── 📜 contracts/
│   └── Lottery.sol ⭐ Smart Contract (hợp đồng quản lý tiền)
│
├── 🖥️ backend/
│   ├── server.js ⭐ Server setup (khởi động API)
│   ├── controllers/
│   │   └── lotteryController.js ⭐ Xử lý API logic
│   ├── models/
│   │   ├── User.js (schema user)
│   │   ├── Ticket.js (schema vé)
│   │   └── Notification.js (schema thông báo)
│   └── routes/
│       └── lotteryRoutes.js (định tuyến API)
│
├── 🎨 frontend/
│   ├── js/
│   │   └── lottery.js ⭐ Giao diện & logic
│   ├── html/
│   │   └── index.html (trang chính)
│   └── css/ (styling)
│
└── 📚 Hướng dẫn
    ├── VIETNAMESE_CODE_GUIDE.md ⭐ Hướng dẫn toàn diện
    └── COMMENTS_SUMMARY.md (tóm tắt)
```

---

## 🔄 API Endpoints (Quan Trọng)

| Method | Endpoint                 | Chức Năng               |
| ------ | ------------------------ | ----------------------- |
| POST   | /api/lottery/buy-ticket  | Mua vé                  |
| GET    | /api/lottery/latest-draw | Lấy kết quả quay        |
| GET    | /api/lottery/public-info | Lấy thông tin công khai |
| POST   | /api/lottery/draw        | Admin quay số           |
| POST   | /api/lottery/claim-prize | User rút tiền           |

---

## 💡 Công Thức Quan Trọng

### **So Sánh Vé**

```
Quy tắc: Trùng 3 số cuối = Trúng thưởng

Ví dụ:
Số trúng: 999456
- Vé 123456: Last 3 = 456 ✅ Trúng
- Vé 789012: Last 3 = 012 ❌ Thua
```

### **Giải Thưởng**

```
Nếu N người trúng:
Mỗi người nhận = Prize Pool ÷ N

Ví dụ:
- 3 người chơi → Pool = 0.003 ETH
- 1 người trúng → Nhận 0.003 ETH
- 2 người trúng → Mỗi người 0.0015 ETH
```

### **Chi Phí**

```
Phí vào: 0.001 ETH
Tỷ giá: 1 ETH = $2000 (ví dụ)
Vậy: 0.001 ETH = $2
```

---

## ⚡ Chạy Dự Án (Nhanh)

```bash
# 1. Setup (1 lần)
npm install
node admin-setup.js deploy
# Lưu Contract Address!

# 2. Cập nhật Contract Address
# Mở: frontend/js/lottery.js (dòng ~23)
# Sửa: const CONTRACT_ADDRESS = "0x..."

# 3. Chạy Backend (Terminal 1)
cd backend
npm start

# 4. Chạy Frontend (Terminal 2)
npm run frontend

# 5. Mở Browser
http://localhost:5500
```

---

## 🎯 Các File Cần Đọc (Theo Thứ Tự)

### **Level 1 - Căn Bản**

1. VIETNAMESE_CODE_GUIDE.md (Phần tổng quan)
2. contracts/Lottery.sol (Đọc comments)
3. QUICK_START.md

### **Level 2 - Trung Bình**

4. backend/server.js (Đọc comments)
5. backend/controllers/lotteryController.js (Đọc comments)
6. LOTTERY_FLOW.md

### **Level 3 - Nâng Cao**

7. backend/models/Ticket.js
8. backend/services/scheduleService.js
9. DEPLOY_GUIDE.md

---

## 🐛 Debug Tips

### **Vấn đề: Frontend không thấy giá trị**

✅ Kiểm tra: Browser console (F12)
✅ Kiểm tra: API URL trong lottery.js
✅ Kiểm tra: Backend có chạy không?

### **Vấn đề: MetaMask không connect**

✅ Cài đặt MetaMask extension
✅ Kiểm tra: Ở mạng Sepolia Testnet không?
✅ Kiểm tra: Có Sepolia ETH không?

### **Vấn đề: Giao dịch fail**

✅ Kiểm tra: Có đủ ETH không?
✅ Kiểm tra: Contract Address đúng không?
✅ Kiểm tra: RPC endpoint còn hoạt động không?

---

## 📞 Cheat Sheet - Nhất Định Phải Nhớ

| Gì               | Giá Trị                          |
| ---------------- | -------------------------------- |
| Phí vé           | 0.001 ETH                        |
| So sánh          | 3 số cuối                        |
| Mạng             | Sepolia Testnet                  |
| Contract Address | Được deploy trong admin-setup.js |
| Backend URL      | http://localhost:5000            |
| Frontend URL     | http://localhost:5500            |
| Port Backend     | 5000                             |
| Port Frontend    | 5500                             |

---

## ✅ Checklist - Trước Khi Deploy

- [ ] Đọc VIETNAMESE_CODE_GUIDE.md
- [ ] Hiểu luồng mua vé & quay số
- [ ] Biết smart contract làm gì
- [ ] Biết backend API làm gì
- [ ] Biết frontend gọi API như nào
- [ ] Setup .env với private key
- [ ] Deploy contract & lưu address
- [ ] Cập nhật frontend với address
- [ ] Chạy backend & frontend
- [ ] Test flow: mua vé → quay số → nhận tiền

---

**Bạn đã sẵn sàng! 🚀 Chúc bạn học tập vui vẻ!**
