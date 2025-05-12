const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authenticate } = require("../middlewares/authMiddleware");

// Protected routes
router.post("/message", authenticate, chatController.postMessage);
router.get("/messages", authenticate, chatController.getMessages);
router.get("/users", authenticate, chatController.getAllUsers);
// Add this with your other chat routes
router.post("/logout", authenticate, chatController.logout);

module.exports = router;
