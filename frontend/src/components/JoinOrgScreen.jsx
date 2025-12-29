import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building2, Key, LogOut } from 'lucide-react';

const JoinOrgScreen = () => {
    const { user, logout, checkUser } = useAuth(); // checkUser to refresh state after join
    const { showToast } = useToast();
    const [orgCode, setOrgCode] = useState('');
    const [role, setRole] = useState('Associate');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/organization/join-existing', { orgCode, role });
            showToast('Join request sent successfully!', 'success');
            setSent(true);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to join', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
                <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Request Sent!</h2>
                    <p className="text-zinc-400">
                        Your request to join the organization has been sent to the Lead.
                        Please wait for approval.
                    </p>
                    <button
                        onClick={logout}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mt-4 inline-block"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
            <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Join Organization</h1>
                        <p className="text-zinc-500 text-sm mt-1">Enter an organization code to join</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-sm font-medium border border-zinc-700 hover:border-zinc-600"
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Organization Code</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                type="text"
                                required
                                value={orgCode}
                                onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-mono tracking-wider"
                                placeholder="16-CHARACTER-CODE"
                                maxLength={16}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Join As</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('Associate')}
                                className={`p-3 rounded-xl border transition-all text-sm font-medium ${role === 'Associate'
                                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                                    : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                    }`}
                            >
                                Associate
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('Lead')}
                                className={`p-3 rounded-xl border transition-all text-sm font-medium ${role === 'Lead'
                                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                                    : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                    }`}
                            >
                                Lead
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-white text-zinc-900 font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending Request...' : 'Send Join Request'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-zinc-600 text-xs">
                        Don't have a code? Ask your organization administrator.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JoinOrgScreen;
