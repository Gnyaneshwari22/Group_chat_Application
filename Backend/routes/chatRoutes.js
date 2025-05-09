const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authenticate } = require("../middlewares/authMiddleware");

//post message
router.post("/postmessages", authenticate, chatController.postMessage);

// Get all online users
//router.get("/online-users", authenticate, chatController.getOnlineUsers);

// Get chat history
router.get("/getmessages", authenticate, chatController.getMessages);

module.exports = router;
