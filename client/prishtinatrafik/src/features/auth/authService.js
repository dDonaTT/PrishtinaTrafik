import API from "../../services/api";

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
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};
const getCurrentUser =()=>{
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null
}
const getToken = () => localStorage.getItem("token");
const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
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
};
