const express = require('express');
const router = express.Router({ mergeParams: true });

const { allMessages,sendMessage } = require('../../controllers/message.controller')

router.get("/:chatId", allMessages);
router.post("/sendmessage/:Id", sendMessage);

module.exports = router;
