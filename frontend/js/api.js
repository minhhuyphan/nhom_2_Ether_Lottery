// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    LOGOUT: '/auth/logout'
  }
};

// API Helper Class
class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // Lấy token từ localStorage
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Lưu token vào localStorage
  setToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Xóa token
  removeToken() {
    localStorage.removeItem('authToken');
  }

  // Lưu thông tin user
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('username', user.username);
    localStorage.setItem('userRole', user.role);
  }

  // Lấy thông tin user
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Xóa thông tin user
  clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
  }

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated() {
    return !!this.getToken();
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, 'GET');
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, 'POST', data);
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, 'PUT', data);
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, 'DELETE');
  }

  // Main request method
  async request(endpoint, method, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Đã có lỗi xảy ra');
      }

      return result;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại.');
      }
      throw error;
    }
  }
}

// Export global instance
const api = new ApiService(API_CONFIG.BASE_URL);

// Auth specific methods
const authApi = {
  // Đăng ký
  async register(username, email, password) {
    const result = await api.post(API_CONFIG.AUTH.REGISTER, { username, email, password });
    if (result.success) {
      api.setToken(result.data.token);
      api.setUser(result.data.user);
    }
    return result;
  },

  // Đăng nhập
  async login(username, password) {
    const result = await api.post(API_CONFIG.AUTH.LOGIN, { username, password });
    if (result.success) {
      api.setToken(result.data.token);
      api.setUser(result.data.user);
    }
    return result;
  },

  // Lấy thông tin user hiện tại
  async getMe() {
    return api.get(API_CONFIG.AUTH.ME);
  },

  // Đổi mật khẩu
  async changePassword(currentPassword, newPassword) {
    return api.put(API_CONFIG.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword });
  },

  // Đăng xuất
  async logout() {
    try {
      await api.post(API_CONFIG.AUTH.LOGOUT);
    } catch (e) {
      // Ignore errors
    }
    api.clearAuth();
  },

  // Kiểm tra trạng thái đăng nhập
  isLoggedIn() {
    return api.isAuthenticated();
  },

  // Lấy user hiện tại
  getCurrentUser() {
    return api.getUser();
  }
};
