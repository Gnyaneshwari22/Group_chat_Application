const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const { authenticate } = require("../middlewares/authMiddleware");
const upload = require("../middleware/fileUpload");
const { uploadFile } = require("../controllers/groupController");

router.post("/groups", authenticate, groupController.createGroup);
router.get("/groups", authenticate, groupController.getUserGroups);
router.post(
  "/groups/:groupId/message",
  authenticate,
  groupController.sendMessageToGroup
);
router.get(
  "/groups/:groupId/messages",
  authenticate,
  groupController.getGroupMessages
);
router.post("/upload", upload.single("file"), uploadFile);

module.exports = router;
