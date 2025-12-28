import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Join a room based on user ID for private notifications
        socket.on('join', (userId) => {
            if (userId) {
                const room = String(userId);
                socket.join(room);
                console.log(`Socket ${socket.id} joined room: ${room}`);
            } else {
                console.log(`Socket ${socket.id} tried to join with invalid ID:`, userId);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Utility to send notification to a specific user
export const sendNotification = async (userId, title, message, type = 'info', data = {}) => {
    try {
        const ioInstance = getIO();

        // Save to Database
        const Notification = (await import('../models/Notification.js')).default;
        const notification = await Notification.create({
            user: userId,
            title,
            message,
            type,
            data,
            read: false
        });

        // Emit real-time event
        ioInstance.to(userId.toString()).emit('notification', notification);

        return notification;
    } catch (error) {
        console.error('Notification Error:', error);
    }
};
