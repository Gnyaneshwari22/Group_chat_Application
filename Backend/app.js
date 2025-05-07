const express = require("express");
const sequelize = require("./config/db");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

require("dotenv").config();

const app = express();

// Middleware to parse JSON bodies
const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:5500"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
//app.options("*", cors());

app.use(express.json());

// Use user routes
app.use("/user", userRoutes);

// Sync database and start server
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced");
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });
