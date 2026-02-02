# 🎰 Ether Lottery - Complete Documentation

## 📖 Quick Navigation

- 🚀 [Quick Start (5 min)](#quick-start)
- 📚 [Complete Setup](#complete-setup)
- 💰 [Finance API](#finance-api)
- 🆘 [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 5 Minute Setup

```bash
# 1. Configure .env
PRIVATE_KEY=0x[YOUR_PRIVATE_KEY]
ADMIN_WALLET_ADDRESS=0x[YOUR_ADMIN_WALLET]

# 2. Deploy Contract
node admin-setup.js deploy

# 3. Update CONTRACT_ADDRESS in frontend/js/lottery.js

# 4. Run Backend & Frontend
cd backend && npm start
# Open browser: file:///d:/nhom_2_Ether_Lottery/frontend/html/index.html
```

✅ **Done!** Money goes to admin wallet automatically.

---

## 📚 Complete Setup

### Prerequisites

- Node.js v14+
- Python 3.8+ (for frontend server)
- MetaMask wallet
- Sepolia Testnet ETH (from faucet)

### Step-by-Step Deployment

#### Step 1: Environment Configuration

Create `.env` file:

```env
PRIVATE_KEY=0x[your_private_key_64_chars]
ADMIN_WALLET_ADDRESS=0x[your_wallet_address]
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
CONTRACT_ADDRESS=0x[will_be_updated_after_deploy]
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your_jwt_secret
```

**Get Private Key:**

1. MetaMask → Settings → Security & Privacy → Reveal Secret Recovery Phrase
2. Or use dedicated admin wallet

#### Step 2: Deploy Smart Contract

```bash
# Run deployment script
node admin-setup.js deploy

# Output will show:
# ✅ Contract deployed to: 0x[ADDRESS]
# Save this address!
```

**Contract Functions:**

- `enter()` - Buy lottery ticket (transfers money to admin)
- `getTotalCollected()` - Get total collected funds
- `pickWinner()` - Select lottery winner
- Events: `PlayerEntered`, `FundsTransferredToAdmin`, `WinnerPicked`

#### Step 3: Update Frontend

File: `frontend/js/lottery.js` (Line 10)

```javascript
const CONTRACT_ADDRESS = "0x[ADDRESS_FROM_DEPLOY]";
```

#### Step 4: Start Backend

```bash
cd backend
npm install
npm start

# Backend runs on: http://localhost:5000/api
# MongoDB: Connected to Atlas Cloud
```

#### Step 5: Start Frontend

**Option A: Python HTTP Server**

```bash
cd frontend
python -m http.server 5500

# Access: http://localhost:5500/html/index.html
```

**Option B: Direct File**

```
file:///d:/nhom_2_Ether_Lottery/frontend/html/index.html
```

#### Step 6: Verify Installation

Check dashboard:

```bash
node dashboard.js

# Shows:
# ✅ Backend: Running
# ✅ MongoDB: Connected
# ✅ Contract: Deployed
# ✅ Admin Wallet: Configured
```

#### Step 7: Test System

1. Navigate to: http://localhost:5500/html/index.html
2. Click "Connect MetaMask"
3. Select 6 numbers
4. Click "Mua Vé" (Buy Ticket)
5. Confirm MetaMask transaction
6. Check admin wallet - ETH received ✅

#### Step 8: Admin Features

- **Admin Dashboard**: http://localhost:5500/html/admin.html
- **Finance Stats**: http://localhost:5500/html/admin-finance.html
- **User Management**: http://localhost:5500/html/admin-profile.html

---

## 💰 Finance API

### Two Main Endpoints

#### 1. Get Financial Stats

```bash
GET /api/lottery/admin/finance-stats
Header: Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalIncome": 2.45,
    "totalExpense": 0.107,
    "totalVolume": 2.45,
    "totalProfit": 2.343,
    "ticketStats": {
      "totalTickets": 245,
      "wonTickets": 3,
      "activeTickets": 42,
      "lostTickets": 200
    }
  }
}
```

**Data Source**: Real MongoDB Ticket collection aggregation

#### 2. Get Transaction History

```bash
GET /api/lottery/admin/transactions?type=all&page=1&limit=10
Header: Authorization: Bearer {token}
```

**Query Parameters:**

- `type`: "all", "fee", "prize", "deposit", "withdraw"
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "65c4f9a1...",
        "type": "prize",
        "from": "0x1234...5678",
        "to": "0xabcd...ef12",
        "amount": 0.045,
        "timestamp": "2025-12-09T14:32:15.000Z",
        "status": "success",
        "ticketNumber": "123456",
        "username": "player1",
        "txHash": "0x5f3c...",
        "amountDirection": "income"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 245,
      "pages": 25
    }
  }
}
```

**Data Source**: Real MongoDB Ticket collection with pagination & filtering

---

## 🛠️ Admin Scripts

### admin-setup.js Commands

```bash
# Deploy Contract
node admin-setup.js deploy

# Check Contract
node admin-setup.js check

# Check Balance
node admin-setup.js balance

# Transfer Funds
node admin-setup.js transfer [amount]
```

### Useful Backend Scripts

```bash
# Check Backend Config
cd backend && node scripts/checkBackendConfig.js

# Check Users
node scripts/checkUsers.js

# Check Notifications
node scripts/checkNotifications.js

# Check Tickets
node scripts/findPendingTickets.js
```

---

## 🔐 Admin Wallet Setup

### Getting Private Key

**MetaMask:**

1. Settings → Security & Privacy
2. Reveal Secret Recovery Phrase
3. Save somewhere safe (NEVER share!)

**From Recovery Phrase:**

```bash
# Use tools like:
# https://www.bip39.com/
# Or
# https://www.keytool.online/
```

### Configure Admin in .env

```env
PRIVATE_KEY=0x[64_character_hex_string]
ADMIN_WALLET_ADDRESS=0x[42_character_wallet_address]
```

### Verify Setup

```bash
node admin-setup.js check

# Output shows:
# Private Key: Valid
# Admin Wallet: 0x...
# Network: Sepolia
# Balance: 0.xxx ETH
```

---

## 🆘 Troubleshooting

### Backend Issues

**Error: MongoDB Connection Failed**

```
Solution: Check DATABASE_URL in .env
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure credentials are valid
```

**Error: Port 5000 Already in Use**

```
Solution: Kill existing process
# Windows PowerShell:
Get-Process node | Stop-Process -Force

# Or use different port:
PORT=3000 npm start
```

**Error: Contract Not Found**

```
Solution: Deploy contract first
node admin-setup.js deploy
Update CONTRACT_ADDRESS in frontend/js/lottery.js
```

### Frontend Issues

**Error: MetaMask Not Detected**

```
Solution:
1. Install MetaMask extension
2. Refresh page
3. Check browser console for errors
```

**Error: 401 Unauthorized (Finance Dashboard)**

```
Solution:
1. Login first at /html/login.html
2. Token will be stored in localStorage
3. Then access /html/admin-finance.html
```

**Error: Network: Wrong Network**

```
Solution:
1. MetaMask → Select Network
2. Choose "Sepolia Testnet"
3. Refresh page
```

### Database Issues

**Error: Ticket Not Saving**

```
Solution:
1. Check backend logs
2. Verify Ticket schema has all fields
3. Run: node backend/scripts/checkUsers.js
```

**Error: Prize Not Transferred**

```
Solution:
1. Check wallet balance (must have ETH for gas)
2. Run: node admin-setup.js balance
3. Check prizeTransactionHash in MongoDB
```

---

## 📊 System Architecture

```
User Browser
    ↓
Frontend (HTML/CSS/JS)
    ↓
MetaMask Wallet
    ↓
Smart Contract (Sepolia)
    ↓
Backend API (Node.js)
    ↓
MongoDB Database
    ↓
Admin Wallet (Receives ETH)
```

---

## 📂 Project Structure

```
nhom_2_Ether_Lottery/
├── backend/
│   ├── controllers/          # lotteryController, authController, etc.
│   ├── models/              # Ticket, User, Notification schemas
│   ├── routes/              # API endpoints
│   ├── services/            # scheduleService, notificationService
│   ├── middleware/          # auth middleware
│   ├── scripts/             # admin scripts
│   └── server.js            # Express app
├── frontend/
│   ├── html/                # All HTML pages
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript files
│   └── icon/                # Images & icons
├── contracts/
│   └── Lottery.sol          # Smart contract
├── scripts/
│   ├── admin-setup.js       # Deploy & manage contract
│   └── dashboard.js         # Check status
└── README.md                # This file
```

---

## ✨ Key Features

### ✅ Implemented

- [x] Lottery ticket purchase
- [x] Automatic money transfer to admin
- [x] Winner selection algorithm
- [x] Prize distribution
- [x] Admin dashboard
- [x] Finance statistics API
- [x] Transaction history
- [x] User notifications
- [x] JWT authentication
- [x] Responsive UI
- [x] Professional footer

### 🚀 Coming Soon

- [ ] CSV export for reports
- [ ] Real-time price feeds
- [ ] Advanced analytics
- [ ] Multi-language support

---

## 📞 Support

### Check Status

```bash
# Backend health
curl http://localhost:5000/api/health

# Contract status
node admin-setup.js check

# Database
node backend/scripts/checkBackendConfig.js
```

### View Logs

```bash
# Backend logs
# Open terminal where npm start is running

# Frontend console
# F12 → Console tab

# Database
# MongoDB Atlas → Collections
```

---

## 🔗 Useful Links

- **Sepolia Faucet**: https://sepoliafaucet.com
- **Etherscan Sepolia**: https://sepolia.etherscan.io
- **MetaMask**: https://metamask.io
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas

---

## 📝 Version Info

- **Created**: February 2026
- **Status**: Production Ready ✅
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Blockchain**: Sepolia Testnet
- **Smart Contract**: Solidity 0.8+

---

**Ready to start?** → Follow [Quick Start](#quick-start) above! 🚀
