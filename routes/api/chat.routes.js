const express = require('express');
const router = express.Router({ mergeParams: true });

const { accessChat, fetchChats } = require('../../controllers/chat.controllers')

router.post('/accessChat/:Id', accessChat),
router.get('/fetchChats/:Id', fetchChats),

module.exports = router;
