import jwt from 'jsonwebtoken';

const authorization = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unathorized' });

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decode) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });

        req.userId = decode.id;

        next();
    })
}

export default authorization;