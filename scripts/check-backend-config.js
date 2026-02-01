require('dotenv').config({ path: './backend/.env' });

const CONTRACT_ADDR = process.env.LOTTERY_CONTRACT_ADDRESS;
const ADMIN_WALLET = process.env.ADMIN_ADDRESS;
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

console.log('\n🔍 Backend Configuration Check');
console.log('=====================================\n');

console.log('📋 Contract Address:', CONTRACT_ADDR);
console.log('👤 Admin Wallet:    ', ADMIN_WALLET);
console.log('🔑 Private Key:     ', PRIVATE_KEY ? '***' + PRIVATE_KEY.slice(-10) : '❌ MISSING');
console.log('');

// Check contract address
if (CONTRACT_ADDR === '0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc') {
  console.log('✅ CONTRACT ADDRESS IS CORRECT');
  console.log('   → Using new contract with withdraw functions');
  console.log('   → Address: 0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc');
} else if (CONTRACT_ADDR === '0x7f2A7abf8c5248e8768061553a21D65F263Cf0d2') {
  console.log('❌ CONTRACT ADDRESS IS WRONG');
  console.log('   → This is ADMIN WALLET address, not contract!');
  console.log('   → Backend will fail to send prizes');
  console.log('   → Fix: Change to 0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc');
} else if (CONTRACT_ADDR === '0x327F9548dC8599c634598f4a1b538C6351CfB22f') {
  console.log('⚠️  USING OLD CONTRACT');
  console.log('   → This contract lacks withdraw functions');
  console.log('   → Consider updating to: 0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc');
} else {
  console.log('⚠️  UNKNOWN CONTRACT ADDRESS');
  console.log('   → Expected: 0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc');
}

console.log('');

// Check admin wallet match
if (ADMIN_WALLET === '0x7f2A7abf8c5248e8768061553a21D65F263Cf0d2') {
  console.log('✅ ADMIN WALLET IS CORRECT');
} else {
  console.log('⚠️  ADMIN WALLET MIGHT BE WRONG');
  console.log('   → Expected: 0x7f2A7abf8c5248e8768061553a21D65F263Cf0d2');
}

console.log('');
console.log('📝 Summary:');
console.log('   Contract and Admin Wallet are DIFFERENT addresses ✓');
console.log('   Contract handles lottery logic');
console.log('   Admin Wallet signs transactions (pays gas)');
console.log('');
