const jwt = require("jsonwebtoken");

// ✅ Verify JWT from either cookie OR Authorization header
const verifyToken = (req, res, next) => {
  try {
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "❌ You must be logged in. No token provided." });
    }

    // ✅ Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info safely
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || "user",
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res
      .status(401)
      .json({ message: "❌ Invalid or expired token. Please log in again." });
  }
};

// ✅ Restrict access to Admins only
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "❌ Not authenticated." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "❌ Access Denied. Admins only." });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
