const mysql = require("mysql2");
const config = require("./env");

const pool = mysql
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

module.exports = pool;
