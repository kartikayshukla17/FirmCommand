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
    Plus, Users, CheckCircle, Clock, AlertCircle, Briefcase,
    LogOut, MoreHorizontal, FileText, XCircle, LayoutDashboard,
    LayoutGrid, List, Table, Settings2, Eye, MessageSquare, UserPlus,
    ChevronLeft, ChevronRight, Menu, PieChart, ExternalLink, CalendarDays
} from 'lucide-react';

const LeadDashboard = () => {
    const { user, checkUser, logout } = useAuth();
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState({ joinRequests: [], exitRequests: [] });
    const [loading, setLoading] = useState(true);

    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [activeTab, setActiveTab] = useState('tasks');
    const [showExitModal, setShowExitModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedAssociateDetail, setSelectedAssociateDetail] = useState(null);

    const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'Associate' });
    const [taskForm, setTaskForm] = useState({
        title: '', description: '', type: 'Custom', assigned_to: '',
        builder: '', property_type: '', category: '', sector: '', deadline: ''
    });
    const [editForm, setEditForm] = useState({
        title: '', description: '', type: '', assigned_to: '',
        builder: '', property_type: '', category: '', sector: '', deadline: ''
    });

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const statusColumns = ['Pending', 'In Progress', 'Under Review', 'Completed', 'Rejected'];

    const fetchTasks = useCallback(async () => {
        try {
            const res = await axios.get('/api/tasks');
            setTasks(res.data);
        } catch { }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await axios.get('/api/organization/users');
            setUsers(res.data);
        } catch { }
    }, []);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await axios.get('/api/organization/pending-requests');
            setRequests(res.data);
        } catch { }
    }, []);

    useEffect(() => {
        Promise.all([fetchTasks(), fetchUsers(), fetchRequests()]).finally(() => setLoading(false));
    }, [fetchTasks, fetchUsers, fetchRequests]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/auth/register-user', userForm);
            showToast(`${userForm.username} added successfully!`, 'success');
            setShowAddUserModal(false);
            setUserForm({ username: '', email: '', password: '', role: 'Associate' });
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to add user', 'error');
        }
    };

    const handleDeleteUser = async (userId, name) => {
        const isConfirmed = await confirm({
            title: 'Remove Team Member',
            message: `Remove ${name} from this organization? This action cannot be undone.`,
            confirmText: 'Remove',
            type: 'danger'
        });
        if (!isConfirmed) return;
        try {
            await axios.delete(`/api/organization/users/${userId}`);
            showToast(`${name} has been removed`, 'success');
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to remove user', 'error');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...taskForm };
            if (!payload.assigned_to) delete payload.assigned_to;
            if (!payload.builder) delete payload.builder;
            if (!payload.property_type) delete payload.property_type;
            if (!payload.category) delete payload.category;
            if (!payload.sector) delete payload.sector;
            if (!payload.deadline) delete payload.deadline;
            await axios.post('/api/tasks', payload);
            showToast('Task created successfully!', 'success');
            setShowTaskModal(false);
            setTaskForm({ title: '', description: '', type: 'Custom', assigned_to: '', builder: '', property_type: '', category: '', sector: '', deadline: '' });
            fetchTasks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create task', 'error');
        }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`/api/tasks/${selectedTask._id}`, editForm);
            showToast('Task updated successfully!', 'success');
            setShowDetailModal(false);
            setIsEditing(false);
            fetchTasks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update', 'error');
        }
    };

    const handleReview = async (taskId, status, feedback) => {
        try {
            await axios.post(`/api/tasks/${taskId}/review`, { status, feedback });
            showToast(`Task ${status.toLowerCase()} successfully!`, 'success');
            setShowDetailModal(false);
            fetchTasks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Review failed', 'error');
        }
    };

    const handleRequestAction = async (type, id, action) => {
        try {
            const endpoint = type === 'join'
                ? `/api/organization/join-requests/${id}/${action}`
                : `/api/organization/exit-requests/${id}/${action}`;
            await axios.post(endpoint);
            showToast(`Request ${action}ed successfully`, 'success');
            fetchRequests();
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.message || 'Action failed', 'error');
        }
    };
    
    // Derived styles for categories
    const getTypeColor = (type) => {
        switch(type) {
            case 'Registry': return { bg: 'var(--fc-purple-dim)', text: 'var(--fc-purple)' };
            case 'Payment': return { bg: 'var(--fc-green-dim)', text: 'var(--fc-green)' };
            case 'Corporate': return { bg: 'var(--fc-orange-dim)', text: 'var(--fc-orange)' };
            default: return { bg: 'var(--fc-blue-dim)', text: 'var(--fc-blue)' };
        }
    };

    // Calculate a dummy progress for visual flair based on status
    const getProgress = (status) => {
        switch(status) {
            case 'Completed': return 100;
            case 'Under Review': return 85;
            case 'In Progress': return 40;
            default: return 10;
        }
    };

    // Calendar Helpers
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--fc-bg-deep)]">
                <div className="w-12 h-12 rounded-full border-4 border-[var(--fc-border)] border-t-[var(--fc-purple)] animate-[fc-spin_0.8s_linear_infinite]" />
            </div>
        );
    }

    const sidebarExpanded = isSidebarOpen || isMobileMenuOpen;

    return (
        <div className="min-h-screen flex bg-[var(--fc-bg-deep)] text-[var(--fc-text-primary)] w-full overflow-hidden">
            
            {/* ═══ Mobile Sidebar Overlay ═══ */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ═══ Sidebar ═══ */}
            <motion.aside 
                initial={false}
                animate={{ width: sidebarExpanded ? 256 : 80 }}
                className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col bg-[var(--fc-bg-panel)] border-r border-[var(--fc-border-subtle)] shadow-[var(--fc-shadow-lg)] overflow-visible transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Collapse Toggle */}
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute top-6 -right-3 z-50 w-6 h-6 bg-[var(--fc-purple)] rounded-full text-black flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_10px_rgba(140,114,219,0.5)] border-2 border-[var(--fc-bg-deep)]"
                >
                    {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>

                <div className="h-[76px] flex items-center px-6 border-b border-[var(--fc-border-subtle)] overflow-hidden shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--fc-purple-dim)] border border-[rgba(140,114,219,0.25)] flex items-center justify-center shadow-sm shrink-0">
                        <LayoutDashboard size={16} className="text-[var(--fc-purple)]" />
                    </div>
                    {isSidebarOpen && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fc-heading text-[1.125rem] font-bold text-white tracking-wide ml-3 whitespace-nowrap">
                            Firm<span className="text-[var(--fc-purple)]">Command</span>
                        </motion.span>
                    )}
                </div>
                
                <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto flex flex-col scrollbar-hide">
                    
                    {/* Primary Action */}
                    <div className="px-1">
                        <button onClick={() => { setShowTaskModal(true); setIsMobileMenuOpen(false); }} 
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--fc-purple)] hover:bg-[var(--fc-purple-hover)] text-black font-bold transition-colors shadow-[0_0_15px_rgba(140,114,219,0.3)] min-h-[40px]`}>
                            <Plus size={18} />
                            {sidebarExpanded && <span>New Task</span>}
                        </button>
                    </div>

                    {/* Main Menu */}
                    <div>
                        {sidebarExpanded && <h4 className="text-[10px] font-bold text-[var(--fc-text-dim)] uppercase tracking-wider mb-2 px-3 whitespace-nowrap">Main Menu</h4>}
                        <nav className="space-y-1">
                            <button onClick={() => { setActiveTab('tasks'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${sidebarExpanded ? 'justify-start px-3' : 'justify-center'} gap-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${['tasks', 'list', 'table'].includes(activeTab) ? 'bg-[rgba(255,255,255,0.05)] text-white border border-[var(--fc-border-subtle)] shadow-sm' : 'text-[var(--fc-text-muted)] hover:bg-[var(--fc-bg-surface)] hover:text-white border border-transparent'}`}>
                                <LayoutGrid size={18} className={['tasks', 'list', 'table'].includes(activeTab) ? 'text-[var(--fc-purple)]' : ''} />
                                {sidebarExpanded && <span className="whitespace-nowrap">Tasks Hub</span>}
                            </button>
                            <button onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${sidebarExpanded ? 'justify-start px-3' : 'justify-center'} gap-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'calendar' ? 'bg-[rgba(255,255,255,0.05)] text-white border border-[var(--fc-border-subtle)] shadow-sm' : 'text-[var(--fc-text-muted)] hover:bg-[var(--fc-bg-surface)] hover:text-white border border-transparent'}`}>
                                <CalendarDays size={18} className={activeTab === 'calendar' ? 'text-[var(--fc-purple)]' : ''} />
                                {sidebarExpanded && <span className="whitespace-nowrap">Calendar</span>}
                            </button>
                            <button onClick={() => { setActiveTab('team'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${sidebarExpanded ? 'justify-start px-3' : 'justify-center'} gap-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'team' ? 'bg-[rgba(255,255,255,0.05)] text-white border border-[var(--fc-border-subtle)] shadow-sm' : 'text-[var(--fc-text-muted)] hover:bg-[var(--fc-bg-surface)] hover:text-white border border-transparent'}`}>
                                <div className="relative">
                                    <Users size={18} className={activeTab === 'team' ? 'text-[var(--fc-purple)]' : ''} />
                                    {!sidebarExpanded && requests.joinRequests.length + requests.exitRequests.length > 0 && (
                                        <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-[var(--fc-orange)]"></span>
                                    )}
                                </div>
                                {sidebarExpanded && <span className="whitespace-nowrap">Team Mgmt</span>}
                                {sidebarExpanded && requests.joinRequests.length + requests.exitRequests.length > 0 && (
                                    <span className="ml-auto bg-[var(--fc-orange)] text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.joinRequests.length + requests.exitRequests.length}</span>
                                )}
                            </button>
                            <button onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${sidebarExpanded ? 'justify-start px-3' : 'justify-center'} gap-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'analytics' ? 'bg-[rgba(255,255,255,0.05)] text-white border border-[var(--fc-border-subtle)] shadow-sm' : 'text-[var(--fc-text-muted)] hover:bg-[var(--fc-bg-surface)] hover:text-white border border-transparent'}`}>
                                <PieChart size={18} className={activeTab === 'analytics' ? 'text-[var(--fc-purple)]' : ''} />
                                {sidebarExpanded && <span className="whitespace-nowrap">Analytics</span>}
                            </button>
                        </nav>
                    </div>

                    {/* Workspace (Useful static links) */}
                    <div>
                        {sidebarExpanded && <h4 className="text-[10px] font-bold text-[var(--fc-text-dim)] uppercase tracking-wider mb-2 px-3 whitespace-nowrap">Workspace</h4>}
                        <nav className="space-y-1">
                            <button className={`w-full flex items-center ${sidebarExpanded ? 'justify-start px-3' : 'justify-center'} gap-3 py-2.5 rounded-lg text-[var(--fc-text-muted)] hover:bg-[var(--fc-bg-surface)] hover:text-white font-medium text-sm transition-colors`}>
                                <Briefcase size={18} />
                                {sidebarExpanded && <span className="whitespace-nowrap">Client Portals</span>}
                                {sidebarExpanded && <span className="ml-auto text-[9px] bg-[var(--fc-bg-surface)] px-1.5 py-0.5 rounded text-[var(--fc-text-dim)] border border-[var(--fc-border)]">PRO</span>}
                            </button>

                            <button onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center ${sidebarExpanded ? 'justify-start px-3' : 'justify-center'} gap-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'settings' ? 'bg-[rgba(255,255,255,0.05)] text-white border border-[var(--fc-border-subtle)] shadow-sm' : 'text-[var(--fc-text-muted)] hover:bg-[var(--fc-bg-surface)] hover:text-white border border-transparent'}`}>
                                <Settings2 size={18} className={activeTab === 'settings' ? 'text-[var(--fc-purple)]' : ''} />
                                {sidebarExpanded && <span className="whitespace-nowrap">Settings</span>}
                            </button>
                        </nav>
                    </div>

                    {/* Quick Stats Summary */}
                    {sidebarExpanded && (
                        <div className="mt-auto px-3 py-4 bg-[var(--fc-bg-surface)] rounded-xl border border-[var(--fc-border-subtle)] overflow-hidden shrink-0">
                            <h4 className="text-[10px] font-bold text-[var(--fc-text-dim)] uppercase tracking-wider mb-3 whitespace-nowrap">Quick Stats</h4>
                            <div className="flex items-center justify-between mb-2 whitespace-nowrap">
                                <span className="text-xs text-[var(--fc-text-muted)] flex items-center gap-1"><AlertCircle size={12} className="text-[var(--fc-orange)]"/> Pending</span>
                                <span className="text-xs font-bold text-white">{tasks.filter(t=>t.status==='Pending').length}</span>
                            </div>
                            <div className="flex items-center justify-between whitespace-nowrap">
                                <span className="text-xs text-[var(--fc-text-muted)] flex items-center gap-1"><CheckCircle size={12} className="text-[var(--fc-green)]"/> Completed</span>
                                <span className="text-xs font-bold text-white">{tasks.filter(t=>t.status==='Completed').length}</span>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-3 border-t border-[var(--fc-border-subtle)] bg-[rgba(11,17,32,0.5)] shrink-0">
                    <div className={`fc-card p-2 flex items-center ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'} cursor-pointer hover:border-[var(--fc-border-hover)] transition-colors overflow-hidden`} onClick={() => setShowExitModal(true)}>
                        <div className="w-8 h-8 rounded-full bg-[var(--fc-purple-dim)] border border-[var(--fc-purple)] flex items-center justify-center font-bold text-[var(--fc-purple)] text-xs shrink-0 shadow-inner">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                                <p className="text-[10px] text-[var(--fc-text-muted)] truncate">{user?.role} • Exit Org</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4NiIgaGVpZ2h0PSI4NiI+PGNpcmNsZSBjeD0iNDMiIGN5PSI0MyIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPjwvc3ZnPg==')]">
            
            {/* Header Area */}
            <header className="sticky top-0 z-30 px-5 md:px-8 py-4 md:py-5 flex items-center justify-between border-b border-[var(--fc-border-subtle)]"
                    style={{ background: 'rgba(5, 9, 18, 0.6)', backdropFilter: 'blur(24px)' }}>
                <div className="flex items-center gap-3 md:gap-4">
                    {/* Mobile Hamburger toggle */}
                    <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1.5 -ml-2 text-[var(--fc-text-muted)] hover:text-white rounded-md bg-[rgba(255,255,255,0.05)] border border-[var(--fc-border-subtle)]">
                        <Menu size={20} />
                    </button>
                    <div className="w-10 h-10 hidden sm:flex rounded-xl bg-[var(--fc-bg-panel)] border border-[var(--fc-border-subtle)] items-center justify-center text-[var(--fc-text-primary)] font-bold fc-heading text-lg">
                        {user?.organization?.name ? user.organization.name.charAt(0).toUpperCase() : 'W'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--fc-text-muted)] uppercase tracking-wider font-semibold mb-1">
                            <span>Sandbox</span> <span className="text-[var(--fc-text-dim)]">&gt;</span> 
                            <span>{user?.organization?.name || 'Workspace'}</span> <span className="text-[var(--fc-text-dim)]">&gt;</span> 
                            <span className="text-[var(--fc-text-primary)]">Lead View</span>
                        </div>
                        <h1 className="fc-heading text-2xl font-bold text-white flex items-center gap-2">
                            Dashboard <span className="text-[var(--fc-purple)]">v2.0</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search Mockup */}
                    <div className="hidden md:flex items-center gap-2 bg-[var(--fc-bg-panel)] px-4 py-2 rounded-full border border-[var(--fc-border-subtle)] w-64 hover:border-[var(--fc-border-hover)] transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fc-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" placeholder="Search in Firm..." className="bg-transparent border-none outline-none text-sm w-full text-[var(--fc-text-primary)] placeholder-[var(--fc-text-muted)]" />
                        <Settings2 size={16} className="text-[var(--fc-text-muted)] cursor-pointer hover:text-white" />
                    </div>
                    
                    <NotificationDropdown />
                    <button onClick={logout} className="p-2 rounded-lg text-[var(--fc-text-muted)] hover:text-[var(--fc-red)] hover:bg-[var(--fc-bg-surface)] transition-all">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <div className="p-8">
                
                {/* Tabs / Sub-nav */}
                <div className="flex items-center gap-6 sm:gap-8 mb-8 border-b border-[var(--fc-border-subtle)] w-full overflow-x-auto scrollbar-hide">
                    <button onClick={() => setActiveTab('tasks')} 
                        className={`flex items-center gap-2 pb-3 text-sm font-bold fc-heading uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'tasks' ? 'text-[var(--fc-purple)] border-b-2 border-[var(--fc-purple)] -mb-[1px]' : 'text-[var(--fc-text-muted)] hover:text-white border-b-2 border-transparent'}`}>
                        <LayoutGrid size={16} /> Kanban
                    </button>
                    <button onClick={() => setActiveTab('list')} 
                        className={`flex items-center gap-2 pb-3 text-sm font-bold fc-heading uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'list' ? 'text-[var(--fc-purple)] border-b-2 border-[var(--fc-purple)] -mb-[1px]' : 'text-[var(--fc-text-muted)] hover:text-white border-b-2 border-transparent'}`}>
                        <List size={16} /> List View
                    </button>
                    <button onClick={() => setActiveTab('table')} 
                        className={`flex items-center gap-2 pb-3 text-sm font-bold fc-heading uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'table' ? 'text-[var(--fc-purple)] border-b-2 border-[var(--fc-purple)] -mb-[1px]' : 'text-[var(--fc-text-muted)] hover:text-white border-b-2 border-transparent'}`}>
                        <Table size={16} /> Table
                    </button>
                    <button onClick={() => setActiveTab('calendar')} 
                        className={`flex items-center gap-2 pb-3 text-sm font-bold fc-heading uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'calendar' ? 'text-[var(--fc-purple)] border-b-2 border-[var(--fc-purple)] -mb-[1px]' : 'text-[var(--fc-text-muted)] hover:text-white border-b-2 border-transparent'}`}>
                        <CalendarDays size={16} /> Calendar
                    </button>
                    <div className="h-5 w-px bg-[var(--fc-border-subtle)] mx-2 hidden sm:block"></div>
                    <button onClick={() => setActiveTab('team')} 
                        className={`flex items-center gap-2 pb-3 text-sm font-bold fc-heading uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'team' ? 'text-[var(--fc-purple)] border-b-2 border-[var(--fc-purple)] -mb-[1px]' : 'text-[var(--fc-text-muted)] hover:text-white border-b-2 border-transparent'}`}>
                        <Users size={16} /> Team Management
                        {requests.joinRequests.length + requests.exitRequests.length > 0 && (
                            <span className="bg-[var(--fc-orange)] text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.joinRequests.length + requests.exitRequests.length}</span>
                        )}
                    </button>
                </div>

                {/* ═══ Tasks Tab (Kanban Mode) ═══ */}
                {activeTab === 'tasks' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            {statusColumns.map((status, colIdx) => {
                                const colTasks = tasks.filter(t => t.status === status);
                                // Determine indicator color based on column
                                let indicatorColor = 'var(--fc-blue)';
                                if (status === 'Completed') indicatorColor = 'var(--fc-green)';
                                if (status === 'Pending') indicatorColor = 'var(--fc-orange)';
                                if (status === 'Under Review') indicatorColor = 'var(--fc-purple)';
                                if (status === 'Rejected') indicatorColor = 'var(--fc-red)';

                                return (
                                    <div key={status} className="flex flex-col gap-4">
                                        {/* Column Header */}
                                        <div className="flex items-center justify-between pb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: indicatorColor }} />
                                                <h3 className="fc-heading font-bold text-[15px]">{status} <span className="text-[var(--fc-text-muted)] font-medium text-sm ml-1">({colTasks.length})</span></h3>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-40 hover:opacity-100 cursor-pointer transition-opacity">
                                                <MoreHorizontal size={16} />
                                            </div>
                                        </div>
                                        
                                        {/* "Add Card" ghost button at top of column */}
                                        {status === 'Pending' && (
                                            <button onClick={() => setShowTaskModal(true)} 
                                                className="w-full py-3 rounded-xl border border-dashed border-[var(--fc-border)] text-[var(--fc-text-muted)] hover:text-white hover:border-[var(--fc-border-hover)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.03)] transition-all flex justify-center items-center">
                                                <Plus size={18} />
                                            </button>
                                        )}

                                        {/* Cards container */}
                                        <div className="fc-stagger space-y-4">
                                            {colTasks.map((task, i) => (
                                                <div key={task._id} 
                                                    className="fc-card p-4 cursor-pointer group"
                                                    onClick={() => { setSelectedTask(task); setEditForm({ title: task.title, description: task.description, type: task.type, assigned_to: task.assigned_to?._id || '', builder: task.builder || '', property_type: task.property_type || '', category: task.category || '', sector: task.sector || '', deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '' }); setIsEditing(false); setShowDetailModal(true); }}>
                                                    
                                                    {/* Tags Row */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={getTypeColor(task.type)}>
                                                            {task.type}
                                                        </span>
                                                        {task.deadline && (
                                                            <span className="flex items-center gap-1 text-[10px] text-[var(--fc-orange)] font-bold bg-[var(--fc-orange-dim)] px-2 py-0.5 rounded-full">
                                                                <Clock size={10} /> {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        )}
                                                        {task.category && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--fc-bg-surface)] text-[var(--fc-text-muted)]">
                                                                {task.category}
                                                            </span>
                                                        )}
                                                        <span className="ml-auto text-[10px] text-[var(--fc-text-dim)] font-medium">
                                                            {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>

                                                    {/* Title & Desc */}
                                                    <h4 className="fc-heading font-bold text-[16px] text-white leading-tight mb-2 group-hover:text-[var(--fc-purple)] transition-colors">
                                                        {task.title}
                                                    </h4>
                                                    <p className="text-[13px] text-[var(--fc-text-secondary)] line-clamp-2 leading-snug mb-4 font-medium">
                                                        {task.description || "No description provided."}
                                                    </p>

                                                    {/* Bottom Row */}
                                                    <div className="flex items-center justify-between mt-auto">
                                                        {/* Avatars */}
                                                        <div className="flex -space-x-2">
                                                            {task.assigned_to ? (
                                                                <div className="w-6 h-6 rounded-full bg-[var(--fc-blue-hover)] border border-[var(--fc-bg-panel)] flex items-center justify-center text-[10px] font-bold text-black z-10">
                                                                    {task.assigned_to.username?.charAt(0).toUpperCase()}
                                                                </div>
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-[var(--fc-bg-surface)] border border-[var(--fc-bg-panel)] flex items-center justify-center text-[10px] font-bold text-[var(--fc-text-muted)] z-10 border-dashed">
                                                                    <Plus size={10} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Icons */}
                                                        <div className="flex items-center gap-3 text-[var(--fc-text-dim)]">
                                                            <div className="flex items-center gap-1 text-[11px] font-bold group-hover:text-[var(--fc-text-muted)] transition-colors"><MessageSquare size={12}/> {task.proof_of_work ? '1' : '0'}</div>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar visual flare */}
                                                    <div className="fc-progress-bar">
                                                        <div className="fc-progress-fill" style={{ width: `${getProgress(task.status)}%`, background: indicatorColor }} />
                                                    </div>
                                                </div>
                                            ))}
                                            {colTasks.length === 0 && status !== 'Pending' && (
                                                <div className="opacity-0 pb-12"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ═══ List View Tab ═══ */}
                {activeTab === 'list' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3 max-w-5xl">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="fc-heading text-xl font-bold text-white mb-1">All Tasks List</h2>
                                <p className="text-[var(--fc-text-muted)] text-sm">A vertical view of all tasks across the organization.</p>
                            </div>
                            <button onClick={() => setShowTaskModal(true)} className="fc-btn-primary flex items-center gap-2 text-sm py-2 px-4">
                                <Plus size={16} /> New Task
                            </button>
                        </div>
                        {tasks.length === 0 && <div className="text-center py-12 text-[var(--fc-text-muted)] border border-dashed border-[var(--fc-border)] rounded-xl mt-4">No tasks found.</div>}
                        {tasks.map(task => {
                            let indicatorColor = 'var(--fc-blue)';
                            if (task.status === 'Completed') indicatorColor = 'var(--fc-green)';
                            if (task.status === 'Pending') indicatorColor = 'var(--fc-orange)';
                            if (task.status === 'Under Review') indicatorColor = 'var(--fc-purple)';
                            if (task.status === 'Rejected') indicatorColor = 'var(--fc-red)';

                            return (
                                <div key={task._id} 
                                    className="fc-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group hover:border-[var(--fc-purple)] transition-all"
                                    onClick={() => { setSelectedTask(task); setEditForm({ title: task.title, description: task.description, type: task.type, assigned_to: task.assigned_to?._id || '', builder: task.builder || '', property_type: task.property_type || '', category: task.category || '', sector: task.sector || '' }); setIsEditing(false); setShowDetailModal(true); }}>
                                    
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="min-w-[4px] w-1 h-12 rounded-full mt-1" style={{ background: indicatorColor }} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="fc-heading font-bold text-[16px] text-white truncate group-hover:text-[var(--fc-purple)] transition-colors">{task.title}</h4>
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider" style={getTypeColor(task.type)}>
                                                    {task.type}
                                                </span>
                                            </div>
                                            <p className="text-[13px] text-[var(--fc-text-secondary)] truncate font-medium">{task.description || "No description provided."}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-[var(--fc-text-muted)] uppercase tracking-wider font-bold mb-1">Status</span>
                                            <span className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider" style={{ color: indicatorColor }}>
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: indicatorColor }}></div>
                                                {task.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-col hidden sm:flex min-w-[120px]">
                                            <span className="text-[10px] text-[var(--fc-text-muted)] uppercase tracking-wider font-bold mb-1">Assignee</span>
                                            <div className="flex items-center gap-2">
                                                {task.assigned_to ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-[var(--fc-blue-hover)] flex items-center justify-center text-[9px] font-bold text-black">{task.assigned_to.username?.charAt(0).toUpperCase()}</div>
                                                        <span className="text-[var(--fc-text-primary)] font-medium text-[13px] truncate max-w-[80px]">{task.assigned_to.username}</span>
                                                    </div>
                                                ) : <span className="text-[var(--fc-text-dim)] italic text-[13px]">Unassigned</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col hidden md:flex items-end min-w-[80px]">
                                            <span className="text-[10px] text-[var(--fc-text-muted)] uppercase tracking-wider font-bold mb-1">Created</span>
                                            <span className="text-[var(--fc-text-secondary)] font-medium text-[13px]">{new Date(task.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}

                {/* ═══ Table View Tab ═══ */}
                {activeTab === 'table' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full w-full max-w-6xl">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="fc-heading text-xl font-bold text-white mb-1">Tasks Database</h2>
                                <p className="text-[var(--fc-text-muted)] text-sm">Spreadsheet-style view of all organization data.</p>
                            </div>
                            <button onClick={() => setShowTaskModal(true)} className="fc-btn-primary flex items-center gap-2 text-sm py-2 px-4">
                                <Plus size={16} /> New Task
                            </button>
                        </div>
                        <div className="fc-card overflow-hidden w-full mt-4">
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-[rgba(11,17,32,0.4)] border-b border-[var(--fc-border)] text-[var(--fc-text-muted)] text-[10px] uppercase tracking-wider font-bold">
                                            <th className="p-4 w-1/3 min-w-[200px]">Task Name</th>
                                            <th className="p-4 min-w-[120px]">Status</th>
                                            <th className="p-4 min-w-[150px]">Assignee</th>
                                            <th className="p-4 min-w-[100px]">Type</th>
                                            <th className="p-4 min-w-[100px] text-right">Date Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--fc-border-subtle)]">
                                        {tasks.length === 0 && (
                                            <tr><td colSpan="5" className="p-8 text-center text-[var(--fc-text-muted)]">No tasks found.</td></tr>
                                        )}
                                        {tasks.map(task => {
                                            let indicatorColor = 'var(--fc-blue)';
                                            if (task.status === 'Completed') indicatorColor = 'var(--fc-green)';
                                            if (task.status === 'Pending') indicatorColor = 'var(--fc-orange)';
                                            if (task.status === 'Under Review') indicatorColor = 'var(--fc-purple)';
                                            if (task.status === 'Rejected') indicatorColor = 'var(--fc-red)';

                                            return (
                                                <tr key={task._id} 
                                                    className="hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer group"
                                                    onClick={() => { setSelectedTask(task); setEditForm({ title: task.title, description: task.description, type: task.type, assigned_to: task.assigned_to?._id || '', builder: task.builder || '', property_type: task.property_type || '', category: task.category || '', sector: task.sector || '' }); setIsEditing(false); setShowDetailModal(true); }}>
                                                    <td className="p-4">
                                                        <p className="fc-heading font-bold text-[14px] text-white group-hover:text-[var(--fc-purple)] transition-colors truncate max-w-[300px]">{task.title}</p>
                                                        <p className="text-[12px] text-[var(--fc-text-dim)] truncate max-w-[300px]">{task.description || 'No description'}</p>
                                                    </td>
                                                    <td className="p-4 flex items-center h-full pt-[22px]">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-bold text-[10px] uppercase tracking-wider" 
                                                              style={{ background: `${indicatorColor}15`, color: indicatorColor, borderColor: `${indicatorColor}30` }}>
                                                            <div className="w-1 h-1 rounded-full" style={{ background: indicatorColor }}></div>
                                                            {task.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        {task.assigned_to ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded bg-[var(--fc-bg-surface)] border border-[var(--fc-border)] flex items-center justify-center text-[10px] font-bold text-white">{task.assigned_to.username?.charAt(0).toUpperCase()}</div>
                                                                <span className="text-[var(--fc-text-secondary)] font-medium text-[13px]">{task.assigned_to.username}</span>
                                                            </div>
                                                        ) : <span className="text-[var(--fc-text-dim)] italic text-[13px]">Unassigned</span>}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-[11px] font-bold uppercase tracking-wider" style={getTypeColor(task.type)}>{task.type}</span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="text-[12px] font-medium text-[var(--fc-text-muted)]">{new Date(task.createdAt).toLocaleDateString()}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══ Calendar Tab ═══ */}
                {activeTab === 'calendar' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full w-full max-w-6xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="fc-heading text-xl font-bold text-white mb-1">Calendar & Deadlines</h2>
                                <p className="text-[var(--fc-text-muted)] text-sm">Visual schedule of due tasks and milestones.</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="fc-btn-ghost !px-3"><ChevronLeft size={18} /></button>
                                <div className="fc-card flex items-center justify-center px-4 font-bold text-white w-40">
                                    {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                </div>
                                <button onClick={nextMonth} className="fc-btn-ghost !px-3"><ChevronRight size={18} /></button>
                                <button onClick={() => setShowTaskModal(true)} className="fc-btn-primary flex items-center gap-2 text-sm ml-2">
                                    <Plus size={16} /> New Task
                                </button>
                            </div>
                        </div>

                        <div className="fc-card bg-[var(--fc-bg-panel)] overflow-hidden">
                            {/* Days Header */}
                            <div className="grid grid-cols-7 border-b border-[var(--fc-border-subtle)] bg-[rgba(11,17,32,0.4)]">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="p-3 text-center text-[11px] font-bold uppercase tracking-wider text-[var(--fc-text-dim)]">{day}</div>
                                ))}
                            </div>
                            
                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 auto-rows-fr">
                                {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="min-h-[120px] p-2 border-b border-r border-[var(--fc-border-subtle)] bg-[rgba(255,255,255,0.01)] opacity-50"></div>
                                ))}
                                
                                {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                                    const date = i + 1;
                                    const cellDateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date).toDateString();
                                    
                                    // Find tasks due today
                                    const dayTasks = tasks.filter(task => {
                                        if (!task.deadline) return false;
                                        return new Date(task.deadline).toDateString() === cellDateStr;
                                    });

                                    const isToday = new Date().toDateString() === cellDateStr;

                                    return (
                                        <div key={date} className={`min-h-[120px] p-2 border-b border-r border-[var(--fc-border-subtle)] transition-colors hover:bg-[rgba(255,255,255,0.02)] ${isToday ? 'bg-[rgba(140,114,219,0.05)] shadow-[inset_0_0_0_1px_var(--fc-purple)]' : ''}`}>
                                            <div className={`text-xs font-bold mb-2 flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-[var(--fc-purple)] text-black' : 'text-[var(--fc-text-muted)]'}`}>
                                                {date}
                                            </div>
                                            <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide pr-1">
                                                {dayTasks.map(task => {
                                                    let indicatorColor = 'var(--fc-blue)';
                                                    if (task.status === 'Completed') indicatorColor = 'var(--fc-green)';
                                                    if (task.status === 'Pending') indicatorColor = 'var(--fc-orange)';
                                                    if (task.status === 'Under Review') indicatorColor = 'var(--fc-purple)';
                                                    if (task.status === 'Rejected') indicatorColor = 'var(--fc-red)';

                                                    return (
                                                        <div key={task._id} 
                                                            onClick={() => { setSelectedTask(task); setEditForm({ title: task.title, description: task.description, type: task.type, assigned_to: task.assigned_to?._id || '', builder: task.builder || '', property_type: task.property_type || '', category: task.category || '', sector: task.sector || '', deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '' }); setIsEditing(false); setShowDetailModal(true); }}
                                                            className="text-[10px] p-1.5 rounded bg-[var(--fc-bg-surface)] border-l-2 truncate cursor-pointer hover:opacity-80 transition-opacity"
                                                            style={{ borderLeftColor: indicatorColor, color: 'var(--fc-text-secondary)' }}
                                                            title={task.title}>
                                                            {task.title}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══ Team Tab ═══ */}
                {activeTab === 'team' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl">
                         <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="fc-heading text-2xl font-bold mb-1">Organization Members</h2>
                                <p className="text-[var(--fc-text-muted)] text-sm">Manage user access and pending requests.</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowAddUserModal(true)} className="fc-btn-primary flex items-center gap-2 text-sm">
                                    <UserPlus size={16} /> Add Member
                                </button>
                                <button onClick={() => setShowExitModal(true)} className="fc-btn-ghost flex items-center gap-2 text-sm hover:text-[var(--fc-red)] hover:border-[var(--fc-red-dim)]">
                                    Exit Org
                                </button>
                            </div>
                        </div>

                        {/* Pending Requests */}
                        {(requests.joinRequests.length > 0 || requests.exitRequests.length > 0) && (
                            <div className="mb-10 p-6 rounded-2xl bg-[var(--fc-orange-dim)] border border-[rgba(219,134,72,0.2)]">
                                <h3 className="fc-heading text-lg font-bold text-[var(--fc-orange)] mb-4">Pending Requests</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[...requests.joinRequests, ...requests.exitRequests].map((r, i) => {
                                        const isJoin = r.role !== undefined;
                                        return (
                                            <div key={r._id || i} className="fc-card-raised p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[var(--fc-bg-surface)] flex items-center justify-center font-bold text-white">
                                                        {r.userId?.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-[15px]">{r.userId?.username}</p>
                                                        <p className="text-sm text-[var(--fc-text-muted)]">
                                                            {isJoin ? `Wants to join as ${r.role}` : 'Wants to exit the organization'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleRequestAction(isJoin ? 'join' : 'exit', r._id, 'approve')}
                                                        className="fc-btn-primary !bg-[var(--fc-green)] !text-black !py-1.5 !px-3 !text-xs">Approve</button>
                                                    <button onClick={() => handleRequestAction(isJoin ? 'join' : 'exit', r._id, 'reject')}
                                                        className="fc-btn-danger !py-1.5 !px-3 !text-xs">Reject</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Team Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 fc-stagger">
                            {/* Current user card */}
                            <div className="fc-card p-6 flex flex-col items-center text-center group cursor-pointer hover:border-[var(--fc-purple)] transition-colors"
                                onClick={() => setSelectedAssociateDetail(user)}>
                                <div className="w-16 h-16 rounded-full bg-[var(--fc-purple-dim)] border-2 border-[var(--fc-purple)] flex items-center justify-center font-bold text-2xl text-[var(--fc-purple)] mb-4">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="fc-heading font-bold text-lg text-white">{user?.username}</h3>
                                <p className="text-sm text-[var(--fc-text-muted)] mb-4">You</p>
                                <span className="fc-badge bg-[var(--fc-purple-dim)] text-[var(--fc-purple)]">Lead Admin</span>
                            </div>

                            {users.map(u => (
                                <div key={u._id} className="fc-card p-6 flex flex-col items-center text-center group cursor-pointer hover:border-[var(--fc-purple)] transition-colors"
                                    onClick={() => setSelectedAssociateDetail(u)}>
                                    <button onClick={() => handleDeleteUser(u._id, u.username)}
                                        className="absolute top-3 right-3 text-[var(--fc-text-dim)] hover:text-[var(--fc-red)] hover:bg-[var(--fc-red-dim)] p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                        <XCircle size={16} />
                                    </button>
                                    <div className="w-16 h-16 rounded-full bg-[var(--fc-bg-surface)] border-2 border-[var(--fc-border)] flex items-center justify-center font-bold text-2xl text-[var(--fc-text-secondary)] mb-4 group-hover:border-[var(--fc-blue)] transition-colors">
                                        {u.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <h3 className="fc-heading font-bold text-lg text-white">{u.username}</h3>
                                    <p className="text-sm text-[var(--fc-text-muted)] mb-4">{u.email}</p>
                                    <span className={`fc-badge ${u.role === 'Lead' ? 'bg-[var(--fc-purple-dim)] text-[var(--fc-purple)]' : 'bg-[var(--fc-blue-dim)] text-[var(--fc-blue)]'}`}>
                                        {u.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ═══ Analytics Tab ═══ */}
                {activeTab === 'analytics' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-6xl w-full">
                        <div className="mb-2">
                            <h2 className="fc-heading text-2xl font-bold mb-1">Workspace Analytics</h2>
                            <p className="text-[var(--fc-text-muted)] text-sm">Visualize task distribution, team workloads, and overall progress.</p>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="fc-card p-5 border-t-[3px] border-t-[var(--fc-blue)]">
                                <h4 className="text-[11px] font-bold text-[var(--fc-text-muted)] uppercase tracking-wider mb-2">Total Tasks</h4>
                                <p className="text-3xl font-bold text-white mb-1">{tasks.length}</p>
                                <p className="text-xs text-[var(--fc-blue)]">+12% from last week</p>
                            </div>
                            <div className="fc-card p-5 border-t-[3px] border-t-[var(--fc-orange)]">
                                <h4 className="text-[11px] font-bold text-[var(--fc-text-muted)] uppercase tracking-wider mb-2">Pending Pipeline</h4>
                                <p className="text-3xl font-bold text-white mb-1">{tasks.filter(t=>t.status==='Pending').length}</p>
                                <p className="text-xs text-[var(--fc-text-dim)]">Awaiting assignment</p>
                            </div>
                            <div className="fc-card p-5 border-t-[3px] border-t-[var(--fc-purple)]">
                                <h4 className="text-[11px] font-bold text-[var(--fc-text-muted)] uppercase tracking-wider mb-2">In Progress</h4>
                                <p className="text-3xl font-bold text-white mb-1">{tasks.filter(t=>['In Progress', 'Under Review'].includes(t.status)).length}</p>
                                <p className="text-xs text-[var(--fc-purple)]">Active workloads</p>
                            </div>
                            <div className="fc-card p-5 border-t-[3px] border-t-[var(--fc-green)]">
                                <h4 className="text-[11px] font-bold text-[var(--fc-text-muted)] uppercase tracking-wider mb-2">Total Completed</h4>
                                <p className="text-3xl font-bold text-white mb-1">{tasks.filter(t=>t.status==='Completed').length}</p>
                                <p className="text-xs text-[var(--fc-green)] flex items-center gap-1"><CheckCircle size={10}/> Firm target met</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Status Distribution */}
                            <div className="fc-card p-6">
                                <h3 className="fc-heading text-lg font-bold text-white mb-6">Status Distribution</h3>
                                <div className="space-y-4">
                                    {['Pending', 'In Progress', 'Under Review', 'Completed'].map(status => {
                                        const count = tasks.filter(t => t.status === status).length;
                                        const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
                                        let color = 'var(--fc-blue)';
                                        if (status === 'Completed') color = 'var(--fc-green)';
                                        if (status === 'Pending') color = 'var(--fc-orange)';
                                        if (status === 'Under Review') color = 'var(--fc-purple)';
                                        
                                        return (
                                            <div key={status}>
                                                <div className="flex justify-between items-center mb-1.5 text-sm">
                                                    <span className="font-bold text-[var(--fc-text-secondary)]">{status}</span>
                                                    <span className="text-[var(--fc-text-muted)] font-mono">{percentage}% ({count})</span>
                                                </div>
                                                <div className="w-full h-2.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full" style={{ background: color }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Task Demographics */}
                            <div className="fc-card p-6">
                                <h3 className="fc-heading text-lg font-bold text-white mb-6">Task Demographics</h3>
                                <div className="space-y-4">
                                    {['Custom', 'Registry', 'Payment', 'Corporate'].map(type => {
                                        const count = tasks.filter(t => t.type === type).length;
                                        const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
                                        const { bg, text } = getTypeColor(type);
                                        
                                        return (
                                            <div key={type}>
                                                <div className="flex justify-between items-center mb-1.5 text-sm">
                                                    <span className="font-bold" style={{ color: text }}>{type}</span>
                                                    <span className="text-[var(--fc-text-muted)] font-mono">{percentage}% ({count})</span>
                                                </div>
                                                <div className="w-full h-2.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="h-full rounded-full" style={{ background: text }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Team Workloads */}
                            <div className="fc-card p-6 lg:col-span-2">
                                <h3 className="fc-heading text-lg font-bold text-white mb-6">Team Workloads</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {users.map(u => {
                                        const userTasks = tasks.filter(t => t.assigned_to?._id === u._id);
                                        const activeTasks = userTasks.filter(t => ['Pending', 'In Progress', 'Under Review'].includes(t.status)).length;
                                        const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
                                        
                                        return (
                                            <div key={u._id} className="p-4 rounded-xl border border-[var(--fc-border-subtle)] bg-[rgba(255,255,255,0.02)]">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-[var(--fc-purple-dim)] border border-[var(--fc-purple)] flex items-center justify-center font-bold text-[var(--fc-purple)] text-xs">
                                                        {u.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-white text-sm truncate w-full">{u.username}</p>
                                                        <p className="text-[10px] text-[var(--fc-text-dim)]">{u.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-end gap-4 mt-2">
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--fc-orange)] mb-1">Active</p>
                                                        <p className="text-xl font-bold text-white">{activeTasks}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--fc-green)] mb-1">Done</p>
                                                        <p className="text-xl font-bold text-[var(--fc-text-muted)]">{completedTasks}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══ Settings Tab ═══ */}
                {activeTab === 'settings' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl">
                        <div className="mb-8">
                            <h2 className="fc-heading text-2xl font-bold mb-1">Organization Settings</h2>
                            <p className="text-[var(--fc-text-muted)] text-sm">Manage your workspace preferences and profile details.</p>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Profile Section */}
                            <div className="fc-card p-6 border-t-[var(--fc-purple)] border-t-[3px]">
                                <h3 className="fc-heading text-lg font-bold text-white mb-4 border-b border-[var(--fc-border-subtle)] pb-2 flex items-center gap-2">
                                    <Users size={18} className="text-[var(--fc-purple)]" /> Profile Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="fc-label">Username</label>
                                        <div className="fc-input bg-[rgba(255,255,255,0.02)] border-[var(--fc-border-subtle)] text-[var(--fc-text-secondary)] opacity-80 cursor-not-allowed">
                                            {user?.username}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="fc-label">Email Address</label>
                                        <div className="fc-input bg-[rgba(255,255,255,0.02)] border-[var(--fc-border-subtle)] text-[var(--fc-text-secondary)] opacity-80 cursor-not-allowed">
                                            {user?.email || 'admin@firm.com'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="fc-label">Role Definition</label>
                                        <div className="fc-input bg-[rgba(255,255,255,0.02)] border-[var(--fc-border-subtle)] font-bold text-[var(--fc-purple)] opacity-80 cursor-not-allowed flex items-center justify-between">
                                            <span>{user?.role}</span>
                                            <Briefcase size={14} className="text-[var(--fc-text-muted)]"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="fc-label">Account Action</label>
                                        <button onClick={() => setShowExitModal(true)} className="fc-btn-danger w-full py-3 flex items-center justify-center gap-2">
                                            <LogOut size={16}/> Exit Organization
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Workspace Section */}
                            <div className="fc-card p-6 border-t-[var(--fc-blue)] border-t-[3px]">
                                <h3 className="fc-heading text-lg font-bold text-white mb-4 border-b border-[var(--fc-border-subtle)] pb-2 flex items-center gap-2">
                                    <Briefcase size={18} className="text-[var(--fc-blue)]" /> Workspace Options
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="fc-label">Organization ID</label>
                                        <div className="fc-input bg-[rgba(255,255,255,0.02)] border-[var(--fc-border-subtle)] text-[var(--fc-text-secondary)] opacity-80 cursor-not-allowed flex items-center gap-2">
                                            <div className="w-5 h-5 rounded bg-[var(--fc-bg-surface)] flex items-center justify-center text-[10px] font-bold text-white border border-[var(--fc-border)]">
                                                {user?.organization?.name ? user.organization.name.charAt(0).toUpperCase() : 'F'}
                                            </div>
                                            {user?.organization?._id || 'ORG-10X-SANDBOX'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="fc-label">Theme Engine</label>
                                        <div className="fc-input bg-[var(--fc-purple-dim)] border-[var(--fc-purple)] text-[var(--fc-purple)] font-bold cursor-not-allowed flex items-center justify-between">
                                            <span>TaskWhiz v2.0 (Active)</span>
                                            <span className="w-3 h-3 rounded-full bg-[var(--fc-purple)] shadow-[0_0_8px_var(--fc-purple)]"></span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <h4 className="fc-label mt-2 mb-3">Notification Preferences</h4>
                                        <div className="flex flex-col gap-4 bg-[rgba(11,17,32,0.4)] p-4 rounded-xl border border-[var(--fc-border-subtle)]">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="w-5 h-5 rounded border border-[var(--fc-purple)] bg-[var(--fc-purple-dim)] flex items-center justify-center text-[var(--fc-purple)] shadow-inner"><CheckCircle size={14}/></div>
                                                <span className="text-sm font-bold text-[var(--fc-text-primary)] group-hover:text-white transition-colors">In-app notifications for task updates</span>
                                                <span className="ml-auto text-[10px] uppercase font-bold text-[var(--fc-purple)] bg-[var(--fc-purple-dim)] px-2 py-0.5 rounded-full">Active</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group opacity-50">
                                                <div className="w-5 h-5 rounded border border-[var(--fc-border)] bg-[rgba(255,255,255,0.02)] flex items-center justify-center"></div>
                                                <span className="text-sm font-bold text-[var(--fc-text-secondary)] transition-colors">Daily email status summaries</span>
                                                <span className="ml-auto text-[9px] uppercase font-bold text-[var(--fc-text-muted)] border border-[var(--fc-border)] px-1.5 py-0.5 rounded">Coming Soon</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group opacity-50">
                                                <div className="w-5 h-5 rounded border border-[var(--fc-border)] bg-[rgba(255,255,255,0.02)] flex items-center justify-center"></div>
                                                <span className="text-sm font-bold text-[var(--fc-text-secondary)] transition-colors">Slack Integrations</span>
                                                <span className="ml-auto text-[9px] uppercase font-bold text-[var(--fc-text-muted)] border border-[var(--fc-border)] px-1.5 py-0.5 rounded">Coming Soon</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ═════════════════════════════════════════════ */}
            {/* MODALS                                       */}
            {/* ═════════════════════════════════════════════ */}

            {/* Modals remain mostly identical to logic but using the new classes inside Modal.jsx which should be globally styled correctly. Note Modal.jsx may need update too. */}
            <AnimatePresence>
                {showAddUserModal && (
                    <Modal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)} title="Add Team Member">
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="fc-label">Full Name</label>
                                <input className="fc-input" required value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="fc-label">Email</label>
                                <input type="email" className="fc-input" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="user@firm.com" />
                            </div>
                            <div>
                                <label className="fc-label">Password</label>
                                <input type="password" className="fc-input" required value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="fc-label">Role</label>
                                <select className="fc-input" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                                    <option value="Associate">Associate</option>
                                    <option value="Lead">Lead</option>
                                </select>
                            </div>
                            <button type="submit" className="fc-btn-primary w-full py-3">Register User</button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Create Task Modal */}
            <AnimatePresence>
                {showTaskModal && (
                    <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create New Task">
                        <form onSubmit={handleCreateTask} className="space-y-5">
                            <div>
                                <label className="fc-label">Task Title</label>
                                <input className="fc-input" required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="e.g. Review Contracts" />
                            </div>
                            <div>
                                <label className="fc-label">Description</label>
                                <textarea className="fc-input" rows="3" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Enter task details..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="fc-label">Type</label>
                                    <select className="fc-input" value={taskForm.type} onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}>
                                        <option value="Custom">Custom</option>
                                        <option value="Registry">Registry</option>
                                        <option value="Payment">Payment</option>
                                        <option value="Corporate">Corporate</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="fc-label">Assign To</label>
                                    <select className="fc-input" value={taskForm.assigned_to} onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}>
                                        <option value="">Select Associate...</option>
                                        <option value={user?._id}>Assign to Me</option>
                                        {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.role})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="fc-label">Deadline (Optional)</label>
                                    <input type="date" className="fc-input" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} />
                                </div>
                            </div>
                            
                            {/* Simplified Property Filters */}
                            <div className="pt-4 border-t border-[var(--fc-border-subtle)]">
                                <h3 className="fc-heading text-sm font-bold text-white mb-3">Property Filters (Optional)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="fc-label">Property Type</label>
                                        <select className="fc-input" value={taskForm.property_type} onChange={(e) => setTaskForm({ ...taskForm, property_type: e.target.value })}>
                                            <option value="">Select...</option>
                                            <option value="Residential">Residential</option>
                                            <option value="Commercial">Commercial</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="fc-label">Category</label>
                                        <select className="fc-input" value={taskForm.category} onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}>
                                            <option value="">Select...</option>
                                            <option value="Flat">Flat</option>
                                            <option value="Plot">Plot</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="fc-btn-primary w-full py-3 mt-2">Create Task</button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Detail / Edit Modal */}
            <AnimatePresence>
                {selectedTask && showDetailModal && (
                    <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={isEditing ? 'Edit Task' : selectedTask.title}>
                        {!isEditing ? (
                            <div className="space-y-6">
                                {user.role === 'Lead' && (
                                    <div className="flex justify-end -mt-2 mb-2 gap-3 items-center">
                                        {selectedTask.status !== 'Completed' && (
                                            <button onClick={async () => {
                                                    const isConfirmed = await confirm({ title: 'Complete Task', message: 'Mark this task as completed?', confirmText: 'Complete', type: 'success' });
                                                    if (!isConfirmed) return;
                                                    try {
                                                        await axios.patch(`/api/tasks/${selectedTask._id}`, { status: 'Completed' });
                                                        showToast('Task marked as Completed!', 'success');
                                                        setShowDetailModal(false);
                                                        fetchTasks();
                                                    } catch { showToast('Failed to complete task', 'error'); }
                                                }}
                                                className="text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 bg-[var(--fc-green-dim)] text-[var(--fc-green)] hover:bg-[var(--fc-green)] hover:text-black transition-all">
                                                <CheckCircle size={14} /> Mark Complete
                                            </button>
                                        )}
                                        {selectedTask.status !== 'Completed' && (
                                            <button onClick={() => setIsEditing(true)}
                                                className="text-xs font-bold text-[var(--fc-purple)] hover:text-[var(--fc-purple-hover)] uppercase tracking-wider">
                                                Edit Task
                                            </button>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <h3 className="fc-label !text-xs !mb-2 uppercase tracking-widest text-[var(--fc-text-dim)]">Description</h3>
                                    <p className="fc-card-raised p-4 text-[14px] text-[var(--fc-text-secondary)]">{selectedTask.description || 'No description'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 fc-card-raised p-4">
                                    {[
                                        { label: 'Type', value: selectedTask.type },
                                        { label: 'Status', value: selectedTask.status },
                                        { label: 'Assigned To', value: selectedTask.assigned_to?.username || 'N/A' },
                                        { label: 'Created', value: new Date(selectedTask.createdAt).toLocaleDateString() },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <h3 className="fc-label !text-[10px] !mb-1 uppercase tracking-widest">{item.label}</h3>
                                            <p className="text-white font-bold text-[14px]">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                {selectedTask.proof_of_work && (
                                    <div>
                                         <h3 className="fc-label !text-xs !mb-2 flex items-center gap-2 uppercase tracking-widest text-[var(--fc-purple)]">
                                            <FileText size={14} /> Proof of Work
                                        </h3>
                                        <div className="fc-card-raised p-4 whitespace-pre-wrap text-sm font-mono text-[var(--fc-text-secondary)]">
                                            {selectedTask.proof_of_work}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateTask} className="space-y-4">
                                <div>
                                    <label className="fc-label">Task Title</label>
                                    <input className="fc-input" required value={editForm.title} onChange={(e) => setEditForm(p=>({...p, title: e.target.value}))} />
                                </div>
                                <div>
                                    <label className="fc-label">Description</label>
                                    <textarea className="fc-input" rows="3" value={editForm.description} onChange={(e) => setEditForm(p=>({...p, description: e.target.value}))} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="fc-label">Type</label>
                                        <select className="fc-input" value={editForm.type} onChange={(e) => setEditForm(p=>({...p, type: e.target.value}))}>
                                            <option value="Custom">Custom</option>
                                            <option value="Registry">Registry</option>
                                            <option value="Payment">Payment</option>
                                            <option value="Corporate">Corporate</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="fc-label">Assign To</label>
                                        <select className="fc-input" value={editForm.assigned_to} onChange={(e) => setEditForm(p=>({...p, assigned_to: e.target.value}))}>
                                            <option value="">Select...</option>
                                            <option value={user?._id}>Me</option>
                                            {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="fc-label">Deadline</label>
                                        <input type="date" className="fc-input" value={editForm.deadline} onChange={(e) => setEditForm(p=>({...p, deadline: e.target.value}))} />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setIsEditing(false)} className="fc-btn-ghost flex-1 py-2.5">Cancel</button>
                                    <button type="submit" className="fc-btn-primary flex-1 py-2.5">Save Changes</button>
                                </div>
                            </form>
                        )}
                    </Modal>
                )}
            </AnimatePresence>

            {/* Associate Detail Modal */}
            <AnimatePresence>
                {selectedAssociateDetail && (
                    <Modal isOpen={!!selectedAssociateDetail} onClose={() => setSelectedAssociateDetail(null)} title="Team Member Details">
                        <div className="space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[var(--fc-border-subtle)]">
                                <div className="w-14 h-14 rounded-full bg-[var(--fc-purple-dim)] border-2 border-[var(--fc-purple)] flex items-center justify-center font-bold text-xl text-[var(--fc-purple)]">
                                    {selectedAssociateDetail.username?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedAssociateDetail.username}</h3>
                                    <p className="text-sm text-[var(--fc-text-muted)]">{selectedAssociateDetail.email}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedAssociateDetail.role === 'Lead' ? 'bg-[var(--fc-purple-dim)] text-[var(--fc-purple)]' : 'bg-[var(--fc-blue-dim)] text-[var(--fc-blue)]'}`}>
                                        {selectedAssociateDetail.role}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Quick Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="fc-card-raised p-3 text-center">
                                    <h4 className="text-[10px] font-bold text-[var(--fc-text-muted)] uppercase tracking-wider mb-1">Assigned</h4>
                                    <p className="text-2xl font-bold text-white">{tasks.filter(t => t.assigned_to?._id === selectedAssociateDetail._id).length}</p>
                                </div>
                                <div className="fc-card-raised p-3 text-center border-t-2 border-t-[var(--fc-orange)]">
                                    <h4 className="text-[10px] font-bold text-[var(--fc-text-muted)] uppercase tracking-wider mb-1">Active</h4>
                                    <p className="text-2xl font-bold text-white">{tasks.filter(t => t.assigned_to?._id === selectedAssociateDetail._id && ['Pending', 'In Progress'].includes(t.status)).length}</p>
                                </div>
                                <div className="fc-card-raised p-3 text-center border-t-2 border-t-[var(--fc-purple)]">
                                    <h4 className="text-[10px] font-bold text-[var(--fc-text-muted)] uppercase tracking-wider mb-1">Review</h4>
                                    <p className="text-2xl font-bold text-white">{tasks.filter(t => t.assigned_to?._id === selectedAssociateDetail._id && t.status === 'Under Review').length}</p>
                                </div>
                                <div className="fc-card-raised p-3 text-center border-t-2 border-t-[var(--fc-green)]">
                                    <h4 className="text-[10px] font-bold text-[var(--fc-text-muted)] uppercase tracking-wider mb-1">Done</h4>
                                    <p className="text-2xl font-bold text-white">{tasks.filter(t => t.assigned_to?._id === selectedAssociateDetail._id && t.status === 'Completed').length}</p>
                                </div>
                            </div>

                            {/* Active Task List */}
                            <div>
                                <h3 className="fc-heading text-sm font-bold text-white mb-3">Current Workload</h3>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {tasks.filter(t => t.assigned_to?._id === selectedAssociateDetail._id && t.status !== 'Completed').length > 0 ? (
                                        tasks.filter(t => t.assigned_to?._id === selectedAssociateDetail._id && t.status !== 'Completed').map(task => (
                                            <div key={task._id} className="p-3 bg-[rgba(255,255,255,0.03)] border border-[var(--fc-border-subtle)] rounded-lg flex items-center justify-between group hover:border-[var(--fc-border-hover)] transition-colors">
                                                <div className="min-w-0 pr-4">
                                                    <p className="text-sm font-bold text-white truncate">{task.title}</p>
                                                    <div className="flex gap-2 mt-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--fc-text-muted)" }}>{task.type}</span>
                                                        <span className="text-[10px] text-[var(--fc-text-dim)]">•</span>
                                                        <span className="text-[10px] flex gap-1 items-center text-[var(--fc-text-muted)]"><Clock size={10} /> {new Date(task.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-[var(--fc-text-secondary)]">{task.status}</span>
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: task.status === 'Pending' ? 'var(--fc-orange)' : task.status === 'Under Review' ? 'var(--fc-purple)' : 'var(--fc-blue)' }} />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 border border-dashed border-[var(--fc-border-subtle)] rounded-xl">
                                            <p className="text-sm text-[var(--fc-text-muted)]">No active tasks currently assigned.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            <ExitOrgModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} user={user} isLastLead={users.filter(u => u.role === 'Lead').length === 1} onExitSuccess={async (result) => { await checkUser(); if(result.exited){showToast('Organization dissolved', 'success');} }} />
        </div>
        </div>
    );
};

export default LeadDashboard;
