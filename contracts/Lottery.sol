// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Lottery {
    address public manager;
    address[] public players;
    uint256 public entranceFee;
    
    event PlayerEntered(address indexed player);
    event WinnerPicked(address indexed winner, uint256 amount);
    
    constructor() {
        manager = msg.sender;
        entranceFee = 0.001 ether; // 0.001 ETH để vào
    }
    
    // Tham gia xổ số
    function enter() public payable {
        require(msg.value >= entranceFee, "Khong du phi de tham gia");
        players.push(msg.sender);
        emit PlayerEntered(msg.sender);
    }
    
    // Hàm random (không an toàn hoàn toàn - chỉ dùng test)
    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, players)));
    }
    
    // Chọn người thắng (chỉ manager)
    function pickWinner() public restricted {
        require(players.length > 0, "Khong co nguoi choi nao");
        
        uint index = random() % players.length;
        address winner = players[index];
        uint256 prize = address(this).balance;
        
        // Chuyển tiền cho người thắng
        payable(winner).transfer(prize);
        
        emit WinnerPicked(winner, prize);
        
        // Reset lottery
        players = new address[](0);
    }
    
    // Gửi tiền thưởng cho người chơi (được gọi bởi backend)
    function sendPrizeToWinner(address winner, uint256 amount) public restricted {
        require(winner != address(0), "Dia chi winner khong hop le");
        require(amount > 0, "So tien phai lon hon 0");
        require(address(this).balance >= amount, "Khong du tien trong contract");
        
        payable(winner).transfer(amount);
        emit WinnerPicked(winner, amount);
    }
    
    // Modifier chỉ manager
    modifier restricted() {
        require(msg.sender == manager, "Chi manager moi co quyen");
        _;
    }
    
    // Lấy danh sách người chơi
    function getPlayers() public view returns (address[] memory) {
        return players;
    }
    
    // Thay đổi phí vào
    function setEntranceFee(uint256 _fee) public restricted {
        entranceFee = _fee;
    }
    
    // Lấy số dư contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // Rút tiền về ví admin (chỉ manager)
    function withdraw(uint256 amount) public restricted {
        require(amount > 0, "So tien phai lon hon 0");
        require(address(this).balance >= amount, "Khong du tien trong contract");
        
        payable(manager).transfer(amount);
    }
    
    // Rút toàn bộ tiền về ví admin
    function withdrawAll() public restricted {
        uint256 balance = address(this).balance;
        require(balance > 0, "Contract khong co tien");
        
        payable(manager).transfer(balance);
    }
}
