// Login functionality

// Toggle password visibility
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Change icon
    togglePassword.textContent = type === "password" ? "👁️" : "🙈";
  });
}

// Handle login form
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const btnLogin = document.querySelector(".btn-login");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      showMessage("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }

    // Show loading
    btnLogin.classList.add("loading");
    btnLogin.disabled = true;

    try {
      // Gọi API đăng nhập
      const result = await authApi.login(username, password);

      if (result.success) {
        showMessage("Đăng nhập thành công! Đang chuyển hướng...", "success");

        // Redirect dựa trên role
        setTimeout(() => {
          const user = result.data.user;
          if (user.role === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "index.html";
          }
        }, 1000);
      }
    } catch (error) {
      showMessage(error.message, "error");
      btnLogin.classList.remove("loading");
      btnLogin.disabled = false;
    }
  });
}

// Show message
function showMessage(message, type = "error") {
  let messageDiv = document.querySelector(".message-box");

  if (!messageDiv) {
    messageDiv = document.createElement("div");
    messageDiv.className = "message-box";
    loginForm.insertBefore(messageDiv, loginForm.firstChild);
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
    messageDiv.style.display = "none";
  }, 3000);
}

// Check if already logged in
if (typeof authApi !== 'undefined' && authApi.isLoggedIn()) {
  const user = authApi.getCurrentUser();
  if (user) {
    window.location.href = user.role === "admin" ? "admin.html" : "index.html";
  }
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
