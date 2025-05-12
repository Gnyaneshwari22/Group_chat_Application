const { User, Message } = require("../models");
const { Op } = require("sequelize");

exports.postMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const sender_id = req.user.userId; // Make sure this is coming from your auth middleware

    if (!content) {
      return res.status(400).json({ error: "Message content is required" });
    }

    // Debug log to check the sender_id
    console.log("Creating message with sender_id:", sender_id);

    const message = await Message.create({
      content,
      sender_id, // Make sure this is not null
    });

    // Include sender details in the response
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username"],
        },
      ],
    });

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error("Error posting message:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.errors
        ? error.errors.map((e) => e.message)
        : error.message,
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const lastMessageId = parseInt(req.query.lastMessageId) || 0;

    const messages = await Message.findAll({
      where: {
        id: { [Op.gt]: lastMessageId },
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // In your getAllUsers controller
    const users = await User.findAll({
      where: { status: "online" },
      attributes: ["id", "username"],
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.logout = async (req, res) => {
  try {
    // Mark user as offline in DB
    await User.update(
      { status: "offline" },
      { where: { id: req.user.userId } }
    );

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
