import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // Debug Logs
    console.log('--- Auth Middleware Debug ---');
    console.log('Cookies:', req.cookies);
    // console.log('Headers:', req.headers); // Too verbose, maybe just authorization
    if (req.headers.authorization) console.log('Auth Header:', req.headers.authorization);

    if (req.cookies.token) {
        token = req.cookies.token;
        console.log('Token found in cookies');
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
        console.log('Token found in headers');
    }

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified, decoded:', decoded);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password_hash');

            if (!req.user) {
                console.log('User not found in DB for ID:', decoded.id);
                return next(new ErrorResponse('Not authorized, user not found', 401));
            }

            // Check if token version matches (for remote signout)
            if (req.user.tokenVersion !== undefined && decoded.tokenVersion !== undefined) {
                if (req.user.tokenVersion !== decoded.tokenVersion) {
                    console.log('Token version mismatch');
                    return next(new ErrorResponse('Session expired, please login again', 401));
                }
            }

            console.log('User authorized:', req.user.username);
            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return next(new ErrorResponse('Not authorized, token failed', 401));
        }
    } else {
        console.log('No token found');
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
