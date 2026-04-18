const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await authService.register({
      fullname,
      email,
      password,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const data = await authService.login({ email, password });

    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
const getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, fullname as name, email, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    await db.query(
      'UPDATE users SET fullname = ?, email = ? WHERE id = ?',
      [name, email, req.user.id]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isValid = await bcrypt.compare(current_password, users[0].password);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const [tickets] = await db.query(
      'SELECT COUNT(*) as total FROM tickets WHERE user_id = ?',
      [req.user.id]
    );
    
    const [rides] = await db.query(
      'SELECT COUNT(*) as total FROM rides WHERE user_id = ? AND status = "completed"',
      [req.user.id]
    );
    
    res.json({
      total_tickets: tickets[0]?.total || 0,
      total_rides: rides[0]?.total || 0
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.json({ total_tickets: 0, total_rides: 0 }); // Kthe 0 në vend të gabimit
  }
};

module.exports = { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  getUserStats 
};