# Git Commit History Commands

## Xem lịch sử commit

### 1. Xem log đơn giản (oneline)

```bash
git log --oneline -10
# Hiển thị 10 commit gần nhất dưới dạng 1 dòng
```

### 2. Xem log chi tiết

```bash
git log -5
# Hiển thị 5 commit gần nhất với đầy đủ thông tin
```

### 3. Xem log với author

```bash
git log --oneline --author="minhhuyphan"
# Hiển thị commits từ author cụ thể
```

### 4. Xem log theo ngày

```bash
git log --oneline --since="2 days ago"
git log --oneline --until="2026-01-28"
```

### 5. Xem log từ branch khác

```bash
git log origin/main --oneline
# Xem commits từ remote main branch
```

### 6. Xem thống kê commits

```bash
git log --stat
# Hiển thị files thay đổi trong mỗi commit
```

### 7. Xem commit cụ thể

```bash
git show 46ba6e7
# Xem chi tiết một commit (commit hash)
```

### 8. Xem sự khác biệt giữa 2 commits

```bash
git diff 45a8dba 46ba6e7
# So sánh 2 commits
```

### 9. Xem blame (ai thay đổi dòng code này)

```bash
git blame backend/controllers/lotteryController.js
# Hiển thị ai và khi nào thay đổi mỗi dòng
```

### 10. Xem graph commits (rất đẹp!)

```bash
git log --graph --oneline --all
# Hiển thị graph các branch và merge
```

## Current Status

**Latest Commit:**

```
46ba6e7 - feat: Add blockchain prize transfer to MetaMask wallet
Author: minhhuyphan <phanminhhuycm@gmail.com>
Date: Thu Jan 29 19:11:35 2026 +0700

Changes:
- 48 files changed
- 2123 insertions(+)
- 2568 deletions(-)
```

**Current Branch:** `feature/improve-blockchain-integration`

**Files Modified in Latest Commit:**

- BLOCKCHAIN_SETUP.md (105 lines added)
- backend/controllers/lotteryController.js (405 lines modified)
- backend/services/notificationService.js (182 lines added)
- backend/models/Ticket.js (8 lines added)
- 44 other files...

## Tạo Pull Request

Sau khi commit trên branch mới, push lên GitHub:

```bash
# 1. Push branch mới
git push origin feature/improve-blockchain-integration

# 2. Truy cập GitHub → Click "Compare & pull request"
#    Hoặc: https://github.com/minhhuyphan/nhom_2_Ether_Lottery/pull/new/feature/improve-blockchain-integration

# 3. Điền Title và Description
# Title: "feat: Add blockchain prize transfer to MetaMask wallet"
# Description: (copy từ git log message)

# 4. Click "Create Pull Request"
```

## Xem Pull Requests

```bash
# GitHub UI: https://github.com/minhhuyphan/nhom_2_Ether_Lottery/pulls
```
