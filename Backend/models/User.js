const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { Sequelize } = require("sequelize");

const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
      onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    timestamps: true, // Ensures Sequelize manages createdAt and updatedAt.
    createdAt: "created_at", // Maps Sequelize's createdAt to created_at
    updatedAt: "updated_at",
  }
);

// Add associations
User.associate = function (models) {
  User.hasMany(models.Message, {
    foreignKey: "sender_id",
    as: "messages",
  });
};

module.exports = User;
