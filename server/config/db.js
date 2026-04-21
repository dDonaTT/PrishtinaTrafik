const mysql = require("mysql2");

let pool;

console.log("📡 Starting database connection...");
console.log("RAILWAY_ENVIRONMENT:", !!process.env.RAILWAY_ENVIRONMENT);
console.log("MYSQLHOST:", process.env.MYSQLHOST || "missing");

if (process.env.MYSQLHOST) {
  console.log("🚄 Connecting to Railway INTERNAL MySQL");

  pool = mysql
    .createPool({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: Number(process.env.MYSQLPORT) || 3306,

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 60000,
    })
    .promise();
} 
else {
  console.log("💻 Connecting to LOCAL MySQL");

  pool = mysql
    .createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_DATABASE || "prishtina_trafik",
      port: Number(process.env.DB_PORT) || 3306,

      waitForConnections: true,
      connectionLimit: 10,
    })
    .promise();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const testConnection = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      const conn = await pool.getConnection();
      console.log("✅ DATABASE CONNECTED SUCCESSFULLY");
      conn.release();
      return;
    } catch (err) {
      console.log(`❌ DB attempt ${i + 1}/10 failed:`, err.message);
      await sleep(3000);
    }
  }

  console.error("💥 DATABASE CONNECTION FAILED PERMANENTLY");
};

testConnection();

module.exports = pool;