const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  // Get token from cookies
  const token = req.cookies.token;

  console.log("Token from cookies:===============>", token); // Debugging line

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request
    console.log("Decoded token:===============>", decoded); // Debugging line
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authenticate };
