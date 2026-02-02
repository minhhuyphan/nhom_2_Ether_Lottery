// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Lottery Contract - Hợp đồng Xổ Số Blockchain
 * @notice Hợp đồng này quản lý tiền của người chơi xổ số
 * @dev Người chơi gửi 0.001 ETH để mua vé, Admin quay số và phát giải thưởng
 */
contract Lottery {
    // 📍 Biến lưu trữ chính
    address public manager;            // Địa chỉ admin - chỉ admin mới có quyền
    address[] public players;          // Danh sách ví người chơi
    uint256 public entranceFee;        // Phí vào = 0.001 ETH
    
    // 📢 Các sự kiện (Event) - ghi log trên blockchain
    event PlayerEntered(address indexed player);           // Khi người chơi mua vé
    event WinnerPicked(address indexed winner, uint256 amount);  // Khi phát tiền cho người trúng
    
    /**
     * @dev Constructor - Hàm khởi tạo khi deploy contract
     * manager được set bằng địa chỉ deploy contract
     */
    constructor() {
        manager = msg.sender;                    // Set admin = người deploy
        entranceFee = 0.001 ether;              // Phí vào = 0.001 ETH
    }
    
    /**
     * @notice Hàm cho phép người chơi mua vé
     * @dev Người chơi gọi hàm này kèm 0.001 ETH để mua vé
     */
    function enter() public payable {
        require(msg.value >= entranceFee, "Khong du phi de tham gia");  // Kiểm tra người gửi đủ tiền
        players.push(msg.sender);                                        // Thêm ví vào danh sách
        emit PlayerEntered(msg.sender);                                  // Ghi log sự kiện
    }
    
    /**
     * @notice Hàm tạo số ngẫu nhiên (dùng cho test, không an toàn 100%)
     * @dev Sử dụng dữ liệu blockchain để tạo random
     */
    function random() private view returns (uint) {
        // Kết hợp: random block, timestamp, danh sách người chơi → số ngẫu nhiên
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, players)));
    }
    
    /**
     * @notice Chọn người thắng và phát giải thưởng tổng cộng
     * @dev Chỉ admin mới gọi được (dùng modifier restricted)
     */
    function pickWinner() public restricted {
        require(players.length > 0, "Khong co nguoi choi nao");  // Phải có người chơi
        
        uint index = random() % players.length;                  // Lấy số random từ 0 đến số người chơi
        address winner = players[index];                         // Chọn người thắng
        uint256 prize = address(this).balance;                   // Tổng tiền trong contract = giải thưởng
        
        // 💸 Chuyển toàn bộ tiền trong contract đến ví người thắng
        payable(winner).transfer(prize);
        
        emit WinnerPicked(winner, prize);                        // Ghi log sự kiện thắng
        
        // 🔄 Reset: Xóa danh sách người chơi để bắt đầu kỳ mới
        players = new address[](0);
    }
    
    /**
     * @notice Gửi tiền thưởng cho người trúng số (hàm chính - Backend gọi)
     * @param winner Địa chỉ ví người trúng
     * @param amount Số tiền giải thưởng (tính bằng wei)
     */
    function sendPrizeToWinner(address winner, uint256 amount) public restricted {
        require(winner != address(0), "Dia chi winner khong hop le");                // Kiểm tra ví hợp lệ
        require(amount > 0, "So tien phai lon hon 0");                               // Số tiền phải > 0
        require(address(this).balance >= amount, "Khong du tien trong contract");   // Kiểm tra contract có đủ tiền
        
        // 💸 Transfer ETH từ contract → ví người trúng
        payable(winner).transfer(amount);
        emit WinnerPicked(winner, amount);                        // Ghi log sự kiện
    }
    
    /**
     * @notice Modifier - Chỉ cho phép admin gọi các hàm được bảo vệ
     * @dev Nếu không phải admin, giao dịch sẽ fail
     */
    modifier restricted() {
        require(msg.sender == manager, "Chi manager moi co quyen");  // Kiểm tra caller = admin
        _;  // Tiếp tục thực thi hàm
    }
    
    /**
     * @notice Lấy danh sách tất cả người chơi hiện tại
     */
    function getPlayers() public view returns (address[] memory) {
        return players;  // Trả về mảng địa chỉ
    }
    
    /**
     * @notice Thay đổi phí vào xổ số
     * @param _fee Phí mới (tính bằng wei)
     */
    function setEntranceFee(uint256 _fee) public restricted {
        entranceFee = _fee;  // Cập nhật phí (chỉ admin)
    }
    
    /**
     * @notice Lấy số dư ETH hiện có trong contract
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;  // Trả về balance (tính bằng wei)
    }
    
    /**
     * @notice Rút một lượng tiền cụ thể về ví admin
     * @param amount Số tiền muốn rút (tính bằng wei)
     */
    function withdraw(uint256 amount) public restricted {
        require(amount > 0, "So tien phai lon hon 0");                              // Số tiền phải > 0
        require(address(this).balance >= amount, "Khong du tien trong contract");  // Kiểm tra đủ tiền
        
        // 💸 Chuyển tiền đến ví admin
        payable(manager).transfer(amount);
    }
    
    /**
     * @notice Rút toàn bộ tiền trong contract về ví admin
     */
    function withdrawAll() public restricted {
        uint256 balance = address(this).balance;           // Lấy tổng balance
        require(balance > 0, "Contract khong co tien");   // Phải có tiền để rút
        
        // 💸 Chuyển toàn bộ tiền đến ví admin
        payable(manager).transfer(balance);
    }
}
