const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const GroupUser = sequelize.define(
  "GroupUser",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
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
    tableName: "group_users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = GroupUser;
