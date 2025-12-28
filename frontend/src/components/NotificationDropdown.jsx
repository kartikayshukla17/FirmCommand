import { useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead, clearAll, requestPermission } = useSocket();
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDropdown}
                className="relative p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-zinc-900">
                        {unreadCount}
                    </span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/95 backdrop-blur">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-white">Notifications</h3>
                                    {/* Connection Status Indicator */}
                                    <div className={`w-2 h-2 rounded-full ${useSocket().socket?.connected ? 'bg-green-500' : 'bg-red-500'}`} title={useSocket().socket?.connected ? 'Connected' : 'Disconnected'} />
                                </div>
                                <div className="flex gap-2">
                                    {Notification.permission !== 'granted' && (
                                        <button
                                            onClick={requestPermission}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                                        >
                                            Enable Desktop
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={clearAll}
                                            className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500">
                                        <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No new notifications</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-zinc-800/50">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification._id || Math.random()}
                                                className={`p-4 hover:bg-zinc-800/50 transition-colors relative group ${!notification.read ? 'bg-zinc-800/20' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-indigo-500' : 'bg-zinc-600'}`} />
                                                    <div className="flex-1">
                                                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-zinc-400'}`}>
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                                            {notification.message}
                                                        </p>
                                                        <span className="text-[10px] text-zinc-600 mt-2 block">
                                                            Just now
                                                        </span>
                                                    </div>
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification._id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded transition-all text-zinc-400 hover:text-green-400"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
