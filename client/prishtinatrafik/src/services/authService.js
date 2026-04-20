// client/src/services/authService.js
import API from './api';

const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
};

const register = async (userData) => {
  try {
    const response = await API.post(AUTH_ENDPOINTS.REGISTER, userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("loginTime", Date.now().toString());
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

const login = async (credentials) => {
  try {
    const response = await API.post(AUTH_ENDPOINTS.LOGIN, credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("loginTime", Date.now().toString());
    }
    return response.data;
  } catch (error) {
    console.error("Login service error:", error);
    throw error.response?.data || { message: "Invalid credentials" };
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("loginTime");
  window.location.href = "/login";
};

const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const getToken = () => localStorage.getItem("token");

const getLoginTime = () => {
  const loginTime = localStorage.getItem("loginTime");
  return loginTime ? parseInt(loginTime) : null;
};

const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const tokenExp = payload.exp * 1000;
    const now = Date.now();
    
    if (tokenExp < now) {
      logout();
      return false;
    }
    
    const loginTime = getLoginTime();
    if (loginTime) {
      const hoursPassed = (now - loginTime) / (1000 * 60 * 60);
      if (hoursPassed >= 24) {
        logout();
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
};

export {
  register,
  login,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  getLoginTime,
};