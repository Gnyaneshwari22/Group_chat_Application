const { Message, User } = require("../models");

const { getIO } = require("../socket/socket");

const chatController = {
  getOnlineUsers: async (req, res) => {
    try {
      const io = getIO();
      const sockets = await io.fetchSockets();

      const onlineUserIds = sockets.map((socket) => socket.user.id);
      const onlineUsers = await User.findAll({
        where: { id: onlineUserIds },
        attributes: ["id", "username", "email"],
      });

      res.json(onlineUsers);
    } catch (error) {
      console.error("Error fetching online users:", error);
      res.status(500).json({ message: "Error fetching online users" });
    }
  },

  getMessages: async (req, res) => {
    try {
      const messages = await Message.findAll({
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "username"],
          },
        ],
        order: [["created_at", "ASC"]],
        limit: 50, // Get last 50 messages
      });

      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Error fetching messages" });
    }
  },

  // controllers/chatController.js

  // controllers/chatController.js

  postMessage: async (req, res) => {
    try {
      const { content } = req.body;
      const senderId = req.user.id;

      if (!content) {
        return res.status(400).json({ error: "Message content is required." });
      }

      const newMessage = await Message.create({
        content,
        senderId,
      });

      // Include sender info for UI
      const messageWithSender = await Message.findByPk(newMessage.id, {
        include: [{ model: User, attributes: ["id", "username"] }],
      });

      // Emit message to all clients (no group room needed)
      req.app.get("io").emit("new-message", messageWithSender);

      res.status(201).json(messageWithSender);
    } catch (error) {
      console.error("Error posting message:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
};

module.exports = chatController;
