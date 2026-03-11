import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building2, Key, LogOut } from 'lucide-react';

const JoinOrgScreen = () => {
    const { user, logout, checkUser } = useAuth();
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
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--fc-bg-deep)' }}>
                <div className="max-w-md w-full p-8 text-center space-y-4 rounded-2xl"
                    style={{ background: 'var(--fc-bg-raised)', border: '1px solid var(--fc-border)' }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'var(--fc-teal-glow)', color: 'var(--fc-teal-light)' }}>
                        <Building2 size={32} />
                    </div>
                    <h2 className="fc-serif" style={{ fontSize: '1.5rem', color: 'var(--fc-text-primary)' }}>Request Sent!</h2>
                    <p style={{ color: 'var(--fc-text-secondary)' }}>
                        Your request to join the organization has been sent to the Lead. Please wait for approval.
                    </p>
                    <button onClick={logout} style={{ color: 'var(--fc-brass)', fontSize: '0.875rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', marginTop: '1rem' }}
                        className="hover:opacity-80 transition-opacity">
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--fc-bg-deep)' }}>
            <div className="max-w-md w-full fc-glass p-8 rounded-2xl" style={{ boxShadow: 'var(--fc-shadow-lg)' }}>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="fc-serif" style={{ fontSize: '1.5rem', color: 'var(--fc-text-primary)' }}>Join Organization</h1>
                        <p style={{ color: 'var(--fc-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Enter an organization code to join</p>
                    </div>
                    <button onClick={logout}
                        className="fc-btn-ghost flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium">
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                        <label className="fc-label">Organization Code</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--fc-text-dim)' }} />
                            <input
                                type="text"
                                required
                                value={orgCode}
                                onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                                className="fc-input fc-input-icon uppercase tracking-wider"
                                style={{ fontFamily: 'var(--fc-font-mono)' }}
                                placeholder="16-CHARACTER-CODE"
                                maxLength={16}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="fc-label">Join As</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setRole('Associate')}
                                className="p-3 rounded-xl text-sm font-medium transition-all"
                                style={{
                                    background: role === 'Associate' ? 'var(--fc-brass-glow)' : 'var(--fc-bg-deep)',
                                    border: `1px solid ${role === 'Associate' ? 'var(--fc-brass)' : 'var(--fc-border)'}`,
                                    color: role === 'Associate' ? 'var(--fc-brass)' : 'var(--fc-text-muted)',
                                    cursor: 'pointer'
                                }}>
                                Associate
                            </button>
                            <button type="button" onClick={() => setRole('Lead')}
                                className="p-3 rounded-xl text-sm font-medium transition-all"
                                style={{
                                    background: role === 'Lead' ? 'var(--fc-teal-glow)' : 'var(--fc-bg-deep)',
                                    border: `1px solid ${role === 'Lead' ? 'var(--fc-teal)' : 'var(--fc-border)'}`,
                                    color: role === 'Lead' ? 'var(--fc-teal-light)' : 'var(--fc-text-muted)',
                                    cursor: 'pointer'
                                }}>
                                Lead
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="fc-btn-brass w-full py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontSize: '0.875rem' }}>
                        {loading ? 'Sending Request...' : 'Send Join Request'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p style={{ color: 'var(--fc-text-dim)', fontSize: '0.75rem' }}>
                        Don't have a code? Ask your organization administrator.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JoinOrgScreen;
