const User = require("../models/User");
const Message = require("../models/Message");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    // Notify all users about new connection
    socket.broadcast.emit("user-connected", {
      userId: socket.user.id,
      username: socket.user.username,
    });

    // Join the user to a room (for private chats if needed later)
    socket.join(socket.user.id);

    // Handle sending messages
    socket.on("send-message", async (message) => {
      try {
        // Save message to database
        const newMessage = await Message.create({
          content: message.content,
          sender_id: socket.user.id,
        });

        // Broadcast the message to all connected clients
        io.emit("new-message", {
          id: newMessage.id,
          content: newMessage.content,
          sender: {
            id: socket.user.id,
            username: socket.user.username,
          },
          timestamp: newMessage.created_at,
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.username}`);
      io.emit("user-disconnected", {
        userId: socket.user.id,
        username: socket.user.username,
      });
    });
  });
};
