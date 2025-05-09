const Sequelize = require("sequelize");
const sequelize = require("../config/db"); // ✅ Import the configured instance

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require("./User");
db.Message = require("./Message");

// Call associate methods (if defined)
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;
