// client/src/hooks/useAuth.js
import { useState, useEffect } from "react";
import {
  register as registerService,
  login as loginService,
  logout as logoutService,
  getCurrentUser,
  getToken,
  isAuthenticated as checkAuth,
  getLoginTime,
} from "../services/authService";
import toast from "react-hot-toast";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = () => {
      const currentUser = getCurrentUser();
      const token = getToken();

      if (currentUser && token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const tokenExp = payload.exp * 1000;
          const now = Date.now();

          if (tokenExp > now) {
            setUser(currentUser);
            setIsAuthenticated(true);
            updateTimeRemaining();
          } else {
            logoutService();
          }
        } catch (error) {
          console.error("Token verification error:", error);
          logoutService();
        }
      }
      setLoading(false);
    };

    initAuth();

    const interval = setInterval(() => {
      if (isAuthenticated) {
        const token = getToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const tokenExp = payload.exp * 1000;
            const now = Date.now();

            if (tokenExp < now) {
              logoutService();
              setIsAuthenticated(false);
              setUser(null);
              toast.error("Sesioni ka skaduar. Ju lutemi rihuni.");
            }
          } catch (error) {
            console.error("Token check error:", error);
          }
        }
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const updateTimeRemaining = () => {
    const loginTime = getLoginTime();
    if (loginTime) {
      const now = Date.now();
      const hoursPassed = (now - loginTime) / (1000 * 60 * 60);
      const hoursLeft = 24 - hoursPassed;
      if (hoursLeft > 0) {
        setTimeRemaining({
          hours: Math.floor(hoursLeft),
          minutes: Math.floor((hoursLeft % 1) * 60),
        });
      } else {
        setTimeRemaining(null);
      }
    }
  };

  const login = async (credentials) => {
    setError(null);
    try {
      setLoading(true);
      const response = await loginService(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success("Identifikimi i suksesshëm!");
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err.message || "Email ose fjalëkalimi janë të gabuara";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await registerService(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      updateTimeRemaining();
      toast.success("Registration successful!");
      return response;
    } catch (error) {
      toast.error(error.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setIsAuthenticated(false);
    setTimeRemaining(null);
    toast.success("Logged out successfully");
  };

  return {
    user,
    loading,
    isAuthenticated,
    timeRemaining,
    login,
    register,
    logout,
  };
};
