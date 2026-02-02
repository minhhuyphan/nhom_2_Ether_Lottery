# 🚀 Deployment & Administration Guide

**Quick Links**: [Backend Setup](#backend-setup) | [Smart Contract Deployment](#smart-contract-deployment) | [Frontend Setup](#frontend-setup) | [Admin Wallet](#admin-wallet-setup) | [Blockchain Config](#blockchain-configuration)

---

## Backend Setup

### Prerequisites

- Node.js v14+
- MongoDB Atlas account
- Git

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Environment Variables

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/lottery_db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### Step 3: MongoDB Setup

1. Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Create database `lottery_db`
4. Create user with read/write access
5. Get connection string
6. Update DATABASE_URL in .env

### Step 4: Create Indexes

```bash
cd backend
node scripts/checkBackendConfig.js

# This will:
# - Connect to MongoDB
# - Create required collections
# - Add indexes
```

### Step 5: Start Backend

```bash
npm start

# Output:
# ✅ MongoDB Connected
# ✅ Server running on port 5000
```

### Backend API Endpoints

**Authentication:**

- POST `/api/auth/register` - Create account
- POST `/api/auth/login` - Login
- POST `/api/auth/refresh` - Refresh token

**Lottery:**

- GET `/api/lottery/tickets` - Get user tickets
- POST `/api/lottery/buy-ticket` - Purchase ticket
- GET `/api/lottery/draw-history` - View past draws

**Admin:**

- GET `/api/lottery/admin/finance-stats` - Finance statistics
- GET `/api/lottery/admin/transactions` - Transaction history

---

## Smart Contract Deployment

### Prerequisites

- Private key from admin wallet
- Sepolia ETH for gas fees
- Alchemy or Infura API key

### Step 1: Get Sepolia ETH

1. Go to: https://sepoliafaucet.com
2. Enter your wallet address
3. Request funds
4. Wait for confirmation (~1 minute)

### Step 2: Configure Environment

Create `.env` in root directory:

```env
PRIVATE_KEY=0x[your_64_character_private_key]
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
ADMIN_WALLET_ADDRESS=0x[your_wallet_address]
CONTRACT_ADDRESS=0x[will_be_updated_after_deploy]
```

### Step 3: Deploy Contract

```bash
# From root directory
node admin-setup.js deploy

# Output shows:
# Contract deployed to: 0x[ADDRESS]
# Transaction: 0x[HASH]
# Blocks confirmed: 12
```

### Step 4: Update Frontend

File: `frontend/js/lottery.js` (line 10)

```javascript
const CONTRACT_ADDRESS = "0x[ADDRESS_FROM_DEPLOY]";
```

Also update `.env`:

```env
CONTRACT_ADDRESS=0x[ADDRESS_FROM_DEPLOY]
```

### Step 5: Verify Deployment

```bash
node admin-setup.js check

# Shows:
# ✅ Contract deployed
# ✅ Admin wallet configured
# ✅ Network: Sepolia
# ✅ Contract balance: 0 ETH
```

### Smart Contract Functions

**Public Functions:**

```solidity
enter(uint8[] calldata selectedNumbers)
  - Purpose: Buy lottery ticket
  - Cost: 0.001 ETH
  - Returns: Ticket ID

getTotalCollected()
  - Purpose: Total funds collected
  - Returns: Amount in wei

pickWinner()
  - Purpose: Select winner
  - Requires: Admin only
```

**Events Emitted:**

- `PlayerEntered(address, uint ticketId, uint amount)`
- `FundsTransferredToAdmin(address, uint amount)`
- `WinnerPicked(address, uint amount)`

---

## Frontend Setup

### Prerequisites

- Python 3.8+ (for local server)
- Modern web browser
- MetaMask extension

### Option A: Python HTTP Server

```bash
cd frontend

# Python 3+
python -m http.server 5500

# Access: http://localhost:5500/html/index.html
```

### Option B: Direct File

```
file:///d:/nhom_2_Ether_Lottery/frontend/html/index.html
```

### Option C: VS Code Live Server

Install extension, right-click `frontend/html/index.html` → "Open with Live Server"

### Frontend Pages

**Public Pages:**

- `index.html` - Home & lottery entry
- `login.html` - User login
- `register.html` - Create account
- `connect.html` - MetaMask connection

**Admin Pages:**

- `admin.html` - Admin dashboard
- `admin-finance.html` - Financial statistics
- `admin-profile.html` - User management
- `admin-history.html` - Draw history

---

## Admin Wallet Setup

### Getting Private Key

**From MetaMask:**

1. Click wallet icon → Settings
2. Security & Privacy
3. Click "Reveal Secret Recovery Phrase"
4. Copy recovery phrase
5. Use BIP39 tool to get private key from phrase

**Important: NEVER share private key!**

### Configuring Admin Wallet

1. Create `.env` in root:

```env
PRIVATE_KEY=0x[64_character_hex]
ADMIN_WALLET_ADDRESS=0x[40_character_wallet]
```

2. Verify configuration:

```bash
node admin-setup.js check
```

3. Expected output:

```
✅ Private Key: Valid
✅ Admin Wallet: 0x...
✅ Balance: X.XXX ETH
✅ Network: Sepolia
```

### Testing Admin Functions

```bash
# Check admin wallet balance
node admin-setup.js balance

# Expected: Shows ETH balance

# Transfer funds
node admin-setup.js transfer 0.5

# Expected: Transaction hash returned
```

---

## Blockchain Configuration

### Network Details

**Sepolia Testnet:**

- Chain ID: 11155111
- RPC: https://eth-sepolia.g.alchemy.com/v2/[YOUR_API_KEY]
- Block Time: ~12 seconds
- Gas: ≈20 gwei

### Getting RPC URL

**Option 1: Alchemy (Recommended)**

1. Sign up: https://www.alchemy.com
2. Create app → Select Sepolia
3. Copy API key
4. URL: `https://eth-sepolia.g.alchemy.com/v2/[KEY]`

**Option 2: Infura**

1. Sign up: https://infura.io
2. Create project
3. Select Sepolia network
4. Copy project ID
5. URL: `https://sepolia.infura.io/v3/[PROJECT_ID]`

### MetaMask Network Configuration

**Manual Setup (if not auto-detected):**

1. MetaMask → Settings → Networks → Add Network
2. Fill in:
   - Network Name: `Sepolia Testnet`
   - New RPC URL: `https://eth-sepolia.g.alchemy.com/v2/[YOUR_KEY]`
   - Chain ID: `11155111`
   - Currency: `ETH`
   - Block Explorer: `https://sepolia.etherscan.io`
3. Save

---

## Admin Scripts Reference

### admin-setup.js

```bash
# Deploy smart contract
node admin-setup.js deploy

# Check contract & admin wallet status
node admin-setup.js check

# Check admin wallet ETH balance
node admin-setup.js balance

# Transfer ETH from admin wallet
node admin-setup.js transfer [amount]

# Example: Transfer 0.5 ETH
node admin-setup.js transfer 0.5
```

### Backend Scripts

```bash
# Check backend configuration
cd backend && node scripts/checkBackendConfig.js

# Check all users in database
node scripts/checkUsers.js

# Check notifications
node scripts/checkNotifications.js

# Find pending tickets
node scripts/findPendingTickets.js

# Create admin user (if needed)
node scripts/createAdmin.js

# Reset admin password
node scripts/resetAdminPassword.js

# Fund contract (for testing)
node scripts/fund-contract-auto.js

# Seed test players
node scripts/seedPlayers.js
```

### Frontend Check

```bash
# From root directory
node dashboard.js

# Shows system status:
# - Backend: Running/Not Running
# - MongoDB: Connected/Not Connected
# - Contract: Deployed/Not Deployed
# - Admin Wallet: Configured/Not Configured
```

---

## Complete Installation Walkthrough

### 1. Clone Repository

```bash
git clone https://github.com/minhhuyphan/nhom_2_Ether_Lottery.git
cd nhom_2_Ether_Lottery
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env
echo PRIVATE_KEY=0x[YOUR_KEY] > .env
echo ADMIN_WALLET_ADDRESS=0x[YOUR_WALLET] >> .env
echo DATABASE_URL=mongodb+srv://[YOUR_DB_URL] >> .env
echo JWT_SECRET=secret_key >> .env

npm start
# Backend now running on http://localhost:5000
```

### 3. Deploy Smart Contract

**In new terminal (from root):**

```bash
node admin-setup.js deploy

# Save the CONTRACT_ADDRESS
```

### 4. Update Frontend

Edit `frontend/js/lottery.js` line 10:

```javascript
const CONTRACT_ADDRESS = "0x[ADDRESS_FROM_DEPLOY]";
```

### 5. Start Frontend

**In new terminal:**

```bash
cd frontend
python -m http.server 5500

# Access: http://localhost:5500/html/index.html
```

### 6. Verify Everything

```bash
node dashboard.js

# All should show ✅
```

### 7. Test Full Flow

1. Go to http://localhost:5500/html/index.html
2. Click "Connect MetaMask"
3. Select Sepolia network
4. Select 6 numbers
5. Click "Mua Vé" (Buy Ticket)
6. Confirm transaction in MetaMask
7. Check admin wallet - you should see ETH received ✅

---

## Troubleshooting Deployment

### Contract Deployment Failed

```
Error: insufficient funds for gas * price + value

Solution:
1. Get Sepolia ETH from faucet: https://sepoliafaucet.com
2. Check wallet balance: node admin-setup.js balance
3. Retry: node admin-setup.js deploy
```

### Backend Won't Start

```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution:
1. Check DATABASE_URL in .env
2. Verify MongoDB Atlas cluster is running
3. Check IP whitelist settings
4. Test connection: mongosh [connection_string]
```

### Frontend Shows Wrong Network

```
Solution:
1. MetaMask → Select "Sepolia Testnet"
2. Refresh page (Ctrl+R)
3. If still wrong, disconnect and reconnect wallet
```

### Admin Wallet Not Working

```
Solution:
1. Verify PRIVATE_KEY in .env (should start with 0x)
2. Verify ADMIN_WALLET_ADDRESS matches wallet
3. Test: node admin-setup.js check
4. If balance is 0, get ETH from faucet
```

---

## Security Best Practices

### ⚠️ Private Keys

- **NEVER** commit .env to Git
- **NEVER** share private keys
- Use environment variables only
- Rotate keys regularly

### 🔐 Admin Access

- Change default passwords
- Use strong JWT secrets
- Enable 2FA on MongoDB Atlas
- Whitelist IP addresses

### 🛡️ Contract Security

- Only deploy on testnet first
- Test all functions before mainnet
- Verify contract code on Etherscan
- Consider audit before mainnet

---

## Performance Optimization

### Database Optimization

```bash
# Create indexes for faster queries
cd backend && node scripts/checkBackendConfig.js

# Indexes created:
# - userId on Ticket
# - createdAt on Notification
# - ticketNumbers on Ticket
```

### Frontend Optimization

- Lazy load images
- Cache static assets
- Minimize JavaScript
- Use gzip compression

### Backend Optimization

- Connection pooling
- Query optimization
- Rate limiting enabled
- Response compression

---

## Monitoring & Logs

### Backend Logs

```bash
# Check current backend logs (in running terminal)
# Or add logging:

# In backend/server.js
const fs = require('fs');
const logStream = fs.createWriteStream('backend.log', {flags: 'a'});

app.use(morgan('combined', {stream: logStream}));
```

### Database Monitoring

**MongoDB Atlas Console:**

1. Go to https://www.mongodb.com/cloud/atlas
2. Select your cluster
3. Monitoring → Performance Advisor
4. View query statistics

### Smart Contract Monitoring

**Etherscan Sepolia:**

1. Go to https://sepolia.etherscan.io
2. Search for CONTRACT_ADDRESS
3. View all transactions
4. Monitor gas prices

---

## Updating & Maintenance

### Update Backend Dependencies

```bash
cd backend
npm update
npm audit fix
npm test
```

### Update Frontend Libraries

```bash
cd frontend
npm update
```

### Git Workflow

```bash
# Pull latest changes
git pull origin main

# Make changes
git add .
git commit -m "Your message"

# Push to GitHub
git push origin main
```

---

## Support Resources

- **Ethereum Docs**: https://ethereum.org/developers
- **Solidity Docs**: https://docs.soliditylang.org
- **Web3.js Docs**: https://web3js.readthedocs.io
- **Express.js Docs**: https://expressjs.com
- **MongoDB Docs**: https://docs.mongodb.com

---

**All set up?** Return to [README.md](README.md) for quick navigation! 📖
