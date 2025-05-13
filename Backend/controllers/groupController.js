const { Group, GroupUser, Message, User } = require("../models");

//Creating group
exports.createGroup = async (req, res) => {
  try {
    const { name, memberIds } = req.body;

    const group = await Group.create({ name });

    await GroupUser.bulkCreate([
      { user_id: req.user.userId, group_id: group.id },
      ...memberIds.map((id) => ({ user_id: id, group_id: group.id })),
    ]);

    res.status(201).json({ success: true, group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Group creation failed" });
  }
};

//Fetching user Groups
exports.getUserGroups = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: { model: Group, as: "groups" },
    });

    res.json({ success: true, groups: user.groups });
  } catch (err) {
    res.status(500).json({ success: false, message: "Unable to fetch groups" });
  }
};

//sending messages in the groups
exports.sendMessageToGroup = async (req, res) => {
  try {
    const { content } = req.body;
    const { groupId } = req.params;

    const message = await Message.create({
      content,
      group_id: groupId,
      sender_id: req.user.userId,
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Message sending failed" });
  }
};

//getting the mesages of the group
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await Message.findAll({
      where: { group_id: groupId },
      include: [{ model: User, as: "sender", attributes: ["username"] }],
      order: [["created_at", "ASC"]],
    });

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Fetching messages failed" });
  }
};
