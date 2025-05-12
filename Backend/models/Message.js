const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { Sequelize } = require("sequelize");

const Message = sequelize.define(
  "Message",
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: false,
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "groups",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    tableName: "messages",
  }
);

// Define associations
Message.associate = function (models) {
  Message.belongsTo(models.User, {
    foreignKey: "sender_id",
    as: "sender",
  });
};

module.exports = Message;
