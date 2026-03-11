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
            <button
                onClick={toggleDropdown}
                className="relative p-2 rounded-lg transition-all"
                style={{
                    color: 'var(--fc-text-muted)',
                    background: 'none',
                    border: '1px solid transparent',
                    cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--fc-purple)';
                    e.currentTarget.style.background = 'var(--fc-purple-dim)';
                    e.currentTarget.style.borderColor = 'rgba(140,114,219,0.25)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--fc-text-muted)';
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.borderColor = 'transparent';
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold flex items-center justify-center rounded-full"
                        style={{ background: 'var(--fc-danger)', color: '#fff', border: '2px solid var(--fc-bg-raised)' }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl overflow-hidden z-50"
                            style={{
                                background: 'var(--fc-bg-raised)',
                                border: '1px solid var(--fc-border)',
                                boxShadow: 'var(--fc-shadow-lg)',
                            }}
                        >
                            <div className="p-4 flex justify-between items-center"
                                style={{ borderBottom: '1px solid var(--fc-border)', background: 'var(--fc-bg-surface)' }}>
                                <div className="flex items-center gap-2">
                                    <h3 className="fc-heading" style={{ fontWeight: 600, color: 'var(--fc-text-primary)', fontSize: '1rem' }}>Notifications</h3>
                                    <div className="w-2 h-2 rounded-full" style={{ background: useSocket().socket?.connected ? 'var(--fc-green)' : 'var(--fc-danger)' }}
                                        title={useSocket().socket?.connected ? 'Connected' : 'Disconnected'} />
                                </div>
                                <div className="flex gap-2">
                                    {Notification.permission !== 'granted' && (
                                        <button onClick={requestPermission}
                                            style={{ fontSize: '0.75rem', color: 'var(--fc-purple)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                                            className="hover:opacity-80 transition-opacity">
                                            Enable Desktop
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button onClick={clearAll}
                                            style={{ fontSize: '0.75rem', color: 'var(--fc-text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
                                            className="hover:opacity-80 transition-opacity">
                                            Clear all
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Bell size={32} className="mx-auto mb-2" style={{ color: 'var(--fc-text-dim)', opacity: 0.3 }} />
                                        <p style={{ fontSize: '0.875rem', color: 'var(--fc-text-dim)' }}>No new notifications</p>
                                    </div>
                                ) : (
                                    <div>
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification._id || Math.random()}
                                                className="p-4 transition-colors relative group"
                                                style={{
                                                    borderBottom: '1px solid var(--fc-border-subtle)',
                                                    background: !notification.read ? 'var(--fc-purple-dim)' : 'transparent',
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--fc-bg-hover)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = !notification.read ? 'var(--fc-purple-dim)' : 'transparent'; }}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                                                        style={{ background: !notification.read ? 'var(--fc-purple)' : 'var(--fc-text-dim)' }} />
                                                    <div className="flex-1">
                                                        <h4 style={{ fontSize: '0.875rem', fontWeight: 500, color: !notification.read ? 'var(--fc-text-primary)' : 'var(--fc-text-secondary)' }}>
                                                            {notification.title}
                                                        </h4>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--fc-text-muted)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                                                            {notification.message}
                                                        </p>
                                                        <span style={{ fontSize: '0.625rem', color: 'var(--fc-text-dim)', marginTop: '0.5rem', display: 'block' }}>
                                                            Just now
                                                        </span>
                                                    </div>
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification._id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
                                                            style={{ color: 'var(--fc-text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
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
