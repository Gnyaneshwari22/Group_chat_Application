const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Group = sequelize.define(
  "Group",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "groups",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Group;
