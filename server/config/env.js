require("dotenv").config();

const required = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_DATABASE'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: '7d',
  NODE_ENV: process.env.NODE_ENV || "development",

  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_DATABASE: process.env.DB_DATABASE,
  DB_PORT: process.env.DB_PORT || 3306,
};