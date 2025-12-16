// Slot Machine Game Logic
class SlotMachine {
  constructor() {
    // Mapping số sang tên file ảnh (trong thư mục nohu)
    this.numberImages = {
      0: "banhchung.png",
      1: "caithuyen.png",
      2: "chuphuc.png",
      3: "conlan.png",
      4: "hoasen.png",
      5: "longden.png",
      6: "nonla.png",
      7: "rong.png",
      8: "tohe.png",
      9: "trongdong.png",
    };

    this.balance = 0;
    this.jackpot = 0;
    this.spinCost = 0.001; // ETH per spin
    this.jackpotMultiplier = 10;
    this.isSpinning = false;
    this.spinDuration = 2000; // 2 seconds
    this.isAutoSpinning = false;
    this.autoSpinRemaining = 0;

    this.initializeElements();
    this.attachEventListeners();
    this.preloadImages();
    this.updateDisplay();
    this.setInitialImages();
  }

  initializeElements() {
    this.balanceElement = document.getElementById("balance-amount");
    this.jackpotElement = document.getElementById("jackpot-amount");
    this.spinBtn = document.getElementById("spin-btn");
    this.spinBtnText = this.spinBtn.querySelector(".btn-text");
    this.spinBtnLoading = this.spinBtn.querySelector(".btn-loading");
    this.reel1 = document.getElementById("reel1").querySelector(".slot-image");
    this.reel2 = document.getElementById("reel2").querySelector(".slot-image");
    this.reel3 = document.getElementById("reel3").querySelector(".slot-image");
    this.jackpotModal = document.getElementById("jackpot-modal");
    this.winModal = document.getElementById("win-modal");
    this.closeModalBtn = document.getElementById("close-modal-btn");
    this.closeWinModalBtn = document.getElementById("close-win-modal-btn");
    this.winAmountElement = document.getElementById("win-amount");
    this.winModalAmountElement = document.getElementById("win-modal-amount");
    this.winMessageElement = document.getElementById("win-message");
    // Bet controls
    this.betAmountSelect = document.getElementById("bet-amount");
    this.autoSpinsSelect = document.getElementById("auto-spins");
    this.autoSpinCount = document.querySelector(".auto-spin-count");
  }

  attachEventListeners() {
    this.spinBtn.addEventListener("click", () => this.startSpin());
    this.closeModalBtn.addEventListener("click", () =>
      this.closeJackpotModal()
    );
    this.closeWinModalBtn.addEventListener("click", () => this.closeWinModal());

    // Bet and auto-spin select controls
    this.betAmountSelect.addEventListener("change", () =>
      this.updateSpinCost()
    );
    this.autoSpinsSelect.addEventListener("change", () =>
      this.handleAutoSpinChange()
    );
  }

  preloadImages() {
    // Preload all slot images to ensure smooth gameplay
    const imagePromises = Object.values(this.numberImages).map((imageName) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(imageName);
        img.onerror = () => {
          console.warn(`Failed to preload image: ${imageName}`);
          resolve(imageName); // Still resolve to not break the flow
        };
        img.src = `../icon/nohu/${imageName}`;
      });
    });

    Promise.all(imagePromises).then(() => {
      console.log("All slot images preloaded successfully");
    });
  }

  // Bet controls methods
  updateSpinCost() {
    this.spinCost = parseFloat(this.betAmountSelect.value);
  }

  // Auto spin methods
  handleAutoSpinChange() {
    const selectedSpins = parseInt(this.autoSpinsSelect.value);

    // If 0 (Tắt) is selected, stop auto spin
    if (selectedSpins === 0) {
      if (this.isAutoSpinning) {
        this.stopAutoSpin();
      }
      return;
    }

    // If already auto spinning, stop it first
    if (this.isAutoSpinning) {
      this.stopAutoSpin();
    }

    // Start auto spin with selected number
    this.startAutoSpin(selectedSpins);
  }

  startAutoSpin(totalSpins) {
    this.autoSpinRemaining = totalSpins;
    this.autoSpinTotal = totalSpins; // Store for counter
    this.isAutoSpinning = true;

    // Disable controls during auto spin
    this.betAmountSelect.disabled = true;
    this.autoSpinsSelect.disabled = true;

    this.autoSpinCount.textContent = `(0/${totalSpins})`;
    this.autoSpinCount.classList.remove("hidden");

    this.performAutoSpin();
  }

  stopAutoSpin() {
    this.isAutoSpinning = false;
    this.autoSpinsSelect.value = "0"; // Reset to "Tắt"
    this.autoSpinCount.classList.add("hidden");

    // Re-enable controls
    this.betAmountSelect.disabled = false;
    this.autoSpinsSelect.disabled = false;
  }

  async performAutoSpin() {
    if (!this.isAutoSpinning || this.autoSpinRemaining <= 0) {
      this.stopAutoSpin();
      return;
    }

    // Check if user has enough balance
    if (this.balance < this.spinCost) {
      this.showToast("Không đủ số dư để tiếp tục auto quay!", "error");
      this.stopAutoSpin();
      return;
    }

    // Perform one spin
    await this.performSingleSpin();

    // Update counter
    this.autoSpinRemaining--;
    this.autoSpinCount.textContent = `(${
      this.autoSpinTotal - this.autoSpinRemaining
    }/${this.autoSpinTotal})`;

    // Continue if still auto spinning and has remaining spins
    if (this.isAutoSpinning && this.autoSpinRemaining > 0) {
      // Add a small delay between spins for better UX
      setTimeout(() => this.performAutoSpin(), 1000);
    } else {
      this.stopAutoSpin();
    }
  }

  async performSingleSpin() {
    return new Promise((resolve) => {
      // Temporarily disable manual spin button
      this.spinBtn.disabled = true;

      // Start the spin
      this.startSpinAnimation();

      // Wait for spin to complete
      setTimeout(() => {
        this.completeSpin();
        this.spinBtn.disabled = false;
        this.isSpinning = false;
        resolve();
      }, this.spinDuration + 500); // Add extra time for modal if any
    });
  }

  startSpinAnimation() {
    // Deduct spin cost
    this.balance -= this.spinCost;
    this.updateDisplay();

    // Add spinning effect to reels
    document.getElementById("reel1").classList.add("spinning");
    document.getElementById("reel2").classList.add("spinning");
    document.getElementById("reel3").classList.add("spinning");

    // Update reels during animation
    this.spinInterval = setInterval(() => {
      this.updateReels();
    }, 100);
  }

  completeSpin() {
    clearInterval(this.spinInterval);

    // Generate final numbers
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const num3 = Math.floor(Math.random() * 10);

    this.setReelImage(this.reel1, num1);
    this.setReelImage(this.reel2, num2);
    this.setReelImage(this.reel3, num3);

    // Check for wins
    this.checkWin(num1, num2, num3);

    // Reset button
    this.spinBtn.disabled = false;
    this.spinBtn.classList.remove("spinning");
    this.spinBtnText.classList.remove("hidden");
    this.spinBtnLoading.classList.add("hidden");

    // Remove spinning effect from reels
    document.getElementById("reel1").classList.remove("spinning");
    document.getElementById("reel2").classList.remove("spinning");
    document.getElementById("reel3").classList.remove("spinning");
  }

  updateDisplay() {
    this.balanceElement.textContent = this.balance.toFixed(4) + " ETH";
    this.jackpotElement.textContent = this.jackpot.toFixed(4) + " ETH";
  }

  showToast(message, type = "info") {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Add to page
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add("show"), 100);

    // Hide and remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  setInitialImages() {
    // Set initial images to 7 (rong.png) từ thư mục nohu
    this.setReelImage(this.reel1, 7);
    this.setReelImage(this.reel2, 7);
    this.setReelImage(this.reel3, 7);
  }

  setReelImage(reelElement, number) {
    const imageName = this.numberImages[number];
    if (!imageName) {
      console.error(`No image found for number: ${number}`);
      return;
    }

    reelElement.src = `../icon/nohu/${imageName}`;
    reelElement.alt = number.toString();

    // Add error handling for image loading
    reelElement.onerror = () => {
      console.error(`Failed to load image: ${imageName}`);
      reelElement.src = "../icon/rong.png"; // Fallback to rồng icon
    };
  }

  async startSpin() {
    // If auto spinning, stop it when manual spin is clicked
    if (this.isAutoSpinning) {
      this.stopAutoSpin();
      return;
    }

    if (this.isSpinning) return;

    // Check if user has enough balance
    if (this.balance < this.spinCost) {
      this.showToast("Không đủ số dư để quay!", "error");
      return;
    }

    this.isSpinning = true;
    await this.performSingleSpin();
  }

  updateReels() {
    // Update all reels with random images
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const num3 = Math.floor(Math.random() * 10);

    this.setReelImage(this.reel1, num1);
    this.setReelImage(this.reel2, num2);
    this.setReelImage(this.reel3, num3);
  }

  stopSpin() {
    clearInterval(this.spinInterval);

    // Generate final numbers
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const num3 = Math.floor(Math.random() * 10);

    this.setReelImage(this.reel1, num1);
    this.setReelImage(this.reel2, num2);
    this.setReelImage(this.reel3, num3);

    // Check for wins
    this.checkWin(num1, num2, num3);

    // Reset button
    this.isSpinning = false;
    this.spinBtn.disabled = false;
    this.spinBtn.classList.remove("spinning");
    this.spinBtnText.classList.remove("hidden");
    this.spinBtnLoading.classList.add("hidden");

    // Remove spinning effect from reels
    document.getElementById("reel1").classList.remove("spinning");
    document.getElementById("reel2").classList.remove("spinning");
    document.getElementById("reel3").classList.remove("spinning");
  }

  checkWin(num1, num2, num3) {
    // Check for 3 matching numbers (jackpot)
    if (num1 === num2 && num2 === num3) {
      this.handleWin(10, "NỔ HŨ - 3 hình giống nhau!");
      return;
    }

    // Check for 2 matching numbers
    if (num1 === num2 || num1 === num3 || num2 === num3) {
      this.handleWin(5, "Thắng lớn - 2 hình giống nhau!");
      return;
    }

    // No win - just show a message
    this.showToast("Chúc bạn may mắn lần sau!", "info");
  }

  handleWin(multiplier, message) {
    const winAmount = this.spinCost * multiplier;
    this.balance += winAmount;

    // Update jackpot (reduce it when someone wins big)
    if (multiplier === 10) {
      this.jackpot = Math.max(0, this.jackpot - winAmount);
    }

    this.updateDisplay();

    // Show appropriate modal based on win type
    setTimeout(() => {
      if (multiplier === 10) {
        // Jackpot win - show special jackpot modal
        this.winAmountElement.textContent = winAmount.toFixed(4) + " ETH";
        this.showJackpotModal();
        // Auto close after 2 seconds
        setTimeout(() => this.closeJackpotModal(), 2000);
      } else {
        // Regular win - show win modal
        this.showWinModal(winAmount, message);
        // Auto close after 2 seconds
        setTimeout(() => this.closeWinModal(), 2000);
      }
    }, 500);
  }

  showWinModal(amount, message) {
    this.winMessageElement.textContent = message;
    this.winModalAmountElement.textContent = amount.toFixed(4) + " ETH";
    this.winModal.classList.remove("hidden");
  }

  closeWinModal() {
    this.winModal.classList.add("hidden");
  }
  showJackpotModal() {
    this.jackpotModal.classList.remove("hidden");
  }

  closeJackpotModal() {
    this.jackpotModal.classList.add("hidden");
  }

  showToast(message, type = "info") {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Add to container
    const container = document.getElementById("toast-container");
    container.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add("show"), 100);

    // Hide and remove toast
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => container.removeChild(toast), 300);
    }, 3000);
  }

  // Method to add balance (for testing/demo purposes)
  addBalance(amount) {
    this.balance += amount;
    this.updateDisplay();
    this.showToast(`Đã thêm ${amount} ETH vào ví!`, "success");
  }

  // Method to set jackpot
  setJackpot(amount) {
    this.jackpot = amount;
    this.updateDisplay();
  }
}

// Initialize the game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const slotMachine = new SlotMachine();

  // For demo purposes, add some initial balance
  setTimeout(() => {
    slotMachine.addBalance(0.01);
    slotMachine.setJackpot(0.1);
  }, 1000);
});

// Toast styles (add to CSS if not already present)
const toastStyles = `
.toast {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 12px 20px;
    margin-bottom: 10px;
    color: var(--text-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 400px;
}

.toast.show {
    transform: translateX(0);
}

.toast-success {
    border-color: #4CAF50;
    background: linear-gradient(145deg, var(--card-bg), rgba(76, 175, 80, 0.1));
}

.toast-error {
    border-color: #f44336;
    background: linear-gradient(145deg, var(--card-bg), rgba(244, 67, 54, 0.1));
}

.toast-info {
    border-color: var(--gold);
    background: linear-gradient(145deg, var(--card-bg), rgba(255, 215, 0, 0.1));
}
`;

// Add toast styles to head
const style = document.createElement("style");
style.textContent = toastStyles;
document.head.appendChild(style);
