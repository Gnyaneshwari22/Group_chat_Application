const socketIO = require("socket.io");
const { authenticateSocket } = require("../middlewares/socketAuth");

let io;

//initiating the socket
const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: ["http://localhost:3000", "http://127.0.0.1:5500"],
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  require("./socketHandlers")(io);

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };
