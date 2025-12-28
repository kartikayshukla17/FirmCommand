import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { Upload, Clock, Eye, CheckCircle, XCircle, FileText, Send, TrendingUp, LogOut, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmationContext';
import ExitOrgModal from './ExitOrgModal';
import JoinOrgScreen from './JoinOrgScreen';
import NotificationDropdown from './NotificationDropdown';


const AssociateDashboard = () => {
    const { user, logout, checkUser } = useAuth();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [proofOfWork, setProofOfWork] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user && user.organization) {
            fetchTasks();
        }
    }, [user]);

    const fetchTasks = async () => {
        try {
            const res = await axios.get('/api/tasks');
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // If user has no organization (Free Agent)
    if (user && !user.organization) {
        return <JoinOrgScreen />;
    }

    const handleLogout = async () => {
        const isConfirmed = await confirm({
            title: 'Sign Out',
            message: 'Are you sure you want to sign out?',
            confirmText: 'Sign Out',
            type: 'danger'
        });
        if (isConfirmed) logout();
    };

    const openUpdateModal = (task) => {
        setSelectedTask(task);
        setProofOfWork(task.proof_of_work || '');
        setSelectedFile(null);
        setShowUpdateModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size must be less than 5MB', 'error');
                return;
            }
            setSelectedFile(file);
        }
    };

    const uploadFile = async () => {
        if (!selectedFile) return null;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setUploading(true);
            const res = await axios.post('/api/tasks/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.fileUrl;
        } catch (err) {
            showToast('File upload failed: ' + (err.response?.data?.message || err.message), 'error');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitForReview = async (e) => {
        e.preventDefault();

        const isConfirmed = await confirm({
            title: 'Submit Task?',
            message: 'Are you sure you want to submit this task for review? You may not be able to edit it afterwards.',
            confirmText: 'Submit',
            type: 'info'
        });
        if (!isConfirmed) return;

        try {
            let fileUrl = null;
            if (selectedFile) {
                fileUrl = await uploadFile();
                if (!fileUrl) return;
            }

            const proofText = fileUrl
                ? `${proofOfWork}\n\nAttached file: ${fileUrl}`
                : proofOfWork;

            await axios.patch(`/api/tasks/${selectedTask._id}`, {
                proof_of_work: proofText,
                status: 'Under Review'
            });
            showToast('Task submitted for review!', 'success');
            setShowUpdateModal(false);
            setProofOfWork('');
            setSelectedFile(null);
            fetchTasks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to submit task', 'error');
        }
    };

    const handleSaveProgress = async (e) => {
        e.preventDefault();
        try {
            let fileUrl = null;
            if (selectedFile) {
                fileUrl = await uploadFile();
                if (!fileUrl) return;
            }

            const proofText = fileUrl
                ? `${proofOfWork}\n\nAttached file: ${fileUrl}`
                : proofOfWork;

            await axios.patch(`/api/tasks/${selectedTask._id}`, {
                proof_of_work: proofText
            });
            showToast('Progress saved!', 'success');
            setShowUpdateModal(false);
            setProofOfWork('');
            setSelectedFile(null);
            fetchTasks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save progress', 'error');
        }
    };

    const handleStartTask = async (task) => {
        try {
            await axios.patch(`/api/tasks/${task._id}`, {
                status: 'In Progress'
            });
            showToast('Task started! Status updated to In Progress', 'success');
            fetchTasks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to start task', 'error');
        }
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(t => t.status === status);
    };

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
            <div className="bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                                {user?.orgName || 'My Dashboard'}
                            </h1>
                            <div className="flex items-center gap-3 mt-1 ml-4">
                                <p className="text-xs text-zinc-500 font-medium tracking-wider">
                                    Welcome, <span className="text-indigo-400 font-bold">{user?.username}</span>
                                </p>
                            </div>
                        </motion.div>
                        <div className="flex gap-3 items-center flex-wrap justify-center sm:justify-end w-full md:w-auto">
                            <NotificationDropdown />
                            {/* ThemeToggle removed as we represent specific requested look */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowExitModal(true)}
                                className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-2"
                            >
                                <LogOut size={16} /> Exit Org
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleLogout}
                                className="p-2 rounded-full text-zinc-500 hover:text-red-500 transition-colors"
                            >
                                <LogOut size={20} />
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
                        { title: 'My Tasks', value: tasks.length, icon: FileText, color: 'text-indigo-400' },
                        { title: 'Pending', value: getTasksByStatus('Pending').length, icon: Clock, color: 'text-amber-400' },
                        { title: 'Under Review', value: getTasksByStatus('Under Review').length, icon: Eye, color: 'text-purple-400' },
                        { title: 'Completed', value: getTasksByStatus('Completed').length, icon: CheckCircle, color: 'text-emerald-400' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-800"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg bg-zinc-800/50`}>
                                    <stat.icon className={stat.color} size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-500">{stat.title}</p>
                                    <motion.p
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 100 }}
                                        className="text-2xl font-bold text-white"
                                    >
                                        {stat.value}
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Kanban Board */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="text-indigo-500" />
                        My Task Board
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {statusColumns.map((column, colIdx) => {
                            const columnTasks = getTasksByStatus(column.status);
                            const Icon = column.icon;

                            // Simple color mapping without separate light/dark variants
                            const headerColors = {
                                amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                                blue: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
                                purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
                                green: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                                red: 'bg-red-500/10 text-red-500 border-red-500/20'
                            };

                            return (
                                <motion.div
                                    key={column.status}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: colIdx * 0.1 }}
                                    className="flex-shrink-0 w-80"
                                >
                                    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800 h-full">
                                        <div className={`rounded-lg p-3 mb-4 border ${headerColors[column.color]}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Icon size={20} />
                                                    <h3 className="font-bold">{column.title}</h3>
                                                </div>
                                                <span className="bg-zinc-900/50 px-2 py-0.5 rounded text-sm font-semibold">
                                                    {columnTasks.length}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
                                            <AnimatePresence>
                                                {columnTasks.map(task => (
                                                    <motion.div
                                                        key={task._id}
                                                        layoutId={task._id}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        whileHover={{ scale: 1.02 }}
                                                        className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-indigo-500/50 transition-all duration-200"
                                                    >
                                                        <h4 className="font-bold text-zinc-100 mb-2">{task.title}</h4>
                                                        <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{task.description}</p>

                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${task.type === 'Corporate' ? 'bg-indigo-500/10 text-indigo-400' :
                                                                task.type === 'Registry' ? 'bg-blue-500/10 text-blue-400' :
                                                                    task.type === 'Payment' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                        'bg-zinc-700 text-zinc-300'
                                                                }`}>
                                                                {task.type}
                                                            </span>
                                                        </div>

                                                        {task.proof_of_work && (
                                                            <div className="mb-3 p-2 bg-indigo-500/10 rounded text-xs text-indigo-300 border border-indigo-500/20">
                                                                ✓ Proof attached
                                                            </div>
                                                        )}

                                                        <div className="text-xs text-zinc-500 mb-3">
                                                            Created: {new Date(task.createdAt).toLocaleDateString()}
                                                        </div>

                                                        {task.status === 'Pending' && (
                                                            <button
                                                                onClick={() => handleStartTask(task)}
                                                                className="w-full bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 mb-2"
                                                            >
                                                                <Play size={16} /> Start Task
                                                            </button>
                                                        )}

                                                        {task.status !== 'Completed' && task.status !== 'Under Review' && (
                                                            <button
                                                                onClick={() => openUpdateModal(task)}
                                                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                                                            >
                                                                <Send size={16} /> Update Progress
                                                            </button>
                                                        )}
                                                        {task.status === 'Rejected' && (
                                                            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                                <p className="text-red-400 text-xs font-medium">Rejected - Update and resubmit</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            {columnTasks.length === 0 && (
                                                <div className="text-center py-8 text-zinc-600">
                                                    <p className="text-sm">No tasks</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>

            {/* Update Progress Modal */}
            <AnimatePresence>
                {selectedTask && showUpdateModal && (
                    <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} title={selectedTask.title}>
                        <form className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Task Details</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTask.description}</p>
                                <div className="mt-2 flex gap-2 text-xs">
                                    <span className="text-gray-500 dark:text-gray-400">Type: {selectedTask.type}</span>
                                    <span className="dark:text-gray-500">•</span>
                                    <span className="text-gray-500 dark:text-gray-400">By: {selectedTask.assigned_by?.username}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Proof of Work</label>
                                <textarea
                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    rows="6"
                                    placeholder="Describe what you've done, add notes, or paste file links..."
                                    value={proofOfWork}
                                    onChange={(e) => setProofOfWork(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Upload File (Optional)</label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer flex flex-col items-center gap-3"
                                    >
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                            <Upload className="text-blue-600 dark:text-blue-400" size={28} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {selectedFile ? selectedFile.name : 'Click to upload file'}
                                            </span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                PDF, DOC, Images (Max 5MB)
                                            </p>
                                        </div>
                                    </label>
                                </div>
                                {selectedFile && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFile(null)}
                                        className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                                    >
                                        Remove file
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleSaveProgress}
                                    disabled={uploading}
                                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 font-medium"
                                >
                                    {uploading ? 'Uploading...' : 'Save Progress'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitForReview}
                                    disabled={uploading}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                                >
                                    {uploading ? 'Uploading...' : (
                                        <>
                                            <Send size={18} /> Submit for Review
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
            {/* Exit Org Modal */}
            <ExitOrgModal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                user={user}
                onExitSuccess={async (result) => {
                    await checkUser(); // Refresh user state
                    if (result.exited) {
                        // handled by re-render showing JoinOrgScreen
                    } else if (result.pending) {
                        // Just close modal, toast already shown
                    }
                }}
            />
        </div>
    );
};

export default AssociateDashboard;
