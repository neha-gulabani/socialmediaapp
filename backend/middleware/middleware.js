
const jwt = require('jsonwebtoken');
const User = require('../model/user');

const middleware = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            console.log('1', req.headers.authorization.split(' ')[1])
            token = req.headers.authorization.split(' ')[1];
            console.log('2', token)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('3')

            req.user = await User.findById(decoded.id).select('-password');
            console.log('User in Middleware:', req.user);

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = middleware;
