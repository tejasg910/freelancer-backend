const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'chat' },
    content: { type: String, trim: true },
    isRead: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('message', messageSchema);