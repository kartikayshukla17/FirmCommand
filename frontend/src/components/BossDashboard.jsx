import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Activity, Users, ClipboardList, CheckCircle, Clock, AlertCircle, Plus,
    Search, Filter, MoreVertical, LogOut, ChevronDown, UserPlus, Trash2, Eye,
    FileText, XCircle, ChevronRight, Briefcase, Building, Upload, Download, EyeOff, Key, Copy, Bell, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ExitOrgModal from './ExitOrgModal';
import NotificationDropdown from './NotificationDropdown';
import JoinOrgScreen from './JoinOrgScreen';


const LeadDashboard = () => {
    const { logout } = useAuth();
    const { showToast } = useToast();
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    // const [builders, setBuilders] = useState([]);
    const [requests, setRequests] = useState([]);
    const [exitRequests, setExitRequests] = useState([]);
    const { user, checkUser } = useAuth(); // Get current user for Org Code

    // Modal states
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRequestsDropdown, setShowRequestsDropdown] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    // Form states
    const [userForm, setUserForm] = useState({
        username: '', email: '', password: '', role: 'Associate'
    });
    const [taskForm, setTaskForm] = useState({
        title: '', description: '', type: 'Custom', assigned_to: '',
        builder: '', property_type: '', category: '', sector: ''
    });
    const [editForm, setEditForm] = useState({
        title: '', description: '', type: 'Custom', assigned_to: '',
        builder: '', property_type: '', category: '', sector: ''
    });

    useEffect(() => {
        if (user && user.organization) {
            fetchTasks();
            fetchUsers();
            fetchRequests();
            fetchExitRequests();
        }
    }, [user]);

    // If user has no organization (Free Agent / Recent Exit)
    if (user && !user.organization) {
        return <JoinOrgScreen />;
    }

    const fetchRequests = async () => {
        try {
            const res = await axios.get('/api/organization/requests');
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch requests:', err);
        }
    };

    const fetchExitRequests = async () => {
        try {
            const res = await axios.get('/api/organization/exit-requests');
            setExitRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch exit requests:', err);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await axios.get('/api/tasks');
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/auth/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    /*
    const fetchBuilders = async () => {
        try {
            const res = await axios.get('/api/tasks/builders/list');
            setBuilders(res.data);
        } catch (err) {
            console.error('Builders not seeded yet');
        }
    };
    */

    const handleRegisterUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/organization/users', userForm);
            showToast('User registered successfully!', 'success');
            setShowRegisterModal(false);
            setUserForm({ username: '', email: '', password: '', role: 'Associate' });
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.message || 'Registration failed', 'error');
        }
    };

    const handleApproveRequest = async (id) => {
        try {
            await axios.post(`/api/organization/requests/${id}/approve`);
            showToast('User approved!', 'success');
            fetchRequests();
            fetchUsers();
        } catch (err) {
            showToast('Approval failed', 'error');
        }
    };

    const handleRejectRequest = async (id) => {
        try {
            if (!window.confirm('Reject this user request?')) return;
            await axios.post(`/api/organization/requests/${id}/reject`);
            showToast('Request rejected', 'success');
            fetchRequests();
        } catch (err) {
            showToast('Rejection failed', 'error');
        }
    };

    const handleExitDecision = async (id, status) => {
        try {
            await axios.put(`/api/organization/exit-requests/${id}/decide`, { status });
            showToast(`Exit request ${status}`, 'success');
            fetchExitRequests();
            fetchUsers(); // User list changes if approved
            fetchTasks(); // Task assignments change
        } catch (err) {
            showToast('Action failed', 'error');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: taskForm.title,
                description: taskForm.description,
                type: taskForm.type,
                assigned_to: taskForm.assigned_to,
                property_filters: {
                    builder: taskForm.builder,
                    property_type: taskForm.property_type,
                    category: taskForm.category,
                    sector: taskForm.sector
                }
            };
            await axios.post('/api/tasks', payload);
            showToast('Task created successfully!', 'success');
            setShowTaskModal(false);
            setTaskForm({
                title: '', description: '', type: 'Custom', assigned_to: '',
                builder: '', property_type: '', category: '', sector: ''
            });
            fetchTasks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Task creation failed', 'error');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: editForm.title,
                description: editForm.description,
                type: editForm.type,
                assigned_to: editForm.assigned_to,
                property_filters: {
                    builder: editForm.builder,
                    property_type: editForm.property_type,
                    category: editForm.category,
                    sector: editForm.sector
                }
            };
            await axios.patch(`/api/tasks/${selectedTask._id}`, payload);
            showToast('Task updated successfully!', 'success');
            setIsEditing(false);
            setShowDetailModal(false);
            fetchTasks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Update failed', 'error');
        }
    };

    const handleReview = async (taskId, decision, reason = '') => {
        try {
            await axios.patch(`/api/tasks/${taskId}/review`, { decision, reason });
            showToast(`Task ${decision}d successfully!`, 'success');
            setShowDetailModal(false);
            fetchTasks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Review failed', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await axios.delete(`/api/auth/users/${userId}`);
            showToast('User deleted successfully', 'success');
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete user', 'error');
        }
    };

    const openTaskDetail = (task) => {
        setSelectedTask(task);
        setIsEditing(false);
        // Pre-fill edit form
        setEditForm({
            title: task.title,
            description: task.description,
            type: task.type,
            assigned_to: task.assigned_to?._id || '',
            builder: task.property_filters?.builder || '',
            property_type: task.property_filters?.property_type || '',
            category: task.property_filters?.category || '',
            sector: task.property_filters?.sector || ''
        });
        setShowDetailModal(true);
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(t => t.status === status);
    };

    const bosses = users.filter(u => u.role === 'Lead' && u.status === 'Active');
    const workers = users.filter(u => u.role === 'Associate' && u.status === 'Active');

    const statusColumns = [
        { title: 'Pending', status: 'Pending', color: 'amber', icon: Clock },
        { title: 'In Progress', status: 'In Progress', color: 'blue', icon: FileText },
        { title: 'Under Review', status: 'Under Review', color: 'purple', icon: Eye },
        { title: 'Completed', status: 'Completed', color: 'green', icon: CheckCircle },
        { title: 'Rejected', status: 'Rejected', color: 'red', icon: XCircle },
    ];

    const colorVariants = {
        amber: {
            light: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
            dark: 'dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20 dark:ring-amber-500/20 dark:bg-none'
        },
        blue: {
            light: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white',
            dark: 'dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/20 dark:ring-blue-500/20 dark:bg-none'
        },
        purple: {
            light: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white',
            dark: 'dark:bg-purple-500/10 dark:text-purple-200 dark:border-purple-500/20 dark:ring-purple-500/20 dark:bg-none'
        },
        green: {
            light: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
            dark: 'dark:bg-green-500/10 dark:text-green-200 dark:border-green-500/20 dark:ring-green-500/20 dark:bg-none'
        },
        red: {
            light: 'bg-gradient-to-r from-red-400 to-rose-500 text-white',
            dark: 'dark:bg-red-500/10 dark:text-red-200 dark:border-red-500/20 dark:ring-red-500/20 dark:bg-none'
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                                {user?.orgName || 'Lead Dashboard'}
                            </h1>
                            <div className="flex items-center gap-3 mt-1 ml-4">
                                <p className="text-xs text-zinc-500 font-medium tracking-wider">
                                    Welcome, <span className="text-indigo-400 font-bold">{user?.username}</span>
                                </p>
                                <span className="text-zinc-700">•</span>
                                <div className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 flex items-center gap-2" title="Share this code for users to join">
                                    <Key size={12} className="text-zinc-400" />
                                    <span className="text-xs font-mono font-bold text-indigo-400 tracking-wider">
                                        {user?.orgCode || 'UNKNOWN'}
                                    </span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(user?.orgCode);
                                            showToast('Org Code copied!', 'success');
                                        }}
                                        className="text-zinc-500 hover:text-white"
                                    >
                                        <Copy size={12} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                        <div className="flex gap-3 relative flex-wrap justify-center sm:justify-end mt-4 md:mt-0">
                            {/* Notification Dropdown */}
                            <NotificationDropdown />

                            {/* Requests Dropdown */}
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowRequestsDropdown(!showRequestsDropdown)}
                                    className="relative bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm font-medium"
                                >
                                    <Bell size={16} />
                                    Requests
                                    {requests.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-zinc-900">
                                            {requests.length}
                                        </span>
                                    )}
                                </motion.button>

                                <AnimatePresence>
                                    {showRequestsDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                                                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                                                    Pending Requests
                                                    <span className="text-xs font-normal text-zinc-500">{requests.length + exitRequests.length} pending</span>
                                                </h3>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                                                {requests.length === 0 && exitRequests.length === 0 ? (
                                                    <div className="p-8 text-center text-zinc-500 text-xs">
                                                        No pending requests
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-zinc-800">
                                                        {/* Join Requests */}
                                                        {requests.length > 0 && (
                                                            <>
                                                                <div className="px-4 py-2 bg-zinc-800/30 text-xs font-bold text-indigo-400 uppercase tracking-wider">Join Requests</div>
                                                                {requests.map(req => (
                                                                    <div key={req._id} className="p-4 hover:bg-zinc-800/50 transition-colors">
                                                                        <div className="mb-3">
                                                                            <p className="font-medium text-white text-sm">{req.user.username}</p>
                                                                            <p className="text-xs text-zinc-500">{req.user.email}</p>
                                                                            <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400">
                                                                                <span>Role: <span className="text-indigo-400 font-medium">{req.role}</span></span>
                                                                                <span>•</span>
                                                                                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => handleApproveRequest(req._id)}
                                                                                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
                                                                            >
                                                                                Accept
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleRejectRequest(req._id)}
                                                                                className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded text-xs font-medium transition-colors"
                                                                            >
                                                                                Reject
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )}

                                                        {/* Exit Requests */}
                                                        {exitRequests.length > 0 && (
                                                            <>
                                                                <div className="px-4 py-2 bg-zinc-800/30 text-xs font-bold text-red-400 uppercase tracking-wider">Exit Requests</div>
                                                                {exitRequests.map(req => (
                                                                    <div key={req._id} className="p-4 hover:bg-zinc-800/50 transition-colors border-l-2 border-red-500/20">
                                                                        <div className="mb-3">
                                                                            <p className="font-medium text-white text-sm flex items-center gap-2">
                                                                                <LogOut size={12} className="text-red-400" />
                                                                                {req.user.username}
                                                                            </p>
                                                                            <p className="text-xs text-zinc-500">Wants to exit organization</p>
                                                                            <div className="mt-1 text-[10px] text-zinc-400">
                                                                                {new Date(req.createdAt).toLocaleDateString()}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => handleExitDecision(req._id, 'Approved')}
                                                                                className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors"
                                                                            >
                                                                                Approve Exit
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleExitDecision(req._id, 'Rejected')}
                                                                                className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600 rounded text-xs font-medium transition-colors"
                                                                            >
                                                                                Reject
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowExitModal(true)}
                                className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm font-medium"
                                title="Dissolve Organization"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Exit Org</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={logout}
                                className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm font-medium"
                                title="Sign Out"
                            >
                                <span className="text-zinc-400 text-xs hidden sm:inline mr-1">{user?.email}</span>
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Sign Out</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowRegisterModal(true)}
                                className="bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm font-medium"
                            >
                                <Users size={16} /> Add User
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowTaskModal(true)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all duration-200 text-sm font-medium"
                            >
                                <Plus size={16} /> New Task
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <motion.div
                className="max-w-7xl mx-auto p-6 space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'Total Tasks', value: tasks.length, icon: FileText, color: 'text-indigo-400' },
                        { title: 'Under Review', value: getTasksByStatus('Under Review').length, icon: Eye, color: 'text-amber-400' },
                        { title: 'Associates', value: workers.length, icon: Users, color: 'text-emerald-400' },
                        { title: 'Completed', value: getTasksByStatus('Completed').length, icon: CheckCircle, color: 'text-emerald-400' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ y: -2 }}
                            className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-5 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg bg-zinc-900 border border-zinc-700/50 ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{stat.title}</p>
                                    <motion.p
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-2xl font-bold text-white mt-1"
                                    >
                                        {stat.value}
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Kanban Board */}
                {/* Kanban Board */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="text-indigo-500" size={20} />
                        Task Board
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                        {statusColumns.map((column, colIdx) => {
                            const columnTasks = getTasksByStatus(column.status);
                            const Icon = column.icon;
                            // Simplify color mapping for zinc theme
                            const statusColor = column.status === 'Completed' ? 'text-emerald-400' :
                                column.status === 'Rejected' ? 'text-red-400' :
                                    column.status === 'Under Review' ? 'text-amber-400' :
                                        column.status === 'In Progress' ? 'text-blue-400' : 'text-zinc-400';

                            return (
                                <motion.div
                                    key={column.status}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: colIdx * 0.1 }}
                                    className="flex-shrink-0 w-80"
                                >
                                    <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-800/50 h-full flex flex-col">
                                        <div className="flex items-center justify-between mb-4 px-1">
                                            <div className="flex items-center gap-2">
                                                <Icon size={16} className={statusColor} />
                                                <h3 className="font-semibold text-zinc-300 text-sm">{column.title}</h3>
                                            </div>
                                            <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs font-medium text-zinc-400 border border-zinc-700">
                                                {columnTasks.length}
                                            </span>
                                        </div>

                                        <div className="space-y-3 flex-1 min-h-[100px]">
                                            <AnimatePresence>
                                                {columnTasks.map(task => (
                                                    <motion.div
                                                        key={task._id}
                                                        layoutId={task._id}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        whileHover={{ scale: 1.02 }}
                                                        className="bg-zinc-800 rounded-lg p-4 shadow-sm border border-zinc-700 cursor-pointer group hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
                                                        onClick={() => openTaskDetail(task)}
                                                    >
                                                        <h4 className="font-medium text-zinc-200 mb-2 group-hover:text-indigo-400 transition-colors text-sm">{task.title}</h4>
                                                        <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{task.description}</p>
                                                        <div className="flex items-center justify-between mt-auto">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${task.type === 'Legal' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                                task.type === 'Registry' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                    task.type === 'Payment' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                        'bg-zinc-700/30 text-zinc-400 border-zinc-700'
                                                                }`}>
                                                                {task.type}
                                                            </span>
                                                            {task.assigned_to && (
                                                                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                                                    <Users size={12} />
                                                                    <span>{task.assigned_to.username}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            {columnTasks.length === 0 && (
                                                <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-zinc-800/50 rounded-lg">
                                                    <p className="text-xs text-zinc-600 font-medium">No tasks</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Team Section */}
                {/* Team Section */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-xl font-bold text-white mb-4">Team Members</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Leades */}
                        <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50"
                        >
                            <h3 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                <Users size={16} className="text-amber-400" />
                                Leades ({bosses.length})
                            </h3>
                            <div className="space-y-3">
                                {bosses.map(boss => (
                                    <div key={boss._id} className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-zinc-200 text-sm">{boss.username}</p>
                                            <p className="text-xs text-zinc-500">{boss.email}</p>
                                        </div>
                                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold">
                                            BOSS
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Associates */}
                        <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50"
                        >
                            <h3 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                <Users size={16} className="text-indigo-400" />
                                Associates ({workers.length})
                            </h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
                                {workers.map(worker => (
                                    <div key={worker._id} className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center justify-between group">
                                        <div>
                                            <p className="font-medium text-zinc-200 text-sm">{worker.username}</p>
                                            <p className="text-xs text-zinc-500">{worker.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[10px] font-bold">
                                                WORKER
                                            </span>
                                            <button
                                                onClick={() => handleDeleteUser(worker._id)}
                                                className="p-1.5 text-zinc-600 hover:bg-red-500/10 hover:text-red-400 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete User"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {workers.length === 0 && (
                                    <p className="text-center text-zinc-600 text-xs py-4">No workers yet</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {showRegisterModal && (
                    <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register New User">
                        <form onSubmit={handleRegisterUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white placeholder-zinc-500 outline-none transition-all"
                                    value={userForm.username}
                                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                                    placeholder="e.g. John Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white placeholder-zinc-500 outline-none transition-all"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    placeholder="e.g. john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white placeholder-zinc-500 outline-none transition-all"
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Role</label>
                                <select
                                    className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white outline-none transition-all"
                                    value={userForm.role}
                                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                >
                                    <option value="Associate">Associate</option>
                                    <option value="Lead">Lead</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-600/20">
                                Register User
                            </button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showTaskModal && (
                    <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create New Task">
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Task Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white placeholder-zinc-500 outline-none transition-all"
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    placeholder="e.g. Review Contracts"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Description</label>
                                <textarea
                                    className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white placeholder-zinc-500 outline-none transition-all"
                                    rows="3"
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    placeholder="Enter task details..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-zinc-300">Type</label>
                                    <select
                                        className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white outline-none transition-all"
                                        value={taskForm.type}
                                        onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                                    >
                                        <option value="Custom">Custom</option>
                                        <option value="Registry">Registry</option>
                                        <option value="Payment">Payment</option>
                                        <option value="Legal">Legal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-zinc-300">Assign To</label>
                                    <select
                                        className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white outline-none transition-all"
                                        value={taskForm.assigned_to}
                                        onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                                    >
                                        <option value="">Select Associate...</option>
                                        <option value={user?._id}>Assign to Me (Lead)</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.username} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="border-t border-zinc-800 pt-4 mt-4">
                                <h3 className="font-semibold mb-3 text-white text-sm">Property Filters (Optional)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 text-zinc-300">Builder</label>
                                        <select
                                            className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white outline-none transition-all"
                                            value={taskForm.builder}
                                            onChange={(e) => setTaskForm({ ...taskForm, builder: e.target.value })}
                                        >
                                            <option value="">Select Builder...</option>
                                            {/* builders.map(builder => (
                                                <option key={builder._id} value={builder.name}>{builder.name}</option>
                                            )) */}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 text-zinc-300">Property Type</label>
                                        <select
                                            className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white outline-none transition-all"
                                            value={taskForm.property_type}
                                            onChange={(e) => setTaskForm({ ...taskForm, property_type: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Residential">Residential</option>
                                            <option value="Commercial">Commercial</option>
                                            <option value="Industrial">Industrial</option>
                                            <option value="Land">Land</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 text-zinc-300">Category</label>
                                        <select
                                            className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white outline-none transition-all"
                                            value={taskForm.category}
                                            onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Flat">Flat</option>
                                            <option value="Plot">Plot</option>
                                            <option value="Villa">Villa</option>
                                            <option value="Shop">Shop</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 text-zinc-300">Sector</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white placeholder-zinc-500 outline-none transition-all"
                                            placeholder="e.g. Sector 150"
                                            value={taskForm.sector}
                                            onChange={(e) => setTaskForm({ ...taskForm, sector: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20">
                                Create Task
                            </button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>



            <AnimatePresence>
                {selectedTask && showDetailModal && (
                    <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={isEditing ? 'Edit Task' : selectedTask.title}>
                        {!isEditing ? (
                            <div className="space-y-6">
                                {/* Header Actions */}
                                {user.role === 'Lead' && (
                                    <div className="flex justify-end -mt-2 mb-2 gap-3 items-center">
                                        {selectedTask.status !== 'Completed' && (
                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm('Mark this task as Completed?')) return;
                                                    try {
                                                        await axios.patch(`/api/tasks/${selectedTask._id}`, { status: 'Completed' });
                                                        showToast('Task marked as Completed!', 'success');
                                                        setShowDetailModal(false);
                                                        fetchTasks();
                                                    } catch (err) {
                                                        showToast('Failed to complete task', 'error');
                                                    }
                                                }}
                                                className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded hover:bg-emerald-500/20 transition-colors font-medium flex items-center gap-1"
                                            >
                                                <CheckCircle size={12} /> Mark Complete
                                            </button>
                                        )}
                                        {selectedTask.status !== 'Completed' && (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                                            >
                                                Edit Task
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-semibold mb-2 text-white text-sm uppercase tracking-wide opacity-80">Description</h3>
                                    <p className="text-zinc-300 bg-zinc-800/50 p-4 rounded-lg border border-zinc-800">{selectedTask.description || 'No description'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold mb-1 text-white text-xs uppercase tracking-wide opacity-80">Type</h3>
                                        <p className="text-zinc-300 font-medium">{selectedTask.type}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1 text-white text-xs uppercase tracking-wide opacity-80">Status</h3>
                                        <p className="text-zinc-300 font-medium">{selectedTask.status}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1 text-white text-xs uppercase tracking-wide opacity-80">Assigned To</h3>
                                        <p className="text-zinc-300 font-medium">{selectedTask.assigned_to?.username || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1 text-white text-xs uppercase tracking-wide opacity-80">Assigned By</h3>
                                        <p className="text-zinc-300 font-medium">{selectedTask.assigned_by?.username || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1 text-white text-xs uppercase tracking-wide opacity-80">Created</h3>
                                        <p className="text-zinc-300 text-sm font-mono">{new Date(selectedTask.createdAt).toLocaleString()}</p>
                                    </div>
                                    {selectedTask.started_at && (
                                        <div>
                                            <h3 className="font-semibold mb-1 text-white text-xs uppercase tracking-wide opacity-80">Started</h3>
                                            <p className="text-zinc-300 text-sm font-mono">{new Date(selectedTask.started_at).toLocaleString()}</p>
                                        </div>
                                    )}
                                    {selectedTask.submitted_at && (
                                        <div>
                                            <h3 className="font-semibold mb-1 text-white text-xs uppercase tracking-wide opacity-80">Submitted</h3>
                                            <p className="text-zinc-300 text-sm font-mono">{new Date(selectedTask.submitted_at).toLocaleString()}</p>
                                        </div>
                                    )}
                                    {selectedTask.completed_at && (
                                        <div>
                                            <h3 className="font-semibold mb-1 text-white text-xs uppercase tracking-wide opacity-80">Completed</h3>
                                            <p className="text-zinc-300 text-sm font-mono">{new Date(selectedTask.completed_at).toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Property Details Display */}
                                {selectedTask.property_filters && (Object.values(selectedTask.property_filters).some(v => v)) && (
                                    <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-800">
                                        <h3 className="font-semibold mb-3 text-white text-sm uppercase tracking-wide opacity-80">Property Filters</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {selectedTask.property_filters.builder && <p><span className="text-zinc-500">Builder:</span> <span className="text-zinc-200">{selectedTask.property_filters.builder}</span></p>}
                                            {selectedTask.property_filters.property_type && <p><span className="text-zinc-500">Type:</span> <span className="text-zinc-200">{selectedTask.property_filters.property_type}</span></p>}
                                            {selectedTask.property_filters.category && <p><span className="text-zinc-500">Category:</span> <span className="text-zinc-200">{selectedTask.property_filters.category}</span></p>}
                                            {selectedTask.property_filters.sector && <p><span className="text-zinc-500">Sector:</span> <span className="text-zinc-200">{selectedTask.property_filters.sector}</span></p>}
                                        </div>
                                    </div>
                                )}

                                {selectedTask.proof_of_work && (
                                    <div>
                                        <h3 className="font-semibold mb-2 text-white text-sm uppercase tracking-wide opacity-80">Proof of Work</h3>
                                        <div className="text-zinc-300 bg-zinc-800/50 p-4 rounded-lg border border-zinc-800 whitespace-pre-wrap font-mono text-sm">
                                            {selectedTask.proof_of_work.split(/(\/api\/tasks\/files\/[a-f0-9]+)/gi).map((part, i) => (
                                                part.match(/\/api\/tasks\/files\/[a-f0-9]+/i) ? (
                                                    <div key={i} className="mt-1">
                                                        <a href={part} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline break-all flex items-center gap-2">
                                                            <FileText size={14} /> View Attached File
                                                        </a>
                                                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                            <span className="text-xs">⚠️</span> Auto-deletes in 7 days. Please download if important.
                                                        </p>
                                                    </div>
                                                ) : part
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedTask.status === 'Under Review' && (
                                    <div className="flex gap-3 pt-6 border-t border-zinc-800">
                                        <button
                                            onClick={() => handleReview(selectedTask._id, 'approve', 'Looks good!')}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-600/20"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                const reason = prompt('Reason for rejection:');
                                                if (reason) handleReview(selectedTask._id, 'reject', reason);
                                            }}
                                            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-red-600/20"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateTask} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-zinc-300">Task Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white outline-none"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-zinc-300">Description</label>
                                    <textarea
                                        className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-white outline-none"
                                        rows="3"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 text-zinc-300">Type</label>
                                        <select
                                            className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none"
                                            value={editForm.type}
                                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                        >
                                            <option value="Custom">Custom</option>
                                            <option value="Registry">Registry</option>
                                            <option value="Payment">Payment</option>
                                            <option value="Legal">Legal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 text-zinc-300">Assign To</label>
                                        <select
                                            className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none"
                                            value={editForm.assigned_to}
                                            onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                                        >
                                            <option value="">Select Associate...</option>
                                            <option value={user?._id}>Assign to Me (Lead)</option>
                                            {users.map(user => (
                                                <option key={user._id} value={user._id}>{user.username}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="border-t border-zinc-800 pt-4 mt-4">
                                    <h3 className="font-semibold mb-3 text-white text-sm">Property Filters</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 text-zinc-300">Builder</label>
                                            <select
                                                className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none"
                                                value={editForm.builder}
                                                onChange={(e) => setEditForm({ ...editForm, builder: e.target.value })}
                                            >
                                                <option value="">Select Builder...</option>
                                                {/* builders.map(builder => (
                                                    <option key={builder._id} value={builder.name}>{builder.name}</option>
                                                )) */}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 text-zinc-300">Property Type</label>
                                            <select
                                                className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none"
                                                value={editForm.property_type}
                                                onChange={(e) => setEditForm({ ...editForm, property_type: e.target.value })}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Residential">Residential</option>
                                                <option value="Commercial">Commercial</option>
                                                <option value="Industrial">Industrial</option>
                                                <option value="Land">Land</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 text-zinc-300">Category</label>
                                            <select
                                                className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none"
                                                value={editForm.category}
                                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Flat">Flat</option>
                                                <option value="Plot">Plot</option>
                                                <option value="Villa">Villa</option>
                                                <option value="Shop">Shop</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 text-zinc-300">Sector</label>
                                            <input
                                                type="text"
                                                className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none"
                                                value={editForm.sector}
                                                onChange={(e) => setEditForm({ ...editForm, sector: e.target.value })}
                                            />
                                        </div>

                                    </div>
                                </div>
                                <div className="flex gap-3 pt-6 border-t border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2.5 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </Modal>
                )}
            </AnimatePresence>
            {/* Exit Org Modal */}
            <ExitOrgModal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                user={user}
                isLastLead={users.filter(u => u.role === 'Lead').length === 1}
                onExitSuccess={async (result) => {
                    await checkUser(); // Refresh user state
                    if (result.exited) {
                        showToast('Organization dissolved', 'success');
                    }
                }}
            />
        </div>
    );
};

export default LeadDashboard;
