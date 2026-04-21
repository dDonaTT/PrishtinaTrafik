const mysql = require("mysql2");
const config = require("./env");

let pool;

if (config.MYSQL_URL) {
  pool = mysql.createPool({
    uri: config.MYSQL_URL,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false }
  }).promise();
} else {
  pool = mysql
    .createPool({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_DATABASE,
      port: config.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
    })
    .promise();
}

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
  }
};

testConnection();

module.exports = pool;