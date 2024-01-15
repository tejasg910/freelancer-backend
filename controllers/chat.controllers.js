const UserModel = require('../models/User.model');
const ChatModel = require('../models/Chat.model');


const accessChat = async (req, res, next) => {
    try {
        const userSender = req.params.Id;
        const userReceiver = req.body.userId;


        if (!userSender || !userReceiver) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        let isChat = await ChatModel.findOne({
            $or: [
                { sender: userSender, receiver: userReceiver },
                { sender: userReceiver, receiver: userSender },
            ],
        }).populate("sender", "fullName email profilePic ")
            .populate("receiver", "fullName email profilePic ")
            .populate("latestMessage", " content isReady createdAt");


        isChat = await UserModel.populate(isChat, {
            path: "latestMessage",
            select: "fullName email",
        });

        if (isChat) {
            if (isChat.sender == userSender) {
                return res.status(200).json({ message: "Chat successfully", chat: isChat });
            }

            const swap = {
                sender: userSender,
                receiver: userReceiver,
            };

            const swapUser = await ChatModel.findOneAndUpdate(
                { _id: isChat._id },
                { $set: swap },
                { new: true }
            ).populate("sender", "fullName email profilePic")
                .populate("receiver", "fullName email profilePic")


            return res.status(200).json({ message: "Chat successfully", chat: swapUser });
        } else {
            if (userSender !== userReceiver) {

                const chatData = {
                    sender: userSender,
                    receiver: userReceiver,
                };

                const createChat = await ChatModel.create(chatData);

                const fullChat = await ChatModel.findOne({ _id: createChat._id })
                    .populate("sender", "fullName email profilePic")
                    .populate("receiver", "fullName email profilePic")

                return res.status(201).json({ message: "Chat successfully created", chat: fullChat });
            }
            return res.status(400).json({ message: "can't create chat with same persone" })
        }

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}


const fetchChats = async (req, res) => {
    try {

        const senderId = req.params.Id;

        const getAllChats = await ChatModel.find({
            $or: [
                { sender: senderId },
                { receiver: senderId }
            ]
        })
            .populate({
                path: "latestMessage",
                select: "content isReady createdAt"
            })
            .populate({
                path: "sender",
                select: "fullName profilePic email"
            })
            .populate({
                path: "receiver",
                select: "fullName profilePic email"
            })




        const transformedChats = getAllChats.map(chat => {
            const { _id, latestMessage, createdAt } = chat;
            const { receiver, sender } = chat;

            // Identify the other user's information based on the senderId
            const otherUser = sender._id.equals(senderId) ? receiver : sender;

            return {
                _id,
                latestMessage,
                sender,
                timestamp: createdAt,
                receiver: {
                    _id: otherUser._id,
                    fullName: otherUser.fullName,
                    // firstName: otherUser.firstName,
                    // lastName: otherUser.lastName,
                    profilePic: otherUser.profilePic,
                    email: otherUser.email
                }
            };
        });

        return res.status(200).json({ messages: "success", chats: transformedChats });



    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = { accessChat, fetchChats }
