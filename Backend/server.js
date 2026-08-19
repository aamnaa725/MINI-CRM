const authMiddleware = require("./middleware/authMiddleware");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");

const app = express();

// ======================================================
// ENVIRONMENT VARIABLES
// ======================================================

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

// ======================================================
// CHECK REQUIRED ENV VARIABLES
// ======================================================

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing from .env");
  process.exit(1);
}

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174"
];

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// ======================================================
// BODY PARSER
// ======================================================

app.use(express.json());

// ======================================================
// COOKIE PARSER
// ======================================================

app.use(cookieParser());

// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Mini CRM backend is running.",
  });
});

// ======================================================
// AUTH ROUTES
// ======================================================

app.use("/auth", authRouter);

// ======================================================
// USER ROUTES
// ======================================================

app.use(
  "/users",
  authMiddleware,
  userRouter
);

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "Route not found.",
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);

  res.status(500).json({
    status: 500,
    message: "Internal server error.",
  });
});

// ======================================================
// CONNECT MONGODB THEN START SERVER
// ======================================================

const startServer = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Frontend allowed: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);

    process.exit(1);
  }
};

startServer();