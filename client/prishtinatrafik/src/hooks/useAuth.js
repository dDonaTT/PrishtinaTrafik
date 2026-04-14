// client/src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { 
  register as registerService, 
  login as loginService, 
  logout as logoutService,
  getCurrentUser,
  getToken,
  isAuthenticated as checkAuth 
} from '../services/authService';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      const token = getToken();
      
      if (currentUser && token) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await loginService(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
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
      toast.success('Registration successful!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };
};