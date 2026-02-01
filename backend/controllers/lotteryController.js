const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Notification = require("../models/Notification");
const scheduleService = require("../services/scheduleService");
const notificationService = require("../services/notificationService");
const { Web3 } = require("web3");

// Web3 setup cho Sepolia
const web3 = new Web3(
  process.env.INFURA_RPC_URL ||
    "https://sepolia.infura.io/v3/" + process.env.INFURA_API_KEY,
);
const contractAddress = process.env.LOTTERY_CONTRACT_ADDRESS;
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
const adminWallet = process.env.ADMIN_WALLET_ADDRESS;

// @desc    Mua vé số
// @route   POST /api/lottery/buy-ticket
// @access  Private
exports.buyTicket = async (req, res) => {
  try {
    const { ticketNumber, walletAddress, transactionHash, amount } = req.body;

    console.log("📝 Buy ticket request:", {
      ticketNumber,
      walletAddress,
      transactionHash,
      amount,
    });

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
      amount: parseFloat(amount), // Ensure it's a number
    });

    console.log("✅ Ticket created:", {
      ticketNumber,
      amount: ticket.amount,
      isActive: ticket.isActive,
    });

    // Gửi thông báo mua vé thành công
    try {
      await Notification.createTicketPurchaseNotification(
        req.user._id,
        ticketNumber,
        amount,
        ticket._id,
      );
    } catch (notifError) {
      // Log lỗi nhưng không ảnh hưởng đến việc mua vé
      console.error("Create notification error:", notifError);
    }

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

// @desc    Lấy kết quả quay số gần nhất
// @route   GET /api/lottery/latest-draw
// @access  Public
exports.getLatestDraw = async (req, res) => {
  try {
    // Tìm kết quả xổ số gần nhất (có winningNumber, bất kể có người trúng hay không)
    const latestDraw = await Ticket.findOne({
      winningNumber: { $exists: true, $ne: null },
      drawDate: { $exists: true, $ne: null },
    })
      .sort({ drawDate: -1 })
      .limit(1);

    if (!latestDraw) {
      return res.status(404).json({
        success: false,
        message: "Chưa có kỳ quay thưởng nào",
      });
    }

    // Lấy tất cả người trúng cùng kỳ quay (cùng drawDate và status = "won")
    const winners = await Ticket.find({
      status: "won",
      drawDate: latestDraw.drawDate,
      winningNumber: latestDraw.winningNumber,
    })
      .select("walletAddress prizeAmount ticketNumber")
      .sort({ prizeAmount: -1 });

    // Tính tổng giải thưởng đã phát
    const totalPrizeDistributed = winners.reduce(
      (sum, winner) => sum + (winner.prizeAmount || 0),
      0,
    );

    console.log(`📊 Latest draw result:`, {
      winningNumber: latestDraw.winningNumber,
      drawDate: latestDraw.drawDate,
      winnersCount: winners.length,
      totalPrizeDistributed: totalPrizeDistributed.toFixed(6),
    });

    res.json({
      success: true,
      data: {
        _id: latestDraw._id,
        winningNumber: latestDraw.winningNumber,
        drawDate: latestDraw.drawDate,
        winnersCount: winners.length,
        totalPrizeDistributed: parseFloat(totalPrizeDistributed.toFixed(6)),
        winners: winners.map((w) => ({
          walletAddress: w.walletAddress,
          prizeAmount: parseFloat((w.prizeAmount || 0).toFixed(6)),
          ticketNumber: w.ticketNumber,
        })),
      },
    });
  } catch (error) {
    console.error("Get latest draw error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy kết quả quay thưởng",
    });
  }
};

// @desc    Lấy thông tin công khai (prize pool, players)
// @route   GET /api/lottery/public-info
// @access  Public (không cần đăng nhập)
exports.getPublicInfo = async (req, res) => {
  try {
    // Lấy tổng số người chơi
    const totalPlayers = await User.countDocuments({ role: "user" });

    // Lấy tổng giải thưởng (vé active chưa quay)
    const activeTickets = await Ticket.find({
      status: "active",
    }).select("amount");

    const prizePool = activeTickets.reduce(
      (sum, ticket) => sum + (ticket.amount || 0),
      0,
    );

    const totalTickets = activeTickets.length;

    console.log("🎰 Public Info:", {
      prizePool: prizePool.toFixed(6),
      totalPlayers,
      totalTickets,
    });

    res.json({
      success: true,
      data: {
        prizePool: parseFloat(prizePool.toFixed(6)),
        totalPlayers,
        totalTickets,
      },
    });
  } catch (error) {
    console.error("Get public info error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin",
    });
  }
};

// @desc    Lấy thống kê Admin Dashboard
// @route   GET /api/lottery/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalPlayers = await User.countDocuments({ role: "user" });

    // Lấy chỉ vé ACTIVE (chưa quay)
    const activeTickets = await Ticket.find({
      status: "active",
    }).select("amount");
    const totalTickets = activeTickets.length;

    // Tính tổng doanh thu từ vé ACTIVE (chưa quay)
    const totalRevenue = activeTickets.reduce(
      (sum, ticket) => sum + (ticket.amount || 0),
      0,
    );

    // Đếm người thắng hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayWinners = await Ticket.countDocuments({
      status: "won",
      updatedAt: { $gte: today, $lt: tomorrow },
    });

    console.log("📊 Admin Stats:");
    console.log("  - Total Players:", totalPlayers);
    console.log("  - Tickets Pending Draw:", totalTickets);
    console.log("  - Prize Pool:", totalRevenue.toFixed(6), "ETH");
    console.log("  - Today Winners:", todayWinners);

    res.json({
      success: true,
      data: {
        totalPlayers,
        totalTickets,
        totalRevenue: parseFloat(totalRevenue.toFixed(6)),
        todayWinners,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê",
    });
  }
};

// @desc    Lấy danh sách người chơi gần đây
// @route   GET /api/lottery/admin/recent-players
// @access  Private/Admin
exports.getRecentPlayers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const players = await User.find({ role: "user" })
      .select("username email walletAddress balance createdAt lastLogin")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: players,
    });
  } catch (error) {
    console.error("Get recent players error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách người chơi",
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

// @desc    Quay số trúng thưởng (Admin)
// @route   POST /api/lottery/draw
// @access  Private/Admin
exports.drawLottery = async (req, res) => {
  try {
    const { winningNumbers } = req.body;

    // Validate winning numbers
    if (!winningNumbers || winningNumbers.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Số trúng thưởng phải có đúng 6 chữ số",
      });
    }

    // Format winning number as string (e.g., "123456")
    const winningNumber = winningNumbers.join("");

    // Lấy tất cả vé với trạng thái "active"
    const activeTickets = await Ticket.find({ status: "active" }).populate(
      "user",
    );

    // Tìm những vé trúng (so sánh 3 chữ số cuối)
    const winningTickets = [];
    const losingTickets = [];

    console.log(`🎯 Winning number: ${winningNumber}`);
    console.log(`🔍 Kiểm tra ${activeTickets.length} vé...`);

    for (const ticket of activeTickets) {
      const ticketLastThree = ticket.ticketNumber.slice(-3);
      const winningLastThree = winningNumber.slice(-3);

      console.log(
        `  Vé: ${ticket.ticketNumber} (3 số cuối: ${ticketLastThree}) vs Winning: ${winningLastThree}`,
      );

      if (ticketLastThree === winningLastThree) {
        console.log(`    ✅ TRÚNG!`);
        winningTickets.push(ticket);
      } else {
        console.log(`    ❌ Thua`);
        losingTickets.push(ticket);
      }
    }

    // Cập nhật vé thắng
    for (const ticket of winningTickets) {
      ticket.status = "won";
      ticket.drawDate = new Date();
      ticket.winningNumber = winningNumber;
      ticket.prizeAmount = ticket.amount; // Giải thưởng = tiền vé
      await ticket.save();

      // Cộng tiền thưởng cho user
      const user = await User.findById(ticket.user._id);
      console.log(`💰 Cộng tiền cho ${user.username}:`);
      console.log(`   Balance trước: ${user.balance} ETH`);
      user.balance += ticket.amount;
      console.log(`   Balance sau: ${user.balance} ETH`);
      console.log(`   Giải thưởng: ${ticket.amount} ETH`);
      await user.save();
      console.log(`   ✅ Đã save vào database`);

      // Gửi tiền vào ví MetaMask trên blockchain
      try {
        console.log(
          `💸 Gửi tiền thưởng ${ticket.amount} ETH đến ví ${ticket.walletAddress}...`,
        );
        const txHash = await sendPrizeToWinner(
          ticket.walletAddress,
          ticket.amount,
        );
        console.log(`✅ Gửi tiền thành công! TX: ${txHash}`);

        // Lưu transaction hash
        ticket.prizeTransactionHash = txHash;
        await ticket.save();
      } catch (blockchainError) {
        console.error("❌ Lỗi gửi tiền blockchain:", blockchainError.message);
        // Vẫn cập nhật trạng thái thắng, nhưng note lỗi blockchain
        ticket.blockchainError = blockchainError.message;
        await ticket.save();
      }

      // Tạo thông báo thắng
      try {
        await Notification.create({
          user: ticket.user._id,
          type: "win",
          title: "Chúc mừng bạn đã thắng!",
          message: `Bạn đã trúng số ${winningNumber} với giải thưởng ${ticket.amount} ETH`,
          relatedTicket: ticket._id,
          isRead: false,
        });
      } catch (notifError) {
        console.error("Notification error:", notifError);
      }
    }

    // Cập nhật vé thua
    for (const ticket of losingTickets) {
      ticket.status = "lost";
      ticket.drawDate = new Date();
      ticket.winningNumber = winningNumber;
      await ticket.save();
    }

    // Gửi thông báo cho tất cả người chơi
    try {
      await notificationService.notifyDrawResults(
        winningNumber,
        winningTickets.reduce((sum, t) => sum + t.amount, 0),
      );
      console.log("✅ Draw notifications sent to all players");
    } catch (notifError) {
      console.error("Send draw notifications error:", notifError);
    }

    res.json({
      success: true,
      message: "Quay số thành công",
      data: {
        winningNumber,
        totalWinners: winningTickets.length,
        prizePool: winningTickets.reduce((sum, t) => sum + t.amount, 0),
        winners: winningTickets.map((t) => ({
          username: t.user.username,
          ticketNumber: t.ticketNumber,
          prizeAmount: t.amount,
        })),
      },
    });
  } catch (error) {
    console.error("Draw lottery error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Reset tất cả vé sau khi quay (Admin) - Ẩn vé cũ
// @route   POST /api/lottery/reset-tickets
// @access  Private/Admin
exports.resetTickets = async (req, res) => {
  try {
    // Ẩn tất cả vé cũ (isActive = false) - không xoá
    const result = await Ticket.updateMany({}, { isActive: false });

    const activeCount = await Ticket.countDocuments({ isActive: true });
    const archivedCount = await Ticket.countDocuments({ isActive: false });

    console.log(`📦 Đã ẩn ${result.modifiedCount} vé`);
    console.log(
      `📊 Vé đang hoạt động: ${activeCount}, Vé đã ẩn: ${archivedCount}`,
    );

    res.json({
      success: true,
      message: "Reset vé thành công - Ẩn tất cả vé cũ",
      data: {
        archivedCount: result.modifiedCount,
        activeTickets: activeCount,
        archivedTickets: archivedCount,
      },
    });
  } catch (error) {
    console.error("Reset tickets error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Lấy lịch sử kết quả quay gần đây (Admin)
// @route   GET /api/lottery/draw-results
// @access  Private/Admin
exports.getDrawResults = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Lấy các vé có trạng thái "won" hoặc "lost" (đã quay)
    const results = await Ticket.find({
      drawDate: { $exists: true, $ne: null },
    })
      .select("winningNumber drawDate status")
      .sort({ drawDate: -1 })
      .limit(limit);

    // Nhóm theo winningNumber để lấy kết quả unique
    const uniqueResults = [];
    const seenNumbers = new Set();

    for (const result of results) {
      if (!seenNumbers.has(result.winningNumber)) {
        seenNumbers.add(result.winningNumber);

        // Đếm số người thắng cho số quay này
        const winnersCount = await Ticket.countDocuments({
          winningNumber: result.winningNumber,
          status: "won",
        });

        // Tính tổng giải thưởng
        const prizeData = await Ticket.aggregate([
          {
            $match: {
              winningNumber: result.winningNumber,
              status: "won",
            },
          },
          {
            $group: {
              _id: null,
              totalPrize: { $sum: "$prizeAmount" },
            },
          },
        ]);

        uniqueResults.push({
          winningNumber: result.winningNumber,
          drawDate: result.drawDate,
          winnersCount,
          totalPrize: prizeData[0]?.totalPrize || 0,
        });
      }
    }

    res.json({
      success: true,
      data: uniqueResults,
    });
  } catch (error) {
    console.error("Get draw results error:", error);
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
    const limit = parseInt(req.query.limit) || 10; // Mặc định 10 vé
    const skip = (page - 1) * limit;

    // Hiển thị TẤT CẢ vé đã mua (tất cả trạng thái)
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

// @desc    Đặt lịch quay số
// @route   POST /api/lottery/schedule-draw
// @access  Private/Admin
exports.scheduleDraw = async (req, res) => {
  try {
    console.log("📅 [scheduleDraw] Received schedule-draw request");
    const { scheduledTime, winningNumbers } = req.body;
    console.log(
      `📅 [scheduleDraw] Scheduled time: ${scheduledTime}, Winning numbers: ${winningNumbers}`,
    );

    // Validate input
    if (!scheduledTime || !winningNumbers || winningNumbers.length !== 6) {
      console.log(
        "📅 [scheduleDraw] Validation failed - missing or invalid data",
      );
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    // Validate time format (should be a valid date/time)
    const drawTime = new Date(scheduledTime);
    if (isNaN(drawTime.getTime())) {
      console.log("📅 [scheduleDraw] Invalid time format");
      return res.status(400).json({
        success: false,
        message: "Thời gian không hợp lệ",
      });
    }

    if (drawTime < new Date()) {
      console.log("📅 [scheduleDraw] Time in the past");
      return res.status(400).json({
        success: false,
        message: "Thời gian phải trong tương lai",
      });
    }

    console.log(
      `📅 [scheduleDraw] Validation passed, scheduling draw at ${drawTime.toISOString()}`,
    );
    const scheduleId = `draw_${Date.now()}`;
    const winningNumber = winningNumbers.join("");

    // Schedule the draw
    const drawFunction = async () => {
      try {
        console.log(`🎰 Auto-executing scheduled draw: ${scheduleId}`);

        // Get all active tickets
        const activeTickets = await Ticket.find({ status: "active" }).populate(
          "user",
        );

        const winningTickets = [];
        const losingTickets = [];

        // Find winning tickets
        for (const ticket of activeTickets) {
          const ticketLastThree = ticket.ticketNumber.slice(-3);
          const winningLastThree = winningNumber.slice(-3);

          if (ticketLastThree === winningLastThree) {
            winningTickets.push(ticket);
          } else {
            losingTickets.push(ticket);
          }
        }

        // Update winning tickets
        for (const ticket of winningTickets) {
          ticket.status = "won";
          ticket.drawDate = new Date();
          ticket.winningNumber = winningNumber;
          ticket.prizeAmount = ticket.amount;
          await ticket.save();

          // Add prize to user balance
          const user = await User.findById(ticket.user._id);
          user.balance += ticket.amount;
          await user.save();

          // Create win notification
          try {
            await Notification.create({
              user: ticket.user._id,
              type: "win",
              title: "Chúc mừng bạn đã thắng!",
              message: `Bạn đã trúng số ${winningNumber} với giải thưởng ${ticket.amount} ETH`,
              relatedTicket: ticket._id,
              isRead: false,
            });
          } catch (notifError) {
            console.error("Notification error:", notifError);
          }
        }

        // Update losing tickets
        for (const ticket of losingTickets) {
          ticket.status = "lost";
          ticket.drawDate = new Date();
          ticket.winningNumber = winningNumber;
          await ticket.save();
        }

        // Gửi thông báo kết quả quay cho tất cả người chơi
        try {
          await notificationService.notifyDrawResults(
            winningNumber,
            winningTickets.reduce((sum, t) => sum + t.amount, 0),
          );
          console.log("✅ Scheduled draw notifications sent to all players");
        } catch (notifError) {
          console.error("Send draw notifications error:", notifError);
        }

        console.log(
          `✅ Scheduled draw ${scheduleId} completed. Winners: ${winningTickets.length}`,
        );
      } catch (error) {
        console.error("Scheduled draw error:", error);
      }
    };

    // Schedule the job
    scheduleService.scheduleDrawLottery(scheduleId, drawTime, drawFunction);

    // Gửi thông báo sắp tới giờ quay cho tất cả người chơi
    try {
      const drawTimeStr = drawTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      await notificationService.notifyUpcomingDraw(drawTimeStr);
      console.log("✅ Upcoming draw notification sent");
    } catch (notifError) {
      console.error("Send upcoming draw notification error:", notifError);
    }

    res.json({
      success: true,
      message: "Lịch quay số đã được đặt",
      data: {
        scheduleId,
        scheduledTime: drawTime,
        winningNumber,
        nextInvocation: scheduleService.getNextInvocationTime(scheduleId),
      },
    });
  } catch (error) {
    console.error("Schedule draw error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Hủy lịch quay số
// @route   POST /api/lottery/cancel-scheduled-draw
// @access  Private/Admin
exports.cancelScheduledDraw = async (req, res) => {
  try {
    const { scheduleId } = req.body;

    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID lịch",
      });
    }

    const cancelled = scheduleService.cancelScheduledDraw(scheduleId);

    if (!cancelled) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch này",
      });
    }

    res.json({
      success: true,
      message: "Lịch quay số đã bị hủy",
    });
  } catch (error) {
    console.error("Cancel scheduled draw error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};

// @desc    Lấy danh sách lịch quay số
// @route   GET /api/lottery/scheduled-draws
// @access  Private/Admin
exports.getScheduledDraws = async (req, res) => {
  try {
    const scheduledDraws = scheduleService.getScheduledJobs();

    res.json({
      success: true,
      data: scheduledDraws,
    });
  } catch (error) {
    console.error("Get scheduled draws error:", error);
    res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra",
    });
  }
};
/**
 * Gửi tiền thưởng đến ví MetaMask qua smart contract
 * @param {string} winnerAddress - Địa chỉ ví MetaMask của người thắng
 * @param {number} amountETH - Số tiền ETH cần gửi
 * @returns {string} Transaction hash
 */
async function sendPrizeToWinner(winnerAddress, amountETH) {
  try {
    if (!contractAddress || !adminPrivateKey || !adminWallet) {
      throw new Error(
        "Missing blockchain configuration (CONTRACT_ADDRESS, PRIVATE_KEY, ADMIN_WALLET)",
      );
    }

    console.log(
      `📤 Gửi giải thưởng ${amountETH} ETH từ CONTRACT đến ${winnerAddress}...`,
    );

    // Convert ETH to Wei
    const amountWei = web3.utils.toWei(amountETH.toString(), "ether");

    // Contract ABI - function sendPrizeToWinner
    const contractABI = [
      {
        inputs: [
          { internalType: "address", name: "winner", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "sendPrizeToWinner",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Get nonce
    const nonce = await web3.eth.getTransactionCount(adminWallet);
    console.log(`   Nonce: ${nonce}`);

    // Get gas price
    const gasPrice = await web3.eth.getGasPrice();
    console.log(`   Gas price: ${web3.utils.fromWei(gasPrice, "gwei")} Gwei`);

    // Estimate gas for contract call
    const gasEstimate = await contract.methods
      .sendPrizeToWinner(winnerAddress, amountWei)
      .estimateGas({ from: adminWallet });
    console.log(`   Estimated gas: ${gasEstimate}`);

    // Build transaction to call contract method
    const tx = {
      from: adminWallet,
      to: contractAddress,
      data: contract.methods
        .sendPrizeToWinner(winnerAddress, amountWei)
        .encodeABI(),
      gas: Math.ceil(gasEstimate * 1.2),
      gasPrice: gasPrice,
      nonce: nonce,
      chainId: 11155111,
    };

    console.log(`   📋 Thông tin giao dịch:`, {
      from: tx.from,
      to: tx.to,
      amount: web3.utils.fromWei(amountWei, "ether") + " ETH",
      recipient: winnerAddress,
      contract: contractAddress,
    });

    // Sign transaction
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      adminPrivateKey,
    );
    console.log(`   ✅ Transaction signed`);

    // Send transaction
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );
    console.log(`   ✅ Transaction sent! Hash: ${receipt.transactionHash}`);
    console.log(`   ✅ Người nhận: ${winnerAddress}`);
    console.log(`   ✅ Số tiền từ contract: ${amountETH} ETH`);
    console.log(`   ✅ Gas used: ${receipt.gasUsed}`);

    return receipt.transactionHash;
  } catch (error) {
    console.error("❌ Error in sendPrizeToWinner:", error.message);
    throw error;
  }
}
