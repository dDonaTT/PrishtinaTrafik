const mysql = require("mysql2");

let pool;

console.log("📡 Starting database connection...");
console.log("RAILWAY_ENVIRONMENT:", !!process.env.RAILWAY_ENVIRONMENT);
console.log("Has MYSQLHOST:", !!process.env.MYSQLHOST);
console.log("Has MYSQL_PUBLIC_URL:", !!process.env.MYSQL_PUBLIC_URL);

if (process.env.MYSQLHOST) {
  console.log("📡 Connecting with individual MySQL variables");
  pool = mysql
    .createPool({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: parseInt(process.env.MYSQLPORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 30000
    })
    .promise();
} 
else if (process.env.MYSQL_PUBLIC_URL && process.env.MYSQL_PUBLIC_URL.includes('@')) {
  console.log("📡 Connecting with PUBLIC URL");
  pool = mysql
    .createPool({
      uri: process.env.MYSQL_PUBLIC_URL,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 30000,
      ssl: { rejectUnauthorized: false }
    })
    .promise();
}
else {
  console.log("📡 Connecting to LOCAL MySQL");
  pool = mysql
    .createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'prishtina_trafik',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
    })
    .promise();
}

const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Database connected successfully");
    conn.release();
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
};

testConnection();

module.exports = pool;