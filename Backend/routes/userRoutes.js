const express = require("express");
const router = express.Router();
const { signup, login, getMe } = require("../controllers/userController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
//router.get("/verify", authenticate, verifyUser); // Verify user token
router.get("/me", getMe);

module.exports = router;
