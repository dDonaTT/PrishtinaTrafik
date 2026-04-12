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

module.exports = { register, login };