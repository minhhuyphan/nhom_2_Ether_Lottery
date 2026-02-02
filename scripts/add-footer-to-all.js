#!/usr/bin/env node
/**
 * Script tự động thêm footer vào tất cả HTML files
 * Sử dụng: node add-footer-to-all.js
 */

const fs = require("fs");
const path = require("path");

const htmlDir = path.join(__dirname, '../frontend/html');
const footerPath = path.join(htmlDir, "footer-component.html");

// Đọc footer component
const footerHTML = fs.readFileSync(footerPath, "utf8");

// Danh sách files cần thêm footer
const htmlFiles = [
  "profile.html",
  "settings.html",
  "notifications.html",
  "change-password.html",
  "login.html",
  "register.html",
  "connect.html",
  "forgot-password.html",
  "admin.html",
  "admin-profile.html",
  "admin-settings.html",
  "admin-finance.html",
  "admin-history.html",
  "admin-notifications.html",
];

let successCount = 0;
let skipCount = 0;

htmlFiles.forEach((file) => {
  const filePath = path.join(htmlDir, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Bỏ qua: ${file} (không tìm thấy)`);
    skipCount++;
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Kiểm tra xem đã có footer chưa
  if (content.includes('class="footer"')) {
    console.log(`✅ Đã có footer: ${file}`);
    skipCount++;
    return;
  }

  // Tìm vị trí để chèn footer (trước </body>)
  if (!content.includes("</body>")) {
    console.log(`⚠️  Lỗi: ${file} không có thẻ </body>`);
    return;
  }

  // Chèn footer trước </body>
  content = content.replace(
    /\s*<\/body>\s*<\/html>\s*$/,
    `

    ${footerHTML}

  </body>
</html>`,
  );

  // Kiểm tra xem có link CSS footer chưa
  if (!content.includes("footer.css")) {
    content = content.replace(
      /(<link rel="stylesheet" href="\.\.\/css\/responsive\.css[^>]*>)/,
      `$1
    <link rel="stylesheet" href="../css/footer.css?v=11" />`,
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ Thêm footer: ${file}`);
  successCount++;
});

console.log(`\n📊 Tóm tắt:`);
console.log(`✅ Thêm thành công: ${successCount}`);
console.log(`⏭️  Bỏ qua: ${skipCount}`);
