const mysql = require("mysql2");

let pool;

if (process.env.MYSQL_URL) {
  console.log("Connecting to Railway MySQL via internal URL");
  pool = mysql
    .createPool({
      uri: process.env.MYSQL_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    })
    .promise();
} 
else if (process.env.MYSQLHOST) {
  console.log("Connecting to Railway MySQL via individual variables");
  pool = mysql
    .createPool({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: parseInt(process.env.MYSQLPORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    })
    .promise();
}
else {
  console.log("Connecting to local MySQL");
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
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
  }
};

testConnection();

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = pool;