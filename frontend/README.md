# MATTIEN Wallet - Frontend

Giao diện ví điện tử MATTIEN với theme tối và màu vàng accent.

## Cách chạy

Mở trực tiếp file `index.html` trong trình duyệt, hoặc chạy static server:

### Sử dụng Live Server (khuyến nghị)
1. Cài extension Live Server trong VS Code
2. Click chuột phải vào `index.html` → "Open with Live Server"

### Sử dụng npx http-server
```powershell
cd frontend
npx http-server -p 5173
```
Sau đó mở `http://localhost:5173`

### Sử dụng Python
```powershell
cd frontend
python -m http.server 5173
```

## Cấu trúc file
- `index.html` - HTML chính
- `styles.css` - CSS theme tối với màu vàng #FFD700
- `app.js` - JavaScript render dữ liệu mẫu
- `icon/` - Thư mục chứa các icon (add_ban.jpg, hop_qua.jpg, bao_cao.jpg, dong_ho.png, info.png)

## Tính năng
- ✅ Dashboard với balance cards
- ✅ Assets table
- ✅ Theme tối với accent vàng
- ✅ Responsive design
- ⏳ Tích hợp Web3/Ethers.js (sắp có)
- ⏳ Kết nối Sepolia Testnet (sắp có)

