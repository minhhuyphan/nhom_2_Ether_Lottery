# 🔄 Hướng Dẫn Cập Nhật Code Cho Team

## ⚠️ VẤN ĐỀ: Đã pull code mới nhưng giao diện vẫn cũ?

**Nguyên nhân:** Browser cache (lưu file CSS/JS cũ)

---

## ✅ GIẢI PHÁP (3 CÁCH)

### Cách 1: Hard Refresh (NHANH NHẤT)
**Windows/Linux:**
```
Ctrl + Shift + R
```

**Mac:**
```
Cmd + Shift + R
```

### Cách 2: Xóa Cache Browser
**Chrome:**
1. `Ctrl + Shift + Delete`
2. Chọn "Cached images and files"
3. Click "Clear data"

**Firefox:**
1. `Ctrl + Shift + Delete`
2. Chọn "Cache"
3. Click "Clear Now"

### Cách 3: Mở Incognito/Private Mode
**Chrome:**
```
Ctrl + Shift + N
```

**Firefox:**
```
Ctrl + Shift + P
```

---

## 📋 CHECKLIST KHI PULL CODE MỚI

1. ✅ Pull code từ GitHub:
   ```bash
   git pull origin backend
   ```

2. ✅ Restart backend server:
   ```bash
   npm run backend
   ```

3. ✅ Restart frontend server:
   ```bash
   npm run frontend
   ```

4. ✅ Hard refresh browser:
   ```
   Ctrl + Shift + R
   ```

---

## 🔍 KIỂM TRA VERSION

Mở DevTools (F12) → Console → Gõ:
```javascript
// Kiểm tra contract address
console.log(CONTRACT_ADDRESS);
// Kết quả mong đợi: 0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc
```

---

## 🚨 NẾU VẪN LỖI

### Bước 1: Check xem đã pull chưa
```bash
git status
git log --oneline -5
```

### Bước 2: Check version files
Mở `frontend/html/index.html` → Tìm:
```html
<script src="../js/lottery.js?v=11"></script>
<link rel="stylesheet" href="../css/lottery.css?v=11" />
```

Phải là **v=11** (hoặc cao hơn)

### Bước 3: Xóa cache thủ công
**Chrome:**
1. F12 → Network tab
2. Disable cache ✅
3. Right click → Clear browser cache
4. Refresh (F5)

---

## 📱 HƯỚNG DẪN CHO MOBILE

### iOS Safari:
Settings → Safari → Clear History and Website Data

### Android Chrome:
Settings → Privacy → Clear browsing data → Cached images

---

## 🎯 TÓM TẮT NHANH

```bash
# 1. Pull code mới
git pull origin backend

# 2. Restart servers
npm run backend  # Terminal 1
npm run frontend # Terminal 2

# 3. Hard refresh browser
Ctrl + Shift + R
```

---

## ❓ CÂU HỎI THƯỜNG GẶP

**Q: Tại sao máy tôi bị lỗi còn máy khác không?**
A: Browser cache khác nhau. Mỗi người cần hard refresh riêng.

**Q: Đã hard refresh rồi vẫn lỗi?**
A: Check version trong DevTools (F12). Nếu vẫn v=6 → Xóa cache thủ công.

**Q: Có cách nào tự động không?**
A: Mỗi lần sửa code, dev phải tăng version number (v=11 → v=12).

---

## 📞 LƯU Ý CHO DEV

Mỗi lần sửa CSS/JS, nhớ tăng version:
```html
<!-- TỪ -->
<link rel="stylesheet" href="../css/lottery.css?v=11" />

<!-- THÀNH -->
<link rel="stylesheet" href="../css/lottery.css?v=12" />
```

**Không tăng version = Team sẽ thấy giao diện cũ!**
