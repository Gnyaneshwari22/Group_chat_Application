const User = require("./User");
const Message = require("./Message");
const Group = require("./Group");
const GroupUser = require("./GroupUser");

// User <-> Message
User.hasMany(Message, { foreignKey: "sender_id", as: "messages" });
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });

// Group <-> User (many-to-many)
User.belongsToMany(Group, {
  through: GroupUser,
  foreignKey: "user_id",
  as: "groups",
});

Group.belongsToMany(User, {
  through: GroupUser,
  foreignKey: "group_id",
  as: "members",
});

// Group <-> Message (one-to-many)
Group.hasMany(Message, { foreignKey: "group_id", as: "messages" });
Message.belongsTo(Group, { foreignKey: "group_id", as: "group" });

module.exports = {
  User,
  Message,
  Group,
  GroupUser,
};
