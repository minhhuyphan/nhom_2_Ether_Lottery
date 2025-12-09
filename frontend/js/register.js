// Register functionality

// Toggle password visibility
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.textContent = type === "password" ? "👁️" : "🙈";
  });
}

if (toggleConfirmPassword && confirmPasswordInput) {
  toggleConfirmPassword.addEventListener("click", () => {
    const type =
      confirmPasswordInput.getAttribute("type") === "password"
        ? "text"
        : "password";
    confirmPasswordInput.setAttribute("type", type);
    toggleConfirmPassword.textContent = type === "password" ? "👁️" : "🙈";
  });
}

// Handle register form
const registerForm = document.getElementById("registerForm");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const btnRegister = document.querySelector(".btn-login");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
      showMessage("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }

    if (username.length < 3) {
      showMessage("Tên đăng nhập phải có ít nhất 3 ký tự", "error");
      return;
    }

    if (password.length < 6) {
      showMessage("Mật khẩu phải có ít nhất 6 ký tự", "error");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Mật khẩu xác nhận không khớp", "error");
      return;
    }

    // Show loading
    btnRegister.classList.add("loading");
    btnRegister.disabled = true;

    try {
      // Simulate registration (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check if username already exists (demo)
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
      if (existingUsers.some((u) => u.username === username)) {
        throw new Error("Tên đăng nhập đã tồn tại");
      }

      if (existingUsers.some((u) => u.email === email)) {
        throw new Error("Email đã được sử dụng");
      }

      // Save user (demo - replace with real API)
      existingUsers.push({
        username,
        email,
        password, // In production, never store plain passwords!
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("users", JSON.stringify(existingUsers));

      showMessage("Đăng ký thành công! Đang chuyển hướng...", "success");

      // Redirect to login
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } catch (error) {
      showMessage(error.message, "error");
      btnRegister.classList.remove("loading");
      btnRegister.disabled = false;
    }
  });
}

// Show message
function showMessage(message, type = "error") {
  let messageDiv = document.querySelector(".message-box");

  if (!messageDiv) {
    messageDiv = document.createElement("div");
    messageDiv.className = "message-box";
    registerForm.insertBefore(messageDiv, registerForm.firstChild);
  }

  messageDiv.textContent = message;
  messageDiv.className = `message-box ${type}`;
  messageDiv.style.cssText = `
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 14px;
    text-align: center;
    animation: slideDown 0.3s ease;
    ${
      type === "error"
        ? "background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5); color: #fca5a5;"
        : "background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.5); color: #86efac;"
    }
  `;

  setTimeout(() => {
    if (type === "error") {
      messageDiv.style.display = "none";
    }
  }, 3000);
}

// Check if already logged in
if (localStorage.getItem("userRole")) {
  const role = localStorage.getItem("userRole");
  window.location.href = role === "admin" ? "admin.html" : "index.html";
}

// Add animations
const style = document.createElement("style");
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
