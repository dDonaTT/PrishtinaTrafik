const mysql = require("mysql2");

let pool;

if (process.env.RAILWAY_ENVIRONMENT) {
  console.log("🚄 Using INTERNAL Railway MySQL");

  pool = mysql.createPool({
    uri: process.env.MYSQL_URL,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 60000,
  }).promise();
}

else if (process.env.MYSQL_PUBLIC_URL) {
  console.log("🌍 Using PUBLIC MySQL URL");

  pool = mysql.createPool({
    uri: process.env.MYSQL_PUBLIC_URL,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 60000,
  }).promise();
}

else {
  console.log("💻 Using LOCAL DB");

  pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "prishtina_trafik",
  }).promise();
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