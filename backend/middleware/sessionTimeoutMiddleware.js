const jwt = require("jsonwebtoken");
const User = require("../models/user");

function sessionTimeoutMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token has expired (JWT handles this automatically)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ error: "Token expired" });
    }

    // For admin and subadmin, no additional timeout check needed
    if (decoded.role === "admin" || decoded.role === "subadmin") {
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      return next();
    }

    // For regular users, check if token was issued more than 2 minutes ago
    const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const tenMinutesInMs = 2 * 60 * 1000; // 2 minutes in milliseconds (for testing)

    if (currentTime - tokenIssuedAt > tenMinutesInMs) {
      return res.status(401).json({ 
        error: "Session expired", 
        message: "Your session has expired. Please log in again.",
        sessionExpired: true 
      });
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = sessionTimeoutMiddleware; 