# Gọi hàm Enter() từ Frontend

## Cách 1: Gọi trực tiếp từ MetaMask (Web3.js)

```javascript
// Thêm vào file HTML hoặc frontend code
async function enterLottery() {
  try {
    // Kết nối với MetaMask
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const playerAddress = accounts[0];

    // Contract address
    const contractAddress = "0x354A56dBa9A6305C5b3860C38f5dEA6814c607Dc";

    // Contract ABI
    const contractABI = [
      {
        inputs: [],
        name: "enter",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ];

    // Setup Web3
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Gọi hàm enter với 0.001 ETH
    const amountWei = web3.utils.toWei("0.001", "ether");

    // Estimate gas
    const gasEstimate = await contract.methods.enter().estimateGas({
      from: playerAddress,
      value: amountWei,
    });

    // Gửi transaction
    const tx = await contract.methods.enter().send({
      from: playerAddress,
      value: amountWei,
      gas: Math.ceil(gasEstimate * 1.2),
    });

    console.log("✅ Transaction successful!");
    console.log("TX Hash:", tx.transactionHash);

    return tx;
  } catch (error) {
    console.error("❌ Error:", error);
    alert("Lỗi: " + error.message);
  }
}
```

## Cách 2: Gọi qua Backend API

```javascript
async function enterLotteryViaAPI() {
  try {
    // Lấy player address từ MetaMask
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const playerAddress = accounts[0];

    // Call backend để lấy transaction data
    const response = await fetch(
      `/api/lottery/enter-tx-data/0.001/${playerAddress}`,
    );
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    // Gửi transaction qua MetaMask
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: playerAddress,
          to: data.data.to,
          data: data.data.data,
          value: data.data.value,
          gas: "0x" + data.data.gas.toString(16),
          gasPrice: "0x" + data.data.gasPrice.toString(16),
        },
      ],
    });

    console.log("✅ Transaction sent!");
    console.log("TX Hash:", txHash);

    return txHash;
  } catch (error) {
    console.error("❌ Error:", error);
    alert("Lỗi: " + error.message);
  }
}
```

## Kết quả trong MetaMask

Khi gọi `enter()`, bạn sẽ thấy trong MetaMask Activity:

- **Label**: "Enter" (tên function)
- **Status**: "Confirmed" (Đã xác nhận)
- **Amount**: "-0.001 Sepolia ETH"
- **From**: Your wallet address
- **To**: Contract address (0x354A...)

## API Endpoints

### Get Transaction Data

- **URL**: `/api/lottery/enter-tx-data/:amount/:playerAddress`
- **Method**: GET
- **Params**:
  - `amount`: số tiền (vd: 0.001)
  - `playerAddress`: wallet address
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "to": "0x354A...",
      "data": "0x...",
      "value": "1000000000000000",
      "gas": 52088,
      "gasPrice": 12345
    }
  }
  ```

## Điều cần biết

1. **Gas**: Contract estimate ~52,000 gas, nhân 1.2 = ~62,400 gas
2. **Value**: 0.001 ETH = 1,000,000,000,000,000 Wei
3. **Network**: Sepolia (Chain ID: 11155111)
4. **Max Retries**: 3 lần nếu transaction fail

## Testing

```bash
# Test từ terminal
curl "http://localhost:5000/api/lottery/enter-tx-data/0.001/0xca279da15e963d2617099b5a7d71d6472eb01e07"
```
