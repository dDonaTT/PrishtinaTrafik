require("dotenv").config();

const isRailway = !!process.env.RAILWAY_ENVIRONMENT;

let required = ["JWT_SECRET"];

if (!isRailway) {
  required.push("MYSQL_PUBLIC_URL"); 
}

required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️ Missing env: ${key}`);
  }
});

const PORT = process.env.PORT || 8000;

console.log(`⚙️ Config loaded`);
console.log(`PORT: ${PORT}`);
console.log(`Railway: ${isRailway}`);

module.exports = {
  PORT,
  JWT_SECRET: process.env.JWT_SECRET || "change_me",
  JWT_EXPIRES_IN: "7d",

  NODE_ENV: process.env.NODE_ENV || "development",

  MYSQL_URL: process.env.MYSQL_URL,
  MYSQL_PUBLIC_URL: process.env.MYSQL_PUBLIC_URL,

  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_DATABASE: process.env.DB_DATABASE || "prishtina_trafik",
  DB_PORT: process.env.DB_PORT || 3306,
};