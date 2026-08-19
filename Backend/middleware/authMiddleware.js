const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const authMiddleware = async (req, res, next) => {
  try {
    // Get JWT from HttpOnly cookie
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: "Authentication required.",
      });
    }

    try {
      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user information to request
      req.user = decoded;
      
      next();
    } catch (error) {
      console.error("JWT verification error:", error.message);

      // If token expired, clear it from the database and clear the cookie
      if (error.name === "TokenExpiredError") {
        const decoded = jwt.decode(token);
        if (decoded && decoded.userId) {
          await User.findByIdAndUpdate(decoded.userId, { token: null });
        }
      }

      // Clear the expired cookie from the browser
      res.clearCookie("accessToken");

      return res.status(401).json({
        status: 401,
        message: "Token expired or invalid.",
      });
    }
  } catch (error) {
    console.error("Middleware error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
};

module.exports = authMiddleware;