require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/auth", authRouter);
app.use("/users", userRouter);

// Health check
app.get("/status", (req, res) => {
  res.json({
    status: "Online",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

// Start server
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "mini-crm",
    });

    console.log("✅ Connected successfully to MongoDB");

    app.listen(PORT, () => {
      console.log(
        `🚀 Server is running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "❌ Database connection failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();