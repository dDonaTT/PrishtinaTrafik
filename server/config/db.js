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
      keepAliveInitialDelay: 0,
      connectTimeout: 60000,  
      acquireTimeout: 60000,
      timeout: 60000
    })
    .promise();
} 
else if (process.env.MYSQLHOST) {
  console.log("Connecting to Railway MySQL via individual variables");
  console.log(`Host: ${process.env.MYSQLHOST}, Port: ${process.env.MYSQLPORT}`);
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
      keepAliveInitialDelay: 0,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000
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

const testConnection = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log("✅ Database connected successfully");
      connection.release();
      return;
    } catch (err) {
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i === retries - 1) {
        console.error("💡 Make sure the database is running and accessible");
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

testConnection();

pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message);
});

module.exports = pool;