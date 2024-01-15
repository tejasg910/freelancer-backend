const chatModel = require('../models/Chat.model');
const MessageModel = require('../models/Message.model');




const allMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        if (!chatId) {
            console.log("Invalid data passed into request");
            return res.sendStatus(400);
        }

        const messages = await MessageModel.find({ chat: chatId })
            .populate("sender", "fullName profilePic email")
            .populate("receiver", "fullName profilePic email")
            .populate("latestMessage", "content")
            .populate("chat")

        return res.status(200).json({ messages: "success", chat: messages });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};



const sendMessage = async (req, res) => {
    try {
        const senderId = req.params.Id;
        const { content, chatId } = req.body;

        if (!content || !chatId || !senderId) {
            console.log("Invalid data passed into request");
            return res.status(400).json({ message: "Invalid data passed into request" });
        }

        const findReceiver = await chatModel.findOne({ _id: chatId, sender: senderId });


        if (findReceiver) {
            let newMessage = {
                sender: senderId,
                content: content,
                chat: chatId,
                receiver: findReceiver.receiver
            };

            const createMessage = await MessageModel.create(newMessage)
            let sendMessage = await MessageModel.findOne({ _id: createMessage._id })
                .populate("sender", "fullName email profilePic ")
                .populate("receiver", "fullName email profilePic ")
                .populate("chat")

            await chatModel.findByIdAndUpdate(req.body.chatId, { latestMessage: sendMessage });

            return res.status(200).send({ message: "Message created", chat: sendMessage });
        }

        return res.status(400).json({ message: "Message not created" });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = { allMessages, sendMessage };
