const mysql = require("mysql2");

let pool;

if (process.env.MYSQL_PUBLIC_URL) {
  console.log("Connecting to Railway MySQL via public URL");
  pool = mysql
    .createPool({
      uri: process.env.MYSQL_PUBLIC_URL,
      waitForConnections: true,
      connectionLimit: 10,
      ssl: { rejectUnauthorized: false }
    })
    .promise();
} else {
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

pool.getConnection()
  .then(conn => {
    console.log("✅ Database connected successfully");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Database connection error:", err.message);
  });

module.exports = pool;