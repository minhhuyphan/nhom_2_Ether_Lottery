const Ticket = require("../models/Ticket");
const User = require("../models/User");

// @desc    Mua vé số
// @route   POST /api/lottery/buy-ticket
// @access  Private
exports.buyTicket = async (req, res) => {
  try {
    const { ticketNumber, walletAddress, transactionHash, amount } = req.body;

    // Validate input
    if (!ticketNumber || !walletAddress || !transactionHash || !amount) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    // Validate ticket number format (6 digits)
    if (!/^\d{6}$/.test(ticketNumber)) {
      return res.status(400).json({
        success: false,
        message: "Số vé phải có đúng 6 chữ số",
      });
    }

    // Check if transaction hash already exists
    const existingTicket = await Ticket.findOne({ transactionHash });
    if (existingTicket) {
      return res.status(400).json({
        success: false,
        message: "Vé này đã được ghi nhận",
      });
    }

    // Create ticket
    const ticket = await Ticket.create({
      user: req.user._id,
      ticketNumber,
      walletAddress: walletAddress.toLowerCase(),
      transactionHash,
      amount,
    });

    res.status(201).json({
      success: true,
      message: "Mua vé thành công",
      data: ticket,
    });
  } catch (error) {
    console.error("Buy ticket error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Lấy danh sách vé của user
// @route   GET /api/lottery/my-tickets
// @access  Private
exports.getMyTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tickets = await Ticket.find({ user: req.user._id })
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get my tickets error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Lấy thống kê vé số của user
// @route   GET /api/lottery/my-stats
// @access  Private
exports.getMyStats = async (req, res) => {
  try {
    const stats = await Ticket.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          totalPrize: { $sum: "$prizeAmount" },
        },
      },
    ]);

    const totalTickets = await Ticket.countDocuments({ user: req.user._id });
    const wonTickets = await Ticket.countDocuments({
      user: req.user._id,
      status: "won",
    });
    const totalSpent = await Ticket.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalWon = await Ticket.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: "$prizeAmount" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalTickets,
        wonTickets,
        totalSpent: totalSpent[0]?.total || 0,
        totalWon: totalWon[0]?.total || 0,
        details: stats,
      },
    });
  } catch (error) {
    console.error("Get my stats error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Lấy tất cả vé (Admin)
// @route   GET /api/lottery/all-tickets
// @access  Private/Admin
exports.getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const tickets = await Ticket.find()
      .populate("user", "username email")
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments();

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all tickets error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};
