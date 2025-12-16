const User = require("../models/User");

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.json({
      success: true,
      data: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin profile",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, walletAddress, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (walletAddress !== undefined) user.walletAddress = walletAddress;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: "Cập nhật profile thành công",
      data: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${
          field === "username" ? "Tên đăng nhập" : "Email"
        } đã tồn tại`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật profile",
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/profile/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // TODO: Implement actual stats from lottery transactions
    // For now, return mock data
    const stats = {
      totalEntries: 0,
      totalWins: 0,
      totalSpent: 0,
      totalWon: 0,
      winRate: 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê",
    });
  }
};

// @desc    Update wallet address
// @route   PUT /api/profile/wallet
// @access  Private
exports.updateWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp địa chỉ ví",
      });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Địa chỉ ví không hợp lệ",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    user.walletAddress = walletAddress;
    await user.save();

    res.json({
      success: true,
      message: "Cập nhật địa chỉ ví thành công",
      data: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Update wallet error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật địa chỉ ví",
    });
  }
};

// @desc    Update avatar
// @route   PUT /api/profile/avatar
// @access  Private
exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp URL avatar",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    user.avatar = avatar;
    await user.save();

    res.json({
      success: true,
      message: "Cập nhật avatar thành công",
      data: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Update avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật avatar",
    });
  }
};
