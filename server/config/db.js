// server/config/db.js
const mysql = require("mysql2");

console.log("📡 Connecting to database...");
console.log("MYSQLHOST:", process.env.MYSQLHOST);
console.log("MYSQLDATABASE:", process.env.MYSQLDATABASE);

const pool = mysql
  .createPool({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'railway',
    port: parseInt(process.env.MYSQLPORT) || 3306,
    waitForConnections: true,
    connectionLimit: 5,
    connectTimeout: 10000,
    enableKeepAlive: true
  })
  .promise();

pool
  .getConnection()
  .then((conn) => {
    console.log("✅ Database connected successfully");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
  });

module.exports = pool;