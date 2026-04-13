const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const walletRoutes = require("./routes/walletRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const rideRoutes = require("./routes/rideRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use("/api/payments", webhookRoutes)
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/bookings", bookingRoutes);
const port = process.env.PORT || 5000;
db.getConnection()
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

app.listen(port, () => console.log(`Server running on port ${port}`));
