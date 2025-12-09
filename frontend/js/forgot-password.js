// Forgot Password functionality

// Handle forgot password form
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const btnSubmit = document.querySelector(".btn-login");

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Validate email
    if (!email) {
      showMessage("Vui lòng nhập email", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Email không hợp lệ", "error");
      return;
    }

    // Show loading
    btnSubmit.classList.add("loading");
    btnSubmit.disabled = true;

    try {
      // Simulate sending email (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if email exists (demo)
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const user = existingUsers.find((u) => u.email === email);

      if (!user) {
        throw new Error("Email không tồn tại trong hệ thống");
      }

      // Success
      showMessage(
        "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!",
        "success"
      );

      // Clear form
      emailInput.value = "";
      btnSubmit.classList.remove("loading");
      btnSubmit.disabled = false;

      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = "login.html";
      }, 3000);
    } catch (error) {
      showMessage(error.message, "error");
      btnSubmit.classList.remove("loading");
      btnSubmit.disabled = false;
    }
  });
}

// Validate email format
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Show message
function showMessage(message, type = "error") {
  let messageDiv = document.querySelector(".message-box");

  if (!messageDiv) {
    messageDiv = document.createElement("div");
    messageDiv.className = "message-box";
    forgotPasswordForm.insertBefore(messageDiv, forgotPasswordForm.firstChild);
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
