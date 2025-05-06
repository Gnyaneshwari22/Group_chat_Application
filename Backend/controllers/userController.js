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
      return res.status(409).json({ message: "Email already in use." }); // 409 = Conflict
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
  //   const { email, password } = req.body;
  //   try {
  //     const user = await User.findOne({ where: { email } });
  //     console.log("User from database:", user);
  //     if (!user) {
  //       return res.status(404).json({ message: "User Not Found" });
  //     }
  //     //Decrypting the password(password validation)
  //     const isPasswordValid = await bcrypt.compare(password, user.password);
  //     if (!isPasswordValid) {
  //       return res.status(401).json({ message: "User Not Authorized" });
  //     }
  //     // Generate a JWT
  //     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
  //       expiresIn: "1h",
  //     });
  //     console.log("Token generated", token);
  //     res.status(200).json({
  //       message: "Login successful",
  //       token,
  //       user: {
  //         id: user.id,
  //         username: user.username,
  //         email: user.email,
  //         phone: user.phone,
  //         createdAt: user.created_at,
  //         updatedAt: user.updated_at,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error during login:", error);
  //     res
  //       .status(500)
  //       .json({ message: "Error during login", error: error.message });
  //   }
};

module.exports = { signup, login };
