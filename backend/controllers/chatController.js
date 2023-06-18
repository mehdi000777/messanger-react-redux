import Chat from '../models/chatModel.js';


export const accessChat = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) return res.status(400).json({ message: 'userId requierd' });

        const chat = await Chat.findOne({
            isGroup: false,
            $and: [
                { users: { $elemMatch: { $eq: req.userId } } },
                { users: { $elemMatch: { $eq: userId } } }
            ]
        }).populate('users', '-password').populate({
            path: 'latestMessage',
            select: '',
            populate: {
                path: 'sender',
                select: '-password'
            }
        }).lean().exec();

        if (chat) return res.status(200).json(chat);

        const newChat = new Chat({
            users: [
                req.userId,
                userId
            ]
        })

        const createdChat = await newChat.save();

        const fullChat = await createdChat.populate('users', '-password');

        res.status(201).json(fullChat);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            users: { $elemMatch: { $eq: req.userId } }
        })
            .populate('users', '-password')
            .populate({
                path: 'latestMessage',
                select: '',
                populate: {
                    path: 'sender',
                    select: '-password'
                }
            })
            .populate('groupAdmin', '-password')
            .sort({ updatedAt: -1 })

        res.status(200).json(chats);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const createGroupCaht = async (req, res) => {
    try {
        const { name, users } = req.body;

        if (!name || !users) return res.status(400).json({ message: 'All fields requierd' });

        if (users.length < 2) return res.status(400).json({ message: 'Not enough members' });

        const newChat = new Chat({
            name,
            users: [
                ...users,
                req.userId
            ],
            isGroup: true,
            groupAdmin: req.userId
        })

        const createdChat = await newChat.save();

        const fullChat = await createdChat.populate('users groupAdmin', '-password');

        res.status(201).json(fullChat);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const renameGroup = async (req, res) => {
    try {
        const { name, chatId } = req.body;

        const updatedChat = await Chat.findByIdAndUpdate(chatId, { name }, { new: true })
            .populate('users groupAdmin', '-password')

        if (!updatedChat) return res.status(400).json({ message: 'Chat Not Found.' });

        res.status(200).json(updatedChat)

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const removeFromGroup = async (req, res) => {
    try {
        const { userId, chatId } = req.body;

        if (!userId) return res.status(400).json({ message: 'Add a user' });

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {
                $pull: { users: userId }
            },
            { new: true }
        ).populate('users groupAdmin', '-password');

        if (!updatedChat) return res.status(400).json({ message: 'Chat Not Found.' });

        res.status(200).json(updatedChat);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const addToGroup = async (req, res) => {
    try {
        const { userId, chatId } = req.body;

        if (!userId) return res.status(400).json({ message: 'Add a user' });

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {
                $push: { users: userId }
            },
            { new: true }
        ).populate('users groupAdmin', '-password');

        if (!updatedChat) return res.status(400).json({ message: 'Chat Not Found.' });

        res.status(200).json(updatedChat);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}