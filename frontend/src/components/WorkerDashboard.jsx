import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmationContext';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import NotificationDropdown from './NotificationDropdown';
import ExitOrgModal from './ExitOrgModal';
import {
    Clock, CheckCircle, AlertCircle, Briefcase, ClipboardList,
    LogOut, Upload, FileText, XCircle, LayoutDashboard, Play
} from 'lucide-react';

const AssociateDashboard = () => {
    const { user, checkUser, logout } = useAuth();
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const [updateForm, setUpdateForm] = useState({ proof_of_work: '' });
    const [fileUpload, setFileUpload] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [showExitModal, setShowExitModal] = useState(false);

    const statusColumns = ['Pending', 'In Progress', 'Under Review', 'Completed', 'Rejected'];

    const fetchTasks = useCallback(async () => {
        try {
            const res = await axios.get('/api/tasks');
            setTasks(res.data);
        } catch { }
    }, []);

    useEffect(() => {
        fetchTasks().finally(() => setLoading(false));
    }, [fetchTasks]);

    const handleStartTask = async (taskId) => {
        try {
            await axios.patch(`/api/tasks/${taskId}`, { status: 'In Progress' });
            showToast('Task started!', 'success');
            fetchTasks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to start task', 'error');
        }
    };

    const handleFileUpload = async () => {
        if (!fileUpload) return null;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', fileUpload);
            const res = await axios.post(`/api/tasks/${selectedTask._id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.fileUrl;
        } catch (err) {
            showToast('File upload failed', 'error');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProgress = async (e) => {
        e.preventDefault();
        try {
            let proofText = updateForm.proof_of_work;

            if (fileUpload) {
                const fileUrl = await handleFileUpload();
                if (fileUrl) {
                    proofText = proofText ? `${proofText}\n\nAttached: ${fileUrl}` : `Attached: ${fileUrl}`;
                }
            }

            await axios.patch(`/api/tasks/${selectedTask._id}`, {
                proof_of_work: proofText
            });
            showToast('Progress updated!', 'success');
            setShowUpdateModal(false);
            setFileUpload(null);
            fetchTasks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Update failed', 'error');
        }
    };

    const handleSubmitForReview = async (taskId) => {
        const isConfirmed = await confirm({
            title: 'Submit for Review',
            message: 'Submit this task for review? Your lead will review the proof of work.',
            confirmText: 'Submit',
            type: 'info'
        });
        if (!isConfirmed) return;
        try {
            await axios.patch(`/api/tasks/${taskId}`, { status: 'Under Review' });
            showToast('Submitted for review!', 'success');
            fetchTasks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to submit', 'error');
        }
    };

    const statusStyles = {
        'Pending':      { bg: 'var(--fc-orange-dim)', border: 'rgba(219,134,72,0.15)', text: 'var(--fc-orange)', icon: <Clock size={14} /> },
        'In Progress':  { bg: 'var(--fc-blue-dim)', border: 'rgba(114,162,218,0.15)', text: 'var(--fc-blue)', icon: <AlertCircle size={14} /> },
        'Under Review': { bg: 'var(--fc-purple-dim)', border: 'rgba(140,114,219,0.15)', text: 'var(--fc-purple)', icon: <Briefcase size={14} /> },
        'Completed':    { bg: 'var(--fc-green-dim)', border: 'rgba(135,192,115,0.15)', text: 'var(--fc-green)', icon: <CheckCircle size={14} /> },
        'Rejected':     { bg: 'var(--fc-danger-dim)', border: 'rgba(229,91,91,0.15)', text: 'var(--fc-danger)', icon: <XCircle size={14} /> },
    };

    const stats = [
        { label: 'My Tasks', value: tasks.length, icon: <ClipboardList size={20} />, accent: 'var(--fc-purple)' },
        { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, icon: <AlertCircle size={20} />, accent: 'var(--fc-blue)' },
        { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, icon: <CheckCircle size={20} />, accent: 'var(--fc-green)' },
        { label: 'Under Review', value: tasks.filter(t => t.status === 'Under Review').length, icon: <Briefcase size={20} />, accent: 'var(--fc-orange)' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--fc-bg-deep)' }}>
                <div className="w-12 h-12 rounded-full" style={{ border: '3px solid var(--fc-purple-dim)', borderTopColor: 'var(--fc-purple)', animation: 'fc-spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--fc-bg-deep)', fontFamily: 'var(--fc-font-sans)' }}>
            {/* ═══ Header Bar ═══ */}
            <header className="sticky top-0 z-30 px-6 py-3 flex items-center justify-between"
                style={{ background: 'rgba(11, 17, 32, 0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--fc-border-subtle)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--fc-purple-dim)', border: '1px solid rgba(140,114,219,0.25)' }}>
                        <LayoutDashboard size={16} style={{ color: 'var(--fc-purple)' }} />
                    </div>
                    <div>
                        <h1 className="fc-heading font-medium" style={{ fontSize: '1.25rem', color: 'var(--fc-text-primary)' }}>{user?.organization?.name || 'Dashboard'}</h1>
                        <p style={{ fontSize: '0.6875rem', color: 'var(--fc-text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Associate Console</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <NotificationDropdown />
                    <button onClick={() => setShowExitModal(true)} className="p-2 rounded-lg transition-all"
                        style={{ color: 'var(--fc-text-muted)', background: 'none', border: '1px solid transparent', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fc-danger)'; e.currentTarget.style.background = 'var(--fc-danger-dim)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fc-text-muted)'; e.currentTarget.style.background = 'none'; }}
                        title="Exit Organization">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <div className="p-6">
                {/* ═══ Stats Row ═══ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {stats.map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            className="fc-card p-4 flex items-center gap-4">
                            <div className="p-2.5 rounded-lg" style={{ background: `${stat.accent}15`, border: `1px solid ${stat.accent}25` }}>
                                <div style={{ color: stat.accent }}>{stat.icon}</div>
                            </div>
                            <div>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--fc-text-primary)', lineHeight: 1 }}>{stat.value}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--fc-text-muted)', marginTop: '2px' }}>{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ═══ Task Board Title ═══ */}
                <h2 className="fc-heading mb-4" style={{ fontSize: '1.25rem', color: 'var(--fc-text-primary)' }}>My Tasks</h2>

                {/* ═══ Kanban Board ═══ */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {statusColumns.map(status => {
                        const sty = statusStyles[status];
                        const colTasks = tasks.filter(t => t.status === status);
                        return (
                            <div key={status}>
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <div className="w-2 h-2 rounded-full" style={{ background: sty.text }} />
                                    <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fc-text-secondary)' }}>{status}</h3>
                                    <span className="text-[11px] px-1.5 rounded-full font-medium" style={{ background: sty.bg, color: sty.text, border: `1px solid ${sty.border}` }}>{colTasks.length}</span>
                                </div>
                                <div className="space-y-2 min-h-[80px]">
                                    {colTasks.map(task => (
                                        <motion.div key={task._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            className="fc-card p-3 group">
                                            <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fc-text-primary)', lineHeight: 1.4, marginBottom: '0.25rem' }}>{task.title}</h4>
                                            {task.description && (
                                                <p className="line-clamp-2 mb-2" style={{ fontSize: '0.75rem', color: 'var(--fc-text-muted)', lineHeight: 1.5 }}>{task.description}</p>
                                            )}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="fc-badge" style={{ background: sty.bg, color: sty.text, border: `1px solid ${sty.border}` }}>
                                                    {sty.icon} {task.type}
                                                </span>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--fc-border-subtle)' }}>
                                                {task.status === 'Pending' && (
                                                    <button onClick={() => handleStartTask(task._id)}
                                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all hover:bg-[var(--fc-blue)] hover:text-white"
                                                        style={{ background: 'var(--fc-blue-dim)', color: 'var(--fc-blue)', border: '1px solid rgba(114,162,218,0.25)' }}>
                                                        <Play size={12} /> Start
                                                    </button>
                                                )}
                                                {task.status === 'In Progress' && (
                                                    <>
                                                        <button onClick={() => { setSelectedTask(task); setUpdateForm({ proof_of_work: task.proof_of_work || '' }); setShowUpdateModal(true); }}
                                                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all hover:bg-[var(--fc-purple)] hover:text-white"
                                                            style={{ background: 'var(--fc-purple-dim)', color: 'var(--fc-purple)', border: '1px solid rgba(140,114,219,0.25)' }}>
                                                            <Upload size={12} /> Update
                                                        </button>
                                                        <button onClick={() => handleSubmitForReview(task._id)}
                                                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all hover:bg-[var(--fc-green)] hover:text-white"
                                                            style={{ background: 'var(--fc-green-dim)', color: 'var(--fc-green)', border: '1px solid rgba(135,192,115,0.25)' }}>
                                                            <CheckCircle size={12} /> Submit
                                                        </button>
                                                    </>
                                                )}
                                                {task.status === 'Rejected' && (
                                                    <>
                                                        <button onClick={() => { setSelectedTask(task); setUpdateForm({ proof_of_work: task.proof_of_work || '' }); setShowUpdateModal(true); }}
                                                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all hover:bg-[var(--fc-purple)] hover:text-white"
                                                            style={{ background: 'var(--fc-purple-dim)', color: 'var(--fc-purple)', border: '1px solid rgba(140,114,219,0.25)' }}>
                                                            <Upload size={12} /> Revise
                                                        </button>
                                                        <button onClick={() => handleSubmitForReview(task._id)}
                                                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all hover:bg-[var(--fc-green)] hover:text-white"
                                                            style={{ background: 'var(--fc-green-dim)', color: 'var(--fc-green)', border: '1px solid rgba(135,192,115,0.25)' }}>
                                                            <CheckCircle size={12} /> Resubmit
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {/* Rejection feedback */}
                                            {task.status === 'Rejected' && task.review_feedback && (
                                                <div className="mt-2 p-2 rounded-md text-xs" style={{ background: 'var(--fc-danger-dim)', color: 'var(--fc-danger)', border: '1px solid rgba(229,91,91,0.15)' }}>
                                                    <strong>Feedback:</strong> {task.review_feedback}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                    {colTasks.length === 0 && (
                                        <div className="text-center py-6 rounded-lg" style={{ border: '1px dashed var(--fc-border)', color: 'var(--fc-text-dim)', fontSize: '0.75rem' }}>
                                            No tasks
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ═══ Update Progress Modal ═══ */}
            <AnimatePresence>
                {showUpdateModal && selectedTask && (
                    <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} title={`Update: ${selectedTask.title}`}>
                        <form onSubmit={handleUpdateProgress} className="space-y-4">
                            <div>
                                <label className="fc-label">Proof of Work / Progress Notes</label>
                                <textarea
                                    className="fc-input"
                                    style={{ resize: 'vertical', minHeight: '120px' }}
                                    rows="5"
                                    value={updateForm.proof_of_work}
                                    onChange={(e) => setUpdateForm({ ...updateForm, proof_of_work: e.target.value })}
                                    placeholder="Describe your progress, findings, or completed work..."
                                />
                            </div>
                            <div>
                                <label className="fc-label">Attach File (Optional)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={(e) => setFileUpload(e.target.files[0])}
                                        className="fc-input text-sm"
                                        style={{ paddingTop: '8px' }}
                                    />
                                </div>
                                {fileUpload && (
                                    <p className="mt-1 flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--fc-blue)' }}>
                                        <FileText size={12} /> {fileUpload.name}
                                    </p>
                                )}
                            </div>
                            <button type="submit" disabled={uploading}
                                className="fc-btn-primary w-full py-2.5 rounded-lg text-sm disabled:opacity-70 disabled:cursor-not-allowed">
                                {uploading ? 'Uploading...' : 'Update Progress'}
                            </button>
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
                    await checkUser();
                    if (result.exited) {
                        showToast('You have left the organization', 'success');
                    }
                }}
            />
        </div>
    );
};

export default AssociateDashboard;
