const express = require("express");
const sequelize = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const archiveOldChats = require("./cron/archiveOldChats");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoutes");

const { initSocket } = require("./socket/socket");

require("dotenv").config();

const app = express();

// Middleware to parse JSON bodies
const allowedOrigins = [
  "http://localhost:5500", // Your frontend origin
  "http://127.0.0.1:5500", // Alternative localhost
  "http://localhost:3000", // Your backend (for testing)
];
app.use(express.static("FrontEnd")); // Assuming your HTML is in a 'public' folder

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );
//app.options("*", cors());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ["set-cookie"], // Needed for some cookie operations
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Use user routes
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use(groupRoutes);

cron.schedule("0 2 * * *", () => {
  console.log("⏰ Running daily archive job...");
  archiveOldChats();
});

// Sync database and start server
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced");
    const server = app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });

    // Initialize Socket.IO
    initSocket(server);
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });
