import User from '../models/userModel.js';

export const getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;

        const searchQuery = search ? search : '';

        const users = await User.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ],
            $and: [
                { _id: { $ne: req.userId } }
            ]
        }).lean().exec();

        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}