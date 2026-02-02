# 📋 AUDIT: Tính Năng Không Cần Thiết

## 1️⃣ ENVIRONMENT VARIABLES (.env) - CÓ THỂBỎ

### ❌ Không dùng/Dự phòng:

```
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123456
ADMIN_EMAIL=admin@etherlottery.com
SEPOLIA_RPC_URL=https://1rpc.io/sepolia (không dùng)
HOODI_RPC_URL=https://rpc-testnet.hoodi.network (không dùng)
```

**Tại sao?**

- Email chưa được cấu hình thực sự
- Admin credentials không được dùng (dùng JWT thay vì hardcoded)
- Chỉ dùng INFURA, không cần URL dự phòng khác

---

## 2️⃣ API ENDPOINTS - TINH GỌN

### ❌ Notification API - CÓ THỂ GỢP

Hiện tại có:

- `DELETE /api/notifications/delete-all` - xóa hết thông báo
- `DELETE /api/notifications/:id` - xóa từng cái
- `POST /api/notifications/broadcast` - broadcast tùy ý
- `POST /api/notifications/notify-all` - gửi cho tất cả

**Đề xuất:** Chỉ giữ:

- `GET /api/notifications` - lấy danh sách
- `PUT /api/notifications/:id/read` - đánh dấu đã xem
- `DELETE /api/notifications/:id` - xóa (chỉ riêng)

**Bỏ:**

- `DELETE /api/notifications/delete-all` (nguy hiểm)
- `POST /api/notifications/broadcast` (tính năng admin, có thể thay bằng system messages)
- `POST /api/notifications/notify-all` (dư thừa)

---

### ❌ Lottery API - CÓ THỂÔI

```javascript
// Có thể bỏ:
GET /api/lottery/admin/recent-players - thay bằng user list
GET /api/lottery/draw-results - đã có trong latest-draw
POST /api/lottery/reset-tickets - nguy hiểm, ít dùng
POST /api/lottery/cancel-scheduled-draw - có nhưng ít dùng
GET /api/lottery/scheduled-draws - quản lý schedule dư thừa
```

---

## 3️⃣ PROFILE ROUTES - TINH GỌN

### Hiện tại có:

```
GET /api/profile - xem hồ sơ
PUT /api/profile - cập nhật hồ sơ
GET /api/profile/stats - xem thống kê
PUT /api/profile/wallet - cập nhật ví
PUT /api/profile/avatar - cập nhật avatar
```

**Đề xuất:** Hợp nhất:

```
GET /api/profile - xem đầy đủ (hồ sơ + stats)
PUT /api/profile - cập nhật (hồ sơ + ví + avatar cùng lúc)
```

---

## 4️⃣ PACKAGE.JSON - BỎĐƯ THỪA

### Dependencies:

```json
{
  "ethers": "^6.16.0", // ❌ Không dùng (dùng web3)
  "web3": "^4.16.0", // ✅ Dùng
  "node-schedule": "^2.1.1" // ❌ Quản lý schedule, có thể dùng cron thay
}
```

**Đề xuất:**

- Bỏ `ethers` (chỉ dùng web3)
- Giữ `node-schedule` hoặc dùng `node-cron` (nhẹ hơn)

---

## 5️⃣ SERVER.JS - TINH GỌN

### Routes dư thừa:

```javascript
❌ app.get("/api/server-time")
   // Không ai dùng, browser có Date.now()
   // Chỉ cần cho schedule, nhưng client không cần

✅ app.get("/api/health")
   // Giữ lại cho monitoring
```

---

## 📊 TÓMSỐ LIỆU

| Danh mục       | Hiện tại | Đề xuất | Bỏ  |
| -------------- | -------- | ------- | --- |
| ENV Variables  | 20+      | 12      | 8   |
| API Endpoints  | 30+      | 18      | 12+ |
| Profile Routes | 5        | 2       | 3   |
| Dependencies   | 9        | 8       | 1   |

---

## ✅ HÀNH ĐỘNG

Bạn muốn tôi:

1. ✅ **Dọn .env** - bỏ unused variables
2. ✅ **Rút gọn API** - xóa endpoints dư thừa
3. ✅ **Hợp nhất routes** - giảm số endpoints
4. ✅ **Cập nhật package.json** - bỏ unused dependencies

Chọn thứ tự ưu tiên!
