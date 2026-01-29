// Frontend Configuration
// Các thông tin public, không bí mật

const LOTTERY_CONFIG = {
  // Contract address trên Sepolia
  CONTRACT_ADDRESS: "0x327F9548dC8599c634598f4a1b538C6351CfB22f",
  
  // Network configuration
  NETWORK: {
    chainId: "0xaa36a7", // 11155111 in hex (Sepolia)
    chainName: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/69da3b577b944e5a8be9d92d755873c3",
    blockExplorerUrl: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "SepoliaETH",
      symbol: "ETH",
      decimals: 18
    }
  },
  
  // Backend API
  API_BASE_URL: "http://localhost:5000/api",
  
  // Ticket price
  TICKET_PRICE: "0.001" // ETH
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LOTTERY_CONFIG;
}
