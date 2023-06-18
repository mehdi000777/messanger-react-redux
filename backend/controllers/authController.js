import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: 'All fields required' });

        const user = await User.findOne({ email }).lean().exec();
        if (!user) return res.status(401).json({ message: 'Unathorized' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'email or password wrong' });

        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('refresh', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 7 * 60 * 60 * 24 * 1000
        })

        res.status(200).json({
            message: 'Login Success',
            token: accessToken,
            user: {
                ...user,
                password: ''
            }
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const register = async (req, res) => {
    try {
        const { name, email, password, image } = req.body;

        if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

        const user = await User.findOne({ email }).lean().exec();
        if (user) return res.status(400).json({ message: 'Duplicate email' });

        const hasPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            name,
            email,
            password: hasPassword,
            image
        })

        const accessToken = jwt.sign({ id: newUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: newUser._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('refresh', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 7 * 60 * 60 * 24 * 1000
        })

        await newUser.save();

        res.status(201).json({
            message: 'Register Success',
            token: accessToken,
            user: {
                ...newUser._doc,
                password: ''
            }
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const refresh = async (req, res) => {
    try {
        const cookies = req.cookies;

        if (!cookies?.refresh) return res.status(401).json({ message: 'Unauthorized' });

        const refresh = cookies?.refresh;

        jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET, async (err, decode) => {
            if (err) return res.status(403).json({ message: 'Forbidden' });

            const user = await User.findById(decode.id, { password: false }).lean().exec();
            if (!user) return res.status(401).json({ message: 'Unathorized' });

            const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

            res.status(200).json({
                user,
                token: accessToken
            })
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        const cookies = req.cookies;

        if (!cookies?.refresh) return res.status(204);

        res.clearCookie('refresh', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
        })

        res.status(200).json({ message: 'Logout Success' });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}