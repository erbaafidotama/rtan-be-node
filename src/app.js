require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_, res) => res.json({ ok: true }));

// Import middleware
const { authenticateToken } = require("./middleware/auth");

// Routes Auth (tidak perlu autentikasi)
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Routes yang memerlukan autentikasi
const userRoutes = require("./routes/users");
const residentRoutes = require("./routes/residents");
const contributionRoutes = require("./routes/contribution");
const billRoutes = require("./routes/bill");
const paymentRoutes = require("./routes/payment");

// Apply authentication middleware to protected routes
app.use("/users", authenticateToken, userRoutes);
app.use("/residents", authenticateToken, residentRoutes);
app.use("/contributions", authenticateToken, contributionRoutes);
app.use("/bills", authenticateToken, billRoutes);
app.use("/payments", authenticateToken, paymentRoutes);

module.exports = app;
