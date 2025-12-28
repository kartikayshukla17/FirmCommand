import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import axios from 'axios';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const requestPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Browser Notifications Access Granted');
                new Notification('Notifications Enabled', {
                    body: 'You will now receive desktop notifications.',
                    icon: '/vite.svg'
                });
            }
        }
    };

    // 1. Request Browser Permission on Mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            requestPermission();
        }
    }, []);

    // 2. Initialize Socket when User exists
    useEffect(() => {
        if (user) {
            // Updated to port 5001 as per server logs
            const newSocket = io('http://localhost:5001', {
                withCredentials: true,
                transports: ['websocket', 'polling'], // Try websocket first
                reconnectionAttempts: 5
            });

            newSocket.on('connect', () => {
                console.log('Socket Connected Successfully:', newSocket.id);
                // Ensure ID is string to match backend room name
                newSocket.emit('join', String(user._id));
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket Connection Error:', err.message);
            });

            newSocket.on('notification', (notification) => {
                console.log('Socket received notification:', notification);
                handleNewNotification(notification);
            });

            setSocket(newSocket);

            // Fetch existing unread notifications
            fetchNotifications();

            return () => newSocket.disconnect();
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            setNotifications([]);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications');
            setNotifications(res.data);
            const unread = res.data.filter(n => !n.read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Toast
        showToast(notification.title, 'info'); // Using info type for consistency

        // Browser Notification
        console.log('Trying Browser Notification. Permission:', Notification.permission);
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/vite.svg', // Placeholder icon
                requireInteraction: false // Optional: keeps it on screen until user clicks
            });
        }

        // Play sound? (Optional)
    };

    const markAsRead = async (id) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // API Call
            await axios.patch(`/api/notifications/${id}/read`);
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    };

    const clearAll = async () => {
        try {
            // Optimistic update
            setNotifications([]);
            setUnreadCount(0);

            // API Call: Mark all as read
            await axios.patch('/api/notifications/read-all');
        } catch (err) {
            console.error('Failed to clear notifications', err);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, clearAll, requestPermission }}>
            {children}
        </SocketContext.Provider>
    );
};
