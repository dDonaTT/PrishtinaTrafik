require("dotenv").config();

const required = ['JWT_SECRET'];
required.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing environment variable: ${key}`);
    }
});
module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN:  '7d',
  NODE_ENV: process.env.NODE_ENV ,
};