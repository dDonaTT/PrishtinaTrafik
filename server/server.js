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
const adminRoutes = require("./routes/adminRoutes");
const inspectorRoutes = require("./routes/inspectorRoutes");
const busRoutes = require("./routes/busRoutes");
const taxiRoutes = require("./routes/taxiRoutes");
const driverRoutes = require("./routes/driverRoutes");

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://prishtina-trafik.vercel.app',
  'https://prishtina-trafik-frontend.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use("/api/webhook", webhookRoutes);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inspector", inspectorRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/taxi", taxiRoutes);
app.use("/api/driver", driverRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

const port = process.env.PORT || 8000;

db.getConnection()
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database error:", err.message));

app.listen(port, () => console.log(`Server running on port ${port}`));