const express = require("express");
const router = express.Router();
const { signup, login, verifyUser } = require("../controllers/userController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify", authenticate, verifyUser); // Verify user token

module.exports = router;
