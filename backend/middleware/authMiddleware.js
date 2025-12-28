import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password_hash');

            if (!req.user) {
                return next(new ErrorResponse('Not authorized, user not found', 401));
            }

            // Check if token version matches (for remote signout)
            if (req.user.tokenVersion !== undefined && decoded.tokenVersion !== undefined) {
                if (req.user.tokenVersion !== decoded.tokenVersion) {
                    return next(new ErrorResponse('Session expired, please login again', 401));
                }
            }

            next();
        } catch (error) {
            console.error(error);
            return next(new ErrorResponse('Not authorized, token failed', 401));
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const leadOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Lead') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized, Lead access only' });
    }
};
