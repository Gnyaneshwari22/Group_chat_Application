const { Chat, ArchivedChat } = require("../models");
const { Op } = require("sequelize");

const archiveOldChats = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Step 1: Find all chats older than 1 day
    const oldChats = await Chat.findAll({
      where: {
        createdAt: { [Op.lt]: yesterday },
      },
    });

    if (oldChats.length === 0) {
      console.log("No chats to archive today.");
      return;
    }

    // Step 2: Bulk insert into ArchivedChat
    const archived = oldChats.map((chat) => ({
      message: chat.message,
      userId: chat.userId,
      groupId: chat.groupId,
      isFile: chat.isFile,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }));

    await ArchivedChat.bulkCreate(archived);

    // Step 3: Delete from Chat table
    const ids = oldChats.map((c) => c.id);
    await Chat.destroy({
      where: { id: ids },
    });

    console.log(`Archived ${ids.length} chats successfully.`);
  } catch (err) {
    console.error("Error archiving chats:", err);
  }
};

module.exports = archiveOldChats;
