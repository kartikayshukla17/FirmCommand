import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Setup = lazy(() => import('./pages/Setup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

function App() {
    const { user, loading: authLoading } = useAuth();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            const timer = setTimeout(() => setIsInitialLoad(false), 300);
            return () => clearTimeout(timer);
        }
    }, [authLoading]);

    if (authLoading || isInitialLoad) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--fc-bg-deep)' }}>
                <div className="w-12 h-12 rounded-full mb-4" style={{ border: '3px solid var(--fc-brass-glow)', borderTopColor: 'var(--fc-brass)', animation: 'fc-spin 0.8s linear infinite' }} />
                <p className="fc-serif" style={{ color: 'var(--fc-text-muted)', fontSize: '0.875rem' }}>Loading FirmCommand...</p>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <ToastProvider>
                <SocketProvider>
                    <Suspense fallback={
                        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--fc-bg-deep)' }}>
                            <div className="w-10 h-10 rounded-full" style={{ border: '3px solid var(--fc-brass-glow)', borderTopColor: 'var(--fc-brass)', animation: 'fc-spin 0.8s linear infinite' }} />
                        </div>
                    }>
                        <Routes>
                            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
                            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
                            <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
                            <Route path="/setup" element={<Setup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </Suspense>
                </SocketProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
