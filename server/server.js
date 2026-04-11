const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const port = process.env.PORT || 5000;
db.getConnection()
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

app.listen(port, () => console.log(`Server running on port ${port}`));
