# 🆘 Troubleshooting & FAQ

**Quick Navigation**: [Backend Issues](#backend-issues) | [Blockchain Issues](#blockchain-issues) | [Database Issues](#database-issues) | [Frontend Issues](#frontend-issues) | [FAQ](#frequently-asked-questions)

---

## Backend Issues

### Error: MongoDB Connection Failed

**Symptoms:**

- Backend won't start
- Error message: `MongooseError: connect ECONNREFUSED`
- Console: `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**

```bash
# 1. Check DATABASE_URL format
cat .env | grep DATABASE_URL

# Should look like:
# mongodb+srv://user:password@cluster.mongodb.net/database_name

# 2. Verify MongoDB Atlas is running
# Go to: https://www.mongodb.com/cloud/atlas
# Check if cluster is running (green circle)

# 3. Check IP Whitelist
# In MongoDB Atlas:
# - Security → Network Access
# - Add current IP: 0.0.0.0/0 (for development only)

# 4. Test connection manually
mongosh "mongodb+srv://user:password@cluster.mongodb.net/database_name"

# 5. Verify database exists
# MongoDB Atlas → Collections → Check for "lottery_db"

# 6. Restart backend
cd backend
npm start
```

### Error: Port 5000 Already in Use

**Symptoms:**

- Error: `listen EADDRINUSE: address already in use :::5000`
- Another service running on port 5000

**Solutions:**

```bash
# Option 1: Kill existing Node process (Windows PowerShell)
Get-Process node | Stop-Process -Force

# Option 2: Use different port
PORT=3000 npm start

# Option 3: Find what's using port 5000
Get-NetTCPConnection -LocalPort 5000

# Option 4: Update .env
echo PORT=3001 >> .env
npm start
```

### Error: Missing Environment Variables

**Symptoms:**

- Error: `Cannot read property 'split' of undefined`
- Backend crashes on startup

**Solutions:**

```bash
# 1. Create .env file
cd backend
touch .env

# 2. Add required variables
echo DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db > .env
echo JWT_SECRET=your_secret_key >> .env
echo PORT=5000 >> .env

# 3. Verify variables exist
cat .env

# 4. Restart backend
npm start
```

### Error: JWT Token Invalid

**Symptoms:**

- Error: `401 Unauthorized`
- Message: `Invalid token`
- API calls from frontend failing

**Solutions:**

```bash
# 1. Login first to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# 2. Check token in localStorage (Frontend Console)
console.log(localStorage.getItem('token'))

# 3. Verify JWT_SECRET in .env
cat .env | grep JWT_SECRET

# 4. If changed, restart backend
npm restart

# 5. Clear token and login again
# In browser console:
localStorage.clear()
// Then login again
```

### Error: No Users Found

**Symptoms:**

- Login fails
- Error: `User not found`

**Solutions:**

```bash
# 1. Create admin user
cd backend/scripts
node createAdmin.js

# 2. Check existing users
node checkUsers.js

# Expected output:
# Users in database:
# 1. admin@test.com (role: admin)
# 2. user1@test.com (role: user)

# 3. If no users, seed database
node seedPlayers.js

# 4. Reset admin password
node resetAdminPassword.js
```

### Error: API Endpoint Not Found

**Symptoms:**

- Error: `404 Not Found`
- Endpoint returns wrong data

**Solutions:**

```bash
# 1. Check if endpoint exists in backend
grep -r "GET.*tickets" backend/routes/

# 2. Test endpoint directly
curl http://localhost:5000/api/lottery/tickets

# 3. Verify routes are registered
# In backend/server.js, check:
app.use('/api/auth', authRoutes);
app.use('/api/lottery', lotteryRoutes);

# 4. Check for typos
# Common mistakes:
# /api/lottery/buy-ticket (correct)
# /api/lottery/buyTicket (wrong)
# /buy-ticket (wrong)

# 5. Restart backend
npm restart
```

---

## Blockchain Issues

### Error: Contract Not Found

**Symptoms:**

- Error: `call failed: insufficient balance for call`
- Transaction fails
- MetaMask shows error

**Solutions:**

```bash
# 1. Verify contract is deployed
node admin-setup.js check

# Should show:
# ✅ Contract deployed to: 0x...

# 2. Check CONTRACT_ADDRESS in frontend
# frontend/js/lottery.js (line 10)
const CONTRACT_ADDRESS = "0x...";

# Should match deployment address

# 3. If address is wrong, redeploy
node admin-setup.js deploy

# 4. Update frontend with new address
# Edit frontend/js/lottery.js

# 5. Refresh browser
```

### Error: Insufficient Funds for Gas

**Symptoms:**

- Error: `insufficient balance for call: address not account`
- Transaction won't submit
- MetaMask error: `insufficient balance`

**Solutions:**

```bash
# 1. Check wallet balance
node admin-setup.js balance

# Shows: Your balance is: X.XXX ETH

# 2. If balance is 0, get Sepolia ETH
# Go to: https://sepoliafaucet.com
# Paste your wallet address
# Wait ~1 minute

# 3. Check balance again
node admin-setup.js balance

# 4. If still failing, check gas price
# Sepolia average gas: ~20 gwei
# Deployment cost: ~0.05 ETH

# 5. Get more ETH if needed
# Use another faucet:
# https://www.infura.io/faucet/sepolia
# https://sepolia-faucet.pk910.de/
```

### Error: Wrong Network

**Symptoms:**

- MetaMask shows warning: "You are on the wrong network"
- Transaction won't process
- Chain ID mismatch

**Solutions:**

```bash
# 1. MetaMask: Select "Sepolia Testnet"
# Top of MetaMask wallet

# 2. If Sepolia not available, add network manually
# MetaMask → Settings → Networks → Add Network
# Fill in:
Network Name: Sepolia Testnet
New RPC URL: https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer URL: https://sepolia.etherscan.io

# 3. Save and refresh page

# 4. Verify correct network
# MetaMask should show "Sepolia" at top
```

### Error: Transaction Pending Too Long

**Symptoms:**

- Transaction stuck for hours
- Still shows "Pending" in MetaMask
- Nothing happening

**Solutions:**

```bash
# 1. Check transaction on Etherscan
# Go to: https://sepolia.etherscan.io
# Search for wallet address
# View transactions

# 2. If still pending, try:
# Option A: Increase gas price & resubmit
# MetaMask → Click pending transaction → Speed up

# Option B: Cancel transaction
# MetaMask → Click pending transaction → Cancel

# 3. Retry transaction after cancellation

# 4. If issue persists, check RPC provider
# Your RPC URL might be slow
# Try switching to different provider:
# - Alchemy: https://www.alchemy.com
# - Infura: https://www.infura.io
```

### Error: Admin Wallet Not Working

**Symptoms:**

- Private key rejected
- Error: `invalid key length`
- Transactions fail

**Solutions:**

```bash
# 1. Verify private key format
# Must be 66 characters: 0x + 64 hex digits
# Example: 0x1234567890abcdef...

cat .env | grep PRIVATE_KEY

# 2. Check ADMIN_WALLET_ADDRESS
# Must be 42 characters: 0x + 40 hex digits
# Example: 0x1234567890...

cat .env | grep ADMIN_WALLET_ADDRESS

# 3. Verify they match
# Use BIP39 tool to check:
# https://www.bip39.com/

# 4. Get correct private key from MetaMask
# MetaMask Settings → Security → Reveal Secret Recovery Phrase
# Use BIP39 to derive private key

# 5. Update .env with correct values

# 6. Test configuration
node admin-setup.js check
```

---

## Database Issues

### Error: Ticket Not Saving

**Symptoms:**

- Buy ticket but it doesn't appear in database
- Error in MongoDB
- Backend logs show error

**Solutions:**

```bash
# 1. Check Ticket schema
# backend/models/Ticket.js

# Required fields:
# - userId
# - ticketNumbers (array of 6 numbers)
# - amount (in ETH)
# - transactionHash

# 2. Check if ticket is being created
cd backend/scripts
node findPendingTickets.js

# 3. Verify database connection
node checkBackendConfig.js

# Should show:
# ✅ MongoDB Connected
# ✅ Database: lottery_db

# 4. Check backend logs for errors
# Look for: "Error saving ticket:"

# 5. Restart backend
cd ../
npm restart

# 6. Try buying ticket again
```

### Error: Prize Not Transferred

**Symptoms:**

- User won lottery
- Prize not received in wallet
- No transaction hash

**Solutions:**

```bash
# 1. Check wallet balance
node admin-setup.js balance

# Must have ETH for gas fees to send prize

# 2. Get Sepolia ETH from faucet
# https://sepoliafaucet.com

# 3. Check if prize was created
cd backend/scripts
node findPendingTickets.js

# Look for tickets with status "won"

# 4. Retry prize transfer
node retryFailedPrizes.js

# 5. Check transaction on Etherscan
# https://sepolia.etherscan.io
# Search for wallet address
# View transaction history

# 6. If still failing, check gas price
# Sepolia gas: ~20 gwei
# Prize transfer cost: ~0.002 ETH
```

### Error: Duplicate Data in Database

**Symptoms:**

- Same ticket appears multiple times
- User created multiple times
- Data inconsistency

**Solutions:**

```bash
# 1. Check for duplicates
cd backend/scripts
node checkUsers.js

# 2. If duplicates found, manually delete
# MongoDB Atlas → Collections → Users/Tickets
# Delete duplicate entries

# 3. Add unique indexes
# In backend/models/User.js:
userSchema.index({ email: 1 }, { unique: true });

# Restart backend
npm restart

# 4. Verify no more duplicates
node checkUsers.js
```

### Error: Query Timeout

**Symptoms:**

- API calls take too long
- Timeout error from MongoDB
- Page loading very slow

**Solutions:**

```bash
# 1. Check database connection
cd backend/scripts
node checkBackendConfig.js

# 2. Monitor performance
# MongoDB Atlas → Performance Advisor
# Check slow queries

# 3. Add indexes
# In backend/scripts/checkBackendConfig.js
# Indexes are created automatically

# 4. Restart backend to rebuild indexes
cd ../
npm restart

# 5. If still slow, check internet connection
# Sepolia RPC calls might be slow
```

---

## Frontend Issues

### Error: MetaMask Not Detected

**Symptoms:**

- "MetaMask not installed" message
- Connect button doesn't work
- Browser console: `web3 is undefined`

**Solutions:**

```bash
# 1. Install MetaMask
# https://metamask.io/
# Chrome, Firefox, Edge supported

# 2. After installation, refresh page (Ctrl+R or Cmd+R)

# 3. Check browser console for errors
# F12 → Console tab

# 4. Verify MetaMask is enabled
# Settings → Extensions → MetaMask → On

# 5. Try incognito mode
# Sometimes extensions conflict

# 6. Clear browser cache
# Ctrl+Shift+Delete → Clear all
```

### Error: 401 Unauthorized (Finance Dashboard)

**Symptoms:**

- Finance page shows: "401 Unauthorized"
- Can't access admin dashboard
- API returns 401 error

**Solutions:**

```bash
# 1. Login first
# Go to: http://localhost:5500/html/login.html
# Enter email & password
# Token saved to localStorage

# 2. Verify token exists
# In browser console (F12):
console.log(localStorage.getItem('token'))

# Should show a long string starting with "eyJ..."

# 3. Check token expiry
# If older than 24 hours, login again
# localStorage.clear()
// Login again

# 4. Verify user is admin
# In backend console:
node backend/scripts/checkUsers.js

# User should have role: "admin"

# 5. If not admin, reset user role
# MongoDB Atlas → Collections → Users
# Edit user → Set role to "admin"
```

### Error: Network: Wrong Network

**Symptoms:**

- MetaMask warning: "You are on the wrong network"
- Transaction won't submit
- Page shows "Please switch to Sepolia"

**Solutions:**

```bash
# 1. Click MetaMask network selector (top)
# Select "Sepolia Testnet"

# 2. If not visible, add network
# MetaMask → Settings → Networks → Add Network
# Network Name: Sepolia Testnet
# RPC URL: https://eth-sepolia.g.alchemy.com/v2/[KEY]
# Chain ID: 11155111
# Currency: ETH
# Save

# 3. Refresh page
# Ctrl+R

# 4. MetaMask should now show "Sepolia"
```

### Error: Connect Button Not Working

**Symptoms:**

- Clicking "Connect MetaMask" does nothing
- No popup appears
- Browser console shows error

**Solutions:**

```bash
# 1. Check browser console (F12)
# Errors might show there

# 2. Verify MetaMask is installed
# MetaMask icon visible in top right

# 3. Check MetaMask not locked
# Open MetaMask → Enter password if needed

# 4. Try in different browser
# Chrome, Firefox, Edge all supported

# 5. Hard refresh page
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# 6. Try incognito mode
# Ctrl+Shift+N

# 7. Check JavaScript in frontend
# Search for: window.ethereum
# If not found, MetaMask not loading
```

### Error: Ticket Numbers Not Selecting

**Symptoms:**

- Can't click number buttons
- Numbers won't highlight
- Selection appears broken

**Solutions:**

```bash
# 1. Check JavaScript console (F12)
# Look for error messages

# 2. Reload page
# Ctrl+R

# 3. Try different browser
# Chrome, Firefox, Edge

# 4. Check if backend is running
# curl http://localhost:5000/api/health

# Should return: {"status": "ok"}

# 5. Clear browser cache
# Ctrl+Shift+Delete

# 6. Check lottery.js file
# frontend/js/lottery.js
# Verify selectNumber() function exists
```

### Error: Buy Ticket Button Not Working

**Symptoms:**

- Clicking "Mua Vé" does nothing
- Error in MetaMask
- Transaction won't submit

**Solutions:**

```bash
# 1. Check MetaMask connected
# MetaMask should show wallet address

# 2. Check wallet balance
# MetaMask shows ETH balance > 0.002

# 3. Check selected numbers
# Must select exactly 6 numbers

# 4. Check correct network
# MetaMask showing "Sepolia Testnet"

# 5. Check CONTRACT_ADDRESS
# frontend/js/lottery.js line 10
const CONTRACT_ADDRESS = "0x..."; // Should not be "0x"

# 6. Check backend is running
curl http://localhost:5000/api/health

# 7. Hard refresh page
# Ctrl+Shift+R
```

### Error: Page Not Loading

**Symptoms:**

- Blank white page
- Nothing displays
- Browser keeps loading

**Solutions:**

```bash
# 1. Check console for errors (F12)
# JavaScript errors will show

# 2. Check backend is running
# curl http://localhost:5000/api/health

# 3. Restart frontend
# Stop Python server (Ctrl+C)
# python -m http.server 5500

# 4. Try different port
# python -m http.server 5501

# 5. Check file path
# Should be: .../frontend/html/index.html

# 6. Check HTML file exists
# dir frontend/html/

# 7. Hard refresh
# Ctrl+Shift+R

# 8. Try different browser
```

---

## Frequently Asked Questions

### Q1: How long does it take to deploy the contract?

**A:** Typically 1-2 minutes on Sepolia testnet. Factors affecting time:

- Network congestion
- Gas price
- RPC provider speed

**Check status:**

```bash
node admin-setup.js check
```

---

### Q2: Why is my transaction pending?

**A:** Common reasons:

- Network congestion
- Gas price too low
- RPC provider timeout

**Solutions:**

1. Wait 10-15 minutes
2. Increase gas in MetaMask → "Speed up"
3. Cancel and retry with higher gas
4. Try different RPC provider

---

### Q3: How do I get Sepolia ETH?

**A:** Use one of these faucets:

- https://sepoliafaucet.com
- https://www.infura.io/faucet/sepolia
- https://sepolia-faucet.pk910.de/

Takes ~5-15 minutes to receive.

---

### Q4: Can I use Mainnet instead of Sepolia?

**A:** **NO!** Only use Sepolia for testing. Mainnet would use real money.

To use Mainnet (advanced):

1. Change RPC to mainnet RPC
2. Make sure you have ETH on mainnet (expensive!)
3. Update MetaMask to Mainnet
4. Be careful with real money

---

### Q5: How do I backup my private key?

**A:** **NEVER** share your private key!

**Safe backup:**

1. Write on paper, lock in safe
2. Use hardware wallet (Ledger, Trezor)
3. Password-protected cloud storage
4. NOT in email or cloud storage

---

### Q6: What if I lose my private key?

**A:** You lose access to that wallet forever.

- No recovery possible
- Funds are lost
- Always backup!

---

### Q7: How do I reset the database?

**A:** Delete all data and start fresh:

```bash
# 1. Connect to MongoDB Atlas
# https://www.mongodb.com/cloud/atlas

# 2. Go to Collections
# Select your database and collection

# 3. Delete all documents
# Select All → Delete

# 4. Or drop entire database
# Database → Drop
```

---

### Q8: Can I run multiple instances?

**A:** Yes, use different ports:

```bash
# Backend on port 3001
PORT=3001 npm start

# Frontend on port 5501
python -m http.server 5501
```

---

### Q9: How do I change the ticket price?

**A:** Edit smart contract:

```solidity
// contracts/Lottery.sol
uint256 constant TICKET_PRICE = 0.001 ether; // Change here
```

Then redeploy:

```bash
node admin-setup.js deploy
```

---

### Q10: How do I monitor transactions?

**A:** Use Etherscan:

1. Go to: https://sepolia.etherscan.io
2. Search for your wallet address
3. View all transactions
4. Click on tx hash for details

---

## Still Stuck?

### Debug Checklist

```bash
# 1. Check all servers running
node dashboard.js

# 2. Check logs
# Backend: Look at terminal where npm start runs
# Frontend: F12 Console
# Database: MongoDB Atlas console

# 3. Check configuration
cat .env
cat frontend/js/lottery.js | head -20
cd backend && cat .env

# 4. Test each component
curl http://localhost:5000/api/health
curl http://localhost:5500/html/index.html

# 5. Check contract
node admin-setup.js check

# 6. Restart everything
# Kill all processes and start fresh
```

### Get Help

1. Check this guide first
2. Check MongoDB/Etherscan logs
3. Ask in GitHub Issues
4. Check Ethereum documentation

---

**Need more help?** See:

- [README.md](README.md) - Overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Setup guide
- [FINANCE_API_GUIDE.md](FINANCE_API_GUIDE.md) - API documentation

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
   db.tickets.find({ status: "active" }).count();
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
