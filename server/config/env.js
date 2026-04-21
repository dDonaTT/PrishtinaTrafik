require("dotenv").config();

const isRailway = !!process.env.MYSQL_URL;

let required = ["JWT_SECRET"];
if (!isRailway) {
  required = ["JWT_SECRET", "DB_HOST", "DB_USER", "DB_DATABASE"];
}

required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Warning: Missing environment variable: ${key}`);
  }
});

const PORT = process.env.PORT || 8000;

console.log(`Config loaded - PORT: ${PORT}, isRailway: ${isRailway}`);

module.exports = {
  PORT: PORT,
  JWT_SECRET: process.env.JWT_SECRET || "temp_secret_key_change_me",
  JWT_EXPIRES_IN: "7d",
  NODE_ENV: process.env.NODE_ENV || "development",

  MYSQL_URL: process.env.MYSQL_URL,

  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_DATABASE: process.env.DB_DATABASE || "prishtina_trafik",
  DB_PORT: process.env.DB_PORT || 3306,
};