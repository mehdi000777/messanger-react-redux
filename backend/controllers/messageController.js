import Message from '../models/MessageModel.js';
import Chat from '../models/chatModel.js';


export const sendMessage = async (req, res) => {
    try {
        const { content, chatId } = req.body;

        if (!content || !chatId) res.status(400).json({ message: 'All fields requierd' });

        const newMessage = new Message({
            content,
            sender: req.userId,
            chat: chatId
        })

        const createdMessage = await newMessage.save();

        let fullMessage = await createdMessage.populate('sender', '-password');
        fullMessage = await createdMessage.populate({
            path: 'chat',
            select: '',
            populate: {
                path: 'users',
                select: '-password'
            }
        })

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: newMessage._id
        })

        res.status(201).json(fullMessage);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        const messages = await Message.find({ chat: chatId })
            .populate('sender', '-password')
            .populate({
                path: 'chat',
                select: '',
                populate: {
                    path: 'users',
                    select: '-password'
                }
            }).lean().exec();

        res.status(200).json(messages);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}