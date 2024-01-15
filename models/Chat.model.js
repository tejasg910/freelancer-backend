const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'message' },
    isDelete: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('chat', chatSchema);
