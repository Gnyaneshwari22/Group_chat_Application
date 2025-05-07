const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { username, email, password, phone } = req.body;

  // Input validation
  if (!username || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if user exists (optimized query)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists, Please Login" }); // 409 = Conflict
    }

    // Hash password (with salt rounds)
    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security

    // Create user (transaction-safe)
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phone,
    });

    // Omit sensitive data in response
    const { password: _, ...userData } = user.get({ plain: true });

    return res.status(201).json({
      message: "User registered successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : null, // Hide details in production
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    // Respond with success (omit sensitive data)
    const { password: _, ...userData } = user.get({ plain: true });
    res.status(200).json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { signup, login };
