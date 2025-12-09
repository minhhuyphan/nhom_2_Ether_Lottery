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
      // Simulate login (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Demo authentication
      if (username === "admin" && password === "admin") {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("username", username);
        window.location.href = "admin.html";
      } else if (username && password) {
        localStorage.setItem("userRole", "user");
        localStorage.setItem("username", username);
        window.location.href = "index.html";
      } else {
        throw new Error("Sai tên đăng nhập hoặc mật khẩu");
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
